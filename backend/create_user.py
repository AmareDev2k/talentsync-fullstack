import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'talentsync_backend.settings')
django.setup()

from users.models import User  # noqa: E402
from companies.models import Company  # noqa: E402

# Fix user
user, created = User.objects.get_or_create(username="test_employer_2", email="test2@emp.com", role=User.Role.EMPLOYER)
if created:
    user.set_password("Password123!")
    user.save()
Company.objects.get_or_create(owner=user, name="Test Co")
