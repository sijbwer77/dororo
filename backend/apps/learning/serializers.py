# apps/learning/serializers.py
from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)

    class Meta:
        model = Course
        #fields = "__all__"
        fields = [
            "id",
            "title",
            "description",
            "instructor",
            "capacity",
            "status",
            "is_published",
            "created_at",
            "modified_at",
            "instructor_name",
        ]
        read_only_fields = ("created_at", "modified_at", "instructor_name")