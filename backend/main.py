from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import numpy as np
import re
import io
import json
import os
from typing import Optional, List
from datetime import datetime
import copy

app = FastAPI(title="NMDC Employee Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory store ──────────────────────────────────────────────────────────
_employees: List[dict] = []
_next_id = 1


def parse_age(age_str):
    if pd.isna(age_str):
        return None
    match = re.search(r"(\d+)yrs", str(age_str))
    return int(match.group(1)) if match else None


def load_excel():
    global _employees, _next_id
    # Default dataset file - use absolute path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, "NEW NMDC_Employee_Master_1500.xlsx")
    print(f"Loading Excel from: {file_path}")
    try:
        df = pd.read_excel(file_path)
    except FileNotFoundError:
        print(f"ERROR: File not found at {file_path}")
        raise
    except Exception as e:
        print(f"ERROR reading Excel: {e}")
        raise
    df = df.replace({np.nan: None})

    # Derived fields
    df["Age_Years"] = df["Age"].apply(parse_age)
    df["Total_Salary"] = df["BASIC"].fillna(0) + df["DA"].fillna(0)

    def get_experience(doj):
        if doj is None:
            return None
        try:
            d = datetime.strptime(str(doj).strip(), "%d-%m-%Y")
            return (datetime.now() - d).days // 365
        except Exception:
            return None

    df["Experience_Years"] = df["Date of Joining-NMDC"].apply(get_experience)

    records = df.to_dict(orient="records")
    _employees = []
    for i, rec in enumerate(records):
        rec["_id"] = i + 1
        # Ensure all None-able numeric fields are safe
        for k, v in rec.items():
            if isinstance(v, float) and np.isnan(v):
                rec[k] = None
        _employees.append(rec)

    _next_id = len(_employees) + 1
    print(f"Loaded {len(_employees)} employees from Excel.")


try:
    load_excel()
except FileNotFoundError:
    print("Warning: default Excel dataset not found — starting with empty dataset.")
except Exception as e:
    print(f"Warning: failed to load default dataset at startup: {e}")


def _filter_employees(
    search: Optional[str],
    department: Optional[str],
    category: Optional[str],
    state: Optional[str],
    status: Optional[str],
    salary_min: Optional[float],
    salary_max: Optional[float],
    exp_min: Optional[int],
    exp_max: Optional[int],
):
    result = _employees

    if search:
        s = search.lower()
        result = [
            e for e in result
            if s in str(e.get("Employee Name", "")).lower()
            or s in str(e.get("Personnel Number", "")).lower()
            or s in str(e.get("Department Text", "")).lower()
        ]

    if department:
        result = [e for e in result if e.get("Department Text") == department]

    if category:
        result = [e for e in result if e.get("Category") == category]

    if state:
        result = [e for e in result if e.get("State") == state]

    if status:
        result = [e for e in result if e.get("Employment Status") == status]

    if salary_min is not None:
        result = [e for e in result if (e.get("Total_Salary") or 0) >= salary_min]

    if salary_max is not None:
        result = [e for e in result if (e.get("Total_Salary") or 0) <= salary_max]

    if exp_min is not None:
        result = [e for e in result if (e.get("Experience_Years") or 0) >= exp_min]

    if exp_max is not None:
        result = [e for e in result if (e.get("Experience_Years") or 0) <= exp_max]

    return result


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/employees")
def get_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    sort_by: Optional[str] = None,
    sort_order: str = "asc",
    search: Optional[str] = None,
    department: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
    salary_min: Optional[float] = None,
    salary_max: Optional[float] = None,
    exp_min: Optional[int] = None,
    exp_max: Optional[int] = None,
):
    filtered = _filter_employees(search, department, category, state, status,
                                  salary_min, salary_max, exp_min, exp_max)

    if sort_by:
        reverse = sort_order == "desc"
        filtered = sorted(
            filtered,
            key=lambda e: (e.get(sort_by) is None, e.get(sort_by)),
            reverse=reverse,
        )

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = filtered[start:end]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "data": page_data,
    }


@app.get("/employees/{emp_id}")
def get_employee(emp_id: int):
    emp = next((e for e in _employees if e["_id"] == emp_id), None)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@app.post("/employees")
def create_employee(employee: dict):
    global _next_id
    employee["_id"] = _next_id
    _next_id += 1
    if "BASIC" in employee and "DA" in employee:
        employee["Total_Salary"] = (employee.get("BASIC") or 0) + (employee.get("DA") or 0)
    _employees.append(employee)
    return employee


@app.put("/employees/{emp_id}")
def update_employee(emp_id: int, updates: dict):
    for i, emp in enumerate(_employees):
        if emp["_id"] == emp_id:
            _employees[i].update(updates)
            if "BASIC" in updates or "DA" in updates:
                _employees[i]["Total_Salary"] = (
                    (_employees[i].get("BASIC") or 0) + (_employees[i].get("DA") or 0)
                )
            return _employees[i]
    raise HTTPException(status_code=404, detail="Employee not found")


