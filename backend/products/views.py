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


class ProductFilterSortAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.all()
        sub_category_id = request.query_params.get("sub_category_id")

        if sub_category_id:
            products = products.filter(sub_category_id=sub_category_id)

        sort = request.query_params.get("sort")

        if sort == "price_asc":
            products = products.order_by("price")
        elif sort == "price_desc":
            products = products.order_by("-price")
        elif sort == "new":
            products = products.order_by( "-is_new")

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        SIMILARITY_THRESHOLD = 0.75
        TOPK_FAISS = 30
        FINAL_RESULTS = 8

        # ---------------------------------
        #  Read image
        # ---------------------------------
        f = request.FILES.get("image")
        if not f:
            return Response(
                {"detail": "No image provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            pil_image = Image.open(f).convert("RGB")
        except Exception as e:
            return Response(
                {"detail": f"Invalid image: {e}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ---------------------------------
        #  Compute embedding
        # ---------------------------------
        emb = image_to_embedding(pil_image)  # normalized float32

        # ---------------------------------
        #  FAISS search (over-fetch)
        # ---------------------------------
        try:
            faiss_results = faiss_search(emb, topk=TOPK_FAISS)
        except Exception:
            faiss_results = []

        # ---------------------------------
        #  Apply similarity threshold
        # ---------------------------------
        filtered = [
            r for r in faiss_results
            if r["score"] >= SIMILARITY_THRESHOLD
        ]

        product_ids = [r["product_id"] for r in filtered]
        scores = {r["product_id"]: r["score"] for r in filtered}

        # ---------------------------------
        #  Fallback (DB cosine)
        # ---------------------------------
        if not product_ids:
            best = []
            for pe in ProductEmbedding.objects.exclude(vector__isnull=True):
                s = float(np.dot(emb, pe.get_vector()))
                if s >= SIMILARITY_THRESHOLD:
                    best.append((pe.product_id, s))

            best.sort(key=lambda x: x[1], reverse=True)
            best = best[:FINAL_RESULTS]

            product_ids = [pid for pid, _ in best]
            scores = dict(best)

        if not product_ids:
            return Response({"results": []})

        # ---------------------------------
        #  Fetch products
        # ---------------------------------
        products = Product.objects.filter(id__in=product_ids)\
            .select_related("sub_category", "sub_category__main_category")

        id_to_product = {p.id: p for p in products}
        ordered = [id_to_product[pid] for pid in product_ids if pid in id_to_product]

        # ---------------------------------
        #  Re-rank using dominant subcategory
        # ---------------------------------
        from collections import Counter

        subcat_counts = Counter(
            p.sub_category_id for p in ordered
        )

        dominant_subcat = subcat_counts.most_common(1)[0][0]

        ordered.sort(
            key=lambda p: scores.get(p.id, 0) +
            (0.05 if p.sub_category_id == dominant_subcat else 0),
            reverse=True
        )

        ordered = ordered[:FINAL_RESULTS]

        # ---------------------------------
        #  Serialize
        # ---------------------------------
        serializer = ProductLiteSerializer(
            ordered, many=True, context={"request": request}
        )

        data = serializer.data
        for item in data:
            item["similarity_score"] = scores.get(item["id"])

        return Response({"results": data})


# products/views.py
import re
from django.db.models import Q


class SearchSuggestionAPIView(APIView):
    def get(self, request):
        query = request.GET.get("q", "").strip().lower()
        results = []

        if not query:
            return Response(results)

        # =========================================================
        # 1. PRICE INTENT (under / below / less than)
        # =========================================================
        price_match = re.search(r"(under|below|less than)\s*(\d+)", query)
        max_price = int(price_match.group(2)) if price_match else None
        query = re.sub(r"(under|below|less than)\s*\d+", "", query)

        # =========================================================
        # 2. REMOVE FILLER WORDS
        # =========================================================
        query = re.sub(r"\b(for|with|in|of|and|the|a|an)\b", " ", query)

        # =========================================================
        # 3. NORMALIZE COMMON PHRASES (CRITICAL STEP)
        # =========================================================
        PHRASE_MAP = {
    # T-Shirts
    "t shirt": "tshirt",
    "t-shirt": "tshirt",
    "tee shirt": "tshirt",
    "tee": "tshirt",
    "tshirts": "tshirt",

    # Tops
    "tops": "top",

    # Shirts
    "shirts": "shirt",
    "formal shirt": "shirt",
    "casual shirt": "shirt",

    # Jeans / Trousers  ✅ CANONICAL = DB VALUE
    "jeans": "jeans",
    "denim": "jeans",
    "denims": "jeans",
    "jean": "jeans",

    "pants": "trousers",
    "pant": "trousers",
    "trousers":"trousers",

    # Hoodies
    "hoodies": "hoodie",
    "hooded sweatshirt": "hoodie",

    # Jackets / Coats
    "jackets": "jacket",
    "coats": "coat",
}


        for phrase, replacement in PHRASE_MAP.items():
            query = query.replace(phrase, replacement)

        # Clean spaces
        query = re.sub(r"\s+", " ", query).strip()

        tokens = [t for t in query.split() if len(t) > 1]

        # =========================================================
        # 4. DETECT MAIN CATEGORY (MEN / LADIES / KIDS)
        # =========================================================
        gender_map = {
            "men": "Men",
            "man": "Men",
            "male": "Men",
            "ladies": "Ladies",
            "women": "Ladies",
            "woman": "Ladies",
            "female": "Ladies",
            
        }

        detected_main_category = None
        for t in tokens:
            if t in gender_map:
                detected_main_category = MainCategory.objects.filter(
                    name__iexact=gender_map[t]
                ).first()

        # =========================================================
        # 5. EXACT MAIN CATEGORY MATCH (RULE A)
        # =========================================================
        main_category = MainCategory.objects.filter(
            name__iexact=query
        ).first()

        if main_category:
            results.append({
                "type": "category",
                "id": main_category.id,
                "name": main_category.name,
            })

            for sub in SubCategory.objects.filter(main_category=main_category):
                results.append({
                    "type": "subcategory",
                    "id": sub.id,
                    "name": sub.name,
                    "main_category": main_category.name,
                })

            products = Product.objects.filter(
                sub_category__main_category=main_category
            ).select_related(
                "sub_category", "sub_category__main_category"
            ).prefetch_related("images")[:6]

            for p in products:
                img = p.images.first()
                results.append({
                    "type": "product",
                    "id": p.id,
                    "name": p.name,
                    "image": img.images.url if img else None,
                })

            return Response(results)

        # =========================================================
        # 6. EXACT SUBCATEGORY MATCH (RULE B)
        # =========================================================
        subcategory = SubCategory.objects.filter(
            name__iexact=query
        ).select_related("main_category").first()

        if subcategory:
            results.append({
                "type": "subcategory",
                "id": subcategory.id,
                "name": subcategory.name,
                "main_category": subcategory.main_category.name,
            })

            products = Product.objects.filter(
                sub_category=subcategory
            ).select_related(
                "sub_category", "sub_category__main_category"
            ).prefetch_related("images")[:8]

            for p in products:
                img = p.images.first()
                results.append({
                    "type": "product",
                    "id": p.id,
                    "name": p.name,
                    "image": img.images.url if img else None,
                })

            return Response(results)

        # =========================================================
        # 7. MIXED / NATURAL LANGUAGE QUERY (RULE C & D)
        # =========================================================
        gender_tokens = set(gender_map.keys())
        product_tokens = [t for t in tokens if t not in gender_tokens]

        product_q = Q()

        for token in product_tokens:
            if token == "tshirt":
                product_q |= Q(name__iregex=r"t[-\s]?shirt")
            else:
                product_q |= (
                    Q(name__icontains=token) |
                    Q(sub_category__name__icontains=token)
                )

        # Gender filter
        if detected_main_category:
            product_q &= Q(sub_category__main_category=detected_main_category)

        products = Product.objects.filter(product_q)

        # Price filter
        if max_price:
            products = products.filter(price__lte=max_price)

        products = products.select_related(
            "sub_category", "sub_category__main_category"
        ).prefetch_related("images")[:10]

        for p in products:
            img = p.images.first()
            results.append({
                "type": "product",
                "id": p.id,
                "name": p.name,
                "sub_category": p.sub_category.name,
                "main_category": p.sub_category.main_category.name,
                "price": p.price,
                "image": img.images.url if img else None,
            })

        return Response(results)




import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class SimilarProductsAPIView(APIView):
    DEFAULT_LIMIT = 6
    MAX_LIMIT = 20

    def get(self, request, product_id):
        try:
            product = Product.objects.select_related(
                "sub_category__main_category"
            ).get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Safety
        sub_cat = product.sub_category
        main_cat = getattr(sub_cat, "main_category", None)
        if not main_cat:
            return Response([], status=status.HTTP_200_OK)

        # Limit handling
        try:
            limit = int(request.query_params.get("limit", self.DEFAULT_LIMIT))
            limit = min(limit, self.MAX_LIMIT)
        except ValueError:
            limit = self.DEFAULT_LIMIT

        base_qs = Product.objects.filter(
            sub_category__main_category=main_cat
        ).exclude(id=product.id)

        # Prefer different subcategories
        preferred_qs = base_qs.exclude(sub_category=sub_cat)

        final_qs = preferred_qs if preferred_qs.exists() else base_qs

        # Reduce DB load first
        candidate_products = list(final_qs[: self.MAX_LIMIT])

        # Deterministic shuffle (stable UX)
        random.Random(product.id).shuffle(candidate_products)

        result = candidate_products[:limit]

        serializer = ProductLiteSerializer(
            result,
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