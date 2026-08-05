import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# pyrefly: ignore [missing-import]
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talentsync_backend.settings')
django.setup()

from users.models import User  # noqa: E402

# Create a user without a company
user, _ = User.objects.get_or_create(username="test_no_company", role="EMPLOYER")

try:
    company = getattr(user, "company", None)
    print("Company:", company)
except Exception as e:
    print("Exception:", type(e).__name__, str(e))
