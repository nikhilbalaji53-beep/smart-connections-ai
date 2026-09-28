@echo off
title RecallAI - Unified Full Stack + Live Tunnel Deployment
echo ========================================================
echo       RecallAI: Unified Live Deployment Launcher
echo ========================================================
echo.

cd /d "%~dp0"

REM 1. Clear any stuck processes on port 8000
echo [1/3] Checking port 8000 availability...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

REM 2. Ensure frontend is built
if not exist "frontend\dist\index.html" (
    echo [2/3] Building frontend production assets...
    call npm --prefix frontend run build
) else (
    echo [2/3] Frontend assets ready.
)

REM 3. Ensure .env exists
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
    )
)

echo [3/3] Starting Unified Server & Live Tunnel...
start "RecallAI Main Web (Port 8000)" cmd /k "set PYTHONPATH=. && .\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

if exist "cloudflared.exe" (
    start "RecallAI Live Tunnel" cmd /k ".\cloudflared.exe tunnel --url http://localhost:8000"
) else (
    echo Note: cloudflared.exe not found in root, running on local network only.
)

echo.
echo ========================================================
echo RecallAI Unified Web Server is running!
echo Local Main Web:     http://localhost:8000
echo Customer Chat:      http://localhost:8000/#/customer
echo Support Console:    http://localhost:8000/#/support
echo Technician Console: http://localhost:8000/#/technician
echo API Documentation:  http://localhost:8000/docs
echo.
echo The Cloudflare window will display your public HTTPS link.
echo Both Frontend, API, and WebSockets route through this single host!
echo ========================================================
pause
