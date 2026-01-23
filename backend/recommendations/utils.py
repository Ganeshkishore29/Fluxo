# backend/recommendations/utils.py
import numpy as np
from collections import defaultdict
from datetime import timedelta, datetime
from django.utils import timezone
from activities.models import UserActivity
from products.models import Product, ProductEmbedding
from .services import get_ml_recommendations

# Weight settings (tune these)
WEIGHTS = {
    "view_time_per_second": 0.02,   # each second gives this weight
    "add_to_cart": 3.0,
    "wishlist": 2.0,
    "purchase": 5.0,
    "recent_decay_days": 14,        # recency window to prioritize recent actions
    "popularity_fallback": 0.5,     # global popularity weight
}
def compute_user_scores(user, top_k=8, category_id=None):
    now = timezone.now()
    window = now - timedelta(days=WEIGHTS["recent_decay_days"])

    acts = UserActivity.objects.filter(
        user=user,
        timestamp__gte=window
    )

    # ✅ Restrict activities to category
    if category_id:
        acts = acts.filter(
            product__sub_category__main_category_id=category_id
        )

    scores = defaultdict(float)

    for a in acts:
        pid = a.product_id
        if a.action == UserActivity.VIEW:
            scores[pid] += (a.duration_seconds or 0) * WEIGHTS["view_time_per_second"]
        elif a.action == UserActivity.ADD_CART:
            scores[pid] += WEIGHTS["add_to_cart"]
        elif a.action == UserActivity.WISHLIST:
            scores[pid] += WEIGHTS["wishlist"]
        elif a.action == UserActivity.PURCHASE:
            scores[pid] += WEIGHTS["purchase"]

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    seed_product_ids = [pid for pid, _ in ranked[:5]]

    recommendations = []
    seen = set(seed_product_ids)

    for pid in seed_product_ids:
        try:
            pe = ProductEmbedding.objects.get(product_id=pid)
            emb = pe.get_vector()
            results = get_ml_recommendations(emb, 10)

            for r in results:
                rid = r["product_id"]
                if rid in seen:
                    continue

                # ✅ CATEGORY CHECK HERE
                if category_id:
                    if not Product.objects.filter(
                        id=rid,
                        sub_category__main_category_id=category_id
                    ).exists():
                        continue

                recommendations.append((rid, r["score"]))
                seen.add(rid)

                if len(recommendations) >= top_k:
                    break
        except ProductEmbedding.DoesNotExist:
            continue

    
  

    return [pid for pid, _ in recommendations][:top_k]
