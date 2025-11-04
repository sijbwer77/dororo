from django.db import models

# Create your models here.
from django.contrib.auth.models import User

# Create your models here.

class LocalAccount(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin','Admin'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, unique=True)
    nickname = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    role = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} ({self.role})"