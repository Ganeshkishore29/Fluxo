# recommendations/services.py

import requests
from django.conf import settings
import numpy as np

def get_ml_recommendations(embedding, top_k=6):
    ml_service_url = settings.ML_SERVICE_URL

    if isinstance(embedding, np.ndarray):
        embedding = embedding.tolist()

    response = requests.post(
        ml_service_url,
        json={
            "embedding": embedding,
            "top_k": top_k
        },
        timeout=10
    )

    response.raise_for_status()
    return response.json()["recommended_ids"]
