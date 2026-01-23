# ml_service/recommend.py
import numpy as np
from ml_service.faiss_index import search

def recommend_products(seed_product_ids, top_k=6):
    """
    seed_product_ids are IDs, but ML works on embeddings.
    For now, assume you already built FAISS index from embeddings.
    """

    # ⚠️ TEMP: pick the first seed as query
    # (Later you can average embeddings)
    seed_id = seed_product_ids[0]

    results = search(seed_id, top_k=top_k)

    return [r["product_id"] for r in results]
