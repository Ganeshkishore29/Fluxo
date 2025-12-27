# users/views.py (APIView)
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import UserActivity
from products.models import Product
from django.shortcuts import get_object_or_404

class ActivityCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        product_id = request.data.get("product_id")
        action = request.data.get("action", "view")
        duration = request.data.get("duration_seconds", None)

        product = get_object_or_404(Product, id=product_id)
        UserActivity.objects.create(
            user=user,
            product=product,
            action=action,
            duration_seconds=duration
        )
        return Response({"status": "ok"}, status=status.HTTP_201_CREATED)
