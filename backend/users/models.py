from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Shared login table for both roles. AbstractUser already gives us
    username, email, password (hashed), first_name, last_name, etc.
    """

    class Role(models.TextChoices):
        EMPLOYER = "EMPLOYER", "Employer"
        JOB_SEEKER = "JOB_SEEKER", "Job Seeker"

    role = models.CharField(max_length=20, choices=Role.choices)

    # Simple job-seeker profile fields. Split into a separate JobSeekerProfile
    # model later if this grows (resume file, skills list, etc.).
    headline = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
