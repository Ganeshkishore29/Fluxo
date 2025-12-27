from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from .models import Product, MainCategory, SubCategory, ProductImages,ProductSize,ProductEmbedding,BannerImage
from .serializers import ProductSerializer, MainCategorySerializer, SubCategorySerializer,ProductLiteSerializer,ProductSizeSerializer,ProductImagesSerializer,BannerImageSerializer
from rest_framework import permissions
from django.db.models import Q
from PIL import Image
import io
import numpy as np
from .utils.image_features import image_to_embedding
from .utils.faiss_index import search as faiss_search

from django.db.models import F
from numpy.linalg import norm

class MainCategoryView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        category_id = request.query_params.get("id")

        if category_id:
            try:
                category = MainCategory.objects.get(id=category_id)
                serializer = MainCategorySerializer(category)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except MainCategory.DoesNotExist:
                return Response(
                    {"error": "Category not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        
        categories = MainCategory.objects.all()
        serializer = MainCategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self,request):
        serializer=MainCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class SubCategoryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request,pk=None):
        main_category_id = request.query_params.get("main_category")
        if pk is not None:
            try:
                category = SubCategory.objects.get(pk=pk)
                serializer = SubCategorySerializer(category)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except SubCategory.DoesNotExist:
                return Response({"error": "SubCategory not found"},status=status.HTTP_404_NOT_FOUND)
            
        if main_category_id:
            categories = SubCategory.objects.filter(main_category_id=main_category_id)
        else:
            categories = SubCategory.objects.all()

        serializer = SubCategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self,request):
        serializer=SubCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class ProductView(APIView):
    permission_classes = [AllowAny]
    def get(self,request,pk=None):
        if pk:
            try:
                products=Product.objects.get(pk=pk)
            except Product.DoesNotExist:
                return Response({"error:Product not found"},status=status.HTTP_404_NOT_FOUND)
            serializer=ProductSerializer(products)
        else:
            sub_category_id=request.query_params.get("sub_category_id") # /api/products/?sub_category=1 its for filtering the products based on subcategory
            if sub_category_id:
                products = Product.objects.filter(sub_category_id=sub_category_id) 
            else:
                products = Product.objects.all()
            serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self,request):
        if not request.user.is_staff:   # only admin can add products
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer=ProductSerializer(data=request.data)
        if serializer.is_valid():
            product=serializer.save()
            images=request.FILES.getlist('images') # getlist is used to get multiple images
            for img in images:# iterate through the list of images
                ProductImages.objects.create(product=product,image=img)# create a new ProductImages object with the product and image
                # Expecting sizes as a list of objects: [{"size": "S", "stock": 10}, ...]
            sizes_data = request.data.get('sizes', [])
            for size_obj in sizes_data:
                ProductSize.objects.create(
                    product=product,
                    size=size_obj.get('size'),
                    stock=size_obj.get('stock',0)
                )
            return Response(ProductSerializer(product).data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class NewInProductsView(APIView):
    def get(self, request, category):
        
        sub_categories = SubCategory.objects.filter(
            main_category_id=category
        ).values_list("id", flat=True)

        products = Product.objects.filter(
            sub_category_id__in=sub_categories,
            is_new=True
        )

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class ImageSearchAPIView(APIView):
    permission_classes = [permissions.AllowAny]  # or IsAuthenticated if you want

    def post(self, request):
        """
        Accepts multipart/form-data with field 'image' (file upload).
        Returns top-N similar products.
        """
        f = request.FILES.get('image')
        if not f:
            return Response({"detail": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            pil_image = Image.open(f).convert("RGB")
        except Exception as e:
            return Response({"detail": f"Invalid image: {e}"}, status=status.HTTP_400_BAD_REQUEST)

        # 1) compute embedding
        emb = image_to_embedding(pil_image)  # numpy float32 normalized

        # 2) try FAISS first
        try:
            res = faiss_search(emb, topk=8)
            product_ids = [r['product_id'] for r in res]
            # attach scores
            scores = {r['product_id']: r['score'] for r in res}
        except Exception:
            product_ids = []
            scores = {}

        # 3) if no FAISS or no results, fallback to DB cosine on embeddings
        if not product_ids:
            # naive DB scan (ok for small catalogs)
            q = ProductEmbedding.objects.exclude(vector__isnull=True)
            best = []
            for pe in q:
                vec = pe.get_vector()
                # cosine since both normalized, dot = cosine
                s = float(np.dot(emb, vec))
                best.append((pe.product_id, s))
            best.sort(key=lambda x: x[1], reverse=True)
            best = best[:8]
            product_ids = [pid for pid, sc in best]
            scores = {pid: sc for pid, sc in best}

        # 4) fetch product data preserving order
        products = Product.objects.filter(id__in=product_ids)
        # preserve order from product_ids
        id_to_product = {p.id: p for p in products}
        ordered = [id_to_product[pid] for pid in product_ids if pid in id_to_product]

        serializer = ProductLiteSerializer(ordered, many=True, context={'request': request})
        data = serializer.data
        # attach similarity score
        for item in data:
            item['similarity_score'] = scores.get(item['id'], None)
        return Response({"results": data})

# products/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

from products.models import Product, ProductImages, SubCategory, MainCategory


class SearchSuggestionAPIView(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        suggestions = []

        if query:
            # Search in:
            # 1) Product name
            # 2) SubCategory name (T-shirts, Shirts, Jeans)
            # 3) MainCategory name (Men, Ladies, Kids)
            products = Product.objects.filter(
                Q(name__icontains=query) |
                Q(sub_category__name__icontains=query) |
                Q(sub_category__main_category__name__icontains=query)
            ).select_related("sub_category", "sub_category__main_category").prefetch_related("images")[:10]

            for product in products:
                # Fetch the first image (if available)
                first_image = None
                img_obj = product.images.first()
                if img_obj:
                    first_image = img_obj.images.url

                suggestions.append({
                    "id": product.id,
                    "name": product.name,
                    "main_category": product.sub_category.main_category.name,
                    "sub_category": product.sub_category.name,
                    "image": first_image,
                    "price": product.price,
                })

        return Response(suggestions)

class SimilarProductsAPIView(APIView):
    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Priority 1: Same subcategory
        similar_products = Product.objects.filter(
            sub_category=product.sub_category
        ).exclude(id=product.id)

        # If less than 6, add same category
        if similar_products.count() < 6:
            extra_products = Product.objects.filter(
                category=product.category
            ).exclude(
                id__in=similar_products.values_list("id", flat=True)
            ).exclude(id=product.id)

            similar_products = (similar_products | extra_products)

        similar_products = similar_products.distinct()[:6]

        serializer = ProductLiteSerializer(
            similar_products,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)



class BannerImageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        main_category_id = request.query_params.get("id")

        if main_category_id:
            banners = BannerImage.objects.filter(main_category_id=main_category_id)
        else:
            banners = BannerImage.objects.all()

        serializer = BannerImageSerializer(banners, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SubcategoryBannerView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        main_category_id = request.query_params.get("id")

        if not main_category_id:
            return Response(
                {"error": "main_category_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        subcategories = SubCategory.objects.filter(
            main_category_id=main_category_id,
            banner_image__isnull=False
        )

        serializer = SubCategorySerializer(subcategories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)