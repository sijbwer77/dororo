# apps/schedule/views.py
from rest_framework import viewsets, permissions
from rest_framework.response import Response

from .models import ScheduleEvent
from .serializers import ScheduleEventSerializer

# 🔹 learning 앱 *읽기만* 하기 위해 import (수정 아님)
from apps.learning.models import Schedule as CourseSchedule, StudentEnrollment


class MyScheduleEventViewSet(viewsets.ModelViewSet):
    """
    /api/me/schedules/

    - GET: 내 일정 리스트 (월별 필터 지원)
      👉 ScheduleEvent(내가 직접 넣은 일정)
         + 내가 수강 중인 강의들의 learning.Schedule(강의 일정)
         를 합쳐서 반환

    - POST: 내 개인 일정 생성 (ScheduleEvent, type='personal')
    - PATCH/DELETE: 내 개인 일정 수정/삭제
    """

    serializer_class = ScheduleEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        retrieve / update / destroy 에서 사용하는 쿼리셋.
        👉 여기서는 *내 ScheduleEvent 레코드만* 대상으로 삼는다.
        (강의 일정은 DB에 안 만들고, list()에서 on-the-fly로 붙임)
        """
        return (
            ScheduleEvent.objects.filter(user=self.request.user)
            .order_by("date", "start_time", "id")
        )

    def list(self, request, *args, **kwargs):
        user = request.user
        year = request.query_params.get("year")
        month = request.query_params.get("month")

        # 1) 내 ScheduleEvent (개인 일정 + 이미 type='course'로 들어온 것들)
        event_qs = ScheduleEvent.objects.filter(user=user)
        if year:
            event_qs = event_qs.filter(date__year=year)
        if month:
            event_qs = event_qs.filter(date__month=month)

        event_qs = event_qs.order_by("date", "start_time", "id")
        event_data = ScheduleEventSerializer(event_qs, many=True).data

        # 2) 내가 수강 중인 강의들의 learning.Schedule 읽어오기
        #    - StudentEnrollment 통해서 "내가 듣는 강의 id" 뽑고
        #    - 그 course_id들의 Schedule만 필터
        enrolled_course_ids = (
            StudentEnrollment.objects.filter(student=user)
            .values_list("course_id", flat=True)
        )

        course_schedules = (
            CourseSchedule.objects.filter(course_id__in=enrolled_course_ids)
            .select_related("course")
            .order_by("date", "start_time", "id")
        )

        if year:
            course_schedules = course_schedules.filter(date__year=year)
        if month:
            course_schedules = course_schedules.filter(date__month=month)

        # 3) learning.Schedule -> 일정 응답 형태(dict)로 변환해서 event_data에 추가
        #    ScheduleEventSerializer 출력 형태에 맞춰서 맞춤
        #    id는 충돌 방지용으로 "course-<스케줄id>" 문자열 사용
        for cs in course_schedules:
            course = cs.course
            event_data.append(
                {
                    # 문자열이어도 JSON에선 상관 없음
                    "id": f"course-{cs.id}",
                    "date": cs.date.isoformat(),
                    "start_time": cs.start_time.strftime("%H:%M:%S")
                    if cs.start_time
                    else None,
                    "end_time": cs.end_time.strftime("%H:%M:%S")
                    if cs.end_time
                    else None,
                    "title": course.title,  # 캘린더 카드에 보일 이름
                    "description": "",
                    "status": "planned",  # ScheduleEvent.STATUS_CHOICES 중 하나 
                    "type": "course",     # ScheduleEvent.TYPE_CHOICES 중 'course' 
                    "course": {
                        "id": course.id,
                        "name": course.title,
                        "color": "",  # 원하면 course_type별 색상 나중에 매핑 가능
                    },
                }
            )

        # 4) 개인 일정 + 강의 일정 섞인 리스트를 날짜/시간 기준으로 한 번 더 정렬
        def sort_key(ev):
            return (
                ev.get("date") or "",
                ev.get("start_time") or "",
                str(ev.get("id")),
            )

        event_data.sort(key=sort_key)

        return Response(event_data)

    def perform_create(self, serializer):
        """
        POST /api/me/schedules/ 로 들어오는 건
        👉 항상 '내 개인 일정' 생성 용도
        (user는 serializer에서 context로 받아서 저장)
        """
        serializer.save()
