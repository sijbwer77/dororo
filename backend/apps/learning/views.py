from rest_framework import viewsets, status
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Course,
    StudentEnrollment,
    Assignment,
    Submission,
    Schedule,
    Lesson,
    Notice,
    Attendance,
    TeacherAssignmentRequest,
)
from .serializers import (
    CourseSerializer,
    StudentEnrollmentSerializer,
    AssignmentSerializer,
    SubmissionSerializer,
    SubmissionCreateSerializer,
    ScheduleSerializer,
    LessonSerializer,
    NoticeSerializer,
    AttendanceSerializer,
    TeacherAssignmentRequestSerializer,
)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    def perform_create(self, serializer):
        schedule = serializer.save()
        enrollments = schedule.course.enrollments.select_related("student")

        attendance_objects = []
        for enrollment in enrollments:
            attendance_objects.append(
                Attendance(
                    course=schedule.course,
                    student=enrollment.student,
                    schedule=schedule,
                    status='absent',
                )
            )

        Attendance.objects.bulk_create(attendance_objects)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

# 여기 코드 문제정말많습니다 다시짜야할것같아요
# 제출/ 제출확인/ 채점 이렇게 각 API로 분리 고려
class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SubmissionCreateSerializer
        return SubmissionSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        assignment = serializer.validated_data["assignment"]
        student = serializer.validated_data["student"]
        file = serializer.validated_data.get("file")

        # 파일 필요
        if not file:
            return Response({"detail": "파일을 업로드해야 합니다."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 마감 체크
        now = timezone.now()
        if assignment.due_date < now:
            return Response(
                {"detail": "마감 시간이 지나 제출할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 기존 제출 있는지 확인
        existing_submission = Submission.objects.filter(
            assignment=assignment, student=student
        ).first()

        if existing_submission:
            # 파일만 덮어쓰기
            existing_submission.file = file
            existing_submission.submitted_at = now
            existing_submission.status = "submitted"
            existing_submission.grade = None  # 평가 초기화 (원하면 유지 가능)
            existing_submission.save()

            return Response(
                SubmissionSerializer(existing_submission).data,
                status=status.HTTP_200_OK
            )

        # 첫 제출
        serializer.save(submitted_at=now, status="submitted")
        return Response(serializer.data, status=status.HTTP_201_CREATED)


#____________관리자/강사 전용 API___(수정 많이 필요함)___________
'''
class TeacherAssignmentRequestViewSet(viewsets.ModelViewSet):
    queryset = TeacherAssignmentRequest.objects.all()
    serializer_class = TeacherAssignmentRequestSerializer

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        관리자(여기서는 is_staff) 가 승인:
        - request.status = approved
        - course.instructor = teacher
        - course.status = teacher_assigned
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "승인 권한이 없습니다."},
                status=status.HTTP_403_FORBIDDEN,
            )

        req_obj = self.get_object()
        req_obj.status = "approved"
        req_obj.save()

        course = req_obj.course
        course.instructor = req_obj.teacher
        course.status = "teacher_assigned"
        course.save()

        serializer = self.get_serializer(req_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """
        관리자(여기서는 is_staff) 가 거절:
        - request.status = rejected
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "거절 권한이 없습니다."},
                status=status.HTTP_403_FORBIDDEN,
            )

        req_obj = self.get_object()
        req_obj.status = "rejected"
        req_obj.save()

        serializer = self.get_serializer(req_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = StudentEnrollment.objects.all()
    serializer_class = StudentEnrollmentSerializer

    def create(self, request, *args, **kwargs):
        """
        - 같은 학생이 같은 강의에 중복 신청 불가
        - 정원(capacity) 초과 시 신청 불가
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        student = serializer.validated_data["student"]
        course = serializer.validated_data["course"]

        # 중복 체크
        if StudentEnrollment.objects.filter(student=student, course=course).exists():
            return Response(
                {"detail": "이미 신청한 강의입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 정원 체크 (일단 0도 꽉 찬 걸로 처리)
        if course.capacity and course.enrollments.count() >= course.capacity:
            return Response(
                {"detail": "강의 정원이 모두 찼습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

'''