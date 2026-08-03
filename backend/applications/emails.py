from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


def send_application_confirmation_email(application):
    applicant = application.applicant
    job = application.job
    company = job.company

    subject = "Application received"
    context = {
        "applicant_name": applicant.first_name or applicant.username,
        "job_title": job.title,
        "company_name": company.name,
    }
    text_content = render_to_string("applications/emails/application_confirmation.txt", context)
    html_content = render_to_string("applications/emails/application_confirmation.html", context)

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[applicant.email],
    )
    message.attach_alternative(html_content, "text/html")
    message.send()
