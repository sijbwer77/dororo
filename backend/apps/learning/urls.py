
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    ScheduleViewSet,
    LessonViewSet,
    NoticeViewSet,
    AttendanceViewSet,
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'schedule', ScheduleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'notices', NoticeViewSet)
router.register(r'attendances', AttendanceViewSet)

# 관리자/강사 전용
#router.register(r'enroll', StudentEnrollmentViewSet)
#router.register(r'teacher-requests', TeacherAssignmentRequestViewSet)

urlpatterns = router.urls
