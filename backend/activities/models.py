from django.db import models
from django.conf import settings
from products.models import Product
User = settings.AUTH_USER_MODEL

class UserActivity(models.Model):
    VIEW = "view"
    ADD_CART = "add_cart"
    WISHLIST = "wishlist"
    PURCHASE = "purchase"

    ACTION_CHOICES = [
        (VIEW, "View"),
        (ADD_CART, "Add to Cart"),
        (WISHLIST, "Wishlist"),
        (PURCHASE, "Purchase"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default=VIEW)
    timestamp = models.DateTimeField(auto_now_add=True)
    # for VIEW action, store duration in seconds; for others, keep null
    duration_seconds = models.FloatField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "action", "timestamp"]),
        ]

    def __str__(self):
        return f"{self.user} {self.action} {self.product_id} @ {self.timestamp}"
