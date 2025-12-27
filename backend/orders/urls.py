from django.urls import path
from .views import CartView, CashfreePaymentView, OrderListView, AddressView,CheckoutView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('checkout/', CheckoutView.as_view(), name='place-order'),
    path('payment/', CashfreePaymentView.as_view(), name='payment'),
    path('orders/', OrderListView.as_view(), name='orders'),
    path('addresses/', AddressView.as_view(), name='addresses'),
]