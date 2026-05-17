import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line, Legend,
} from "recharts";
import {
  Users, Building2, DollarSign, TrendingUp, Search, Filter, Download,
  Moon, Sun, Plus, Edit3, Trash2, X, ChevronUp, ChevronDown, ChevronLeft,
  ChevronRight, RefreshCw, BarChart2, Home, Table, Settings, Menu, Eye,
  Check, AlertCircle,
} from "lucide-react";

const API = "http://localhost:8000";

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#EC4899"];
const DEPT_COLORS = { "Trg.Inst.": "#F59E0B", "W/S(T/S,Kdl)": "#10B981", "CP(M)-14": "#3B82F6", "Haulage-14": "#EF4444" };

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString("en-IN") ?? "—";
const fmtSal = (n) => n ? `₹${(n / 1000).toFixed(0)}K` : "—";

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useApi(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${API}${url}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData(await r.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [url]);
  useEffect(() => { load(); }, deps);
  return { data, loading, error, reload: load };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in
          ${t.type === "success" ? "bg-emerald-500 text-white" : t.type === "error" ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>
          {t.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          {t.message}
          <button onClick={() => remove(t.id)} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, toast: add, remove };
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color, dark }) {
  return (
    <div className={`rounded-2xl p-5 flex items-center gap-4 shadow-sm border transition-all hover:shadow-md hover:-translate-y-0.5
      ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ background: color + "22" }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>{value}</div>
        <div className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
        {sub && <div className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, children, dark }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${dark ? "text-gray-300" : "text-gray-600"}`}>{title}</h3>
      {children}
    </div>
  );
}

