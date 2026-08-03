from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Company
        fields = [
            "id", "owner", "owner_username", "name", "description",
            "website", "location", "logo_url", "created_at",
        ]
        read_only_fields = ["id", "owner", "created_at"]
