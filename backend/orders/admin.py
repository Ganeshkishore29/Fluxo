from django.contrib import admin
from .models import Order, OrderItem, Address
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_price', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['total_price', 'created_at', 'updated_at']
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product', 'size', 'quantity', 'price']
    search_fields = ['order__id', 'product__name']

admin.site.register(Address)