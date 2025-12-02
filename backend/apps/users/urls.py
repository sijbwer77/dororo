# apps/users/urls.py

from django.urls import path
from .views import LoginAPIView, LogoutAPIView, SignupAPIView, CheckUsernameAPIView

urlpatterns = [
    # 로그인 / 로그아웃
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    
    # 회원가입 (role을 url 파라미터로 받음: sp 또는 mg)
    path("signup/<str:role>/", SignupAPIView.as_view(), name="signup"),
    
    # 아이디 중복 확인
    path("check-username/", CheckUsernameAPIView.as_view(), name="check_username"),
]