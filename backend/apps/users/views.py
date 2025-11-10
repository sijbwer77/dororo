from django.shortcuts import render # 이건뭐지 drf 쓰면서 없어져도 되는 import 인가
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import StudentLoginSerializer
from .serializers import StudentRegisterSerializer

#구글 관련 import
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

# Create your views here.

class StudentLoginAPIView(APIView):
    def post(self, request):
        serializer = StudentLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudentRegisterAPIView(APIView):
    def post(self, request):
        serializer=StudentRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "회원가입 성공"}, status=201)
        return Response(serializer.errors, status=400)


@api_view(["POST"])
def google_login(request):
    email = request.data.get("email")
    name = request.data.get("name")

    user, created = User.objects.get_or_create(
        username=email, defaults={"email": email, "first_name": name}
    )

    refresh = RefreshToken.for_user(user)
    
    return Response({
        "token": str(refresh.access_token),
        "user": {
            "email": email,
            "name": name
        }
    })

