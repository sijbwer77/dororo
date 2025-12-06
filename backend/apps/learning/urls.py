from django.urls import path
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

from .views_student import (
    StudentCoursesAPIView,
    StudentCourseNoticesAPIView,
    StudentAssignmentsAPIView,
    StudentAssignmentDetailAPIView,
    StudentCourseLessonsAPIView,

    MyInfoAPIView,
    StudentCourseAttendanceAPIView,
)
urlpatterns = [
    path('student/courses/', StudentCoursesAPIView.as_view(), name='student-courses'),
    path('student/course/<int:course_id>/notices/', StudentCourseNoticesAPIView.as_view()),
    path("student/course/<int:course_id>/assignments/", StudentAssignmentsAPIView.as_view()),
    path("student/course/<int:course_id>/assignment/<int:assignment_id>/",StudentAssignmentDetailAPIView.as_view()),
    path("student/courses/<int:course_id>/lessons/",StudentCourseLessonsAPIView.as_view()),
    
    #아래는 수정중
    path('user/me/', MyInfoAPIView.as_view(), name='user-me'),
    path('student/course/<int:course_id>/attendance/', StudentCourseAttendanceAPIView.as_view(), name='student-course-attendance'),
]

from .views_teacher import (
    AssignmentViewSet,
    SubmissionViewSet,
    ScheduleViewSet,
    LessonViewSet,
    NoticeViewSet,
    AttendanceViewSet,
)
router.register('assignments', AssignmentViewSet)
router.register('submissions', SubmissionViewSet)
router.register('schedule', ScheduleViewSet)
router.register('lessons', LessonViewSet)
router.register('notices', NoticeViewSet)
router.register('attendances', AttendanceViewSet)

urlpatterns += router.urls