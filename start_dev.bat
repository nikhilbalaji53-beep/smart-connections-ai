@echo off
title RecallAI - Dual Hot-Reload Dev Servers
echo ========================================================
echo       RecallAI: Development Mode (Hot-Reload)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Clearing old dev processes on ports 8000 and 5173...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 8000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
    )
)

echo [2/3] Starting Backend API Server (Port 8000)...
start "RecallAI Backend Dev" cmd /k "set PYTHONPATH=. && .\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Vite Frontend Dev Server (Port 5173)...
start "RecallAI Frontend Dev" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Dev Servers Active:
echo - Frontend with HMR: http://localhost:5173
echo - Backend API Docs:  http://127.0.0.1:8000/docs
echo (Vite automatically proxies /api and /ws to port 8000)
echo ========================================================
pause
