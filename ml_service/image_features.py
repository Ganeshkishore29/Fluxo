import torch  #used for tensor operations and CPU/GPU management
import numpy as np     #converts tensorinto arrays for saving or further processing
from PIL import Image #handles image loading and preprocessing
from transformers import CLIPProcessor, CLIPModel  #imports CLIP models pretrained for image feature extraction ,CLIPProcessor for preprocessing images

DEVICE = "cuda" if torch.cuda.is_available() else "cpu" #sets device to GPU if available, otherwise CPU

MODEL_NAME = "openai/clip-vit-base-patch32"  #specifies the CLIP model to use

_model= None #global variable to hold the loaded model
_processor = None #global variable to hold the loaded processor
# this are load once becaue the clip is heavy model and we dont want to load it every request

def get_model_and_processor():
    global _model, _processor
    if _model is None :
        _model= CLIPModel.from_pretrained(MODEL_NAME).to(DEVICE) #loads the CLIP model and moves it to the specified device
        _processor = CLIPProcessor.from_pretrained(MODEL_NAME) #loads the CLIP processor
    return _model, _processor


def image_to_embedding(pil_image: Image.Image) -> np.ndarray: #converts a PIL image to a CLIP embedding
    model, processor = get_model_and_processor()  #retrieves the loaded model and processor
    #preprocess the image for the model
    inputs = processor(images=pil_image, return_tensors="pt").to(DEVICE)   #Uses CLIPProcessor to resize, normalize, and convert the image into a PyTorch tensor (pt = PyTorch).
    with torch.no_grad():  #disables gradient calculation for inference
        image_features = model.get_image_features(**inputs)  #extracts image features using the CLIP model,get_image_features outputs a high-dimensional tensor (embedding) representing the image.
    #normalize the embedding to unit length
    image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)  #normalizes the embedding to unit length using L2 norm
    #convert the tensor to a numpy array and return
    emb = image_features.cpu().numpy().astype('float32').reshape(-1)
    return emb

"""
"""