@app.delete("/employees/all")
def delete_all_employees():
    global _employees, _next_id
    count = len(_employees)
    _employees = []
    _next_id = 1
    return {"deleted": True, "count": count, "total": len(_employees)}


@app.delete("/employees/{emp_id}")
def delete_employee(emp_id: int):
    global _employees
    before = len(_employees)
    _employees = [e for e in _employees if e["_id"] != emp_id]
    if len(_employees) == before:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Deleted successfully"}


@app.get("/analytics")
def get_analytics(
    search: Optional[str] = None,
    department: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    status: Optional[str] = None,
    salary_min: Optional[float] = None,
    salary_max: Optional[float] = None,
    exp_min: Optional[int] = None,
    exp_max: Optional[int] = None,
):
    employees = _filter_employees(
        search, department, category, state, status, salary_min, salary_max, exp_min, exp_max
    )

    total = len(employees)
    avg_salary = (
        sum(e.get("Total_Salary") or 0 for e in employees) / total if total else 0
    )
    avg_exp = (
        sum(e.get("Experience_Years") or 0 for e in employees) / total if total else 0
    )
    avg_age = (
        sum(e.get("Age_Years") or 0 for e in employees) / total if total else 0
    )

    # Dept breakdown
    dept_counts: dict = {}
    for e in employees:
        d = e.get("Department Text") or "Unknown"
        dept_counts[d] = dept_counts.get(d, 0) + 1

    dept_salary: dict = {}
    dept_salary_count: dict = {}
    for e in employees:
        d = e.get("Department Text") or "Unknown"
        sal = e.get("Total_Salary") or 0
        dept_salary[d] = dept_salary.get(d, 0) + sal
        dept_salary_count[d] = dept_salary_count.get(d, 0) + 1

    dept_avg_salary = {
        d: round(dept_salary[d] / dept_salary_count[d])
        for d in dept_salary
    }

    # Department -> Subgroup mapping with counts
    dept_subgroups: dict = {}
    for e in employees:
        d = e.get("Department Text") or "Unknown"
        sg = e.get("Employee Sub-Group") or e.get("Employee Sub-Group ") or "Unknown"
        dept_subgroups.setdefault(d, {})
        dept_subgroups[d][sg] = dept_subgroups[d].get(sg, 0) + 1

    # Category
    cat_counts: dict = {}
    for e in employees:
        c = e.get("Category") or "Unknown"
        cat_counts[c] = cat_counts.get(c, 0) + 1

    # Employee Sub-Group
    subgroup_counts: dict = {}
    for e in employees:
        sg = e.get("Employee Sub-Group") or e.get("Employee Sub-Group ") or "Unknown"
        subgroup_counts[sg] = subgroup_counts.get(sg, 0) + 1

    # State
    state_counts: dict = {}
    for e in employees:
        s = e.get("State") or "Unknown"
        state_counts[s] = state_counts.get(s, 0) + 1

    # Salary histogram (10 buckets)
    salaries = [e.get("Total_Salary") or 0 for e in employees]
    min_sal = min(salaries)
    max_sal = max(salaries)
    bucket_size = (max_sal - min_sal) / 10 if max_sal != min_sal else 1
    hist_buckets = []
    for i in range(10):
        lo = round(min_sal + i * bucket_size)
        hi = round(min_sal + (i + 1) * bucket_size)
        count = sum(1 for s in salaries if lo <= s < hi)
        hist_buckets.append({"range": f"{lo//1000}K–{hi//1000}K", "count": count})

    # Experience vs Salary (sampled 200 points)
    import random
    sample = random.sample(employees, min(200, total)) if total else []
    exp_salary = [
        {
            "experience": e.get("Experience_Years"),
            "salary": e.get("Total_Salary"),
            "name": e.get("Employee Name"),
            "dept": e.get("Department Text"),
        }
        for e in sample
        if e.get("Experience_Years") is not None and e.get("Total_Salary") is not None
    ]

    # Age distribution
    age_buckets: dict = {}
    for e in employees:
        age = e.get("Age_Years")
        if age is None:
            continue
        bucket = f"{(age // 5) * 5}–{(age // 5) * 5 + 4}"
        age_buckets[bucket] = age_buckets.get(bucket, 0) + 1

    # Join year trend
    join_year: dict = {}
    for e in employees:
        doj = e.get("Date of Joining-NMDC")
        if doj:
            try:
                yr = datetime.strptime(str(doj).strip(), "%d-%m-%Y").year
                join_year[yr] = join_year.get(yr, 0) + 1
            except Exception:
                pass

    return {
        "summary": {
            "total_employees": total,
            "departments": len(dept_counts),
            "avg_salary": round(avg_salary),
            "avg_experience": round(avg_exp, 1),
            "avg_age": round(avg_age, 1),
        },
        "by_department": [
            {"dept": k, "count": v, "avg_salary": dept_avg_salary.get(k, 0)}
            for k, v in sorted(dept_counts.items(), key=lambda x: -x[1])
        ],
        "by_department_with_subgroups": [
            {
                "dept": d,
                "count": dept_counts.get(d, 0),
                "avg_salary": dept_avg_salary.get(d, 0),
                "subgroups": [{"subgroup": sg, "count": c} for sg, c in sorted(dept_subgroups.get(d, {}).items(), key=lambda x: -x[1])]
            }
            for d in sorted(dept_counts.keys(), key=lambda x: -dept_counts.get(x, 0))
        ],
        "by_category": [{"category": k, "count": v} for k, v in cat_counts.items()],
        "by_subgroup": [{"subgroup": k, "count": v} for k, v in subgroup_counts.items()],
        "by_state": [
            {"state": k, "count": v}
            for k, v in sorted(state_counts.items(), key=lambda x: -x[1])
        ],
        "salary_histogram": hist_buckets,
        "exp_salary_scatter": exp_salary,
        "age_distribution": [
            {"age_group": k, "count": v}
            for k, v in sorted(age_buckets.items())
        ],
        "join_year_trend": [
            {"year": k, "count": v}
            for k, v in sorted(join_year.items())
        ],
    }


