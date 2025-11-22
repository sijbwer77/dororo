# apps/message/urls.py
from rest_framework.routers import DefaultRouter
from .views import CourseMessageViewSet

router = DefaultRouter()
router.register(r"messages", CourseMessageViewSet, basename="course-message")

urlpatterns = router.urls
