# apps/learning/permissions.py
from rest_framework.permissions import BasePermission

class IsStudent(BasePermission):
    """
    local_account.role == 'SP' 인 사용자만 허용
    (Student / 학생)
    """
    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        local = getattr(user, "local_account", None)
        return getattr(local, "role", None) == "SP"
