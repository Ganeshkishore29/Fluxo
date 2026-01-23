# backend/ml_service/embeddings.py
import torch
import open_clip
import numpy as np
from PIL import Image

# Load model once (IMPORTANT)
device = "cuda" if torch.cuda.is_available() else "cpu"

model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32", pretrained="openai"
)
model = model.to(device)
tokenizer = open_clip.get_tokenizer("ViT-B-32")


def get_image_embedding(image: Image.Image) -> np.ndarray:
    image = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        emb = model.encode_image(image)

    emb = emb / emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy().astype("float32")[0]


def get_text_embedding(text: str) -> np.ndarray:
    tokens = tokenizer([text]).to(device)

    with torch.no_grad():
        emb = model.encode_text(tokens)

    emb = emb / emb.norm(dim=-1, keepdim=True)
    return emb.cpu().numpy().astype("float32")[0]
