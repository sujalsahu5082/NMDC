import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line, Legend,
} from "recharts";
import {
  Users, Building2, IndianRupee, TrendingUp, Search, Filter, Download,
  Moon, Sun, Plus, Edit3, Trash2, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RefreshCw, BarChart2, Home, Table, Settings, Menu, Eye,
  Check, AlertCircle, UploadCloud,
} from "lucide-react";

const API = "http://localhost:8000";

// ─── Palette ──────────────────────────────────────────────────────────────────
const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"];
const THEME = {
  primary: "#3B82F6",
  accent: "#F59E0B",
  success: "#10B981",
  muted: "#8B5CF6",
  gridDark: "#374151",
  gridLight: "#E5E7EB",
};
const DEPT_COLORS = { "Trg.Inst.": THEME.accent, "W/S(T/S,Kdl)": THEME.success, "CP(M)-14": THEME.primary, "Haulage-14": "#EF4444" };

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString("en-IN") ?? "—";
const formatCurrency = (value) => value ? `₹${(value / 1000).toFixed(0)}K` : "—";
const fmtSal = formatCurrency;
const chartTooltipStyle = (dark) => ({
  background: dark ? "#111827" : "#fff",
  border: `1px solid ${dark ? "#374151" : "#E5E7EB"}`,
  borderRadius: 12,
  fontSize: 12,
  boxShadow: dark ? "0 16px 40px rgba(0,0,0,0.35)" : "0 16px 40px rgba(15,23,42,0.12)",
});

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
    <div className={`min-h-[112px] rounded-2xl p-6 flex items-center gap-4 border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01]
      ${dark ? "bg-slate-900/80 border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.22)]" : "bg-white border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`} style={{ background: color + "22" }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <div className={`text-3xl font-bold tracking-tight leading-none ${dark ? "text-white" : "text-gray-900"}`}>{value}</div>
        <div className={`text-[11px] font-semibold uppercase tracking-[0.18em] mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
        {sub && <div className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>{sub}</div>}
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, sub, color, dark }) {
  return (
    <div className={`min-h-[102px] rounded-2xl p-4 border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01] ${dark ? "bg-slate-900/80 border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.22)]" : "bg-white border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`} style={{ background: color + "22" }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div className="min-w-0">
          <div className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
          <div className={`text-lg font-bold truncate leading-tight mt-1 ${dark ? "text-white" : "text-gray-900"}`}>{value}</div>
          {sub && <div className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, children, dark, className = "" }) {
  return (
    <div className={`h-full rounded-2xl p-5 border overflow-hidden min-w-0 transition-all duration-200 flex flex-col ${className} ${dark ? "bg-slate-900/80 border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.18)]" : "bg-white border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"}`}>
      <h3 className={`text-[11px] font-bold uppercase tracking-[0.22em] mb-4 ${dark ? "text-slate-300" : "text-slate-500"}`}>{title}</h3>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function GlobalFilters({ dark, filters, setFilters, options }) {
  const salaryMin = options?.salary_min ?? 0;
  const salaryMax = options?.salary_max ?? 0;
  const expMin = options?.exp_min ?? 0;
  const expMax = options?.exp_max ?? 0;

  const currentSalaryMin = filters?.salary_min ?? salaryMin;
  const currentSalaryMax = filters?.salary_max ?? salaryMax;
  const currentExpMin = filters?.exp_min ?? expMin;
  const currentExpMax = filters?.exp_max ?? expMax;

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getRangeStyle = (value, min, max) => {
    if (dark || max <= min) return undefined;
    const percent = ((value - min) / (max - min)) * 100;
    return { "--slider-progress": `${Math.min(100, Math.max(0, percent))}%` };
  };

  const resetFilters = () => {
    setFilters({
      department: "",
      salary_min: salaryMin,
      salary_max: salaryMax,
      exp_min: expMin,
      exp_max: expMax,
    });
  };

  return (
    <div className={`rounded-2xl p-4 border shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-[0.2em] ${dark ? "text-gray-300" : "text-gray-700"}`}>Global Filters</div>
          <div className={`text-xs mt-1 ${dark ? "text-gray-500" : "text-gray-500"}`}>All overview charts update together</div>
        </div>
        <button onClick={resetFilters} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${dark ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
        <div className={`h-full min-h-[144px] rounded-xl border p-4 flex flex-col justify-between ${dark ? "border-gray-700 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}>
          <label className={`text-[11px] font-semibold uppercase tracking-[0.16em] block mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>Department</label>
          <select
            value={filters?.department || ""}
            onChange={e => updateFilter("department", e.target.value)}
            className={`w-full h-11 rounded-lg px-3 text-sm border outline-none focus:ring-2 focus:ring-amber-400 transition ${dark ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-900"}`}
          >
            <option value="">All Departments</option>
            {(options?.departments || []).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className={`h-full min-h-[144px] rounded-xl border p-4 flex flex-col justify-between ${dark ? "border-gray-700 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-gray-400" : "text-gray-500"}`}>Salary Range</label>
            <span className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>{fmtSal(currentSalaryMin)} - {fmtSal(currentSalaryMax)}</span>
          </div>
          <div className="space-y-3">
            <div>
              <input
                type="range"
                min={salaryMin}
                max={salaryMax}
                step={1000}
                value={currentSalaryMin}
                onChange={e => updateFilter("salary_min", Math.min(Number(e.target.value), currentSalaryMax))}
                className={`w-full range-slider ${dark ? "accent-amber-500" : "range-slider-light"}`}
                style={getRangeStyle(currentSalaryMin, salaryMin, salaryMax)}
              />
              <div className={`flex justify-between text-[11px] mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                <span>{fmtSal(salaryMin)}</span><span>Min</span>
              </div>
            </div>
            <div>
              <input
                type="range"
                min={salaryMin}
                max={salaryMax}
                step={1000}
                value={currentSalaryMax}
                onChange={e => updateFilter("salary_max", Math.max(Number(e.target.value), currentSalaryMin))}
                className={`w-full range-slider ${dark ? "accent-amber-500" : "range-slider-light"}`}
                style={getRangeStyle(currentSalaryMax, salaryMin, salaryMax)}
              />
              <div className={`flex justify-between text-[11px] mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                <span>Max</span><span>{fmtSal(salaryMax)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`h-full min-h-[144px] rounded-xl border p-4 flex flex-col justify-between ${dark ? "border-gray-700 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-gray-400" : "text-gray-500"}`}>Experience Range</label>
            <span className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>{currentExpMin}y - {currentExpMax}y</span>
          </div>
          <div className="space-y-3">
            <div>
              <input
                type="range"
                min={expMin}
                max={expMax}
                step={1}
                value={currentExpMin}
                onChange={e => updateFilter("exp_min", Math.min(Number(e.target.value), currentExpMax))}
                className={`w-full range-slider ${dark ? "accent-amber-500" : "range-slider-light"}`}
                style={getRangeStyle(currentExpMin, expMin, expMax)}
              />
              <div className={`flex justify-between text-[11px] mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                <span>{expMin}y</span><span>Min</span>
              </div>
            </div>
            <div>
              <input
                type="range"
                min={expMin}
                max={expMax}
                step={1}
                value={currentExpMax}
                onChange={e => updateFilter("exp_max", Math.max(Number(e.target.value), currentExpMin))}
                className={`w-full range-slider ${dark ? "accent-amber-500" : "range-slider-light"}`}
                style={getRangeStyle(currentExpMax, expMin, expMax)}
              />
              <div className={`flex justify-between text-[11px] mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                <span>Max</span><span>{expMax}y</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Overview / Analytics Page ────────────────────────────────────────────────
function OverviewPage({ dark, filters, setFilters, options }) {
  const analyticsUrl = (() => {
    if (!options) return "/analytics";
    const params = new URLSearchParams();
    if (filters?.department) params.set("department", filters.department);
    if (filters?.salary_min !== undefined && filters?.salary_min !== null) params.set("salary_min", String(filters.salary_min));
    if (filters?.salary_max !== undefined && filters?.salary_max !== null) params.set("salary_max", String(filters.salary_max));
    if (filters?.exp_min !== undefined && filters?.exp_min !== null) params.set("exp_min", String(filters.exp_min));
    if (filters?.exp_max !== undefined && filters?.exp_max !== null) params.set("exp_max", String(filters.exp_max));
    return params.toString() ? `/analytics?${params}` : "/analytics";
  })();

  const { data, loading } = useApi(analyticsUrl, [analyticsUrl]);

  if (loading) return <Loader />;
  if (!data) return <ErrorMsg msg="Failed to load analytics" />;

  const { summary, by_department, by_department_with_subgroups, by_subgroup, by_category, salary_histogram, exp_salary_scatter, age_distribution, join_year_trend } = data;

  const tickStyle = { fill: dark ? "#9CA3AF" : "#6B7280", fontSize: 11 };

  const CustomCategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-lg px-3 py-2 shadow-lg ${dark ? "bg-gray-800 text-white border border-gray-600" : "bg-white text-black border border-gray-200"}`}>
          <p className="font-medium">{payload[0].name}</p>
          <p>{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const topDepartment = [...(by_department || [])].sort((a, b) => (b.count || 0) - (a.count || 0))[0];
  const highestPayingDepartment = [...(by_department || [])].sort((a, b) => (b.avg_salary || 0) - (a.avg_salary || 0))[0];
  const mostCommonAgeGroup = [...(age_distribution || [])].sort((a, b) => (b.count || 0) - (a.count || 0))[0];
  const highestSalaryRange = [...(salary_histogram || [])].sort((a, b) => (b.count || 0) - (a.count || 0))[0];

  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className={`rounded-lg px-4 py-2 shadow-lg ${dark ? "bg-gray-800 text-white border border-gray-600" : "bg-white text-black border border-gray-200"}`}>
          <p className={`text-sm font-medium ${dark ? "text-white" : "text-black"}`}>
            Experience: {data.experience}
          </p>
          <p className={`text-sm ${dark ? "text-gray-300" : "text-black"}`}>
            Salary: ₹{data.salary}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <GlobalFilters dark={dark} filters={filters} setFilters={setFilters} options={options} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <InsightCard
          icon={Building2}
          label="Top Department"
          value={topDepartment?.dept || "—"}
          sub={topDepartment ? `${fmt(topDepartment.count)} employees` : "No data available"}
          color="#3B82F6"
          dark={dark}
        />
        <InsightCard
          icon={IndianRupee}
          label="Highest Paying Department"
          value={highestPayingDepartment?.dept || "—"}
          sub={highestPayingDepartment ? fmtSal(highestPayingDepartment.avg_salary) : "No data available"}
          color="#10B981"
          dark={dark}
        />
        <InsightCard
          icon={Users}
          label="Most Common Age Group"
          value={mostCommonAgeGroup?.age_group || "—"}
          sub={mostCommonAgeGroup ? `${fmt(mostCommonAgeGroup.count)} employees` : "No data available"}
          color="#8B5CF6"
          dark={dark}
        />
        <InsightCard
          icon={BarChart2}
          label="Peak Salary Range"
          value={highestSalaryRange?.range || "—"}
          sub={highestSalaryRange ? `${fmt(highestSalaryRange.count)} employees` : "No data available"}
          color="#F59E0B"
          dark={dark}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <SummaryCard icon={Users} label="Total Employees" value={fmt(summary.total_employees)} color="#3B82F6" dark={dark} />
        <SummaryCard icon={Building2} label="Departments" value={summary.departments} color="#F59E0B" dark={dark} />
        <SummaryCard icon={IndianRupee} label="Avg. Salary" value={fmtSal(summary.avg_salary)} sub="Basic + DA" color="#10B981" dark={dark} />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-5 items-stretch">
        <ChartCard title="Employees by Department" dark={dark}>
          <DepartmentChart by_department={by_department} by_department_with_subgroups={by_department_with_subgroups} by_subgroup={by_subgroup} dark={dark} />
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <ChartCard title="Category Distribution" dark={dark} className="min-h-[320px]">
          <div className="flex items-start gap-4 min-h-[220px]">
            <ResponsiveContainer width="55%" height={230}>
              <PieChart>
                <Pie data={by_category} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={58} outerRadius={100} paddingAngle={3}>
                  {by_category.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomCategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1 pt-2">
              {by_category.map((d, i) => (
                <div key={d.category} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className={`text-sm flex-1 ${dark ? "text-gray-300" : "text-gray-600"}`}>{d.category}</span>
                  <span className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Top Departments" dark={dark} className="min-h-[320px]">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={[...(by_department || [])].sort((a, b) => b.count - a.count).slice(0, 6)} margin={{ left: 10, right: 10, top: 10, bottom: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis dataKey="dept" tick={{ ...tickStyle, fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={52} />
              <YAxis tick={tickStyle} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={chartTooltipStyle(dark)} />
              <Bar dataKey="count" fill={THEME.primary} radius={[4, 4, 0, 0]} cursor={{ fill: 'transparent' }} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Distribution" dark={dark} className="min-h-[320px]">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={age_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis dataKey="age_group" tick={tickStyle} interval={0} />
              <YAxis tick={tickStyle} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={chartTooltipStyle(dark)} />
              <Bar dataKey="count" fill={THEME.muted} radius={[4, 4, 0, 0]} cursor={{ fill: 'transparent' }} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Salary by Department" dark={dark} className="min-h-[320px]">
          <div className="flex min-h-[230px] items-center">
            <div className="w-full max-h-[230px] overflow-auto pr-2 space-y-3 scroll-smooth">
              {[...(by_department || [])]
                .sort((a, b) => (b.avg_salary || 0) - (a.avg_salary || 0))
                .map((item, index, items) => {
                  const maxSalary = items[0]?.avg_salary || 1;
                  const width = `${Math.max(18, Math.round(((item.avg_salary || 0) / maxSalary) * 100))}%`;
                  const labelClass = item.dept.length > 18
                    ? "text-[10px]"
                    : item.dept.length > 12
                      ? "text-[11px]"
                      : "text-xs";

                  return (
                    <div key={item.dept} className="grid grid-cols-[minmax(110px,1.1fr)_minmax(0,2.3fr)_84px] items-center gap-3">
                      <div className={`font-medium leading-tight ${labelClass} ${dark ? "text-gray-300" : "text-gray-700"}`}>
                        {index + 1}. {item.dept}
                      </div>
                      <div className={`h-4 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-100"}`}>
                        <div className="h-full rounded-full" style={{ width, background: THEME.accent }} />
                      </div>
                      <div className={`text-right text-sm font-semibold ${dark ? "text-white" : "text-gray-800"}`}>
                        {fmtSal(item.avg_salary)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="Salary Distribution" dark={dark}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salary_histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis dataKey="range" tick={{ ...tickStyle, fontSize: 10 }} interval={0} />
              <YAxis tick={tickStyle} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={chartTooltipStyle(dark)} />
              <Bar dataKey="count" fill={THEME.success} radius={[4, 4, 0, 0]} cursor={{ fill: 'transparent' }} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="Experience vs Salary" dark={dark}>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
              <XAxis
                dataKey="experience"
                name="Experience"
                unit="y"
                tick={tickStyle}
                interval="preserveStartEnd"
                angle={-30}
                textAnchor="end"
                height={60}
                label={{ value: "Experience (years)", position: "insideBottom", offset: -2, fill: dark ? "#9CA3AF" : "#6B7280" }}
              />
              <YAxis
                dataKey="salary"
                name="Salary"
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                tick={tickStyle}
                width={70}
                label={{ value: "Salary", angle: -90, position: "insideLeft", fill: dark ? "#9CA3AF" : "#6B7280" }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={<CustomScatterTooltip />}
              />
              <Scatter data={exp_salary_scatter} fill={THEME.primary} opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

    </div>
  );
}

// Improved department chart: Top-N selector + vertical layout for readability
function DepartmentChart({ by_department = [], by_department_with_subgroups = [], by_subgroup = [], dark }) {
  const [limit, setLimit] = useState(10);
  const [view, setView] = useState("departments");

  const deptSorted = [...(by_department || [])].sort((a, b) => b.count - a.count);
  const subgroupSorted = [...(by_subgroup || [])].sort((a, b) => b.count - a.count);
  const tickStyle = { fill: dark ? "#9CA3AF" : "#6B7280", fontSize: 12 };

  if (view === "combined") {
    const grouped = (by_department_with_subgroups || []).map(item => ({
      ...item,
      subgroups: [...(item.subgroups || [])].sort((a, b) => b.count - a.count),
    }));
    const topGroups = limit === -1 ? grouped : grouped.slice(0, limit);
    const maxDeptCount = Math.max(...topGroups.map(d => d.count), 1);

    return (
      <div className="min-w-0">
        <div className="flex flex-col gap-3 mb-3 xl:flex-row xl:items-center xl:justify-between">
          <div className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>Grouped view — subgroups nested under each department</div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <button onClick={() => setView("departments")} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${view === "departments" ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>Departments</button>
              <button onClick={() => setView("subgroups")} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${view === "subgroups" ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>Subgroups</button>
              <button onClick={() => setView("combined")} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${view === "combined" ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>Combined</button>
            </div>
            {[10, 15, 25, 50].map(n => (
              <button key={n} onClick={() => setLimit(n)} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${limit === n ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>Top {n}</button>
            ))}
            <button onClick={() => setLimit(-1)} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${limit === -1 ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>All</button>
          </div>
        </div>

        <div className="space-y-3 max-h-[700px] overflow-auto pr-1 scroll-smooth">
          {topGroups.map((group, idx) => {
            const deptWidth = `${Math.max(18, Math.round((group.count / maxDeptCount) * 100))}%`;
            return (
              <div key={group.dept} className={`rounded-xl border p-4 shadow-sm ${dark ? "border-gray-700 bg-gray-800/60" : "border-gray-100 bg-white"}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>{idx + 1}. {group.dept}</div>
                    <div className={`text-xs mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{group.count} employees • avg salary ₹{group.avg_salary?.toLocaleString("en-IN")}</div>
                  </div>
                  <div className={`text-xs font-bold ${dark ? "text-amber-300" : "text-amber-600"}`}>{group.subgroups?.length || 0} subgroups</div>
                </div>

                <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-100"}`}>
                  <div className="h-full rounded-full" style={{ width: deptWidth, background: THEME.primary }} />
                </div>

                <div className="mt-4 grid gap-2">
                  {(group.subgroups || []).length ? group.subgroups.map((sg, sidx) => {
                    const subgroupWidth = `${Math.max(8, Math.round((sg.count / group.count) * 100))}%`;
                    return (
                      <div key={sg.subgroup} className="grid grid-cols-[minmax(0,1fr)_minmax(120px,220px)_48px] items-center gap-3">
                        <div className={`text-xs truncate ${dark ? "text-gray-300" : "text-gray-700"}`}>{sg.subgroup}</div>
                        <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-100"}`}>
                          <div className="h-full rounded-full" style={{ width: subgroupWidth, background: THEME.success }} />
                        </div>
                        <div className={`text-xs text-right font-semibold ${dark ? "text-gray-200" : "text-gray-700"}`}>{sg.count}</div>
                      </div>
                    );
                  }) : <div className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>No subgroups available</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const displayData = view === "departments"
    ? (limit === -1 ? deptSorted : deptSorted.slice(0, limit))
    : (limit === -1 ? subgroupSorted : subgroupSorted.slice(0, limit)).map(s => ({ dept: s.subgroup, count: s.count }));

  const height = Math.max(240, Math.min(1200, displayData.length * 36 + 120));

  return (
    <div>
      <div className="flex flex-col gap-3 mb-3 xl:flex-row xl:items-center xl:justify-between">
        <div className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>{view === "departments" ? "Departments" : "Employee Subgroups"}</div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={() => setView("departments")} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${view === "departments" ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>Departments</button>
            <button onClick={() => setView("subgroups")} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${view === "subgroups" ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>Subgroups</button>
            <button onClick={() => setView("combined")} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${view === "combined" ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>Combined</button>
          </div>
          {[10, 15, 25, 50].map(n => (
            <button key={n} onClick={() => setLimit(n)} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${limit === n ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>Top {n}</button>
          ))}
          <button onClick={() => setLimit(-1)} className={`text-xs px-2.5 py-1.5 rounded-lg transition ${limit === -1 ? "bg-amber-500 text-white shadow-sm" : (dark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}`}>All</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={displayData} layout="vertical" margin={{ top: 10, right: 20, left: 160, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#374151" : "#F3F4F6"} />
          <XAxis type="number" tick={tickStyle} />
          <YAxis type="category" dataKey="dept" width={190} tick={tickStyle} />
          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={chartTooltipStyle(dark)} labelStyle={{ color: dark ? "#fff" : "#111" }} />
          <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={view === "departments" ? 18 : 12} cursor={{ fill: 'transparent' }} activeBar={false} fill={THEME.primary}>
            {displayData.map((_, i) => <Cell key={i} fill={THEME.primary} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
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
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [sortBy, setSortBy] = useState("Personnel Number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [modalEmp, setModalEmp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewEmp, setViewEmp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showColumns, setShowColumns] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [importing, setImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const [isCleared, setIsCleared] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [updatingStatusIds, setUpdatingStatusIds] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapRef = useRef(null);
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    department: true,
    category: true,
    age: true,
    experience: true,
    salary: true,
    state: true,
    status: true,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: opts } = useApi("/filters/options", []);
  const analyticsUrl = (() => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (filters.department) p.set("department", filters.department);
    if (filters.category) p.set("category", filters.category);
    if (filters.state) p.set("state", filters.state);
    if (filters.status) p.set("status", filters.status);
    if (filters.salary_min !== undefined && filters.salary_min !== null && filters.salary_min !== "") p.set("salary_min", String(filters.salary_min));
    if (filters.salary_max !== undefined && filters.salary_max !== null && filters.salary_max !== "") p.set("salary_max", String(filters.salary_max));
    if (filters.exp_min !== undefined && filters.exp_min !== null && filters.exp_min !== "") p.set("exp_min", String(filters.exp_min));
    if (filters.exp_max !== undefined && filters.exp_max !== null && filters.exp_max !== "") p.set("exp_max", String(filters.exp_max));
    return `/analytics?${p}`;
  })();
  const { data: analytics } = useApi(analyticsUrl, [debouncedSearch, filters, refreshKey]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setSuggestionQuery(search), 180);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [page, pageSize, debouncedSearch, sortBy, sortOrder, filters]);

  const buildUrl = (searchValue = debouncedSearch, pageValue = page, pageSizeValue = pageSize) => {
    const p = new URLSearchParams({
      page: String(pageValue), page_size: String(pageSizeValue),
      sort_by: sortBy, sort_order: sortOrder,
    });
    if (searchValue) p.set("search", searchValue);
    if (filters.department) p.set("department", filters.department);
    if (filters.category) p.set("category", filters.category);
    if (filters.state) p.set("state", filters.state);
    if (filters.status) p.set("status", filters.status);
    if (filters.salary_min !== undefined && filters.salary_min !== null && filters.salary_min !== "") p.set("salary_min", String(filters.salary_min));
    if (filters.salary_max !== undefined && filters.salary_max !== null && filters.salary_max !== "") p.set("salary_max", String(filters.salary_max));
    if (filters.exp_min !== undefined && filters.exp_min !== null && filters.exp_min !== "") p.set("exp_min", String(filters.exp_min));
    if (filters.exp_max !== undefined && filters.exp_max !== null && filters.exp_max !== "") p.set("exp_max", String(filters.exp_max));
    return `/employees?${p}`;
  };

  const { data, loading, reload } = useApi(buildUrl(), [page, debouncedSearch, sortBy, sortOrder, filters, refreshKey]);
  const { data: searchResults } = useApi(buildUrl(suggestionQuery, 1, 8), [suggestionQuery, filters, refreshKey]);
  const totalPages = Math.max(1, data?.total_pages || 0);

  const handleNext = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const getPageNumbers = () => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    const pages = [];

    for (let current = start; current <= end; current += 1) {
      pages.push(current);
    }

    return pages;
  };

  const searchTerm = debouncedSearch.trim();
  const suggestionTerm = suggestionQuery.trim();

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlightText = (text, term) => {
    const value = String(text ?? "");
    const needle = String(term ?? "").trim();
    if (!needle) return value;
    const regex = new RegExp(`(${escapeRegExp(needle)})`, "ig");
    const needleLower = needle.toLowerCase();
    return value.split(regex).map((part, index) => (
      part.toLowerCase() === needleLower
        ? <mark key={`${part}-${index}`} className="bg-amber-200 text-amber-950 rounded px-0.5">{part}</mark>
        : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    ));
  };

  const searchSuggestions = [];
  const seenSuggestions = new Set();
  if (suggestionTerm) {
    (searchResults?.data || []).forEach((emp) => {
      const candidates = [
        { field: "Name", value: emp["Employee Name"] },
        { field: "ID", value: String(emp["Personnel Number"] ?? "") },
        { field: "Department", value: emp["Department Text"] },
      ];
      candidates.forEach((candidate) => {
        const label = String(candidate.value || "");
        const key = `${candidate.field}:${label}`;
        if (label && label.toLowerCase().includes(suggestionTerm.toLowerCase()) && !seenSuggestions.has(key)) {
          seenSuggestions.add(key);
          searchSuggestions.push(candidate);
        }
      });
    });
  }

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("asc"); }
  };

  const deleteEmp = async (id, name) => {
    try {
      const r = await fetch(`${API}/employees/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      toast(`${name} deleted`, "success");
      setRefreshKey(k => k + 1);
    } catch (e) { toast(e.message, "error"); }
  };

  const toggleEmployeeStatus = async (emp) => {
    const nextStatus = emp["Employment Status"] === "Active" ? "Inactive" : "Active";
    setUpdatingStatusIds(prev => [...prev, emp._id]);
    try {
      const response = await fetch(`${API}/employees/${emp._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "Employment Status": nextStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      toast(`${emp["Employee Name"]} marked ${nextStatus}`, "success");
      setRefreshKey(k => k + 1);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setUpdatingStatusIds(prev => prev.filter(id => id !== emp._id));
    }
  };

  const handleExport = () => {
    const p = new URLSearchParams();
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (filters.department) p.set("department", filters.department);
    if (filters.category) p.set("category", filters.category);
    window.open(`${API}/export?${p}`, "_blank");
    toast("Export started", "success");
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const allowed = [".xlsx", ".csv"];
    const name = f.name.toLowerCase();
    if (!allowed.some(ext => name.endsWith(ext))) {
      toast("Unsupported file type", "error");
      return;
    }
    try {
      setImporting(true);
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch(`${API}/employees/import?dedupe=true`, { method: "POST", body: fd });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || "Import failed");
      }
      const j = await res.json();
      toast("Data imported successfully", "success");
      setRefreshKey(k => k + 1);
      setIsCleared(false);
      if (typeof reload === "function") reload();
    } catch (err) {
      toast(err.message || "Import failed", "error");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearData = async () => {
    setShowClearConfirm(false);
    try {
      const res = await fetch(`${API}/employees/all`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast("All data cleared. Please import a dataset.", "success");
      setPage(1);
      setIsCleared(true);
      setRefreshKey(k => k + 1);
      if (typeof reload === "function") reload();
    } catch (err) {
      toast(err.message || "Delete failed", "error");
    }
  };

  const currentRows = data?.data || [];
  const selectedRows = currentRows.filter(emp => selectedIds.includes(emp._id));
  const allCurrentSelected = currentRows.length > 0 && selectedRows.length === currentRows.length;
  const someCurrentSelected = selectedRows.length > 0 && selectedRows.length < currentRows.length;

  const toggleRow = (id) => {
    setSelectedIds(prev => (
      prev.includes(id)
        ? prev.filter(existing => existing !== id)
        : [...prev, id]
    ));
  };

  const toggleAllCurrent = () => {
    setSelectedIds(prev => (
      allCurrentSelected
        ? prev.filter(id => !currentRows.some(emp => emp._id === id))
        : Array.from(new Set([...prev, ...currentRows.map(emp => emp._id)]))
    ));
  };

  const bulkDelete = async () => {
    if (!selectedRows.length) return;
    try {
      await Promise.all(selectedRows.map(emp => fetch(`${API}/employees/${emp._id}`, { method: "DELETE" })));
      toast(`${selectedRows.length} employees deleted`, "success");
      setSelectedIds([]);
      setRefreshKey(k => k + 1);
    } catch (e) {
      toast(e.message || "Bulk delete failed", "error");
    }
  };

  const bulkExport = () => {
    if (!selectedRows.length) return;
    const headers = [
      "Personnel Number",
      "Employee Name",
      "Department Text",
      "Category",
      "Age_Years",
      "Experience_Years",
      "Total_Salary",
      "State",
      "Employment Status",
    ];
    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...selectedRows.map(emp => headers.map(key => escapeCsv(emp[key])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NMDC_Selected_Employees_Page_${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Selected employees exported", "success");
  };

  const columns = [
    { key: "id", field: "Personnel Number", label: "ID", w: "80px" },
    { key: "name", field: "Employee Name", label: "Name", w: "180px" },
    { key: "department", field: "Department Text", label: "Department", w: "130px" },
    { key: "category", field: "Category", label: "Category", w: "90px" },
    { key: "age", field: "Age_Years", label: "Age", w: "60px" },
    { key: "experience", field: "Experience_Years", label: "Exp.", w: "60px" },
    { key: "salary", field: "Total_Salary", label: "Total Salary", w: "120px" },
    { key: "state", field: "State", label: "State", w: "130px" },
    { key: "status", field: "Employment Status", label: "Status", w: "90px" },
  ];

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={12} className="opacity-20" />;
    return sortOrder === "asc" ? <ChevronUp size={12} className="text-amber-500" /> : <ChevronDown size={12} className="text-amber-500" />;
  };

  const visibleColumnCount = columns.filter(col => visibleColumns[col.key] !== false).length;
  const tableColSpan = visibleColumnCount + 2;
  const skeletonRows = Array.from({ length: 6 }, (_, rowIndex) => rowIndex);

  const inp = `rounded-lg px-3 py-1.5 text-sm border outline-none focus:ring-2 focus:ring-amber-400
    ${dark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200 text-gray-800"}`;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div ref={searchWrapRef} className="relative flex-1 min-w-[200px]">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border
            ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <Search size={16} className="text-gray-400" />
            <input value={search} onFocus={() => setIsSearchFocused(true)} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, department…"
              className={`bg-transparent outline-none text-sm w-full ${dark ? "text-white placeholder-gray-500" : "text-gray-800"}`} />
            {search && <button onClick={() => { setSearch(""); setSuggestionQuery(""); setIsSearchFocused(false); }}><X size={14} className="text-gray-400" /></button>}
          </div>
          {isSearchFocused && suggestionTerm.length > 0 && searchSuggestions.length > 0 && (
            <div className={`absolute left-0 right-0 top-full mt-2 z-30 overflow-hidden rounded-xl border shadow-xl ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-gray-400" : "text-gray-500"}`}>
                Search suggestions
              </div>
              <div className="max-h-72 overflow-auto">
                {searchSuggestions.slice(0, 6).map((item, index) => (
                  <button
                    key={`${item.field}-${item.value}-${index}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearch(item.value);
                      setSuggestionQuery(item.value);
                      setIsSearchFocused(false);
                      setPage(1);
                    }}
                    className={`w-full px-3 py-2 text-left transition flex items-start justify-between gap-3 ${dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                  >
                    <div className="min-w-0">
                      <div className={`text-[11px] font-semibold uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}>{item.field}</div>
                      <div className={`truncate text-sm ${dark ? "text-gray-100" : "text-gray-800"}`}>{highlightText(item.value, suggestionTerm)}</div>
                    </div>
                    <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${dark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                      Use
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
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

        <input ref={fileInputRef} type="file" accept=".xlsx,.csv" onChange={handleFileChange} className="hidden" />
        <button onClick={handleImportClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition
          ${dark ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-500" : "bg-white border-gray-200 text-gray-600 hover:border-emerald-400"}`}>
          {importing ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={15} />} Import
        </button>

        <button onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition bg-red-600 hover:bg-red-700 text-white">
          Clear Data
        </button>
        <button onClick={async () => {
          setRestoring(true);
          try {
            const res = await fetch(`${API}/employees/restore-default`, { method: "POST" });
            if (!res.ok) throw new Error(await res.text().catch(() => "Restore failed"));
            toast("Default dataset restored", "success");
            setIsCleared(false);
            setRefreshKey(k => k + 1);
            if (typeof reload === "function") reload();
          } catch (err) {
            toast(err.message || "Restore failed", "error");
          } finally {
            setRestoring(false);
          }
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition ${dark ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500" : "bg-white border-gray-200 text-gray-600 hover:border-blue-400"}`}>
          {restoring ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />} Restore Default
        </button>

        <div className="relative">
          <button onClick={() => setShowColumns(c => !c)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition
            ${showColumns ? "bg-amber-500 border-amber-500 text-white" : dark ? "bg-gray-800 border-gray-700 text-gray-300 hover:border-amber-500" : "bg-white border-gray-200 text-gray-600 hover:border-amber-400"}`}>
            <Settings size={15} /> Columns
          </button>

          {showColumns && (
            <div className={`absolute right-0 mt-2 z-20 w-60 rounded-xl border shadow-xl p-3 ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? "text-gray-400" : "text-gray-500"}`}>Show Columns</div>
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {columns.map(col => (
                  <label key={col.key} className={`flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm cursor-pointer ${dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
                    <span className={dark ? "text-gray-200" : "text-gray-700"}>{col.label}</span>
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key] !== false}
                      onChange={() => setVisibleColumns(v => ({ ...v, [col.key]: !v[col.key] }))}
                      className="h-4 w-4 accent-amber-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => { setModalEmp(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white transition">
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={`overflow-hidden rounded-xl border transition-all duration-300 ${showFilters ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"} ${dark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              ["Department", "department", opts?.departments || []],
              ["Category", "category", opts?.categories || []],
              ["State", "state", opts?.states || []],
              ["Status", "status", opts?.statuses || []],
            ].map(([label, key, options]) => (
              <div key={key} className={`rounded-lg border p-3 ${dark ? "border-gray-700 bg-gray-900/30" : "border-gray-200 bg-white"}`}>
                <label className={`text-[11px] font-semibold uppercase tracking-[0.16em] block mb-2 ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
                <select value={filters[key] || ""} onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value || undefined })); setPage(1); }} className={inp + " w-full h-11"}>
                  <option value="">All {label === "Status" ? "Statuses" : `${label}s`}</option>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}

            <div className={`rounded-lg border p-3 ${dark ? "border-gray-700 bg-gray-900/30" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-gray-400" : "text-gray-500"}`}>Salary Range</label>
                <span className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>
                  {fmtSal(filters.salary_min || opts?.salary_min || 0)} - {fmtSal(filters.salary_max || opts?.salary_max || 0)}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <input
                    type="range"
                    min={opts?.salary_min || 0}
                    max={opts?.salary_max || 0}
                    step={1000}
                    value={filters.salary_min ?? opts?.salary_min ?? 0}
                    onChange={e => { setFilters(f => ({ ...f, salary_min: e.target.value })); setPage(1); }}
                    className="w-full range-slider accent-amber-500"
                  />
                  <div className={`flex justify-between text-[11px] mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                    <span>{fmtSal(opts?.salary_min || 0)}</span><span>Min</span>
                  </div>
                </div>
                <div>
                  <input
                    type="range"
                    min={opts?.salary_min || 0}
                    max={opts?.salary_max || 0}
                    step={1000}
                    value={filters.salary_max ?? opts?.salary_max ?? 0}
                    onChange={e => { setFilters(f => ({ ...f, salary_max: e.target.value })); setPage(1); }}
                    className="w-full range-slider accent-amber-500"
                  />
                  <div className={`flex justify-between text-[11px] mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                    <span>Max</span><span>{fmtSal(opts?.salary_max || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-lg border p-3 ${dark ? "border-gray-700 bg-gray-900/30" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-gray-400" : "text-gray-500"}`}>Experience Range</label>
                <span className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>
                  {filters.exp_min ?? opts?.exp_min ?? 0}y - {filters.exp_max ?? opts?.exp_max ?? 0}y
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <input
                    type="range"
                    min={opts?.exp_min || 0}
                    max={opts?.exp_max || 0}
                    step={1}
                    value={filters.exp_min ?? opts?.exp_min ?? 0}
                    onChange={e => { setFilters(f => ({ ...f, exp_min: e.target.value })); setPage(1); }}
                    className="w-full range-slider accent-amber-500"
                  />
                  <div className={`flex justify-between text-[11px] mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                    <span>{opts?.exp_min || 0}y</span><span>Min</span>
                  </div>
                </div>
                <div>
                  <input
                    type="range"
                    min={opts?.exp_min || 0}
                    max={opts?.exp_max || 0}
                    step={1}
                    value={filters.exp_max ?? opts?.exp_max ?? 0}
                    onChange={e => { setFilters(f => ({ ...f, exp_max: e.target.value })); setPage(1); }}
                    className="w-full range-slider accent-amber-500"
                  />
                  <div className={`flex justify-between text-[11px] mt-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                    <span>Max</span><span>{opts?.exp_max || 0}y</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-3 flex items-end justify-end pt-1">
              <button onClick={() => { setFilters({}); setPage(1); }} className="px-3 py-2 rounded-lg text-sm text-red-500 border border-red-200 hover:bg-red-50 transition">
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Total employees (filtered)", value: fmt(analytics?.summary?.total_employees ?? 0), accent: "#3B82F6" },
          { label: "Average salary", value: fmtSal(analytics?.summary?.avg_salary ?? 0), accent: "#10B981" },
          { label: "Average experience", value: `${analytics?.summary?.avg_experience ?? 0}y`, accent: "#F59E0B" },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl border px-4 py-4 shadow-sm ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-xs font-semibold uppercase tracking-[0.16em] ${dark ? "text-gray-400" : "text-gray-500"}`}>{card.label}</span>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: card.accent }} />
            </div>
            <div className={`mt-3 text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
        {selectedRows.length > 0 && (
          <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 flex-wrap ${dark ? "bg-gray-900/40 border-gray-700" : "bg-amber-50 border-amber-100"}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-800"}`}>
                {selectedRows.length} row{selectedRows.length === 1 ? "" : "s"} selected
              </span>
              <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                Use bulk actions on the selected employees.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={bulkExport}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-white transition"
              >
                <Download size={14} /> Bulk Export
              </button>
              <button
                onClick={bulkDelete}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-400 text-white transition"
              >
                <Trash2 size={14} /> Bulk Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${dark ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${dark ? "border-gray-700 bg-gray-750" : "border-gray-100 bg-gray-50"}`}>
                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}>
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    ref={el => { if (el) el.indeterminate = someCurrentSelected; }}
                    onChange={toggleAllCurrent}
                    className="h-4 w-4 accent-amber-500"
                    aria-label="Select all rows on this page"
                  />
                </th>
                {columns.filter(col => visibleColumns[col.key] !== false).map(col => (
                  <th key={col.key} style={{ minWidth: col.w }}
                    className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer select-none
                    ${dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}
                    onClick={() => handleSort(col.field)}>
                    <span className="flex items-center gap-1">{col.label} <SortIcon col={col.field} /></span>
                  </th>
                ))}
                <th className={`px-4 py-3 text-right text-xs font-bold uppercase tracking-wider ${dark ? "text-gray-400" : "text-gray-500"}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                skeletonRows.map((rowIndex) => (
                  <tr key={rowIndex} className={`${dark ? "border-gray-700" : "border-gray-100"}`}>
                    <td className="px-4 py-4">
                      <div className={`h-4 w-4 rounded ${dark ? "bg-gray-700" : "bg-gray-200"} animate-pulse`} />
                    </td>
                    {columns.filter(col => visibleColumns[col.key] !== false).map((col, cellIndex) => (
                      <td key={`${rowIndex}-${col.key}`} className="px-4 py-4">
                        <div
                          className={`h-4 rounded animate-pulse ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                          style={{ width: cellIndex === 0 ? "70%" : cellIndex === 1 ? "85%" : cellIndex === 2 ? "65%" : cellIndex === 6 ? "80%" : "60%" }}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className={`h-8 w-8 rounded-lg animate-pulse ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
                        <div className={`h-8 w-8 rounded-lg animate-pulse ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
                        <div className={`h-8 w-8 rounded-lg animate-pulse ${dark ? "bg-gray-700" : "bg-gray-200"}`} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={tableColSpan} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-center gap-3">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-full border ${dark ? "border-gray-700 bg-gray-800 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                        <AlertCircle size={24} />
                      </div>
                      <div>
                          {isCleared ? (
                            <>
                              <div className={`text-base font-semibold ${dark ? "text-white" : "text-gray-900"}`}>No data available</div>
                              <div className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Please import Excel file.</div>
                            </>
                          ) : (
                            <>
                              <div className={`text-base font-semibold ${dark ? "text-white" : "text-gray-900"}`}>No data found</div>
                              <div className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}>Try adjusting your filters or search terms.</div>
                            </>
                          )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.data?.map((emp, idx) => (
                  <tr key={emp._id}
                    className={`border-b transition-colors cursor-default
                    ${idx % 2 === 0 ? dark ? "bg-gray-800" : "bg-white" : dark ? "bg-gray-750" : "bg-gray-50/50"}
                    ${dark ? "border-gray-700 hover:bg-gray-700" : "border-gray-50 hover:bg-amber-50/40"}`}>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp._id)}
                        onChange={() => toggleRow(emp._id)}
                        className="h-4 w-4 accent-amber-500"
                        aria-label={`Select ${emp["Employee Name"]}`}
                      />
                    </td>
                    {visibleColumns.id !== false && <td className={`px-4 py-3 font-mono text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{highlightText(emp["Personnel Number"], searchTerm)}</td>}
                    {visibleColumns.name !== false && <td className={`px-4 py-3 font-semibold ${dark ? "text-white" : "text-gray-800"}`}>{highlightText(emp["Employee Name"], searchTerm)}</td>}
                    {visibleColumns.department !== false && <td className={`px-4 py-3 ${dark ? "text-gray-300" : "text-gray-600"}`}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ background: (DEPT_COLORS[emp["Department Text"]] || "#6B7280") + "22", color: DEPT_COLORS[emp["Department Text"]] || "#6B7280" }}>
                        {highlightText(emp["Department Text"], searchTerm)}
                      </span>
                    </td>}
                    {visibleColumns.category !== false && <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold
                        ${emp["Category"] === "SC" ? "bg-blue-100 text-blue-700" :
                          emp["Category"] === "ST" ? "bg-green-100 text-green-700" :
                          emp["Category"] === "OBC" ? "bg-amber-100 text-amber-700" :
                          "bg-purple-100 text-purple-700"}`}>
                        {emp["Category"]}
                      </span>
                    </td>}
                    {visibleColumns.age !== false && <td className={`px-4 py-3 ${dark ? "text-gray-300" : "text-gray-600"}`}>{emp["Age_Years"] || "—"}</td>}
                    {visibleColumns.experience !== false && <td className={`px-4 py-3 ${dark ? "text-gray-300" : "text-gray-600"}`}>{emp["Experience_Years"] ? `${emp["Experience_Years"]}y` : "—"}</td>}
                    {visibleColumns.salary !== false && <td className={`px-4 py-3 font-semibold ${dark ? "text-emerald-400" : "text-emerald-600"}`}>{fmtSal(emp["Total_Salary"])}</td>}
                    {visibleColumns.state !== false && <td className={`px-4 py-3 text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>{emp["State"]}</td>}
                    {visibleColumns.status !== false && <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleEmployeeStatus(emp)}
                        disabled={updatingStatusIds.includes(emp._id)}
                        className={`inline-flex items-center gap-3 rounded-full border px-2 py-1 text-xs font-semibold transition disabled:opacity-60 ${
                          emp["Employment Status"] === "Active"
                            ? dark
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : dark
                              ? "border-gray-600 bg-gray-700 text-gray-300"
                              : "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                        aria-label={`Toggle status for ${emp["Employee Name"]}`}
                      >
                        <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${emp["Employment Status"] === "Active" ? "bg-emerald-500" : dark ? "bg-gray-500" : "bg-gray-300"}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${emp["Employment Status"] === "Active" ? "translate-x-4" : "translate-x-0.5"}`} />
                        </span>
                        <span>{updatingStatusIds.includes(emp._id) ? "Saving..." : emp["Employment Status"]}</span>
                      </button>
                    </td>}
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
                        <button onClick={() => setDeleteTarget(emp)} title="Delete"
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
            <div className="flex items-center gap-4 flex-wrap">
              <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}>
                Showing {data.total === 0 ? 0 : ((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, data.total)} of total employees
              </span>
              <label className={`flex items-center gap-2 text-xs font-medium ${dark ? "text-gray-400" : "text-gray-500"}`}>
                Page size
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className={`rounded-lg border px-2 py-1 text-xs outline-none ${dark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700"}`}
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handlePrev} disabled={page === 1}
                className={`p-1.5 rounded-lg disabled:opacity-30 transition ${dark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}>
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((pg) => (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition
                  ${pg === page ? "bg-amber-500 text-white" : dark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-600"}`}>
                  {pg}
                </button>
              ))}
              <button onClick={handleNext} disabled={page === totalPages}
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
      {deleteTarget && (
        <DeleteConfirmModal
          dark={dark}
          employee={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            const target = deleteTarget;
            setDeleteTarget(null);
            await deleteEmp(target._id, target["Employee Name"]);
          }}
        />
      )}
      {showClearConfirm && (
        <ClearAllConfirmModal
          dark={dark}
          onCancel={() => setShowClearConfirm(false)}
          onConfirm={handleClearData}
        />
      )}
    </div>
  );
}

function DeleteConfirmModal({ dark, employee, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className={`w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className={`px-6 py-5 border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
          <div className={`text-[11px] font-bold uppercase tracking-[0.22em] ${dark ? "text-red-300" : "text-red-600"}`}>Delete Employee</div>
          <h2 className={`mt-2 text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>Are you sure you want to delete this employee?</h2>
          <p className={`mt-2 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{employee["Employee Name"]} · {employee["Department Text"]}</p>
        </div>

        <div className="px-6 py-5">
          <p className={`text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
            This action cannot be undone. The employee record will be permanently removed from the directory.
          </p>
        </div>

        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${dark ? "border-slate-800" : "border-slate-200"}`}>
          <button onClick={onCancel} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${dark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function ClearAllConfirmModal({ dark, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className={`w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className={`px-6 py-5 border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
          <div className={`text-[11px] font-bold uppercase tracking-[0.22em] ${dark ? "text-red-300" : "text-red-600"}`}>Delete All Data</div>
          <h2 className={`mt-2 text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>Are you sure you want to delete ALL employee data?</h2>
          <p className={`mt-2 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>This action is irreversible and will remove every employee record.</p>
        </div>

        <div className="px-6 py-5">
          <p className={`text-sm leading-6 ${dark ? "text-slate-300" : "text-slate-600"}`}>
            Please confirm to permanently delete all employee data from the system.
          </p>
        </div>

        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${dark ? "border-slate-800" : "border-slate-200"}`}>
          <button onClick={onCancel} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${dark ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Employee Modal ──────────────────────────────────────────────────────
function ViewModal({ emp, onClose, dark }) {
  const detailItems = [
    { key: "Personnel Number", label: "ID", value: emp["Personnel Number"] },
    { key: "Employee Name", label: "Name", value: emp["Employee Name"] },
    { key: "Department Text", label: "Department", value: emp["Department Text"] },
    {
      key: "HOD Department",
      label: "HOD Department",
      value: {
        name: emp["HOD Name"] || null,
        sapId: emp["HOD SAP ID"] || null,
      },
    },
    { key: "Category", label: "Category", value: emp["Category"] },
    { key: "Age_Years", label: "Age", value: emp["Age_Years"] != null ? `${emp["Age_Years"]}y` : null },
    { key: "Experience_Years", label: "Experience", value: emp["Experience_Years"] != null ? `${emp["Experience_Years"]}y` : null },
    { key: "Total_Salary", label: "Salary", value: emp["Total_Salary"] },
    { key: "State", label: "State", value: emp["State"] },
    { key: "Employment Status", label: "Status", value: emp["Employment Status"] },
  ];

  const badgeClass = (label, value) => {
    if (label === "Status") return value === "Active" ? "bg-green-900/40 text-green-300 border-green-700" : "bg-gray-700/60 text-gray-300 border-gray-600";
    if (label === "Category") return value === "OBC" ? "bg-yellow-900/40 text-yellow-300 border-yellow-700" : "bg-amber-900/25 text-amber-200 border-amber-700/40";
    return dark ? "bg-slate-800 text-white border-gray-700" : "bg-slate-50 text-slate-800 border-slate-200";
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className={`w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className={`px-6 py-5 flex items-start justify-between gap-4 border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
          <div className="min-w-0">
            <div className={`text-[11px] font-bold uppercase tracking-[0.22em] ${dark ? "text-slate-400" : "text-slate-500"}`}>View Employee Details</div>
            <h2 className={`mt-2 text-2xl font-bold truncate ${dark ? "text-white" : "text-slate-900"}`}>{emp["Employee Name"] || "Employee"}</h2>
            <p className={`mt-2 text-sm ${dark ? "text-gray-400" : "text-slate-500"}`}>{emp["Department Text"] || "Department not available"}</p>
          </div>
          <button onClick={onClose} className={`rounded-full p-2 transition ${dark ? "text-slate-400 hover:bg-gray-700 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto pr-3 scroll-smooth">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {detailItems.map(item => (
              item.value !== null && item.value !== undefined && item.value !== "" && (
                item.key === "HOD Department" ? (
                  <div key={item.key} className={`h-full min-h-[108px] rounded-xl border p-4 bg-slate-800 text-white border-gray-700`}>
                    <div className={`text-xs uppercase tracking-wide text-gray-400`}>
                      HOD DETAILS
                    </div>
                    <div className="mt-2 text-lg font-semibold leading-tight text-white">
                      <span className="mr-2">👤</span>
                      {item.value.name || "Not Assigned"}
                    </div>
                    <div className="mt-3 text-sm text-gray-300">
                      SAP ID: {item.value.sapId || "Not Assigned"}
                    </div>
                  </div>
                ) : (
                  <div key={item.key} className={`h-full min-h-[108px] rounded-xl border p-4 ${badgeClass(item.label, item.value)}`}>
                    <div className={`text-xs uppercase tracking-wide ${dark ? "text-gray-400" : "text-gray-500"}`}>
                      {item.label}
                    </div>
                    <div className={`mt-2 text-lg font-semibold leading-tight ${item.label === "Status" || item.label === "Category" ? "" : dark ? "text-white" : "text-slate-900"}`}>
                      {item.label === "Salary" ? fmtSal(emp["Total_Salary"]) : item.value}
                    </div>
                  </div>
                )
              )
            ))}
          </div>
        </div>

        <div className={`px-6 py-4 border-t flex justify-end ${dark ? "border-slate-800" : "border-slate-200"}`}>
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition">Close</button>
        </div>
      </div>
    </div>
  );
}

function LogoArea({ dark, sidebarOpen }) {
  const [visible, setVisible] = useState(true);
  const url = "https://images.seeklogo.com/logo-png/63/1/national-mineral-development-corporation-logo-png_seeklogo-630408.png";
  return (
    <>
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        {visible ? (
          <img
            src={url}
            alt="NMDC"
            className="w-full h-full object-contain rounded-md"
            onError={() => setVisible(false)}
            onLoad={() => setVisible(true)}
          />
        ) : (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dark ? "bg-amber-500" : "bg-amber-500"}`}>
            <BarChart2 size={16} className="text-white" />
          </div>
        )}
      </div>
      {sidebarOpen && (
        <div>
          <div className={`text-sm font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>NMDC</div>
          <div className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>Dashboard</div>
        </div>
      )}
    </>
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

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiOk, setApiOk] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState({
    department: "",
    salary_min: 0,
    salary_max: 0,
    exp_min: 0,
    exp_max: 0,
  });
  const { toasts, toast, remove } = useToast();

  // Check API connectivity
  useEffect(() => {
    fetch(`${API}/filters/options`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error("API offline")))
      .then(data => {
        setApiOk(true);
        setFilterOptions(data);
        setFilters(prev => ({
          ...prev,
          salary_min: prev.salary_min || data.salary_min || 0,
          salary_max: prev.salary_max || data.salary_max || 0,
          exp_min: prev.exp_min || data.exp_min || 0,
          exp_max: prev.exp_max || data.exp_max || 0,
        }));
      })
      .catch(() => setApiOk(false));
  }, []);

  const nav = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "employees", label: "Employees", icon: Table },
  ];

  const bg = dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";
  const sidebar = dark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200";

  return (
    <div
      className={`min-h-screen flex ${bg}`}
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        backgroundImage: dark
          ? "radial-gradient(circle at top left, rgba(59,130,246,0.08), transparent 28%), radial-gradient(circle at top right, rgba(245,158,11,0.06), transparent 22%)"
          : "radial-gradient(circle at top left, rgba(59,130,246,0.06), transparent 28%), radial-gradient(circle at top right, rgba(245,158,11,0.05), transparent 22%)",
      }}
    >
      <Toast toasts={toasts} remove={remove} />

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 border-r flex flex-col transition-all duration-200 ${sidebar}`}>
        {/* Logo */}
        <div className={`px-4 py-5 flex items-center gap-3 border-b ${dark ? "border-gray-800" : "border-gray-100"}`}>
          <LogoArea dark={dark} sidebarOpen={sidebarOpen} />
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
        <header className={`border-b px-6 py-3 flex items-center justify-between flex-shrink-0 backdrop-blur-sm ${dark ? "bg-slate-950/75 border-slate-900" : "bg-white/85 border-slate-200"}`}>
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
        <main className="flex-1 overflow-auto p-4 md:p-6 scroll-smooth">
          {page === "overview" && <OverviewPage dark={dark} filters={filters} setFilters={setFilters} options={filterOptions} />}
          {page === "employees" && <EmployeesPage dark={dark} toast={toast} />}
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 3px; }
        .range-slider {
          height: 8px;
          border-radius: 999px;
        }
        .range-slider-light::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, #3B82F6 0%, #3B82F6 var(--slider-progress, 0%), #D1D5DB var(--slider-progress, 0%), #D1D5DB 100%);
        }
        .range-slider-light::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #F59E0B;
          border: 2px solid #F59E0B;
          box-shadow: 0 4px 12px rgba(0,0,0,0.14);
          margin-top: -5px;
        }
        .range-slider-light::-moz-range-track {
          height: 8px;
          border-radius: 999px;
          background: #D1D5DB;
        }
        .range-slider-light::-moz-range-progress {
          height: 8px;
          border-radius: 999px;
          background: #3B82F6;
        }
        .range-slider-light::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #F59E0B;
          border: 2px solid #F59E0B;
          box-shadow: 0 4px 12px rgba(0,0,0,0.14);
        }
        .range-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(251,191,36,0.45), rgba(59,130,246,0.45));
        }
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #fff;
          border: 3px solid #F59E0B;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
          margin-top: -5px;
        }
        .range-slider::-moz-range-track {
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(251,191,36,0.45), rgba(59,130,246,0.45));
        }
        .range-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #fff;
          border: 3px solid #F59E0B;
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
        }
        .chart-panel {
          scroll-margin-top: 16px;
        }
        .bg-gray-750 { background-color: #1f2937cc; }
        @keyframes slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.25s ease; }
      `}</style>
    </div>
  );
}
 
