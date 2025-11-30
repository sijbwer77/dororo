from django.urls import path

from .views import (
    MyLevelView,
    TodayAttendanceStampView,
    AttendanceMapView,
)

urlpatterns = [
    path("my-level/", MyLevelView.as_view(), name="my-level"),
    path("today-attendance/", TodayAttendanceStampView.as_view(), name="today-attendance"),
    path("attendance-map/", AttendanceMapView.as_view(), name="attendance-map"),
]
