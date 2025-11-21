from django.urls import path
from .views import SignupView, LoginView, LogoutView, check_username

urlpatterns = [
    # 회원가입만 역할별
    path('signup/<str:role>/', SignupView.as_view(), name='signup'),  # /api/signup/sp/, /api/signup/mg/

    # 로그인은 하나
    path('login/',  LoginView.as_view(), name='login'),              # /api/login/
    path('logout/', LogoutView.as_view(), name='logout'),
    path('check-username/', check_username, name='check_username'),
]

