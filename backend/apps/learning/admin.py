# apps/learning/admin.py
from django.contrib import admin

from .models import Course
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    # 나타낼 정보 선택
    list_display = ("title", "instructor", "capacity", "status", "created_at")
    search_fields = ("title", "description") # 단독 값은 여기로
    list_filter = ("status",) #범주형 값은 여기로
    readonly_fields = ("created_at", "modified_at")

from .models import StudentEnrollment
@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student','course','created_at')
    search_fields = ('student__username','course__title')
    #list_filter = ()
    readonly_fields = ('created_at',)

from .models import TeacherAssignmentRequest
@admin.register(TeacherAssignmentRequest)
class TeacherAssignmentRequestAdmin(admin.ModelAdmin):
    list_display = ('teacher','course','status','created_at')
    search_fields = ('teacher__username','course__title')
    list_filter = ('status',)
    readonly_fields = ('created_at',)

from .models import Notice
@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('course','title','content','created_at')
    search_fields = ('course__title','title')
    #list_filter = ()
    readonly_fields = ('created_at',)

from .models import Assignment
@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('course','title','description','due_date',)
    search_fields = ('course__title','title')
    #list_filter = ()
    #readonly_fields = ()

from .models import Lesson
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('course','week','title')
    search_fields = ('course__title',)
    list_filter = ('week',)
    #readonly_fields = ()

from .models import Submission
@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment','student','file','status','grade','submitted_at')
    search_fields = ('assignment__title','student__username',)
    list_filter = ('status',)
    readonly_fields = ('submitted_at',)

from .models import Schedule
@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('course','date','start_time','end_time')
    search_fields = ('course__title',)
    #list_filter = ()
    #readonly_fields = ()

from .models import Attendance
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('course','student','schedule')
    search_fields = ('course__title','student__username')
    #list_filter = ()
    #readonly_fields = ()
