# TalentSync - Online Job Board & Recruitment Portal 🚀

TalentSync is an end-to-end full-stack web application built to connect talented job seekers with recruiting employers. The platform allows employers to post, manage, and track job openings while enabling job seekers to search, filter, and apply for their ideal roles.

This project was developed as a self-directed full-stack implementation featuring a normalized **PostgreSQL** database, a secure **Django REST Framework (DRF)** backend API, and a responsive **React** frontend.

---

## 🛠️ Technology Stack

| Layer | Required Technology |
| :--- | :--- |
| **Frontend** | React (Functional Components + Hooks), React Router, Context API / Axios |
| **Backend** | Django, Django REST Framework (DRF), Custom Permissions, `python-dotenv` (`.env`) |
| **Database** | **PostgreSQL** (Normalized Relational Schema, Django ORM, Migrations, `psycopg2-binary`) |
| **Security** | Simple JWT Authentication, CORS/CSRF configurations, Built-in Password Hashing |
| **Email Service** | Django Core Mail Framework (SMTP / Mailtrap Integration) |
| **Version Control** | Git & GitHub (Feature Branch Workflow, Pull Requests, Incremental Commits) |

---

## 🎯 Key Features

### 👤 Role-Based Access Control (RBAC)
* **Employers:** Can register a company profile, create/edit/close job listings, and view/manage applicants exclusively for their own postings.
* **Job Seekers:** Can register, build a user profile, browse/search job listings with pagination, and submit job applications.

### 💼 Employer Dashboard
* A protected, role-exclusive dashboard displaying active/closed job postings and real-time applicant counts.
* Applicant status lifecycle management (`Applied` → `Reviewed` → `Accepted`/`Rejected`).

### 🔍 Advanced Job Browsing & Filtering
* Multi-parameter filtering by keyword, category, and location.
* Server-side pagination for optimized data rendering and performance[cite: 1].

### 📧 Integrated Email Notifications
* Triggers welcome/verification emails upon user registration[cite: 1].
* Sends status update notifications to job seekers when an employer updates their application status[cite: 1].
* Uses environment variables (`.env`) for secure SMTP credentials[cite: 1].

---

## 🗄️ Database Architecture (PostgreSQL)

The application models a normalized relational database schema in PostgreSQL[cite: 1]:
* **User Model:** Extended shared login table with a role field (`Employer` or `JobSeeker`)[cite: 1].
* **Company Model:** One-to-Many relationship (One Employer can own one Company; a Company can have many Jobs)[cite: 1].
* **Job Model:** Linked to `Company` and `Category`, storing attributes like title, description, location, salary range, and status (`open`/`closed`)[cite: 1].
* **Category Model:** One-to-Many relationship with Job listings[cite: 1].
* **Application Model:** Many-to-Many resolution table linking `Job` and `JobSeeker` with application status tracking (`applied`, `reviewed`, `rejected`, `accepted`)[cite: 1].

---

## 🚀 Local Setup & Installation Guide

### Prerequisites
* [Python 3.10+](https://www.python.org/)
* [Node.js & npm](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/) installed and running locally[cite: 1]

---
