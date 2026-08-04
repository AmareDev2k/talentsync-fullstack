import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talentsync_backend.settings')
django.setup()

from users.models import User

# Create a user without a company
user, _ = User.objects.get_or_create(username="test_no_company", role="EMPLOYER")

try:
    company = getattr(user, "company", None)
    print("Company:", company)
except Exception as e:
    print("Exception:", type(e).__name__, str(e))
