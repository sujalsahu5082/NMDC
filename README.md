# NMDC Employee Dashboard

A local-only HR analytics dashboard for NMDC employee records.

**Stack:** React 18 + Recharts + FastAPI + Pandas + in-memory store

## Project Structure

```
New folder (2)/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── run_fast.bat        (Fast startup - no auto-reload)
│   ├── run_dev.bat         (Dev mode with auto-reload)
│   └── NEW NMDC_Employee_Master_1500.xlsx
├── src/
│   ├── main.jsx
│   └── NMDC_Dashboard.jsx
├── run_frontend.bat        (Start frontend only)
├── start_all.bat           (Start both servers)
├── index.html
└── package.json
```

## Quick Start (Fastest)

**Option 1: Use Batch Scripts (Recommended)**

1. **Start both servers at once:**
   ```bash
   start_all.bat
   ```
   This opens two terminal windows and starts backend + frontend automatically.

2. **Open dashboard:** http://localhost:5173

---

## Run Locally (Manual)

### Option 1: Fast Startup (No Auto-Reload) ⚡
Use this for quick restarts without code hot-reload:

```bash
cd backend
./run_fast.bat
```
Backend runs at http://localhost:8000

### Option 2: Development Mode (With Auto-Reload)
Use this when actively editing backend code:

```bash
cd backend
./run_dev.bat
```
Backend auto-reloads on file changes.

### Frontend

```bash
./run_frontend.bat
```
Or manually:
```bash
npm install
npm start
```

The Vite app runs at http://localhost:5173 and talks to the backend on http://localhost:8000.

---

## Performance Notes

- **Startup time:** ~2-3 seconds (optimized with vectorized pandas operations)
- Excel file is loaded once at startup (1500 records)
- Use `run_fast.bat` for fastest restarts without auto-reload overhead
- Use `run_dev.bat` only when actively developing the backend

## Notes

- The frontend is configured to call http://localhost:8000
- The backend loads NEW NMDC_Employee_Master_1500.xlsx from the backend/ folder
- If the dataset is missing, the backend still starts with an empty in-memory store
