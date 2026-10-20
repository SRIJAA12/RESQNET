# ==============================================================================
# RESQNET — Local Environment Automated Setup Script (PowerShell)
# ==============================================================================

Write-Host ">>> Initializing RESQNET development environment..." -ForegroundColor Cyan

# 1. Environment template
if (!(Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# 2. Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

# 3. Backend virtual environment
Write-Host "Setting up Python virtual environment..." -ForegroundColor Cyan
if (!(Test-Path "backend\.venv")) {
    python -m venv backend\.venv
}
& "backend\.venv\Scripts\python.exe" -m pip install --upgrade pip
& "backend\.venv\Scripts\python.exe" -m pip install -r backend\requirements.txt

Write-Host ">>> RESQNET setup complete!" -ForegroundColor Green
Write-Host "To start the development servers:" -ForegroundColor Yellow
Write-Host "  Docker Compose:   docker compose up --build"
Write-Host "  Backend Standalone: uvicorn app.main:app --reload (inside backend folder)"
Write-Host "  Frontend Standalone: npm run dev (inside frontend folder)"
