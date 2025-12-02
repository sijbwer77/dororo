from datetime import timedelta

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import DailyLmsAccess
from .services import update_profile_and_build_status
from .serializers import GamificationStatusSerializer


class MyLevelView(APIView):
    """
    GET /api/gamification/my-level/

    - STAGE / STEP
    - 전체 점수 / 최대 점수
    - 현재 STEP EXP (cur / max)
    - 전체 진행률
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        status_dict = update_profile_and_build_status(request.user)
        serializer = GamificationStatusSerializer(status_dict)
        return Response(serializer.data)


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
        obj = self.get_today_obj(request.user)

        data = {
            "date": str(obj.date),
            "has_accessed": obj.has_accessed,
            "is_checked": obj.is_checked,
            "can_check": obj.has_accessed and not obj.is_checked,
        }
        return Response(data)

    def post(self, request, *args, **kwargs):
        obj = self.get_today_obj(request.user)

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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        today = timezone.now().date()

        # 이 유저의 가장 첫 LMS 접속/도장 날짜를 1일차 기준으로 사용
        qs = DailyLmsAccess.objects.filter(user=user).order_by("date")
        if qs.exists():
            start_date = qs.first().date
        else:
            # 아직 아무 기록 없으면 오늘이 1일차
            start_date = today

        days = []
        for i in range(6):
            date = start_date + timedelta(days=i)
            obj = DailyLmsAccess.objects.filter(user=user, date=date).first()

            has_accessed = obj.has_accessed if obj else False
            is_checked = obj.is_checked if obj else False

            if date < today:
                status = "done" if is_checked else "upcoming"
            elif date == today:
                if is_checked:
                    status = "done"
                elif has_accessed:
                    status = "current"
                else:
                    status = "upcoming"
            else:
                status = "upcoming"

            days.append(
                {
                    "index": i + 1,
                    "date": str(date),
                    "status": status,
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
        return Response(data)