# ml_service/main.py
from fastapi import FastAPI
from ml_service.schemas import RecommendRequest, RecommendResponse
from ml_service.recommend import recommend_products

app = FastAPI(title="Fluxo ML Recommendation Service")

@app.get("/")
def health():
    return {"status": "ML service running"}

@app.post("/recommend", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    product_ids = req.product_ids
    top_k = req.top_k
    recommended_ids = recommend_products(product_ids, top_k)
    return {"recommended_ids": recommended_ids}
