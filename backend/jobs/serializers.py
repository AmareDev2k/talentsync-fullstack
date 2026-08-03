from rest_framework import serializers
from .models import Category, Job


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)
    applications_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Job
        fields = [
            "id", "company", "company_name", "category", "category_name",
            "title", "description", "location", "salary_min", "salary_max",
            "status", "created_at", "updated_at", "applications_count",
        ]
        read_only_fields = ["id", "company", "created_at", "updated_at"]
