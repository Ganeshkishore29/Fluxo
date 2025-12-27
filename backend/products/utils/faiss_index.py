"""
This file is responsible for:
- loading all product embeddings from the database
- creating a FAISS index for fast similarity search
- searching for similar products based on image embeddings
"""

try:
    import faiss                # FAISS library for fast vector similarity search  # type: ignore
except Exception as e:
    raise ImportError(
        "FAISS is required for this module; install it with 'pip install faiss-cpu' "
        "or 'pip install faiss-gpu' depending on your platform."
    ) from e
try:
    import numpy as np      # numerical operations  # type: ignore
except Exception as e:
    raise ImportError("NumPy is required for this module; install it with 'pip install numpy'.") from e
from products.models import ProductEmbedding


# Global variables to store index in memory
_index = None    # FAISS index
_id_map = None   # FAISS index → product_id
_dim = None      # embedding dimension (usually 512 for CLIP)


def build_index():
    """Load all embeddings from DB and create FAISS index."""
    global _index, _id_map, _dim

    embeddings = ProductEmbedding.objects.all()  # fetch all stored embeddings
    vecs = []
    ids = []

    # Convert DB blobs into actual vectors
    for emb in embeddings:
        vec = emb.get_vector()   # convert blob → numpy vector
        if vec is not None:
            vecs.append(vec)
            ids.append(emb.product_id)   # store product ID

    # If no vectors exist → return nothing
    if not vecs:
        return None

    # Convert list → matrix (N x 512)
    vecs = np.vstack(vecs).astype('float32')

    # Save embedding dimension
    _dim = vecs.shape[1]

    # Normalize vectors for L2 or Inner Product search
    faiss.normalize_L2(vecs)

    # Create FAISS index (L2 distance)
    index = faiss.IndexFlatL2(_dim)

    # Add all embedding vectors to FAISS index
    index.add(vecs)

    # Store in global memory
    _index = index
    _id_map = ids

    return _index



def search(emb: np.ndarray, top_k=8):
    """Search for top-k most similar products."""
    global _index, _id_map

    # Build index if it's not built yet (lazy loading)
    if _index is None:
        build_index()

    # Still no index → return empty safely
    if _index is None:
        return []

    # Normalize the query vector
    emb = emb.reshape(1, -1).astype('float32')
    faiss.normalize_L2(emb)

    # Perform FAISS search
    scores, idxs = _index.search(emb, top_k)

    results = []
    for score, idx in zip(scores[0], idxs[0]):
        # Safety check
        if idx < 0 or idx >= len(_id_map):
            continue

        # Map FAISS result index → real product ID
        results.append({
            "product_id": _id_map[idx],
            "score": float(score)
        })

    return results
