# CareerConnect Job Portal Report

## 1. Project Overview

CareerConnect is a university job portal for students, companies, administrators, and super administrators. It is implemented as a static HTML/CSS/JavaScript frontend backed by a FastAPI REST API and a MySQL/MariaDB database.

The application is divided into three main parts:

- `frontend/`: public pages, login and registration forms, shared JavaScript, and role-specific dashboards.
- `backend/app/`: FastAPI application, API routes, services, database models, schemas, authentication, and configuration.
- `database/` and `job_portal.sql`: database schema, seed data, migrations, and the complete database dump.

## 2. How the System Works

### Frontend

The frontend is served as static files with Python's built-in HTTP server on port `3000`. The browser communicates with the backend through the shared API client in `frontend/js/api.js`.

The API client:

- Sends requests to the configured API base URL.
- Adds the JWT bearer token from browser `localStorage` to authenticated requests.
- Handles JSON responses and displays API errors.
- Clears authentication data and redirects to the login page after an HTTP `401` response.
- Uses multipart uploads for resumes, photos, logos, and other documents.

After login, `frontend/js/auth.js` redirects users according to their role:

- `student` -> student dashboard
- `company` -> company dashboard
- `admin` -> admin dashboard
- `super_admin` -> super-admin dashboard

### Backend

The backend is a FastAPI application started by Uvicorn. It exposes the API under the `/api/v1` prefix and provides interactive documentation at `/docs`.

The backend:

- Loads configuration from `backend/.env`.
- Connects to MySQL/MariaDB through SQLAlchemy and PyMySQL.
- Uses JWT tokens for authentication.
- Applies CORS rules for the local frontend and API origins.
- Serves uploaded files under `/uploads`.
- Creates the `uploads/resumes`, `uploads/photos`, and `uploads/logos` directories at startup.
- Registers route groups for authentication, administration, super administration, companies, students, notifications, and files.

## 3. API Reference

All application endpoints use the `/api/v1` prefix. The complete request and response definitions are available in the interactive documentation at `/docs`.

### Authentication: `/api/v1/auth`

- `POST /login` - Log in an administrator, super administrator, or approved company account.
- `POST /student/login` - Log in a student account.
- `POST /lms-login` - Authenticate through the optional LMS integration.
- `POST /company/register` - Register a company and submit optional documents.
- `GET /me` - Return the currently authenticated user.

### Student: `/api/v1/students`

- `GET /me` and `PUT /me` - Read and update the student profile.
- `POST` and `DELETE /me/resume` - Upload or remove a resume.
- `POST` and `DELETE /me/photo` - Upload or remove a profile photo.
- `/me/skills`, `/me/experiences`, `/me/certifications`, `/me/soft-skills`, and `/me/achievements` - Manage profile records.
- `GET /jobs` and `GET /jobs/{job_id}` - Search and view jobs.
- `POST /jobs/{job_id}/apply` - Apply for a job.
- `GET /me/applications` and `POST /me/applications/{application_id}/withdraw` - Track or withdraw applications.
- `GET /me/interview-requests` plus accept/decline actions - Manage interview requests.

These endpoints are restricted to student users.

### Company: `/api/v1/company`

- `GET /profile` and `PATCH /profile` - Read and update the company profile.
- `POST /jobs`, `GET /jobs`, `GET /jobs/{job_id}`, and `PATCH /jobs/{job_id}` - Create and manage company jobs.
- `PATCH /jobs/{job_id}/status` - Change a job's status.
- `GET /jobs/{job_id}/applications` and `GET /applications/{application_id}` - Review applications.
- `POST /applications/{application_id}/shortlist` - Shortlist an applicant.
- `POST /applications/{application_id}/interview-request` - Request an interview.
- `GET /interview-requests` and `PATCH /interview-requests/{request_id}` - Manage interview requests.
- `GET /candidates/search` and `GET /candidates/{student_id}` - Search and view candidates.

### Administration: `/api/v1/admin`

- `GET /companies` and `GET /companies/{company_id}` - Review companies.
- `PATCH /companies/{company_id}` - Update company information.
- `POST /companies/{company_id}/approve` - Approve a pending company.
- `POST /companies/{company_id}/reject` - Reject a company registration.
- `POST /companies/{company_id}/disable` and `PATCH /companies/{company_id}/status` - Disable or change company status.
- Job, student, and application listing/management endpoints - Review and manage portal activity.

### Super administration: `/api/v1/super-admin`

- `POST /admins` and `GET /admins` - Create and list administrator accounts.
- `PATCH /admins/{admin_id}/status` - Change an administrator's status.
- `DELETE /admins/{admin_id}` - Remove an administrator.
- `GET /companies` - View companies with super-administrator access.

