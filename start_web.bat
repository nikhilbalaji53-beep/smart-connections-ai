@echo off
title RecallAI - Unified Main Web Server (Port 8000)
echo ========================================================
echo       RecallAI: Unified Full-Stack Web Application
echo ========================================================
echo.

cd /d "%~dp0"

REM 1. Stop any old processes on port 8000
echo [1/3] Clearing any existing instances on port 8000...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

REM 2. Check if frontend build exists, if not build it
if not exist "frontend\dist\index.html" (
    echo [2/3] Building frontend production assets...
    call npm --prefix frontend run build
) else (
    echo [2/3] Frontend assets verified in frontend\dist.
)

REM 3. Ensure .env exists
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo Created .env from .env.example
    )
)

echo [3/3] Starting Unified Web Server on http://localhost:8000 ...
echo.
echo ========================================================
echo  All-In-One Main Web Application is Live!
echo  - Main Web Portal:   http://localhost:8000
echo  - Customer Portal:   http://localhost:8000/#/customer
echo  - Support Console:   http://localhost:8000/#/support
echo  - Technician View:   http://localhost:8000/#/technician
echo  - Dual Split View:   http://localhost:8000/#/dual
echo  - API Swagger Docs:  http://localhost:8000/docs
echo ========================================================
echo.

set PYTHONPATH=.
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
