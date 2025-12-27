"""this file is for 
Extract embeddings (image_features.py)
Store them in ProductEmbedding model (models.py)
after this 
But — if your database already has hundreds of products, you can’t manually generate embeddings one by one.

So this command lets you run a single terminal command:

>>>python manage.py compute_embeddings
to store all embeddings at once.

"""
from django.core.management.base import BaseCommand  #base class for management commands
from products.utils.image_features import image_to_embedding  #function to convert images to CLIP vector
from PIL import Image  #open image files
import io  #handles image byte streams (not strictly needed here but safe to import).
from products.models import Product, ProductEmbedding, ProductImages

class Command(BaseCommand):
    help='Compute and store image embeddings for all products'
    def handle(self,*args,**kwargs):
        qs=Product.objects.all()  #get all products from database
        total=qs.count()
        self.stdout.write(f"Computing embeddings for {total} products...")
        for p in qs: #loop through each prosuct in product model
            # Get the first image related to the product
            image_obj = p.images.first()
            if not image_obj or not image_obj.images:
                self.stdout.write(self.style.WARNING(f"Skipping Product {p.id}: No image found"))
                continue
            try:
                img=Image.open(image_obj.images.path).convert('RGB')  #open image and convert to RGB
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to open image for product {p.id}: {e}"))
                continue

            emb=image_to_embedding(img)  #convert image to embedding using image_to_embedding function
            #store embedding in ProductEmbedding model
            pe,created=ProductEmbedding.objects.get_or_create(product=p)  #get or create ProductEmbedding for product
            pe.set_vector(emb)  #set the embedding vector       
            pe.save()  #save to database
            self.stdout.write(self.style.SUCCESS(f"Saved embedding for product {p.id}"))
        self.stdout.write(self.style.SUCCESS("Done."))
