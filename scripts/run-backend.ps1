$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

if (-not (Test-Path '.venv\Scripts\python.exe')) {
    & (Join-Path $PSScriptRoot 'setup.ps1')
}

Write-Host "Starting FastAPI backend..." -ForegroundColor Green
$env:PYTHONPATH = Join-Path $projectRoot 'backend'
& (Join-Path $projectRoot '.venv\Scripts\python.exe') -m uvicorn app.main:app --reload
