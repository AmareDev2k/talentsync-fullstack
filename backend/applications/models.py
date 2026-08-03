from django.conf import settings
from django.db import models
from jobs.models import Job


class Application(models.Model):
    """
    Resolves the many-to-many between Job Seekers and Jobs, with a status
    lifecycle: applied -> reviewed -> accepted/rejected.
    """

    class Status(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        REVIEWED = "REVIEWED", "Reviewed"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications",
        limit_choices_to={"role": "JOB_SEEKER"},
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.APPLIED)
    cover_note = models.TextField(blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-applied_at"]
        constraints = [
            models.UniqueConstraint(fields=["job", "applicant"], name="unique_application_per_job"),
        ]

    def __str__(self):
        return f"{self.applicant} -> {self.job} [{self.status}]"
