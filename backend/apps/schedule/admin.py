# apps/schedule/admin.py
from django.contrib import admin
from .models import ScheduleEvent

@admin.register(ScheduleEvent)
class ScheduleEventAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "date", "type", "status")
    list_filter = ("type", "status", "date")
    search_fields = ("title", "description", "course_name")
