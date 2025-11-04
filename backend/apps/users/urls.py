from django.urls import path
from .views import student_signup_api  # 위에서 export한 이름

app_name = "users"
urlpatterns = [
    path("api/users/student/signup/", student_signup_api, name="student_signup"),
]
