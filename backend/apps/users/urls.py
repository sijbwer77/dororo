from django.urls import path
from .views import StudentLoginAPIView
from .views import StudentRegisterAPIView
from .views import google_login

urlpatterns = [
    path("student/login/", StudentLoginAPIView.as_view(), name="student_login"),
    path("student/register/", StudentRegisterAPIView.as_view(), name="student_register"),
    path("google/", google_login, name="google_login"),
]
