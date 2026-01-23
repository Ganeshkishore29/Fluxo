# recommendations/services.py
import requests
from django.conf import settings

def get_ml_recommendations(product_ids, top_k=6):
    ml_service_url = settings.ML_SERVICE_URL

    response = requests.post(
        ml_service_url,
        json={
            "product_ids": product_ids,
            "top_k": top_k
        },
        timeout=10
    )

    response.raise_for_status()
    return response.json()["recommended_ids"]
