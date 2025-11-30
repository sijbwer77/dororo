# apps/learning/views_student.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404

from .models import Course, Assignment, Attendance
from .serializers import CourseListSerializer,StudentNoticeSerializer
from .serializers import AssignmentSerializer, AttendanceSerializer


# 강의 목록
class StudentCoursesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user

        
        enrollments = student.enrollments.select_related("course")
        courses = [e.course for e in enrollments]

        serializer = CourseListSerializer(courses, many=True)
        return Response(serializer.data)

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




# 1) 내 정보
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

# 3) 학생 강의 상세
class StudentCourseDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        student = request.user

        # 수강 중인지 확인
        course = get_object_or_404(
            Course.objects.filter(enrollments__student=student),
            id=course_id
        )

        return Response(CourseSerializer(course).data)


# 4) 강의 과제 목록
class StudentCourseAssignmentsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        student = request.user
        
        # 본인 강의인지 확인
        get_object_or_404(
            Course.objects.filter(enrollments__student=student),
            id=course_id
        )

        assignments = Assignment.objects.filter(course_id=course_id)
        return Response(AssignmentSerializer(assignments, many=True).data)


# 5) 강의 출석 목록
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
