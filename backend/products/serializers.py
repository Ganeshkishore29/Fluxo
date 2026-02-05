from rest_framework import serializers
from .models import Product, MainCategory, SubCategory,ProductImages,ProductSize,BannerImage

class MainCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name']

class SubCategorySerializer(serializers.ModelSerializer):
    # using slug not using the primarykey like id:1 but it  use their names
    main_category=serializers.SlugRelatedField(   # This is a custom field to handle the slug
        slug_field='name',               # This is the field that will be used to represent the main category
        queryset=MainCategory.objects.all()    # This is the queryset that will be used to validate the main category
    )
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'main_category','banner_image']


class ProductImagesSerializer(serializers.ModelSerializer):
    images = serializers.ImageField(use_url=True)

    class Meta:
        model = ProductImages
        fields = ['id', 'images']


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model=ProductSize
        fields=['id','size','stock'] 

class ProductSerializer(serializers.ModelSerializer):
    sub_category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=SubCategory.objects.all()
    )
    images = ProductImagesSerializer(many=True, read_only=True)  # Nested serializer to get all images related to the product
    sizes=ProductSizeSerializer(many=True,read_only=True)  

    class Meta:
        model = Product
        fields = ['id','sub_category', 'name', 'description', 'price', 'sizes', 'images','is_new'] # include images field to get all images related to the product


class ProductLiteSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()
    main_category_id = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'thumbnail_url',
            'main_category_id',
        ]

    def get_thumbnail_url(self, obj):
        first_image = obj.images.first()
        if first_image and first_image.images:
            return first_image.images.url
        return None

    def get_main_category_id(self, obj):
        if obj.sub_category and obj.sub_category.main_category:
            return obj.sub_category.main_category.id
        return None

class BannerImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)
    product_id = serializers.IntegerField(source="product.id", read_only=True)

    class Meta:
        model = BannerImage
        fields = ["id", "image", "title", "price", "product_id"]
