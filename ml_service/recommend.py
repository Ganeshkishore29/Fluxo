# ml_service/recommend.py
import numpy as np
from ml_service.faiss_index import search
from PIL import Image
from image_features import image_to_embedding
from faiss_index import search

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



def recommend_from_image(upload_file):
    img = Image.open(upload_file.file).convert("RGB")
    emb = image_to_embedding(img)

    faiss_results = search(emb, top_k=30)

    return [
        {"product_id": r["product_id"], "score": r["score"]}
        for r in faiss_results[:8]
    ]