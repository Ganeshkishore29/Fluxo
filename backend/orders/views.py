import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import transaction
from .models import Order, OrderItem, Address
from products.models import Product, ProductSize
from django.conf import settings
from decimal import Decimal
from .serializers import OrderSerializer, OrderItemSerializer, AddressSerializer

CASHFREE_APP_ID = settings.CASHFREE_CLIENT_ID
CASHFREE_SECRET_KEY = settings.CASHFREE_CLIENT_SECRET

# CART VIEW
class CartView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        order, _ = Order.objects.get_or_create(
            user=request.user,
            status='PENDING'
        )
        return Response(OrderSerializer(order).data)

    def post(self, request):
        product_id = request.data.get('product_id')
        size_id = request.data.get('size_id')

        try:
            quantity = int(request.data.get('quantity', 1))
            if quantity < 1:
                raise ValueError
        except:
            return Response({"error": "Invalid quantity"}, status=400)

        product = get_object_or_404(Product, id=product_id)
        size = get_object_or_404(ProductSize, id=size_id, product=product)

        if quantity > size.stock:
            return Response(
                {"error": f"Only {size.stock} items available for size {size.size}."},
                status=400
            )

        order, _ = Order.objects.get_or_create(
            user=request.user,
            status='PENDING'
        )

        item, created = OrderItem.objects.get_or_create(
            order=order,
            product=product,
            size=size,
            defaults={'price': product.price, 'quantity': quantity}
        )

        if not created:
            if item.quantity + quantity > size.stock:
                return Response(
                    {"error": f"Only {size.stock} items available."},
                    status=400
                )
            item.quantity += quantity
            item.save()

        order.calculate_total()
        return Response(OrderSerializer(order).data, status=201)

    @transaction.atomic
    def patch(self, request):
        order = get_object_or_404(Order, user=request.user, status='PENDING')
        item = get_object_or_404(OrderItem, id=request.data.get('item_id'), order=order)

        action = request.data.get('action')

        if action == "increase":
            if item.quantity + 1 > item.size.stock:
                return Response({"error": "Stock limit reached"}, status=400)
            item.quantity += 1

        elif action == "decrease":
            item.quantity -= 1
            if item.quantity <= 0:
                item.delete()
                order.calculate_total()
                return Response(OrderSerializer(order).data)

        else:
            return Response({"error": "Invalid action"}, status=400)

        item.save()
        order.calculate_total()
        return Response(OrderSerializer(order).data)

    def delete(self, request, pk):
        order = get_object_or_404(Order, user=request.user, status='PENDING')
        item = get_object_or_404(OrderItem, id=pk, order=order)
        item.delete()
        order.calculate_total()
        return Response(OrderSerializer(order).data)


class TotalBillView(APIView):
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
import uuid
import time
# CASHFREE PAYMENT VIEW
class CashfreePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        print("CASHFREE REQUEST DATA 👉", request.data)

        phone = request.data.get("phone")

        if not phone:
            return Response({"error": "Phone number required"}, status=400)

        try:
            order = Order.objects.filter(
                user=request.user,
                status="PENDING"
            ).latest("created_at")
        except Order.DoesNotExist:
            return Response({"error": "No pending order found"}, status=400)

        amount = float(order.total_price)
        if amount <= 0:
            return Response({"error": "Invalid order amount"}, status=400)

        payload = {
            "order_id": f"order_{order.id}_{uuid.uuid4().hex[:8]}",
            "order_amount": amount,
            "order_currency": "INR",
            "customer_details": {
                "customer_id": str(request.user.id),
                "customer_email": request.user.email,
                "customer_phone": phone,
            },
            "order_meta": {
                "return_url": "http://localhost:3000/payment-success",
            }
        }

        headers = {
            "x-client-id": settings.CASHFREE_CLIENT_ID,
            "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
            "x-api-version": "2022-09-01",
            "Content-Type": "application/json",
        }

        print("CASHFREE PAYLOAD 👉", payload)
        print("CASHFREE URL 👉", settings.CASHFREE_API_URL)

        # 🔁 Retry logic (sandbox-safe)
        for attempt in range(2):
            try:
                response = requests.post(
                    settings.CASHFREE_API_URL,
                    json=payload,
                    headers=headers,
                    timeout=15
                )

                print("CASHFREE STATUS 👉", response.status_code)
                print("CASHFREE RESPONSE 👉", response.text)

                if response.status_code in [200, 201]:
                    return Response({
                        "payment_session_id": response.json()["payment_session_id"],
                        "order_id": payload["order_id"]
                    })

            except requests.exceptions.RequestException as e:
                print("CASHFREE ERROR 👉", str(e))

            time.sleep(1)

        return Response(
            {"error": "Cashfree timeout, please retry"},
            status=503
        )

    def put(self, request):
        """Mark order as PAID after verification"""
        order_id = request.data.get("order_id")

        order = get_object_or_404(
            Order,
            id=order_id,
            user=request.user
        )

        order.status = "PAID"
        order.save()

        return Response({"message": "Order marked as PAID"})

class CashfreeVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        order_id = request.query_params.get("order_id")

        if not order_id:
            return Response({"error": "order_id required"}, status=400)

        headers = {
            "x-client-id": settings.CASHFREE_CLIENT_ID,
            "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
            "x-api-version": "2022-09-01",
            "Content-Type": "application/json"
        }

        response = requests.get(
            f"{settings.CASHFREE_API_URL}/{order_id}",
            headers=headers
        )

        data = response.json()

        if data.get("order_status") == "PAID":
            order = Order.objects.get(
                user=request.user,
                id=order_id.replace("order_", "").split("_")[0]
            )
            order.status = "PAID"
            order.save()

            OrderItem.objects.filter(order=order).delete()

            return Response({"status": "success"})

        return Response({"status": "pending"})


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


class AddressByTypeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # EDIT ADDRESS BY TYPE
    def put(self, request, address_type):
        address = get_object_or_404(
            Address,
            user=request.user,
            address_type=address_type
        )

        serializer = AddressSerializer(
            address,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE ADDRESS BY TYPE
    def delete(self, request, address_type):
        address = get_object_or_404(
            Address,
            user=request.user,
            address_type=address_type
        )

        address.delete()
        return Response(
            {"detail": f"{address_type} address deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    

    