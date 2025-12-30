from django.urls import path
from .views import CartView, CashfreePaymentView, OrderListView, AddressView,TotalBillView,AddressByTypeView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('total-bill/', TotalBillView.as_view(), name='total-bill'),
    path('cashfree/', CashfreePaymentView.as_view(), name='payment'),
    path('orders/', OrderListView.as_view(), name='orders'),
    path('addresses/', AddressView.as_view(), name='addresses'),
    path("addresses/<str:address_type>/", AddressByTypeView.as_view()),
]