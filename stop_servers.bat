@echo off
title RecallAI - Stop All Running Servers
echo ========================================================
echo          RecallAI: Stopping Active Services
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-NetTCPConnection -LocalPort 8000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host 'Stopping PID' $_.OwningProcess 'on port' $_.LocalPort; Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo.
echo [Done] All RecallAI servers on ports 8000 and 5173 have been stopped.
echo ========================================================
pause
