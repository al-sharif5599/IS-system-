from rest_framework.permissions import BasePermission


class IsRoleAdmin(BasePermission):
    """Allow access to users marked as admin by role or superuser."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, 'is_admin', False))
