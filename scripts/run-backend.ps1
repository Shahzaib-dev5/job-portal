$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $projectRoot 'backend'
Set-Location $backendRoot

if (-not (Test-Path (Join-Path $projectRoot '.venv\Scripts\python.exe'))) {
    & (Join-Path $PSScriptRoot 'setup.ps1')
}

Write-Host "Starting FastAPI backend..." -ForegroundColor Green
$env:PYTHONPATH = $backendRoot
& (Join-Path $projectRoot '.venv\Scripts\python.exe') -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
