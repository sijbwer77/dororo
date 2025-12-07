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


class LessonMaterialSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ("id", "title", "material_type", "url")

    def get_url(self, obj):
        request = self.context.get("request")
        if obj.material_type == "pdf" and obj.file:
            return request.build_absolute_uri(obj.file.url)
        if obj.material_type == "video" and obj.video_url:
            return obj.video_url
        return None

class WeekSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    materials = LessonMaterialSerializer(many=True)

class LearningPageSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    weeks = WeekSerializer(many=True)
    progress = serializers.ListField()


class StudentCourseListSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'dimc_type', 'course_type', 'status', 'instructor_name']

    def get_instructor_name(self, obj):
        instructor = obj.instructor  # Course 모델의 FK :contentReference[oaicite:1]{index=1}
        if not instructor:
            return "-"
        full_name = instructor.get_full_name()
        return full_name or instructor.username

class StudentNoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = ['id', 'title', 'content', 'created_at']

class StudentAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ["id", "title", "description", "due_date", "file", ]

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ["id", "assignment", "student", "file", "status", "grade", "submitted_at",]





class CourseManageSerializer(serializers.ModelSerializer):
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
