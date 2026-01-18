from collections import defaultdict
from datetime import timedelta
from django.utils import timezone

from activities.models import UserActivity
from products.models import Product, ProductEmbedding
from products.utils.faiss_index import search as faiss_search


# -------------------------
# Weight configuration
# -------------------------
WEIGHTS = {
    "view_time_per_second": 0.02,
    "add_to_cart": 3.0,
    "wishlist": 2.0,
    "purchase": 5.0,
    "recent_decay_days": 14,
    "popularity_fallback": 0.5,
}


def compute_user_scores(user, top_k=8, category_id=None):
    """
    STRICT GUARANTEE:
    If category_id is provided, ONLY products from that main category
    can ever be recommended.
    """

    now = timezone.now()
    window = now - timedelta(days=WEIGHTS["recent_decay_days"])

    # ------------------------------------------------
    # 1️⃣ ALLOWED PRODUCT SET (SOURCE OF TRUTH)
    # ------------------------------------------------
    if not category_id:
        return []

    allowed_product_ids = set(
        Product.objects.filter(
            sub_category__main_category_id=category_id
        ).values_list("id", flat=True)
    )

    if not allowed_product_ids:
        return []

    # ------------------------------------------------
    # 2️⃣ Recent user activities (CATEGORY SAFE)
    # ------------------------------------------------
    activities = UserActivity.objects.filter(
        user=user,
        timestamp__gte=window,
        product_id__in=allowed_product_ids
    )

    scores = defaultdict(float)

    for act in activities:
        pid = act.product_id

        if act.action == UserActivity.VIEW:
            scores[pid] += (act.duration_seconds or 0) * WEIGHTS["view_time_per_second"]
        elif act.action == UserActivity.ADD_CART:
            scores[pid] += WEIGHTS["add_to_cart"]
        elif act.action == UserActivity.WISHLIST:
            scores[pid] += WEIGHTS["wishlist"]
        elif act.action == UserActivity.PURCHASE:
            scores[pid] += WEIGHTS["purchase"]

    # ------------------------------------------------
    # 3️⃣ Fallback if no strong signals
    # ------------------------------------------------
    if not scores:
        fallback_acts = UserActivity.objects.filter(
            user=user,
            action=UserActivity.PURCHASE,
            product_id__in=allowed_product_ids
        ).order_by("-timestamp")[:5]

        for fa in fallback_acts:
            scores[fa.product_id] += WEIGHTS["purchase"] * 0.5

    # ------------------------------------------------
    # 4️⃣ Seed products
    # ------------------------------------------------
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    seed_product_ids = [pid for pid, _ in ranked[:5]]

    recommendations = []
    seen = set(seed_product_ids)

    # ------------------------------------------------
    # 5️⃣ FAISS expansion (HARD CATEGORY BLOCK)
    # ------------------------------------------------
    for pid in seed_product_ids:
        try:
            pe = ProductEmbedding.objects.get(product_id=pid)
            emb = pe.get_vector()

            # ❗ FIXED: positional argument
            results = faiss_search(emb, 8)

            for r in results:
                rid = r["product_id"]

                if rid not in allowed_product_ids:
                    continue

                if rid not in seen:
                    recommendations.append((rid, r["score"]))
                    seen.add(rid)

        except ProductEmbedding.DoesNotExist:
            continue

    # ------------------------------------------------
    # 6️⃣ Popularity fallback (CATEGORY SAFE)
    # ------------------------------------------------
    if len(recommendations) < top_k:
        popular_qs = Product.objects.filter(
            id__in=allowed_product_ids
        ).order_by("-popularity")

        for p in popular_qs:
            if p.id not in seen:
                recommendations.append((p.id, WEIGHTS["popularity_fallback"]))
                seen.add(p.id)

            if len(recommendations) >= top_k:
                break

    # ------------------------------------------------
    # 7️⃣ Final result
    # ------------------------------------------------
    final_product_ids = [pid for pid, _ in recommendations][:top_k]

    # 🔍 DEBUG (keep temporarily)
    print("CATEGORY ID:", category_id)
    print("ALLOWED PRODUCTS:", len(allowed_product_ids))

    for pid in final_product_ids:
        p = Product.objects.get(id=pid)
        print(
            "RECOMMENDED:",
            p.id,
            p.name,
            "MAIN_CATEGORY:",
            p.sub_category.main_category_id
        )

    return final_product_ids
