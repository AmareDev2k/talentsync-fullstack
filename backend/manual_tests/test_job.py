import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# pyrefly: ignore [missing-import]
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talentsync_backend.settings')
django.setup()

from jobs.serializers import JobSerializer  # noqa: E402

payload = {
    "title": "Software Engineer",
    "description": "Great job",
    "location": "Remote",
    "salary_min": None,
    "salary_max": None,
    "category": None,
    "status": "OPEN",
}

serializer = JobSerializer(data=payload)
if serializer.is_valid():
    print("Valid!")
else:
    print("Invalid:", serializer.errors)
