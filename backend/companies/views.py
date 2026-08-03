from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError

from users.permissions import IsEmployer
from .models import Company
from .serializers import CompanySerializer
from .permissions import IsCompanyOwnerOrReadOnly


class CompanyViewSet(viewsets.ModelViewSet):
    """
    Company profiles.
    - Anyone can browse/view companies.
    - Only an authenticated Employer can create a company.
    - Only that company's owner can update/delete it.
    """

    queryset = Company.objects.all().order_by("name")
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsEmployer()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsEmployer(), IsCompanyOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        if Company.objects.filter(owner=self.request.user).exists():
            raise ValidationError("You already have a company profile. Edit it instead of creating a new one.")
        serializer.save(owner=self.request.user)
