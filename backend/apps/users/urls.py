from django.urls import path
from .views import SignupView, LoginView, LogoutView, check_username

urlpatterns = [
    path('signup/<str:role>/', SignupView.as_view(), name='signup'),
    path('login/',  LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('check-username/', check_username, name='check_username'),
]