### Files: `/api/v1/files`

- `POST /company/logo` - Upload a company logo.
- `DELETE /company/logo` - Remove a company logo.

Student resume and photo uploads are handled through the student endpoints described above.

### Notifications: `/api/v1/notifications`

- `GET /` - List notifications for the authenticated user.
- `PATCH /{notification_id}/read` - Mark one notification as read.
- `PATCH /read-all` - Mark all notifications as read.
- `GET /unread-count` - Return the unread notification count.

## 4. Database

The database is named `job_portal` by default. The complete SQL dump is stored in `job_portal.sql`; the structured schema and seed files are also available in `database/`.

The database stores users and role information, companies, students, jobs, applications, interviews, notifications, and company registration information such as SECP, SAP, NTN, and uploaded documents.

## 5. Main User Workflows

### Public visitor

1. Opens the landing page at `/index.html`.
2. Views available public job information.
3. Opens the login page or company registration page.

### Student

1. Logs in through `/login.html`.
2. Is redirected to the student dashboard.
3. Manages profile information and uploaded documents.
4. Searches for jobs and views job details.
5. Applies for jobs and tracks applications.
6. Views interviews and notifications.

### Company

1. Registers through `/register-company.html`.
2. Provides company, contact, account, SECP, SAP, and NTN information.
3. Optionally uploads registration documents.
4. Waits for administrator approval.
5. Logs in after approval.
6. Uses the company dashboard to manage company information, jobs, applicants, and interview-related activity.

A company whose status is `pending` cannot log in. An administrator or super administrator must approve the registration before company access is enabled.

### Administrator

1. Logs in with an administrator account.
2. Reviews companies and pending registrations.
3. Approves or rejects company registrations.
4. Manages portal data and operational workflows exposed by the admin API.

### Super administrator

1. Logs in with a super administrator account.
2. Uses the elevated dashboard and API permissions.
3. Manages administrative users and system-level records exposed by the super-admin API.

## 6. Running Application Status

The project was started successfully on Windows with the following services running:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`
- MySQL/MariaDB: port `3306`

The frontend page, API documentation, and OpenAPI endpoint were verified with HTTP status `200`.

## 7. Configuration

The active backend configuration is stored in `backend/.env`. The default local configuration expects:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=job_portal
JWT_SECRET_KEY=change-this-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
LMS_API_URL=
LMS_DB_NAME=9july
LMS_API_ENDPOINT=/web/session/authenticate
LMS_PROFILE_MODEL=res.users
LMS_TIMEOUT_SECONDS=10
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:8000"]
```

For a deployed environment, the JWT secret and database credentials must be replaced with secure values. The optional LMS settings can remain empty when LMS integration is not being used.

## 8. Setup and Start Commands

From the project root, run the setup script once:

```powershell
.\scripts\setup.ps1
```

Start the backend in one PowerShell window:

```powershell
.\scripts\run-backend.ps1
```

Start the frontend in another PowerShell window:

```powershell
.\scripts\run-frontend.ps1
```

Before the first run, MySQL/MariaDB must be running and the `job_portal.sql` dump must be imported into a database named `job_portal`.

## 9. Dependency Compatibility Note

The machine used to start the project has Python `3.14`. The original pinned versions of Pydantic and SQLAlchemy attempted to build or load incompatibly on that Python version.

The root and backend requirements files were updated to compatible versions:

- FastAPI `0.141.1`
- Uvicorn `0.52.4`
- SQLAlchemy `2.0.52`
- Pydantic `2.13.4`
- Pydantic Settings `2.15.0`
- Python Dotenv `1.2.3`

The remaining dependency pins were retained. The updated requirements install successfully in the project's `.venv` environment.

## 10. File Storage

Uploaded files are stored in the project-level `uploads/` directory and are exposed by the backend through `/uploads`.

The main categories are:

- `uploads/resumes/`
- `uploads/photos/`
- `uploads/logos/`
- `uploads/company-documents/` for company registration documents

## 11. Default Accounts

The README provides these seeded accounts:

```text
Super administrator
Email: superadmin@jobportal.com
Password: admin123

Administrator
Email: admin@uetjobportal.com
Password: admin123
```

These credentials should be changed or disabled before production use.

## 12. Operational Notes

- Keep both the backend and frontend PowerShell windows open while using the application.
- Use `Ctrl+C` in each server window to stop a service.
- If the backend is unreachable, verify that `http://localhost:8000/docs` opens.
- If database requests fail, verify that MySQL/MariaDB is running and that `backend/.env` matches the database credentials.
- If an old frontend page is cached, refresh with `Ctrl+Shift+R`.
- The LMS integration is optional and requires a configured external LMS endpoint.
