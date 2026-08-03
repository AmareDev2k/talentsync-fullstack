from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCompanyOwnerOrReadOnly(BasePermission):
    """Anyone can view a company profile; only its owner can edit/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id