@app.get("/filters/options")
def get_filter_options():
    departments = sorted(set(e.get("Department Text") for e in _employees if e.get("Department Text")))
    categories = sorted(set(e.get("Category") for e in _employees if e.get("Category")))
    states = sorted(set(e.get("State") for e in _employees if e.get("State")))
    statuses = sorted(set(e.get("Employment Status") for e in _employees if e.get("Employment Status")))
    salaries = [e.get("Total_Salary") or 0 for e in _employees]
    experiences = [e.get("Experience_Years") for e in _employees if e.get("Experience_Years") is not None]
    return {
        "departments": departments,
        "categories": categories,
        "states": states,
        "statuses": statuses,
        "salary_min": int(min(salaries)) if salaries else 0,
        "salary_max": int(max(salaries)) if salaries else 0,
        "exp_min": int(min(experiences)) if experiences else 0,
        "exp_max": int(max(experiences)) if experiences else 0,
    }


@app.get("/export")
def export_employees(
    search: Optional[str] = None,
    department: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    salary_min: Optional[float] = None,
    salary_max: Optional[float] = None,
    exp_min: Optional[int] = None,
    exp_max: Optional[int] = None,
):
    filtered = _filter_employees(search, department, category, state,
                                  salary_min, salary_max, exp_min, exp_max)
    df = pd.DataFrame(filtered)
    output = io.BytesIO()
    df.to_excel(output, index=False)
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=NMDC_Employees_Export.xlsx"},
    )


@app.post("/employees/import")
async def import_employees(file: UploadFile = File(...), dedupe: bool = True):
    global _employees, _next_id
    try:
        content = await file.read()
        name = (file.filename or "").lower()
        if name.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    df = df.replace({np.nan: None})
    # Derived fields similar to load_excel
    df["Age_Years"] = df.get("Age", pd.Series([None]*len(df))).apply(parse_age)
    df["Total_Salary"] = df.get("BASIC", 0).fillna(0) + df.get("DA", 0).fillna(0)

    def get_experience(doj):
        if doj is None:
            return None
        try:
            d = datetime.strptime(str(doj).strip(), "%d-%m-%Y")
            return (datetime.now() - d).days // 365
        except Exception:
            return None

    df["Experience_Years"] = df.get("Date of Joining-NMDC", pd.Series([None]*len(df))).apply(get_experience)

    records = df.to_dict(orient="records")
    added = 0
    # If dedupe requested, update existing records by Personnel Number, otherwise replace
    if dedupe and _employees:
        # build mapping from personnel number to employee index
        existing_map = {str(e.get("Personnel Number")): idx for idx, e in enumerate(_employees) if e.get("Personnel Number") is not None}
        for rec in records:
            for k, v in rec.items():
                if isinstance(v, float) and np.isnan(v):
                    rec[k] = None
            key = str(rec.get("Personnel Number"))
            if key and key in existing_map:
                idx = existing_map[key]
                # preserve _id
                rec["_id"] = _employees[idx]["_id"]
                _employees[idx].update(rec)
            else:
                rec["_id"] = _next_id
                _next_id += 1
                _employees.append(rec)
            added += 1
    else:
        # replace entire dataset
        _employees = []
        _next_id = 1
        for rec in records:
            for k, v in rec.items():
                if isinstance(v, float) and np.isnan(v):
                    rec[k] = None
            rec["_id"] = _next_id
            _next_id += 1
            _employees.append(rec)
            added += 1

    return {"imported": added, "total": len(_employees)}


@app.post("/employees/restore-default")
def restore_default():
    """Restore the original default Excel dataset from disk."""
    try:
        load_excel()
        return {"restored": True, "total": len(_employees)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restore default dataset: {e}")
