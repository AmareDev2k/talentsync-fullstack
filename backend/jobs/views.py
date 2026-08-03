from django.db.models import Count
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from users.permissions import IsEmployer
from .models import Category, Job
from .serializers import CategorySerializer, JobSerializer
from .permissions import IsJobOwnerOrReadOnly
from .filters import JobFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Job categories — read-only via the API (managed through /admin/)."""

    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class JobViewSet(viewsets.ModelViewSet):
    """
    Job listings.
    - Anyone can browse/search open jobs (keyword, category, location, pagination).
    - Only an Employer with a company can post a job.
    - Only that job's owning employer can edit/close/delete it.
    """

    queryset = Job.objects.select_related("company", "category").all()
    serializer_class = JobSerializer
    filterset_class = JobFilter

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsEmployer()]
        if self.action in ("update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsEmployer(), IsJobOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Public browsing only ever sees open jobs; employers see all their own via my_jobs/
        if self.action in ("list", "retrieve") and not (
            self.request.user.is_authenticated and self.request.user.role == "EMPLOYER"
        ):
            qs = qs.filter(status=Job.Status.OPEN)
        return qs

    def perform_create(self, serializer):
        company = getattr(self.request.user, "company", None)
        if company is None:
            raise ValidationError("You need to create a company profile before posting a job.")
        serializer.save(company=company)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated, IsEmployer])
    def my_jobs(self, request):
        """GET /api/jobs/my_jobs/ — the logged-in employer's own postings + applicant counts."""
        jobs = (
            Job.objects.filter(company__owner=request.user)
            .select_related("category")
            .annotate(applications_count=Count("applications"))
            .order_by("-created_at")
        )
        page = self.paginate_queryset(jobs)
        serializer = self.get_serializer(page if page is not None else jobs, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)
