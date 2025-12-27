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
        product_ids = compute_user_scores(user, top_k=top_k)
        products = Product.objects.filter(id__in=product_ids)
        # preserve order
        id_to_prod = {p.id: p for p in products}
        ordered = [id_to_prod[pid] for pid in product_ids if pid in id_to_prod]
        serializer = ProductLiteSerializer(ordered, many=True, context={'request': request})
        return Response({"results": serializer.data})
