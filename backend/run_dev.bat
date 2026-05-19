@echo off
REM Development startup with auto-reload
cd /d "%~dp0"
echo Starting NMDC Backend (Development Mode - With Auto-Reload)...
.venv\Scripts\python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
