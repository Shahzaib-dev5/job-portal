$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$venvPath = Join-Path $projectRoot '.venv'
$python = Join-Path $venvPath 'Scripts\python.exe'
if (-not (Test-Path $python)) {
    Write-Host 'Creating virtual environment...' -ForegroundColor Yellow
    python -m venv $venvPath
}

Write-Host 'Installing project requirements...' -ForegroundColor Green
& $python -m pip install --upgrade pip
& $python -m pip install -r (Join-Path $projectRoot 'requirements.txt')
Write-Host 'Setup complete.' -ForegroundColor Green
