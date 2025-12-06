# apps/schedule/urls.py
from rest_framework.routers import DefaultRouter
from .views import MyScheduleEventViewSet

router = DefaultRouter()
router.register(r"me/schedules", MyScheduleEventViewSet, basename="me-schedule")

urlpatterns = router.urls
