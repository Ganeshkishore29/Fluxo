# backend/recommendations/services.py
import requests
from django.conf import settings


def image_search_via_ml(image_file):
    response = requests.post(
        settings.ML_IMAGE_SEARCH_URL,
        files={"image": image_file},
        timeout=20
    )
    response.raise_for_status()
    return response.json()  # { results: [{product_id, score}, ...] }