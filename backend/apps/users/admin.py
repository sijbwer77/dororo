# apps/users/admin.py
from django.contrib import admin
from .models import LocalAccount

@admin.register(LocalAccount)
class LocalAccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'nickname', 'role')
