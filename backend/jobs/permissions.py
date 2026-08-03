from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsJobOwnerOrReadOnly(BasePermission):
    """Anyone can view a job; only the owning company's employer can edit/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.company.owner_id == request.user.id
