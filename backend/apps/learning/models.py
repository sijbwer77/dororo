# apps/learning/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

# Create your models here.

#강의 테이블
class Course(models.Model):
    STATUS_CHOICES = [
        ('new', '생성됨'),
        ('pending_teacher', '강사 모집'),
        ('teacher_assigned', '강사 배정완료'),
        ('enrolling', '학생 모집'),
        ('in_progress', '강의 진행중'),
        ('finished', '종료'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses", null=True, blank=True)
    capacity = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.title
    
class StudentEnrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student','course')
    
    def __str__(self):
        return f"{self.student.username} -> {self.course.title}"

class TeacherAssignmentRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="teacher_requests")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="teacher_requests")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teacher','course')
    
    def __str__(self):
        return f"{self.teacher.username} -> {self.course.title}"

class Notice(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="notices")
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="weeks")
    week = models.PositiveIntegerField()
    title=models.CharField(max_length=200)
    # TODO: 강의 자료나 학습 내용 저장 방식 설정 필요

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateTimeField()
    #assignment 관련해서 admin 페이지에서 표시되길 assignment object(1)
    #이렇게 표시되는거 괜찮은지 확인필요
    #과제 평가나 완료표시 관련해서도 어떻게할지 생각하기


class Submission(models.Model):
    STATUS_CHOICES={
        ("submitted", "제출됨"),
        ("graded", "평가됨"),
    }
    assignment = models.ForeignKey(Assignment, on_delete = models.CASCADE, related_name="submissions")
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='submissions/', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    grade = models.PositiveSmallIntegerField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

class Schedule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="schedules")
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present','Present'),
        ('late','Late'),
        ('absent','Absent')
    ]
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="attendances")
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name="attendances")
    status=models.CharField(max_length=20, choices=STATUS_CHOICES )
