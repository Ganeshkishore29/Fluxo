# recommendations/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from products.models import Product
from products.serializers import ProductLiteSerializer
from .utils import compute_user_scores
class RecommendationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        top_k = int(request.GET.get("k", 8))
        category_id = request.GET.get("category_id")

        product_ids = compute_user_scores(
            user,
            top_k=top_k,
            category_id=category_id
        )

        qs = Product.objects.filter(id__in=product_ids)

        # ✅ FIX: filter through sub_category → main_category
        if category_id:
            qs = qs.filter(
                sub_category__main_category_id=category_id
            )

        # preserve order
        id_to_prod = {p.id: p for p in qs}
        ordered = [id_to_prod[pid] for pid in product_ids if pid in id_to_prod]

        serializer = ProductLiteSerializer(
            ordered,
            many=True,
            context={"request": request}
        )

        return Response({"results": serializer.data})
