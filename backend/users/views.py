from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser
from rest_framework.permissions import AllowAny,IsAuthenticated
from  .serializers import RegisterSerializer,UserSerializer,CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        serializer=RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user=serializer.save()
            user_data=UserSerializer(user).data
            return Response(user_data,status=status.HTTP_201_CREATED)
        print("REGISTER ERRORS:", serializer.errors)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
            
class LoginView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        serializer=CustomTokenObtainPairSerializer(data=request.data,context={"request":request})
        if serializer.is_valid():
            return Response(serializer.validated_data,status=status.HTTP_200_OK) #validated_data doesn't save anything to the database. It just returns the tokens like: {'access': '...', 'refresh': '...'}.
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        serializer=UserSerializer(request.user)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
class EmailCheckView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        email=request.data.get("email")
        exists=CustomUser.objects.filter(email=email).exists()
        return Response({"exists":exists},status=status.HTTP_200_OK)