from rest_framework import serializers
from jobs.models import Job
from .models import Application


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["id", "job", "cover_note"]
        read_only_fields = ["id"]

    def validate_job(self, job):
        if job.status != Job.Status.OPEN:
            raise serializers.ValidationError("This job is no longer accepting applications.")
        return job

    def validate(self, attrs):
        request = self.context["request"]
        if Application.objects.filter(job=attrs["job"], applicant=request.user).exists():
            raise serializers.ValidationError("You've already applied to this job.")
        return attrs


class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.company.name", read_only=True)
    applicant_username = serializers.CharField(source="applicant.username", read_only=True)
    applicant_email = serializers.CharField(source="applicant.email", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id", "job", "job_title", "company_name",
            "applicant", "applicant_username", "applicant_email",
            "status", "cover_note", "applied_at", "updated_at",
        ]
        # Only status is ever changed after creation (by the employer).
        read_only_fields = ["id", "job", "applicant", "cover_note", "applied_at", "updated_at"]
