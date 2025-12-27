from django.urls import path
from .views import MainCategoryView,SubCategoryView,ProductView,NewInProductsView,ImageSearchAPIView,SearchSuggestionAPIView,BannerImageView,SubcategoryBannerView

urlpatterns = [
    path('main-categories/', MainCategoryView.as_view(), name='main-category-list'),
    path('sub-categories/', SubCategoryView.as_view(), name='sub-category-list'),
    path('sub-categories/<int:pk>/', SubCategoryView.as_view(), name='sub-category-detail'),
   
    path('products/', ProductView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductView.as_view(), name='product-detail'),
    path('products/new/<int:category>/', NewInProductsView.as_view(), name='new-in-products'),
    path('search/image/', ImageSearchAPIView.as_view(), name='image-search'),
    path('search-suggestions/', SearchSuggestionAPIView.as_view(), name='search_suggestions'),
    path('similar-product/<int:pk>/', ProductView.as_view(), name='similar-products'),
    path('banners/', BannerImageView.as_view(), name='banner-image-list'),
    path('subCatBanner/',SubcategoryBannerView.as_view(),name='Sub_cat_banner'),
]