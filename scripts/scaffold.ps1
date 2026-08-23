Write-Host "Creating Job Portal project structure..." -ForegroundColor Green

$root = (Get-Location).Path

$dirs = @(
  "backend/app",
  "backend/tests",
  "backend/uploads/resumes",
  "backend/uploads/photos",
  "backend/uploads/logos",
  "frontend/css",
  "frontend/js",
  "database",
  "docs",
  "scripts"
)

foreach ($dir in $dirs) {
  $full = Join-Path $root $dir
  New-Item -ItemType Directory -Path $full -Force | Out-Null
  Write-Host "Created: $dir"
}

function Write-File {
  param(
    [string]$relativePath,
    [string]$content
  )

  $full = Join-Path $root $relativePath
  $parent = Split-Path -Parent $full
  if ($parent -and -not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }

  [System.IO.File]::WriteAllText($full, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Created: $relativePath"
}

Write-File "backend/app/__init__.py" ""
Write-File "backend/requirements.txt" @"
fastapi==0.104.1
uvicorn[standard]==0.24.0
SQLAlchemy==2.0.23
PyMySQL==1.1.0
pydantic==2.5.2
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
email-validator==2.1.0
pytest==7.4.3
httpx==0.25.2
"@

Write-File "backend/.env.example" @"
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=job_portal
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
LMS_API_KEY=
LMS_API_URL=
ALLOWED_ORIGINS=[\"http://localhost:3000\", \"http://localhost:8000\"]
"@

Write-File "frontend/index.html" @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Job Portal</title>
</head>
<body>
  <div id="app">Job Portal</div>
</body>
</html>
"@

Write-File "frontend/css/custom.css" @"
body { font-family: 'Inter', sans-serif; }
"@
Write-File "database/schema.sql" "-- Database schema will be added here`n"
Write-File "database/seed.sql" "-- Seed data will be added here`n"
Write-File "README.md" @"
# Job Portal Application

This project was scaffolded successfully.
"@

Write-File "backend/uploads/resumes/.gitkeep" ""
Write-File "backend/uploads/photos/.gitkeep" ""
Write-File "backend/uploads/logos/.gitkeep" ""

Write-Host "`n✅ Project scaffold created successfully!" -ForegroundColor Green
