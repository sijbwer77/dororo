from django.urls import path
from rest_framework.routers import DefaultRouter

from .views_teacher import (
    AssignmentViewSet,
    SubmissionViewSet,
    ScheduleViewSet,
    LessonViewSet,
    NoticeViewSet,
    AttendanceViewSet,
)

from .views_student import (
    StudentCoursesAPIView,
    StudentCourseNoticesAPIView,

    MyInfoAPIView,
    StudentCourseDetailAPIView,
    StudentCourseAssignmentsAPIView,
    StudentCourseAttendanceAPIView,
)


router = DefaultRouter()

urlpatterns = [
    path('student/courses/', StudentCoursesAPIView.as_view(), name='student-courses'),
    path('student/course/<int:course_id>/notices/', StudentCourseNoticesAPIView.as_view()),

    path('user/me/', MyInfoAPIView.as_view(), name='user-me'),
    path('student/course/<int:course_id>/', StudentCourseDetailAPIView.as_view(), name='student-course-detail'),
    path('student/course/<int:course_id>/assignments/', StudentCourseAssignmentsAPIView.as_view(), name='student-course-assignments'),
    path('student/course/<int:course_id>/attendance/', StudentCourseAttendanceAPIView.as_view(), name='student-course-attendance'),
]

router = DefaultRouter()
router.register('assignments', AssignmentViewSet)
router.register('submissions', SubmissionViewSet)
router.register('schedule', ScheduleViewSet)
router.register('lessons', LessonViewSet)
router.register('notices', NoticeViewSet)
router.register('attendances', AttendanceViewSet)

urlpatterns += router.urls