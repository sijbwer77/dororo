from django.db import models

from django.conf import settings
from apps.learning.models import Course

class Group(models.Model):
    name = models.CharField(max_length=200)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="groups")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"({self.course}) {self.name}"

class GroupMember(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("group", "user")
    
    def __str__(self):
        return f"{self.user} in {self.group}"

class GroupFile(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="files")
    uploader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True) # models.SET_NULL - 사용자 삭제되어도 파일 날라가지 않음
    file = models.FileField(upload_to="group")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.group.name}: {self.file.name}"

class GroupMessage(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.group}] {self.user}: {self.content[:20]}"

class Document(models.Model):
    BLOCK_TYPES = (
        ("page", "Page"),
        ("text", "Text"),
        ("file", "File"),
        ("toggle", "Toggle"),
        ("divider", "Divider"),
    )

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="documents")
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="children")
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPES)

    content = models.TextField(blank=True)
    file = models.FileField(upload_to="resources/team/document_files/", null=True, blank=True)
    order_index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order_index"]

    def __str__(self):
        return f"{self.block_type}: {self.content[:30] if self.content else '(no content)'}"
