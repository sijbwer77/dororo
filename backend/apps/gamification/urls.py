# apps/gamification/urls.py

from django.urls import path
from .views import (
    AttendanceStatusView,
    MyLevelView,
    TodayAttendanceStampView,
    AttendanceMapView,
    CsrfCookieView,
)

urlpatterns = [
    path("csrf/", CsrfCookieView.as_view(), name="csrf-cookie"),
    # 출석 6칸 상태
    # /api/attendance/status/
    path(
        "attendance/status/",
        AttendanceStatusView.as_view(),
        name="attendance-status",
    ),

    # 내 레벨
    # /api/me/level/
    path(
        "me/level/",
        MyLevelView.as_view(),
        name="my-level",
    ),

    # 오늘 출석 도장 조회/찍기
    # /api/gamification/today-attendance/
    path(
        "gamification/today-attendance/",
        TodayAttendanceStampView.as_view(),
        name="today-attendance",
    ),

    # (선택) 출석 맵
    # /api/gamification/attendance-map/
    path(
        "gamification/attendance-map/",
        AttendanceMapView.as_view(),
        name="attendance-map",
    ),
]
