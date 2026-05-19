@echo off
REM Start both backend and frontend
echo Starting NMDC Backend and Frontend...
echo.
echo Opening two terminal windows...
echo Backend will run on http://localhost:8000
echo Frontend will run on http://localhost:5173
echo.

cd /d "%~dp0"

REM Start backend in a new window
start "NMDC Backend" cmd /k "cd backend && .venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000"

REM Give backend time to start
timeout /t 2 /nobreak

REM Start frontend in a new window
start "NMDC Frontend" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Wait 3-5 seconds for them to be ready, then open http://localhost:5173
pause
