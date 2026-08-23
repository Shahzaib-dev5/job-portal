# CareerConnect University Job Portal

CareerConnect is a university job portal for students, companies, administrators, and super administrators.

## Requirements

- Windows with XAMPP
- MySQL or MariaDB running in XAMPP
- Python 3.10 or newer
- PowerShell
- Internet connection for the remote background images and optional LMS connection

## First-Time Setup

### 1. Start MySQL

Open the XAMPP Control Panel and start **MySQL**. Apache is optional because this project uses Python for the API and frontend server.

### 2. Import the database

Open `http://localhost/phpmyadmin`.

1. Create a database named `job_portal` with collation `utf8mb4_unicode_ci`.
2. Open the new database.
3. Select **Import**.
4. Choose `job_portal.sql` from this project.
5. Click **Import** or **Go**.

`job_portal.sql` is the complete database dump. It already includes SECP, SAP, NTN, and company document fields. No separate migration is needed when using this dump.

### 3. Configure the backend

Create `backend/.env` with the following default XAMPP values:

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

If the XAMPP MySQL root user has a password, put it after `DB_PASSWORD=`.

### 4. Install packages

Open PowerShell in the project root:

```powershell
cd "C:\xampp\htdocs\jobportal (1)"
.\scripts\setup.ps1
```

## Start the Application

Use two separate PowerShell windows.

### Terminal 1: Backend API

```powershell
cd "C:\xampp\htdocs\jobportal (1)"
.\scripts\run-backend.ps1
```

API: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### Terminal 2: Frontend

```powershell
cd "C:\xampp\htdocs\jobportal (1)"
.\scripts\run-frontend.ps1
```

Open the portal at `http://localhost:3000`.

Keep both terminals open while using the application. Stop a server with `Ctrl+C`.

## Login Credentials

### Super Admin

```text
Email: superadmin@jobportal.com
Password: admin123
```

### Admin

```text
Email: admin@uetjobportal.com
Password: admin123
```

Login from the homepage or `http://localhost:3000/login.html`.

## Company Registration and Approval

1. Open `http://localhost:3000/register-company.html`.
2. Enter company, contact, account, SECP, SAP, and NTN information.
3. Upload optional SECP, SAP, and NTN documents.
4. Submit the registration.
5. Log in as an admin or super admin.
6. Open the **Companies** tab.
7. Click **Approve** or **Reject**.

A new company cannot log in while its company status is `pending`. Company login becomes available only after administrator approval. Uploaded documents are stored in `uploads/company-documents`.

## Important URLs

- Public portal: `http://localhost:3000/index.html`
- Company registration: `http://localhost:3000/register-company.html`
- Login: `http://localhost:3000/login.html`
- API docs: `http://localhost:8000/docs`

## Common Problems

**Backend is not reachable:** make sure Terminal 1 is running and `http://localhost:8000/docs` opens.

**Database connection error:** confirm MySQL is running and check `backend/.env` values.

**Old page appears:** refresh with `Ctrl + Shift + R`.

**PowerShell script error:** run scripts directly, not with Python:

```powershell
.\scripts\run-backend.ps1
.\scripts\run-frontend.ps1
```