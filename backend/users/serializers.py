from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password   
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate,get_user_model   #authenticate checks the email and password match a user in the db


class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True,required=True,validators=[validate_password])   # password accepted in request and its wont send back to as a response
    class Meta:
        model=CustomUser
        fields=['full_name','email','password']
    def create(self, validated_data):
        user=CustomUser.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data.get('full_name'," "),  # deflaut of blank if not provided
            password=validated_data['password']
        )
        return user
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=CustomUser
        fields=['id','full_name','email']
    
User=get_user_model()   # get the CustomUser model from settings.py---> AUTH_USER_MODEL='users.CustomUser'
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer): # default serializer behaviour to email and password
    username_field = "email"  #tells JWT to use 'email' instead of 'username'
    def validate(self, attrs):  # this fn trigger the is_valid() method 
        email=attrs.get("email")  # attrs is a dict for incoming request data (password,email)
        password=attrs.get("password")
        if not email or not password:
            raise serializers.ValidationError("Email and password are required")
        user=authenticate(request=self.context.get('request'),email=email,password=password)  # authenticate checks the email and password match a user in the db,serializer dont automatically access the request, so we need to pass the request object as a context( request=request)
        if not user: 
            raise serializers.ValidationError("Invalid email or password")
        
        data=super().validate({   # even though we use email internally JWT expects username so we pass username=user.name cause in model User model we have username as a field USERNAME_FIELD='email'
            self.username_field:email,
            "password":password
        })
        data['email']=user.email
        return data
