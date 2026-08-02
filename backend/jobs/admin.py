from django.contrib import admin
from .models import Category, Job

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "category", "status", "location", "created_at")
    list_filter = ("status", "category")
    search_fields = ("title", "description", "location")