// ─── Overview / Analytics Page ────────────────────────────────────────────────
function OverviewPage({ dark }) {
  const { data, loading } = useApi("/analytics", []);

  if (loading) return <Loader />;
  if (!data) return <ErrorMsg msg="Failed to load analytics" />;

  const { summary, by_department, by_category, salary_histogram, exp_salary_scatter, age_distribution, join_year_trend } = data;

  const tickStyle = { fill: dark ? "#9CA3AF" : "#6B7280", fontSize: 11 };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard icon={Users} label="Total Employees" value={fmt(summary.total_employees)} color="#3B82F6" dark={dark} />
        <SummaryCard icon={Building2} label="Departments" value={summary.departments} color="#F59E0B" dark={dark} />
        <SummaryCard icon={DollarSign} label="Avg. Salary" value={fmtSal(summary.avg_salary)} sub="Basic + DA" color="#10B981" dark={dark} />
        <SummaryCard icon={TrendingUp} label="Avg. Experience" value={`${summary.avg_experience}y`} color="#8B5CF6" dark={dark} />
        <SummaryCard icon={Users} label="Avg. Age" value={`${summary.avg_age}y`} color="#EF4444" dark={dark} />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Employees by Department" dark={dark}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={by_department} margin={{ top: 0, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis dataKey="dept" tick={{ ...tickStyle, fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={tickStyle} />
              <Tooltip
                contentStyle={{ background: dark ? "#1F2937" : "#fff", border: "none", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: dark ? "#fff" : "#111" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {by_department.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category Distribution" dark={dark}>
          <div className="flex items-center gap-6 h-[220px]">
            <div className="w-1/2 h-full flex items-center justify-center flex-shrink-0">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={by_category} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={48} outerRadius={80} paddingAngle={3}>
                    {by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: dark ? "#1F2937" : "#fff", border: "none", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 h-full overflow-auto">
              <div className="flex flex-col gap-2 h-full justify-center">
                {by_category.map((d, i) => (
                  <div key={d.category} className="flex items-center gap-3 px-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className={`text-sm flex-1 ${dark ? "text-gray-300" : "text-gray-600"}`}>{d.category}</span>
                    <span className={`text-sm font-bold ${dark ? "text-white" : "text-gray-800"}`}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Salary Distribution" dark={dark}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salary_histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis dataKey="range" tick={{ ...tickStyle, fontSize: 10 }} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={{ background: dark ? "#1F2937" : "#fff", border: "none", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Experience vs Salary (Sample 200)" dark={dark}>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis dataKey="experience" name="Experience" unit="y" tick={tickStyle} />
              <YAxis dataKey="salary" name="Salary" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={tickStyle} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ background: dark ? "#1F2937" : "#fff", border: "none", borderRadius: 8, fontSize: 12 }}
                formatter={(val, name) => [name === "Salary" ? fmtSal(val) : val + "y", name]}
              />
              <Scatter data={exp_salary_scatter} fill="#3B82F6" opacity={0.65} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Age Distribution" dark={dark}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={age_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis dataKey="age_group" tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={{ background: dark ? "#1F2937" : "#fff", border: "none", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hiring Trend by Year" dark={dark}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={join_year_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis dataKey="year" tick={{ ...tickStyle, fontSize: 10 }} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={{ background: dark ? "#1F2937" : "#fff", border: "none", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ─── Employee Modal ───────────────────────────────────────────────────────────
function EmployeeModal({ employee, onClose, onSave, dark, toast }) {
  const isNew = !employee?._id;
  const [form, setForm] = useState(
    employee || {
      "Employee Name": "", "Department Text": "", "Personnel Area": "",
      "Category": "General", "State": "", "Gender": "Male",
      "Date of Birth": "", "Date of Joining-NMDC": "",
      "BASIC": "", "DA": "", "Employment Status": "Active",
      "Position Text": "", "Qualification Summary": "",
    }
  );
  const [saving, setSaving] = useState(false);

  const handle = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const url = isNew ? `/employees` : `/employees/${form._id}`;
      const method = isNew ? "POST" : "PUT";
      const r = await fetch(`${API}${url}`, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, BASIC: +form.BASIC, DA: +form.DA }),
      });
      if (!r.ok) throw new Error("Save failed");
      toast(isNew ? "Employee added successfully" : "Employee updated", "success");
      onSave();
      onClose();
    } catch (e) { toast(e.message, "error"); }
    setSaving(false);
  };

  const inp = `w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-2 focus:ring-amber-400 transition
    ${dark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border-gray-200 text-gray-900"}`;

  const fields = [
    ["Employee Name", "Employee Name", "text"],
    ["Department Text", "Department", "text"],
    ["Position Text", "Position", "text"],
    ["Personnel Area", "Area", "text"],
    ["State", "State", "text"],
    ["Date of Birth", "Date of Birth (DD-MM-YYYY)", "text"],
    ["Date of Joining-NMDC", "Date of Joining (DD-MM-YYYY)", "text"],
    ["BASIC", "Basic Salary (₹)", "number"],
    ["DA", "DA (₹)", "number"],
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${dark ? "bg-gray-800" : "bg-white"}`}>
        <div className={`px-6 py-4 flex items-center justify-between border-b ${dark ? "border-gray-700" : "border-gray-100"}`}>
          <h2 className={`font-bold text-lg ${dark ? "text-white" : "text-gray-900"}`}>
            {isNew ? "Add New Employee" : "Edit Employee"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {fields.map(([key, label, type]) => (
            <div key={key} className={key === "Employee Name" || key === "Position Text" ? "col-span-2" : ""}>
              <label className={`text-xs font-semibold uppercase tracking-wider block mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
              <input type={type} value={form[key] || ""} onChange={handle(key)} className={inp} placeholder={label} />
            </div>
          ))}
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>Category</label>
            <select value={form["Category"] || "General"} onChange={handle("Category")} className={inp}>
              {["General", "OBC", "SC", "ST"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>Status</label>
            <select value={form["Employment Status"] || "Active"} onChange={handle("Employment Status")} className={inp}>
              {["Active", "Inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className={`px-6 py-4 flex justify-end gap-3 border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-lg text-sm font-medium ${dark ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"}`}>Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-50 flex items-center gap-2">
            {saving && <RefreshCw size={14} className="animate-spin" />}
            {isNew ? "Add Employee" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Employees Table Page ─────────────────────────────────────────────────────
function EmployeesPage({ dark, toast }) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("Personnel Number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [modalEmp, setModalEmp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewEmp, setViewEmp] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: opts } = useApi("/filters/options", []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const buildUrl = () => {
    const p = new URLSearchParams({
      page: String(page), page_size: String(pageSize),
      sort_by: sortBy, sort_order: sortOrder,
    });
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (filters.department) p.set("department", filters.department);
    if (filters.category) p.set("category", filters.category);
    if (filters.state) p.set("state", filters.state);
    if (filters.salary_min) p.set("salary_min", filters.salary_min);
    if (filters.salary_max) p.set("salary_max", filters.salary_max);
    if (filters.exp_min) p.set("exp_min", filters.exp_min);
    if (filters.exp_max) p.set("exp_max", filters.exp_max);
    return `/employees?${p}`;
  };

  const { data, loading, reload } = useApi(buildUrl(), [page, debouncedSearch, sortBy, sortOrder, filters, refreshKey]);

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("asc"); }
  };

  const deleteEmp = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const r = await fetch(`${API}/employees/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      toast(`${name} deleted`, "success");
      setRefreshKey(k => k + 1);
    } catch (e) { toast(e.message, "error"); }
  };

  const handleExport = () => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (filters.department) p.set("department", filters.department);
    if (filters.category) p.set("category", filters.category);
    window.open(`${API}/export?${p}`, "_blank");
    toast("Export started", "success");
  };

  const columns = [
    { key: "Personnel Number", label: "ID", w: "80px" },
    { key: "Employee Name", label: "Name", w: "180px" },
    { key: "Department Text", label: "Department", w: "130px" },
    { key: "Category", label: "Category", w: "90px" },
    { key: "Age_Years", label: "Age", w: "60px" },
    { key: "Experience_Years", label: "Exp.", w: "60px" },
    { key: "Total_Salary", label: "Total Salary", w: "120px" },
    { key: "State", label: "State", w: "130px" },
    { key: "Employment Status", label: "Status", w: "90px" },
  ];

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={12} className="opacity-20" />;
    return sortOrder === "asc" ? <ChevronUp size={12} className="text-amber-500" /> : <ChevronDown size={12} className="text-amber-500" />;
  };

  const inp = `rounded-lg px-3 py-1.5 text-sm border outline-none focus:ring-2 focus:ring-amber-400
    ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-800"}`;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border flex-1 min-w-[200px]
          ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, department…"
            className={`bg-transparent outline-none text-sm w-full ${dark ? "text-white placeholder-gray-500" : "text-gray-800"}`} />
          {search && <button onClick={() => setSearch("")}><X size={14} className="text-gray-400" /></button>}
        </div>

        <button onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition
          ${showFilters ? "bg-amber-500 border-amber-500 text-white" : dark ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-amber-500" : "bg-white border-gray-200 text-gray-600 hover:border-amber-400"}`}>
          <Filter size={15} /> Filters
        </button>

        <button onClick={handleExport}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition
          ${dark ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500" : "bg-white border-gray-200 text-gray-600 hover:border-emerald-400"}`}>
          <Download size={15} /> Export
        </button>

        <button onClick={() => { setModalEmp(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white transition">
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={`rounded-xl p-4 border grid grid-cols-2 md:grid-cols-4 gap-3 ${dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          {[
            ["Department", "department", opts?.departments || []],
            ["Category", "category", opts?.categories || []],
            ["State", "state", opts?.states || []],
          ].map(([label, key, options]) => (
            <div key={key}>
              <label className={`text-xs font-semibold block mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
              <select value={filters[key] || ""} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value || undefined }))} className={inp + " w-full"}>
                <option value="">All {label}s</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className={`text-xs font-semibold block mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>Salary Range (₹K)</label>
            <div className="flex gap-1">
              <input type="number" placeholder="Min" value={filters.salary_min || ""} onChange={e => setFilters(f => ({ ...f, salary_min: e.target.value || undefined }))} className={inp + " w-full"} />
              <input type="number" placeholder="Max" value={filters.salary_max || ""} onChange={e => setFilters(f => ({ ...f, salary_max: e.target.value || undefined }))} className={inp + " w-full"} />
            </div>
          </div>
          <div>
            <label className={`text-xs font-semibold block mb-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>Experience (yrs)</label>
            <div className="flex gap-1">
              <input type="number" placeholder="Min" value={filters.exp_min || ""} onChange={e => setFilters(f => ({ ...f, exp_min: e.target.value || undefined }))} className={inp + " w-full"} />
              <input type="number" placeholder="Max" value={filters.exp_max || ""} onChange={e => setFilters(f => ({ ...f, exp_max: e.target.value || undefined }))} className={inp + " w-full"} />
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={() => setFilters({})} className="px-3 py-1.5 rounded-lg text-sm text-red-500 border border-red-200 hover:bg-red-50">
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${dark ? "border-gray-700 bg-gray-750" : "border-gray-100 bg-gray-50"}`}>
                {columns.map(col => (
                  <th key={col.key} style={{ minWidth: col.w }}
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none
                    ${dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}
                    onClick={() => handleSort(col.key)}>
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                  </th>
                ))}
                <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="py-16 text-center"><Loader inline /></td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className={`py-16 text-center text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}>No employees found</td></tr>
              ) : (
                data?.data?.map((emp, idx) => (
                  <tr key={emp._id}
                    className={`border-b transition-colors cursor-default
                    ${idx % 2 === 0 ? dark ? "bg-gray-800" : "bg-white" : dark ? "bg-gray-750" : "bg-gray-50/50"}
                    ${dark ? "border-gray-700 hover:bg-gray-700" : "border-gray-50 hover:bg-amber-50/40"}`}>
                    <td className={`px-4 py-3 font-mono text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{emp["Personnel Number"]}</td>
                    <td className={`px-4 py-3 font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{emp["Employee Name"]}</td>
                    <td className={`px-4 py-3 ${dark ? "text-gray-300" : "text-gray-600"}`}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ background: (DEPT_COLORS[emp["Department Text"]] || "#6B7280") + "22", color: DEPT_COLORS[emp["Department Text"]] || "#6B7280" }}>
                        {emp["Department Text"]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold
                        ${emp["Category"] === "SC" ? "bg-blue-100 text-blue-700" :
                          emp["Category"] === "ST" ? "bg-green-100 text-green-700" :
                          emp["Category"] === "OBC" ? "bg-amber-100 text-amber-700" :
                          "bg-purple-100 text-purple-700"}`}>
                        {emp["Category"]}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${dark ? "text-gray-300" : "text-gray-600"}`}>{emp["Age_Years"] || "—"}</td>
                    <td className={`px-4 py-3 ${dark ? "text-gray-300" : "text-gray-600"}`}>{emp["Experience_Years"] ? `${emp["Experience_Years"]}y` : "—"}</td>
                    <td className={`px-4 py-3 font-semibold ${dark ? "text-emerald-400" : "text-emerald-600"}`}>{fmtSal(emp["Total_Salary"])}</td>
                    <td className={`px-4 py-3 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{emp["State"]}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${emp["Employment Status"] === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                        {emp["Employment Status"]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewEmp(emp)} title="View"
                          className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-gray-600 text-gray-400" : "hover:bg-gray-100 text-gray-400"}`}>
                          <Eye size={14} />
                        </button>
                        <button onClick={() => { setModalEmp(emp); setShowModal(true); }} title="Edit"
                          className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-blue-900 text-blue-400" : "hover:bg-blue-50 text-blue-500"}`}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteEmp(emp._id, emp["Employee Name"])} title="Delete"
                          className={`p-1.5 rounded-lg transition ${dark ? "hover:bg-red-900 text-red-400" : "hover:bg-red-50 text-red-500"}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className={`px-4 py-3 flex items-center justify-between border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
            <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
              Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, data.total)} of {fmt(data.total)} employees
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1}
                className={`p-1.5 rounded-lg disabled:opacity-30 transition ${dark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, data.total_pages - 4)) + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition
                    ${pg === page ? "bg-amber-500 text-white" : dark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage(data.total_pages)} disabled={page === data.total_pages}
                className={`p-1.5 rounded-lg disabled:opacity-30 transition ${dark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <EmployeeModal
          employee={modalEmp}
          onClose={() => { setShowModal(false); setModalEmp(null); }}
          onSave={() => setRefreshKey(k => k + 1)}
          dark={dark}
          toast={toast}
        />
      )}
      {viewEmp && <ViewModal emp={viewEmp} onClose={() => setViewEmp(null)} dark={dark} />}
    </div>
  );
}

