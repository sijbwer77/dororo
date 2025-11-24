from rest_framework import serializers
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

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"

class StudentEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentEnrollment
        fields = "__all__"

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"

# 조회용
class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = "__all__" # 전체 확인 가능
# 학생 제출용
class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['file', 'assignment', 'student'] #입력받을 인자만 저장


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = "__all__"

    def validate(self, attrs):
        start = attrs.get("start_time")
        end = attrs.get("end_time")
        if start and end and start >= end:
            raise serializers.ValidationError("종료 시간은 시작 시간보다 늦어야 합니다.")
        return attrs


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = "__all__"

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = "__all__"

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = "__all__"

class TeacherAssignmentRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherAssignmentRequest
        fields = "__all__"
