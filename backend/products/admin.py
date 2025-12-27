from django.contrib import admin
from .models import (
    Product,
    MainCategory,
    SubCategory,
    ProductImages,
    ProductSize,
    BannerImage,
)


# Banner Inline under MainCategory

class BannerImageInline(admin.TabularInline):
    model = BannerImage
    extra = 1
    autocomplete_fields = ["product"]  

@admin.register(MainCategory)
class MainCategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)
    inlines = [BannerImageInline]


# -------------------------------
class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImages
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "sub_category")
    search_fields = ("name",)
    inlines = [ProductSizeInline, ProductImageInline]


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "main_category")


