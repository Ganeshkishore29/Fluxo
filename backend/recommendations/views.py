# recommendations/views.py
# recommendations/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from products.models import Product
from products.serializers import ProductLiteSerializer
from recommendations.utils import compute_user_scores
from .services import get_ml_recommendations


class RecommendationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1️⃣ Parse k safely
        try:
            top_k = int(request.GET.get("k", 8))
        except (ValueError, TypeError):
            top_k = 8

        # 2️⃣ Parse category_id safely
        category_id = request.GET.get("category_id")
        if not category_id or category_id == "null":
            return Response({"results": []}, status=status.HTTP_200_OK)

        try:
            category_id = int(category_id)
        except (ValueError, TypeError):
            return Response({"results": []}, status=status.HTTP_200_OK)

        # 3️⃣ Get seed products from user behavior
        seed_product_ids = compute_user_scores(
            user=user,
            top_k=top_k,
            category_id=category_id
        )

        if not seed_product_ids:
            return Response({"results": []}, status=status.HTTP_200_OK)

        # 4️⃣ Call ML SERVICE (HuggingFace)
        try:
            recommended_ids = get_ml_recommendations(
                product_ids=seed_product_ids,
                top_k=top_k
            )
        except Exception:
            return Response({"results": []}, status=status.HTTP_200_OK)

        if not recommended_ids:
            return Response({"results": []}, status=status.HTTP_200_OK)

        # 5️⃣ Fetch products from DB
        products = Product.objects.filter(id__in=recommended_ids)

        # 6️⃣ Preserve ML ranking order
        id_map = {p.id: p for p in products}
        ordered_products = [
            id_map[pid] for pid in recommended_ids if pid in id_map
        ]

        # 7️⃣ Serialize
        serializer = ProductLiteSerializer(
            ordered_products,
            many=True,
            context={"request": request}
        )

        return Response({"results": serializer.data}, status=status.HTTP_200_OK)
