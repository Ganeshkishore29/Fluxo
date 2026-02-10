from rest_framework import serializers
from .models import Address, Order, OrderItem
from products.models import Product, ProductSize
from products.serializers import ProductSerializer

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'address_type', 'first_line', 'second_line', 'city', 'pincode', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    size_name = serializers.CharField(source='size.size', read_only=True)
    sub_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product',
            'size', 'size_name',
            'quantity', 'price', 'sub_total'
        ]

    def get_sub_total(self, obj):
        return obj.sub_total()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)  # Related name from model
    address = AddressSerializer(read_only=True)
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(),
        source='address',
        write_only=True
    )
    user = serializers.StringRelatedField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'address', 'address_id',
            'items', 'total_price', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        validated_data['user'] = user

        order = super().create(validated_data)
        order.calculate_total()  # calculate after items added
        return order