// ─── View Employee Modal ──────────────────────────────────────────────────────
function ViewModal({ emp, onClose, dark }) {
  const fields = [
    ["Personnel Number", "Personnel No."],
    ["Employee Name", "Name"],
    ["Department Text", "Department"],
    ["Position Text", "Position"],
    ["Personnel Area", "Area"],
    ["Category", "Category"],
    ["Gender", "Gender"],
    ["Age_Years", "Age"],
    ["Experience_Years", "Experience (yrs)"],
    ["Date of Birth", "Date of Birth"],
    ["Date of Joining-NMDC", "Date of Joining"],
    ["BASIC", "Basic Salary"],
    ["DA", "Dearness Allowance"],
    ["Total_Salary", "Total Salary"],
    ["State", "State"],
    ["District", "District"],
    ["Employment Status", "Status"],
    ["Qualification Summary", "Qualification"],
    ["Marital Status", "Marital Status"],
    ["Religion", "Religion"],
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${dark ? "bg-gray-800" : "bg-white"}`}>
        <div className={`px-6 py-4 flex items-center justify-between border-b ${dark ? "border-gray-700" : "border-gray-100"}`}>
          <h2 className={`font-bold text-lg ${dark ? "text-white" : "text-gray-900"}`}>{emp["Employee Name"]}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-3 max-h-[70vh] overflow-y-auto">
          {fields.map(([key, label]) => (
            emp[key] !== null && emp[key] !== undefined && (
              <div key={key}>
                <div className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-gray-500" : "text-gray-400"}`}>{label}</div>
                <div className={`text-sm font-medium mt-0.5 ${dark ? "text-gray-200" : "text-gray-800"}`}>
                  {key === "Total_Salary" || key === "BASIC" || key === "DA" ? fmtSal(emp[key]) : String(emp[key])}
                </div>
              </div>
            )
          ))}
        </div>
        <div className={`px-6 py-4 border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-white">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Loader({ inline = false }) {
  if (inline) return (
    <div className="flex items-center justify-center gap-2 text-amber-500 text-sm py-4">
      <RefreshCw size={16} className="animate-spin" /> Loading…
    </div>
  );
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div className="flex items-center justify-center h-64 text-red-400 text-sm gap-2">
      <AlertCircle size={18} /> {msg}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiOk, setApiOk] = useState(null);
  const { toasts, toast, remove } = useToast();

  // Check API connectivity
  useEffect(() => {
    fetch(`${API}/filters/options`)
      .then(r => r.ok ? setApiOk(true) : setApiOk(false))
      .catch(() => setApiOk(false));
  }, []);

  const nav = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "employees", label: "Employees", icon: Table },
  ];

  const bg = dark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const sidebar = dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";

  return (
    <div className={`min-h-screen flex ${bg}`} style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Toast toasts={toasts} remove={remove} />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 border-r flex flex-col transition-all duration-200 ${sidebar}`}>
        {/* Logo */}
        <div className={`px-4 py-5 flex items-center gap-3 border-b ${dark ? "border-gray-800" : "border-gray-100"}`}>
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <BarChart2 size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className={`text-sm font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>NMDC</div>
              <div className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>HR Dashboard</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${page === id
                ? "bg-amber-500 text-white shadow-sm"
                : dark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}>
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && label}
            </button>
          ))}
        </nav>

        {/* API Status */}
        {sidebarOpen && (
          <div className={`px-4 py-3 border-t ${dark ? "border-gray-800" : "border-gray-100"}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${apiOk === true ? "bg-emerald-500" : apiOk === false ? "bg-red-500" : "bg-amber-500 animate-pulse"}`} />
              <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
                {apiOk === true ? "API Connected" : apiOk === false ? "API Offline" : "Connecting…"}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className={`border-b px-6 py-3 flex items-center justify-between flex-shrink-0 ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(o => !o)} className={`p-2 rounded-lg transition ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>
              <Menu size={18} />
            </button>
            <div>
              <h1 className={`text-base font-bold ${dark ? "text-white" : "text-gray-900"}`}>
                {page === "overview" ? "Analytics Overview" : "Employee Directory"}
              </h1>
              <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>NMDC Employee Master · 1,500 records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {apiOk === false && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">
                <AlertCircle size={13} /> Backend offline – start FastAPI on port 8000
              </div>
            )}
            <button onClick={() => setDark(d => !d)}
              className={`p-2 rounded-lg transition ${dark ? "hover:bg-gray-800 text-amber-400" : "hover:bg-gray-100 text-gray-500"}`}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {page === "overview" && <OverviewPage dark={dark} />}
          {page === "employees" && <EmployeesPage dark={dark} toast={toast} />}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 3px; }
        .bg-gray-750 { background-color: #1f2937cc; }
        @keyframes slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.25s ease; }
      `}</style>
    </div>
  );
}
