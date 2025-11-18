from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    StudentEnrollmentViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    ScheduleViewSet
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'enroll', StudentEnrollmentViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'schedule', ScheduleViewSet)

urlpatterns = router.urls
