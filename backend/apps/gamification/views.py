# apps/gamification/views.py

from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DailyLmsAccess
from .services import get_attendance_count, update_profile_and_build_status, track_lms_access

from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response


class AttendanceStatusView(APIView):
    """
    GET /api/attendance/status/

    - 명세서에 맞게 1~6일차 출석 상태를 내려준다.
    - 상태 값: "done" | "current" | "upcoming"
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        attendance_count = get_attendance_count(user)

        def get_status(idx: int) -> str:
            """
            idx: 1 ~ 6 (일차)
            """
            if attendance_count >= 6:
                return "done"

            if idx <= attendance_count:
                return "done"
            elif idx == attendance_count + 1:
                return "current"
            else:
                return "upcoming"

        data = {
            "firstDayStatus": get_status(1),
            "secondDayStatus": get_status(2),
            "thirdDayStatus": get_status(3),
            "fourthDayStatus": get_status(4),
            "fifthDayStatus": get_status(5),
            "sixthDayStatus": get_status(6),
        }
        return Response(data, status=status.HTTP_200_OK)


class MyLevelView(APIView):
    """
    GET /api/me/level/

    - 현재 유저의 게이미피케이션 레벨/점수/EXP 정보 반환
    - 응답 형태:
      {
        "exp": {...},
        "trait": ...,
        "badges": [],
        "background": null,
        "submarine": null
      }
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # 점수/레벨 다시 계산 + GamificationProfile 업데이트
        status_dict = update_profile_and_build_status(user)

        data = {
            "exp": {
                "total": status_dict["total_score"],
                "max": status_dict["max_score"],
                "stage": status_dict["stage"],
                "step": status_dict["step"],
                "globalProgress": status_dict["global_progress"],
                "stepExpCurrent": status_dict["step_exp_current"],
                "stepExpMax": status_dict["step_exp_max"],
                "isClear": status_dict["is_clear"],
            },
            # 아직 구현 안 한 것들은 일단 빈 값/더미
            "trait": None,
            "badges": [],
            "background": None,
            "submarine": None,
        }

        return Response(data, status=status.HTTP_200_OK)


class TodayAttendanceStampView(APIView):
    """
    GET  /api/gamification/today-attendance/
        → 오늘 LMS 접속/도장 상태 조회

    POST /api/gamification/today-attendance/
        → (오늘 LMS에 접속한 상태에서) 출석 도장 클릭
           - is_checked=True 로 만들고, 점수/레벨 재계산
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_today_obj(self, user):
        today = timezone.now().date()
        obj, _ = DailyLmsAccess.objects.get_or_create(
            user=user,
            date=today,
            defaults={"has_accessed": False, "is_checked": False},
        )
        return obj

    def get(self, request, *args, **kwargs):
        user = request.user
        obj = self.get_today_obj(user)

        data = {
            "date": str(obj.date),
            "has_accessed": obj.has_accessed,
            "is_checked": obj.is_checked,
            "can_check": obj.has_accessed and not obj.is_checked,
        }
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        obj = self.get_today_obj(request.user)
        obj = track_lms_access(request.user)

        if not obj.has_accessed:
            # LMS 접속 로그가 없으면 출석 도장 찍기 불가
            return Response(
                {"detail": "오늘은 아직 LMS에 접속한 기록이 없어서 출석을 찍을 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if obj.is_checked:
            # 이미 찍은 날이면 다시 점수 안 줌
            return Response(
                {"detail": "이미 오늘 출석 도장을 찍었습니다."},
                status=status.HTTP_200_OK,
            )

        # 여기서 도장 찍기
        obj.is_checked = True
        obj.save(update_fields=["is_checked", "updated_at"])

        # 출석 1회 늘었으니 점수/레벨 재계산
        status_dict = update_profile_and_build_status(request.user)

        return Response(status_dict, status=status.HTTP_200_OK)


class AttendanceMapView(APIView):
    """
    (선택) 6일 출석 맵
    GET /api/gamification/attendance-map/
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.now().date()

        qs = DailyLmsAccess.objects.filter(user=user).order_by("date")
        if qs.exists():
            start_date = qs.first().date
        else:
            start_date = today

        days = []
        for i in range(6):
            date = start_date + timedelta(days=i)
            obj = DailyLmsAccess.objects.filter(user=user, date=date).first()

            has_accessed = obj.has_accessed if obj else False
            is_checked = obj.is_checked if obj else False

            if date < today:
                status_str = "done" if is_checked else "upcoming"
            elif date == today:
                if is_checked:
                    status_str = "done"
                elif has_accessed:
                    status_str = "current"
                else:
                    status_str = "upcoming"
            else:
                status_str = "upcoming"

            days.append(
                {
                    "index": i + 1,
                    "date": str(date),
                    "status": status_str,
                }
            )

        delta_days = (today - start_date).days
        if delta_days < 0:
            today_index = 1
        elif delta_days >= 6:
            today_index = 6
        else:
            today_index = delta_days + 1

        data = {
            "days": days,
            "today_index": today_index,
        }
        return Response(data, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfCookieView(APIView):
    """
    GET /api/csrf/
    → csrftoken 쿠키만 발급해주는 용도
    """

    authentication_classes = []  # 로그인 안 해도 됨
    permission_classes = []

    def get(self, request, *args, **kwargs):
        return Response({"detail": "CSRF cookie set"})