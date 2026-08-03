from rest_framework.permissions import BasePermission


class IsEmployer(BasePermission):
    """Allows access only to authenticated users with role EMPLOYER."""
    message = "This action is restricted to employer accounts."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "EMPLOYER"
        )


class IsJobSeeker(BasePermission):
    """Allows access only to authenticated users with role JOB_SEEKER."""
    message = "This action is restricted to job seeker accounts."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "JOB_SEEKER"
        )
