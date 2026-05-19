@echo off
REM Frontend startup script
cd /d "%~dp0"
echo Starting NMDC Frontend (Vite Dev Server on http://localhost:5173)...
npm start
pause
