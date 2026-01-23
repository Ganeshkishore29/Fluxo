import faiss
import numpy as np

_index = None
_id_map = None

def build_index(vectors, ids):
    global _index, _id_map

    vectors = np.asarray(vectors, dtype="float32")
    faiss.normalize_L2(vectors)

    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)

    _index = index
    _id_map = ids

def search(query_vec, top_k=6):
    if _index is None:
        return []

    q = np.asarray(query_vec, dtype="float32").reshape(1, -1)
    faiss.normalize_L2(q)

    scores, idxs = _index.search(q, top_k)
    return [_id_map[i] for i in idxs[0] if i < len(_id_map)]
