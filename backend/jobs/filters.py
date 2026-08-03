import django_filters
from django.db.models import Q
from .models import Job


class JobFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method="filter_keyword")
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    category = django_filters.NumberFilter(field_name="category_id")
    status = django_filters.ChoiceFilter(choices=Job.Status.choices)

    class Meta:
        model = Job
        fields = ["location", "category", "status"]

    def filter_keyword(self, queryset, name, value):
        return queryset.filter(Q(title__icontains=value) | Q(description__icontains=value))
