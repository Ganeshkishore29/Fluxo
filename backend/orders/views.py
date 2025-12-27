import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction
from .models import Order, OrderItem, Address
from .serializers import OrderSerializer, OrderItemSerializer, AddressSerializer
from django.conf import settings
from decimal import Decimal

import os
CASHFREE_APP_ID = os.getenv("CASHFREE_APP_ID")
CASHFREE_SECRET_KEY = os.getenv("CASHFREE_SECRET_KEY")


# CART VIEW
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        order = Order.objects.filter(user=request.user, status='PENDING').first()
        if not order:
            order = Order.objects.create(user=request.user, status='PENDING')
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    authentication_classes = [JWTAuthentication]


    def post(self, request):
        product_id = request.data.get('product_id')
        size_id = request.data.get('size_id')

        try:
            quantity = int(request.data.get('quantity', 1))
            if quantity < 1:
                return Response(
                    {"error": "Quantity must be at least 1"},
                    status=400
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid quantity"},
                status=400
            )

        from products.models import Product, ProductSize

        product = get_object_or_404(Product, id=product_id)
        size = get_object_or_404(ProductSize, id=size_id, product=product)

        if size.stock < quantity:
            return Response(
                {
                    "error": f"Only {size.stock} items available for size {size.size}."
                },
                status=400
            )

        order, _ = Order.objects.get_or_create(
            user=request.user,
            status='PENDING'
        )

        order_item, created = OrderItem.objects.get_or_create(
            order=order,
            product=product,
            size=size,
            defaults={
                'price': product.price,
                'quantity': quantity
            }
        )

        
        if not created:
            new_quantity = order_item.quantity + quantity

            if new_quantity > size.stock:
                return Response(
                    {
                        "error": f"Only {size.stock} items available for size {size.size}."
                    },
                    status=400
                )

            order_item.quantity = new_quantity
            order_item.save()

        order.calculate_total()
        return Response(
            OrderSerializer(order).data,
            status=201
        )

    @transaction.atomic
    def patch(self, request):
        """
        Batch update cart item:
        action = increase | decrease | remove
        """
        order = get_object_or_404(Order, user=request.user, status='PENDING')

        item_id = request.data.get('item_id')
        action = request.data.get('action')

        item = get_object_or_404(OrderItem, id=item_id, order=order)
        size = item.size  # ProductSize (has stock)

        if action == "increase":
            if item.quantity + 1 > size.stock:
                return Response(
                    {"error": f"Only {size.stock} items available for size {size.size}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity += 1
            item.save()

        elif action == "decrease":
            if item.quantity > 1:
                item.quantity -= 1
                item.save()
            else:
                item.delete()  # quantity 1 → remove item

        elif action == "remove":
            item.delete()

        else:
            return Response(
                {"error": "Invalid action"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.calculate_total()
        return Response(OrderSerializer(order).data, status=200)
    def delete(self, request):
        """Remove item from cart"""
        order = get_object_or_404(Order, user=request.user, status='PENDING')
        item_id = request.data.get('item_id')
        item = get_object_or_404(OrderItem, id=item_id, order=order)
        item.delete()
        order.calculate_total()
        return Response(OrderSerializer(order).data)



class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        order = get_object_or_404(
            Order,
            user=request.user,
            status='PENDING'
        )

        # Ensure total is calculated
        order.calculate_total()

        items_total = order.total_price or Decimal("0.00")

        DELIVERY_FEE = Decimal("149.00")
        FREE_DELIVERY_LIMIT = Decimal("1999.00")

        if items_total < FREE_DELIVERY_LIMIT:
            delivery_fee = DELIVERY_FEE
            free_delivery = False
        else:
            delivery_fee = Decimal("0.00")
            free_delivery = True

        final_total = items_total + delivery_fee

        return Response(
            {
                "order_id": order.id,
                "items_total": items_total,
                "delivery_fee": delivery_fee,
                "final_total": final_total,
                "free_delivery": free_delivery,
            },
            status=status.HTTP_200_OK
        )

# CASHFREE PAYMENT VIEW
class CashfreePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order = Order.objects.filter(
            user=request.user,
            status='PENDING'
        ).order_by('-created_at').first()

        if not order:
            return Response(
                {"error": "No pending order found"},
                status=status.HTTP_404_NOT_FOUND
            )

        payload = {
            "order_id": f"order_{order.id}",
            "order_amount": float(order.total_price),
            "order_currency": "INR",
            "customer_details": {
                "customer_id": str(request.user.id),
                "customer_email": request.user.email or "test@example.com",
                "customer_phone": "9999999999",
            },
            "order_meta": {
                "return_url": "http://localhost:3000/payment-success",
            }
        }

        headers = {
            "x-client-id": settings.CASHFREE_CLIENT_ID,
            "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
            "Content-Type": "application/json"
        }

        response = requests.post(
        settings.CASHFREE_API_URL,
        headers=headers,
        json=payload,
        timeout=10
            )

        if response.status_code in (200, 201):
            data = response.json()
            return Response({"cashfree": data})

        return Response(
            {"error": "Cashfree order creation failed", "details": response.text},
            status=status.HTTP_400_BAD_REQUEST
        )
    def put(self, request):
        """Mark order as paid after success callback"""
        order_id = request.data.get("order_id")
        order = get_object_or_404(Order, id=order_id, user=request.user)

        order.status = "PAID"
        order.save()
        return Response({"message": "Payment successful and order marked as PAID"})


#  ORDER LIST VIEW
class OrderListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user, status='PAID').order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


#  ADDRESS VIEW
class AddressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            address_type = serializer.validated_data["address_type"]
            existing = Address.objects.filter(user=request.user, address_type=address_type).first()
            if existing:
                for field, value in serializer.validated_data.items():
                    setattr(existing, field, value)
                existing.save()
                return Response(AddressSerializer(existing).data)
            else:
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
