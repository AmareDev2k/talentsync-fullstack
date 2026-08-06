# Frontend and Backend Integration

This project uses a Vite React frontend and a Django REST Framework backend.

## What is connected

- JWT login and refresh flow through `/api/users/login/` and `/api/users/login/refresh/`
- Current profile lookup through `/api/users/me/`
- Jobs feed through `/api/jobs/`
- Employer job list through `/api/jobs/my_jobs/`

## Backend changes

- `corsheaders.middleware.CorsMiddleware` is now first in `MIDDLEWARE`
- `Authorization` is explicitly allowed in CORS headers
- `CORS_ALLOWED_ORIGINS` includes localhost ports `3000` and `5173`

## Frontend files added

- `frontend/.env.local`
- `frontend/src/services/api.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/components/JobFeed.jsx`

## How to run

1. Start the Django backend:

   ```bash
   python manage.py runserver 8000
   ```

2. Start the frontend:

   ```bash
   npm run dev
   ```

3. Open the Vite app in the browser and use the login/register panel to verify that:

   - tokens are saved in local storage
   - `Authorization: Bearer <token>` is attached automatically
   - the API restores the session on refresh

## Notes

- This workspace uses Vite React, not Next.js.
- The frontend points to `http://localhost:8000/api` by default.