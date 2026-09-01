$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location (Join-Path $projectRoot 'frontend')
Write-Host "Starting frontend server at http://localhost:3000" -ForegroundColor Green
& (Join-Path $projectRoot '.venv\Scripts\python.exe') -m http.server 3000

