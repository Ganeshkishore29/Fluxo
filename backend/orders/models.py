from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product,ProductSize

User=get_user_model()  # get the CustomUser model from settings.py---> AUTH_USER_MODEL='users.CustomUser'


class Address(models.Model):
    ADDRESS_TYPE_CHOICES = [
        ('HOME', 'Home'),
        ('OFFICE', 'Office'),
        ('LIVE', 'Live'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPE_CHOICES)
    first_line = models.CharField(max_length=255)
    second_line = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'address_type')
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.address_type} Address of {self.user.email}"

class Order(models.Model):
    Status_Choices = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    address = models.ForeignKey('Address', on_delete=models.SET_NULL, null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00") )
    status = models.CharField(max_length=20, choices=Status_Choices, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_total(self):
        total = sum(item.sub_total() for item in self.items.all())
        self.total_price = total
        self.save()
        return self.total_price

    def __str__(self):
        return f"Order {self.id} by {self.user.email}"

class OrderItem(models.Model):      
    order=models.ForeignKey(Order,on_delete=models.CASCADE,related_name='items')
    product=models.ForeignKey(Product,on_delete=models.CASCADE)
    size=models.ForeignKey(ProductSize,on_delete=models.CASCADE)
    quantity=models.PositiveIntegerField(default=1)
    price=models.DecimalField(max_digits=10,decimal_places=2)  # price at the time of order

    def sub_total(self):
        return self.quantity * self.price
    def __str__(self):
        return f"OrderItem {self.id} - Order {self.order.id} - Product {self.product.name}"
