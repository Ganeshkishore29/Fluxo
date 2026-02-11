from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser,PermissionsMixin


class CustomUserManager(BaseUserManager): # custom user manager to handle user creation and superuser creation
    def create_user(self,email,password=None,**extra_fields):
        if not email:
            raise ValueError("users must have an email address")
        email=self.normalize_email(email)
        user=self.model(email=email,**extra_fields)  #create a instance in CustomUser model
        user.set_password(password)                     # set_password is hashed the password befor saving
        user.save()
        return user
    def create_superuser(self,email,password=None,**extra_fields):
        extra_fields.setdefault("is_staff",True)     #allows login to the django admin
        extra_fields.setdefault("is_superuser",True)      #full access to everything in admin
        return self.create_user(email,password,**extra_fields)

class CustomUser(AbstractBaseUser,PermissionsMixin): # custom user model to use email instead of username and to add full_name field
    email=models.EmailField(unique=True)
    full_name=models.CharField(max_length=100,blank=True) 
    is_active=models.BooleanField(default=True)
    is_staff=models.BooleanField(default=False)
    date_joined=models.DateTimeField(auto_now_add=True)
    objects=CustomUserManager()
    USERNAME_FIELD='email'   #tells the django to use email instead of username
    REQUIRED_FIELDS=[]      #Required when creating a superuser via command line.
    def __str__(self):
        return self.email


