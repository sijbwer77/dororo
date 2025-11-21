from django.contrib.auth import login, logout, get_user_model
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from .models import LocalAccount
from .serializers import (
    SignupSerializer, LoginSerializer, UserSerializer
)

User = get_user_model()


# views.py
class SignupView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request, role):
        if role not in ['sp', 'mg']:
            return Response({'detail': 'invalid role'}, status=400)

        serializer = SignupSerializer(data=request.data,
                                      context={'role': role})
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response(UserSerializer(user).data,
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# views.py
class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'ok': False, 'errors': serializer.errors}, status=400)

        user = serializer.validated_data['user']
        login(request, user)

        # 유저 정보 직렬화
        user_data = UserSerializer(user).data

        # DB에서 역할 가져오기
        try:
            local = user.local_account
            role = local.role   # 'SP' 또는 'MG'
        except LocalAccount.DoesNotExist:
            role = None

        return Response({
            'ok': True,
            'user': user_data,
            'role': role,        # 👈 프론트가 이 값 보고 학생/매니저 구분
        })



class LogoutView(views.APIView):
    def post(self, request):
        logout(request)
        return Response({'ok': True})
@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    username = request.query_params.get('username', '').strip()
    if not username:
        return Response({'ok': False, 'error': 'username-required'}, status=400)

    exists = User.objects.filter(username=username).exists()
    return Response({'ok': True, 'exists': exists})
