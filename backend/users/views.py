from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
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
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
            
class LoginView(APIView):
    permission_classes=[AllowAny]
    def post(self,request):
        serializer=CustomTokenObtainPairSerializer(data=request.data,context={"request":request})
        if serializer.is_valid():
            return Response(serializer.validated_data,status=status.HTTP_200_OK) #validated_data doesn't save anything to the database. It just returns the tokens like: {'access': '...', 'refresh': '...'}.
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
