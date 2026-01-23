# ml_service/schemas.py
from pydantic import BaseModel
from typing import List

class RecommendRequest(BaseModel):
    product_ids: List[int]
    top_k: int = 6

class RecommendResponse(BaseModel):
    recommended_ids: List[int]
