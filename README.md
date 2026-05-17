# NMDC Employee Dashboard

A full-stack HR analytics dashboard for 1,500 NMDC employee records.

**Stack:** React 18 + Recharts + Tailwind CSS · FastAPI + Pandas · In-memory store (MongoDB-optional)

---

## Project Structure

```
nmdc-dashboard/
├── backend/
│   ├── main.py                              ← FastAPI app (all endpoints)
│   ├── requirements.txt
│   └── NMDC_Employee_Master_1500_Records.xlsx   ← put your file here
└── frontend/
    ├── src/
    │   └── App.jsx                          ← Complete React dashboard
    ├── package.json
    ├── tailwind.config.js
    └── public/index.html
```

---

## Quick Start

### 1. Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Make sure the Excel file is in the backend/ folder, then:
uvicorn main:app --reload --port 8000
```

API will be at: **http://localhost:8000**  
Docs (Swagger UI): **http://localhost:8000/docs**

### 2. Frontend (React)

```bash
cd frontend

npm install
npm start
```

App will open at: **http://localhost:3000**

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | List employees (paginated, filterable, sortable) |
| GET | `/employees/{id}` | Single employee |
| POST | `/employees` | Create employee |
| PUT | `/employees/{id}` | Update employee |
| DELETE | `/employees/{id}` | Delete employee |
| GET | `/analytics` | Full analytics data for charts |
| GET | `/filters/options` | Dropdown values (departments, categories, states) |
| GET | `/export` | Download filtered employees as Excel |

### Query Parameters for GET /employees

| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default: 1) |
| `page_size` | int | Records per page (default: 20, max: 200) |
| `sort_by` | string | Column to sort by |
| `sort_order` | string | `asc` or `desc` |
| `search` | string | Search in name, ID, department |
| `department` | string | Filter by department |
| `category` | string | Filter by category (SC/ST/OBC/General) |
| `state` | string | Filter by state |
| `salary_min` | number | Minimum total salary |
| `salary_max` | number | Maximum total salary |
| `exp_min` | int | Minimum years of experience |
| `exp_max` | int | Maximum years of experience |

---

## Features

### Dashboard Overview
- Summary cards: Total Employees, Departments, Avg. Salary, Avg. Experience, Avg. Age
- **Bar Chart** – Employees by Department
- **Pie Chart** – Category distribution (SC / ST / OBC / General)
- **Histogram** – Salary distribution across 10 buckets
- **Scatter Plot** – Experience vs Salary (sampled 200 points)
- **Bar Chart** – Age distribution by 5-year bands
- **Line Chart** – Annual hiring trend

### Employee Table
- Global search (name, ID, department)
- Multi-filter panel: Department · Category · State · Salary Range · Experience Range
- Sortable columns (click header)
- Pagination with page controls
- Color-coded category and department badges
- Inline view / edit / delete per row
- Add new employee modal
- Export filtered results to Excel

### UI/UX
- Dark / Light mode toggle
- Collapsible sidebar
- Real-time API connectivity indicator
- Toast notifications for all CRUD operations
- Responsive layout

---

## Tailwind Config (tailwind.config.js)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: { extend: {} },
  plugins: [],
}
```

## Frontend index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NMDC Employee Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

---

## Optional: MongoDB Persistence

To add MongoDB, install `motor`:
```bash
pip install motor
```

Then replace the in-memory `_employees` list in `main.py` with async MongoDB calls using `motor.AsyncIOMotorClient`. The API contract stays identical.

---

## Tech Decisions

- **Pandas** handles Excel parsing and all data transformations at startup
- **In-memory store** means zero-dependency setup; swap for Mongo/Postgres by changing 4 functions
- **CORS** is open (`*`) for development; restrict origins in production
- **Recharts** used for all charts (already bundled with the React project)
- **No auth** by default; add FastAPI's `OAuth2PasswordBearer` for JWT auth
