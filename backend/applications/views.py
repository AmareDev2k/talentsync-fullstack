from typing import cast

from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.request import Request

from users.models import User
from users.permissions import IsEmployer, IsJobSeeker
from .models import Application
from .serializers import ApplicationSerializer, ApplicationCreateSerializer
from .emails import send_application_confirmation_email


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    - Job Seekers: can create an application, and list/view their own.
    - Employers: can list/view applications for jobs under their own company,
      and update an application's status (reviewed/accepted/rejected).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsJobSeeker()]
        if self.action in ("update", "partial_update"):
            return [permissions.IsAuthenticated(), IsEmployer()]
        if self.action == "destroy":
            return [permissions.IsAuthenticated(), IsJobSeeker()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = cast(User, self.request.user)
        qs = Application.objects.select_related("job", "job__company", "applicant")
        if user.role == "EMPLOYER":
            qs = qs.filter(job__company__owner=user)
        else:
            qs = qs.filter(applicant=user)
        job_id = cast(Request, self.request).query_params.get("job")
        if job_id:
            qs = qs.filter(job_id=job_id)
        return qs

    def perform_create(self, serializer):
        application = serializer.save(applicant=self.request.user)
        send_application_confirmation_email(application)

    def _check_employer_owns_job(self, application):
        if application.job.company.owner_id != self.request.user.id:
            raise PermissionDenied("You can only manage applications for your own job postings.")

    def perform_update(self, serializer):
        self._check_employer_owns_job(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        # A job seeker withdrawing their own application.
        if instance.applicant_id != self.request.user.id:
            raise PermissionDenied("You can only withdraw your own application.")
        instance.delete()
