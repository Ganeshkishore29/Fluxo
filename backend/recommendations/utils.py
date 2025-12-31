
import numpy as np
from collections import defaultdict
from datetime import timedelta, datetime
from django.utils import timezone
from activities.models import UserActivity
from products.models import Product, ProductEmbedding
from products.utils.faiss_index import search as faiss_search  # optional fast search

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
    # Aggregate activities in recent window
    
    now = timezone.now()
    window = now - timedelta(days=WEIGHTS["recent_decay_days"])
    acts = UserActivity.objects.filter(user=user, timestamp__gte=window)

    scores = defaultdict(float)
    

    for a in acts:
        pid = a.product_id
        if a.action == UserActivity.VIEW:
            dur = a.duration_seconds or 0.0
            scores[pid] += dur * WEIGHTS["view_time_per_second"]
        elif a.action == UserActivity.ADD_CART:
            scores[pid] += WEIGHTS["add_to_cart"]
        elif a.action == UserActivity.WISHLIST:
            scores[pid] += WEIGHTS["wishlist"]
        elif a.action == UserActivity.PURCHASE:
            scores[pid] += WEIGHTS["purchase"]

    # If no strong signals, fallback to last order/wishlist/cart items aggregated quickly
    if not scores:
        # last purchases (if any)
        purchases = UserActivity.objects.filter(user=user, action=UserActivity.PURCHASE).order_by('-timestamp')[:5]
        for p in purchases:
            scores[p.product_id] += WEIGHTS["purchase"] * 0.5

    # Normalize scores and pick top seeds
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    seed_product_ids = [pid for pid, sc in ranked[:5]]

    # Expand seeds using embedding similarity (hybrid)
    recommendations = []
    seen = set(seed_product_ids)
    for pid in seed_product_ids:
        # try FAISS search for similar
        try:
            pe = ProductEmbedding.objects.get(product_id=pid)
            emb = pe.get_vector()
            results = faiss_search(emb,6)  # product_id + score
            for r in results:
                rid = r["product_id"]
                if rid not in seen:
                    recommendations.append((rid, r["score"]))
                    seen.add(rid)
        except ProductEmbedding.DoesNotExist:
            continue

    # If recommendations less than needed, add globally popular products
    if len(recommendations) < top_k:
        # simple popularity metric: number of purchases in DB (or product.popularity field)
        pop_qs = Product.objects.order_by('-popularity')[:top_k*2]  # if you have popularity field
        for p in pop_qs:
            if p.id not in seen:
                recommendations.append((p.id, WEIGHTS["popularity_fallback"]))
                seen.add(p.id)
            if len(recommendations) >= top_k:
                break

    # Build final list of product ids with optional scores
    final = [pid for pid, sc in recommendations][:top_k]
    return final
