from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer, LoginSerializer

# 👇 [필수] 면제권 도구들
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny

# --- 1. 통합 로그인 API ---
# Django 경비원 통과 (csrf_exempt)
@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    # 👇 [추가됨] DRF 보안요원 철수! (로그인 할 땐 인증 검사 끄기)
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # 로그인 처리 (세션 생성)
            login(request, user)
            
            account = user.local_account
            return Response({
                "ok": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "email": user.email,
                    "local_account": {
                        "role": account.role,
                        "nickname": account.nickname,
                    }
                },
                "role": account.role
            }, status=status.HTTP_200_OK)
            
        return Response({
            "ok": False, 
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# --- 2. 로그아웃 API ---
class LogoutAPIView(APIView):
    def post(self, request):
        logout(request)
        return Response({"ok": True})

# --- 3. 회원가입 API ---
# 회원가입도 토큰 검사 안 함
@method_decorator(csrf_exempt, name='dispatch')
class SignupAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, role):
        role_upper = role.upper()
        if role_upper not in ['SP', 'MG']:
            return Response({"error": "잘못된 역할입니다."}, status=400)
            
        serializer = SignupSerializer(data=request.data, context={'role': role_upper})
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            
            return Response({
                "id": user.id,
                "username": user.username,
                "role": role_upper
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 4. 아이디 중복 확인 API ---
class CheckUsernameAPIView(APIView):
    authentication_classes = [] # 이것도 검사 없이 허용
    permission_classes = [AllowAny]

    def get(self, request):
        username = request.query_params.get('username')
        if not username:
            return Response({"ok": False, "error": "username-required"}, status=400)
        
        exists = User.objects.filter(username=username).exists()
        return Response({"ok": True, "exists": exists})

# 마이페이지
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import MyPageSerializer
from .models import LocalAccount

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def mypage_view(request):
    account = LocalAccount.objects.get(user=request.user)

    # GET — 마이페이지 조회
    if request.method == "GET":
        serializer = MyPageSerializer(account)
        return Response(serializer.data)

    # PATCH — 마이페이지 수정
    if request.method == "PATCH":
        data = request.data.copy()

        # 프론트에서 solvedAc 로 보내는 경우 → solvedac_handel 로 매핑
        if "solvedAc" in data:
            data["solvedac_handel"] = data["solvedAc"]

        serializer = MyPageSerializer(
            account,
            data=data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)