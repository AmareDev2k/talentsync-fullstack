from types import SimpleNamespace

from django.core import mail
from django.test import TestCase, override_settings

from .emails import send_application_confirmation_email


class ApplicationEmailTests(TestCase):
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_send_application_confirmation_email(self):
        applicant = SimpleNamespace(
            username="sarah",
            first_name="Sarah",
            last_name="Nguyen",
            email="sarah@example.com",
        )
        company = SimpleNamespace(name="TalentSync")
        job = SimpleNamespace(title="Backend Developer", company=company)
        application = SimpleNamespace(applicant=applicant, job=job)

        send_application_confirmation_email(application)

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [applicant.email])
        self.assertIn("Application received", mail.outbox[0].subject)
        self.assertIn(job.title, mail.outbox[0].body)
