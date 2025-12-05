# apps/learning/views_student.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from django.shortcuts import get_object_or_404
from django.utils import timezone


from .models import Course, Assignment, Attendance, Submission
from .serializers import StudentCourseListSerializer, StudentNoticeSerializer, StudentAssignmentSerializer, SubmissionSerializer

# 강의 목록
class StudentCoursesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user
        print("DEBUG >> request.user =", request.user)
        
        enrollments = student.enrollments.select_related("course")
        courses = [e.course for e in enrollments]

        serializer = StudentCourseListSerializer(courses, many=True)
        return Response(serializer.data)

# 강의별 공지
class StudentCourseNoticesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        student = request.user

        # 학생이 수강 중인 강의인지 확인
        course = get_object_or_404(
            Course.objects.filter(enrollments__student=student),
            id=course_id
        )

        # 해당 강의의 공지 리스트 가져오기
        notices = course.notices.order_by('-created_at')

        # 학생 전용 NoticeSerializer로 응답
        serializer = StudentNoticeSerializer(notices, many=True)
        return Response(serializer.data)


class StudentAssignmentsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        student = request.user

        course = get_object_or_404(
            Course.objects.filter(enrollments__student=student),
            id=course_id
        )
        assignments = Assignment.objects.filter(course=course).order_by("due_date")
        serializer = StudentAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


from rest_framework.parsers import MultiPartParser, FormParser

class StudentAssignmentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, course_id, assignment_id):
        student = request.user

        course = get_object_or_404(
            Course.objects.filter(enrollments__student=student),
            id=course_id
        )

        assignment = get_object_or_404(
            Assignment,
            id=assignment_id,
            course=course
        )

        submission = Submission.objects.filter(
            assignment=assignment,
            student=student
        ).first()

        return Response({
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_date": assignment.due_date,
            "file": assignment.file.url if assignment.file else None,
            "submitted": submission is not None,
            "submitted_file": submission.file.url if submission else None,
        })

    def post(self, request, course_id, assignment_id):
        student = request.user

        course = get_object_or_404(
            Course.objects.filter(enrollments__student=student),
            id=course_id
        )
        
        print("FILES:", request.FILES)
        print("DATA:", request.data)
        assignment = get_object_or_404(
            Assignment, id=assignment_id, course=course
        )
        
        file = request.FILES.get("file")
        

        if not file:
            return Response({"detail": "file is required"}, status=400)

        now = timezone.now()
        if assignment.due_date < now:
            return Response({"detail": "마감 시간이 지났습니다"}, status=400)

        submission, created = Submission.objects.get_or_create(
            assignment=assignment,
            student=student
        )

        submission.file = file
        submission.submitted_at = now
        submission.status = "submitted"
        submission.save()
        return Response(SubmissionSerializer(submission).data, status=200)

class LessonAPIView(APIView):
    permission_classes = [IsAuthenticated]




# 여기부터는 아직 코드 작성 안됨
class MyInfoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # LocalAccount가 1:1 로 존재한다고 가정
        local = getattr(user, "local_account", None)

        return Response({
            "id": user.id,
            "username": user.username,
            "full_name": user.first_name,
            "email": user.email,
            "nickname": local.nickname if local else "",
            "phone_number": local.phone_number if local else "",
            "role": local.role if local else "",
        })

class StudentCourseAttendanceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        student = request.user

        # 본인 강의인지 확인
        get_object_or_404(
            Course.objects.filter(enrollments__student=student),
            id=course_id
        )

        attendances = Attendance.objects.filter(
            course_id=course_id,
            student=student
        )

        return Response(AttendanceSerializer(attendances, many=True).data)
