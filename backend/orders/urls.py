from django.urls import path
from .views import CartView, CashfreePaymentView, OrderListView, AddressView,TotalBillView,AddressByTypeView,CashfreeVerifyView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/<int:pk>/',CartView.as_view(),name='cart-delete'),
    path('total-bill/', TotalBillView.as_view(), name='total-bill'),
    path('cashfree/', CashfreePaymentView.as_view(), name='payment'),
    path("cashfree/verify/", CashfreeVerifyView.as_view()),

    path('orders/', OrderListView.as_view(), name='orders'),
    path('addresses/', AddressView.as_view(), name='addresses'),
    path("addresses/<str:address_type>/", AddressByTypeView.as_view()),
]