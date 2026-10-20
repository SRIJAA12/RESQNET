#!/usr/bin/env bash
set -e

echo ">>> Initializing RESQNET development environment..."

# 1. Environment template
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# 2. Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# 3. Backend virtual environment
echo "Setting up Python virtual environment..."
if [ ! -d "backend/.venv" ]; then
    python3 -m venv backend/.venv
fi
source backend/.venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

echo ">>> RESQNET setup complete!"
echo "To start the development servers:"
echo "  Docker Compose:      docker compose up --build"
echo "  Backend Standalone:  uvicorn app.main:app --reload (inside backend folder)"
echo "  Frontend Standalone: npm run dev (inside frontend folder)"
