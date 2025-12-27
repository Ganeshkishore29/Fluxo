from django.urls import path
from .views import WishlistView, WishlistModifyView

urlpatterns = [
    # GET wishlist
    path('wishlist/', WishlistView.as_view(), name='wishlist-list'),
    path('wishlist/<int:pk>/', WishlistView.as_view(), name='wishlist-detail'),

    # POST / DELETE wishlist
    path('wishlist/<int:product_id>/toggle/', WishlistModifyView.as_view(), name='wishlist-modify'),
]
