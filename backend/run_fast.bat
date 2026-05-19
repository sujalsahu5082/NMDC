@echo off
REM Fast startup script - runs backend without auto-reload for quick restarts
cd /d "%~dp0"
echo Starting NMDC Backend (Fast Mode - No Auto-Reload)...
.venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
