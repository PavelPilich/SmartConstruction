import { useState, useMemo } from "react";
import {
  Receipt, DollarSign, Package, Users, Wrench, TrendingUp, Calendar as CalendarIcon,
  Plus, Search, Download, RefreshCw, ChevronDown, ChevronUp, Trash2, Edit3, X,
} from "lucide-react";
import { Badge, Btn, StatCard, Modal, SmartSelect, FileUploadSim } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

// ── Types ──────────────────────────────────────────────────────────────────
type ExpenseCategory =
  | "Materials" | "Labor" | "Subcontractor" | "Equipment"
  | "Permits" | "Delivery" | "Fuel" | "Disposal" | "Office" | "Misc";

interface Expense {
  id: string;
  date: string;
  project: string;
  category: ExpenseCategory;
  vendor: string;
  description: string;
  amount: number;
  receipt: "yes" | "pending" | "none";
  qbSynced: "yes" | "pending";
  taxDeductible: boolean;
  notes: string;
  receiptFile: string;
}

interface JobProfit {
  project: string;
  projectLabel: string;
  contract: number;
  expenses: number;
}

// ── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES: ExpenseCategory[] = [
  "Materials", "Labor", "Subcontractor", "Equipment",
  "Permits", "Delivery", "Fuel", "Disposal", "Office", "Misc",
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Materials: "#3b82f6",
  Labor: "#10b981",
  Subcontractor: "#8b5cf6",
  Equipment: "#f59e0b",
  Permits: "#6366f1",
  Delivery: "#06b6d4",
  Fuel: "#ef4444",
  Disposal: "#64748b",
  Office: "#ec4899",
  Misc: "#94a3b8",
};

const PROJECTS = [
  "MN-0247 Thompson",
  "MN-0089 Garcia",
  "MN-0156 Chen",
  "MN-0312 Andersen",
  "MN-0419 Erickson",
  "General",
];

const INITIAL_VENDORS = [
  "ABC Supply Plymouth", "ABC Supply", "Menards Maple Grove", "Home Depot Plymouth",
  "Pella Windows", "Metal Sales Mfg", "Sunbelt Rentals", "Hertz Equipment",
  "Wilson Siding Co", "Mendez Windows Inc", "Waste Mgmt", "Holiday Station",
  "Staples", "Porta-John Inc", "City of Plymouth",
];

const JOB_PROFITS: JobProfit[] = [
  { project: "MN-0247 Thompson", projectLabel: "MN-0247 Thompson Roof", contract: 18500, expenses: 10537 },
  { project: "MN-0089 Garcia", projectLabel: "MN-0089 Garcia Siding", contract: 24200, expenses: 8397 },
  { project: "MN-0156 Chen", projectLabel: "MN-0156 Chen Windows", contract: 12400, expenses: 10000 },
  { project: "MN-0312 Andersen", projectLabel: "MN-0312 Andersen Ext", contract: 67800, expenses: 480 },
  { project: "MN-0419 Erickson", projectLabel: "MN-0419 Erickson Barn", contract: 42000, expenses: 9840 },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: "e1", date: "2026-03-30", project: "MN-0247 Thompson", category: "Materials", vendor: "ABC Supply Plymouth", description: "OC Duration shingles, 26 sq", amount: 4680, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e2", date: "2026-03-30", project: "MN-0247 Thompson", category: "Materials", vendor: "ABC Supply Plymouth", description: "Synthetic underlayment, ice/water shield", amount: 1240, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e3", date: "2026-03-29", project: "MN-0247 Thompson", category: "Delivery", vendor: "ABC Supply", description: "Shingle delivery to job site", amount: 285, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e4", date: "2026-03-28", project: "MN-0247 Thompson", category: "Labor", vendor: "In-house crew", description: "Tear-off day 1, Alpha Team 6 men x 8 hrs", amount: 2880, receipt: "none", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e5", date: "2026-03-28", project: "MN-0247 Thompson", category: "Disposal", vendor: "Waste Mgmt", description: "2 dumpster loads, shingle disposal", amount: 650, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e6", date: "2026-03-27", project: "MN-0089 Garcia", category: "Subcontractor", vendor: "Wilson Siding Co", description: "Siding installation, east/north walls", amount: 4200, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e7", date: "2026-03-27", project: "MN-0089 Garcia", category: "Materials", vendor: "Menards Maple Grove", description: "Vinyl siding 24 sq, J-channel, corners", amount: 3120, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e8", date: "2026-03-26", project: "MN-0156 Chen", category: "Subcontractor", vendor: "Mendez Windows Inc", description: "Window installation, 8 windows", amount: 3600, receipt: "yes", qbSynced: "pending", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e9", date: "2026-03-26", project: "MN-0156 Chen", category: "Materials", vendor: "Pella Windows", description: "8x Pella 250 series double-hung", amount: 6400, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e10", date: "2026-03-25", project: "MN-0312 Andersen", category: "Equipment", vendor: "Sunbelt Rentals", description: "Boom lift rental, 2 days", amount: 480, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e11", date: "2026-03-25", project: "MN-0247 Thompson", category: "Permits", vendor: "City of Plymouth", description: "Building permit BP-2026-0447", amount: 285, receipt: "yes", qbSynced: "yes", taxDeductible: false, notes: "", receiptFile: "" },
  { id: "e12", date: "2026-03-24", project: "MN-0089 Garcia", category: "Fuel", vendor: "Holiday Station", description: "Fleet fuel, 3 trucks", amount: 187, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e13", date: "2026-03-23", project: "General", category: "Office", vendor: "Staples", description: "Printer paper, toner, office supplies", amount: 124, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e14", date: "2026-03-22", project: "MN-0247 Thompson", category: "Materials", vendor: "Home Depot Plymouth", description: "Flashing, drip edge, pipe boots, caulk", amount: 342, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e15", date: "2026-03-21", project: "MN-0419 Erickson", category: "Materials", vendor: "Metal Sales Mfg", description: "Steel barn panels, 48 sheets", amount: 8640, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e16", date: "2026-03-20", project: "MN-0419 Erickson", category: "Equipment", vendor: "Hertz Equipment", description: "Scissor lift, 1 week", amount: 1200, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e17", date: "2026-03-19", project: "MN-0089 Garcia", category: "Materials", vendor: "ABC Supply", description: "Gutters, downspouts, brackets", amount: 890, receipt: "yes", qbSynced: "pending", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e18", date: "2026-03-18", project: "MN-0247 Thompson", category: "Misc", vendor: "Porta-John Inc", description: "Portable toilet rental, 1 week", amount: 175, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e19", date: "2026-03-17", project: "MN-0089 Garcia", category: "Labor", vendor: "In-house crew", description: "Siding prep, removal old siding, 4 men x 6 hrs", amount: 1440, receipt: "none", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
  { id: "e20", date: "2026-03-16", project: "MN-0247 Thompson", category: "Materials", vendor: "ABC Supply Plymouth", description: "Ridge vent, starter strip, hip/ridge shingles", amount: 518, receipt: "yes", qbSynced: "yes", taxDeductible: true, notes: "", receiptFile: "" },
];

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });
const fmtK = (n: number) => n >= 1000 ? "$" + Math.round(n / 1000) + "K" : fmt(n);

const fmtDate = (d: string) => {
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("en", { month: "short", day: "numeric" });
};

type SortKey = "date" | "project" | "category" | "vendor" | "amount";
type SortDir = "asc" | "desc";

const emptyForm = (): Omit<Expense, "id"> => ({
  date: new Date().toISOString().split("T")[0],
  project: "",
  category: "Materials" as ExpenseCategory,
  vendor: "",
  description: "",
  amount: 0,
  receipt: "none",
  qbSynced: "pending",
  taxDeductible: true,
  notes: "",
  receiptFile: "",
});

// ── Component ──────────────────────────────────────────────────────────────
export default function JobExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Expense, "id">>(emptyForm());
  const [filterProject, setFilterProject] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [profitOpen, setProfitOpen] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [projects, setProjects] = useState<string[]>(PROJECTS);
  const [categories, setCategories] = useState<ExpenseCategory[]>(CATEGORIES);
  const [vendors, setVendors] = useState<string[]>(INITIAL_VENDORS);
  const addToast = useAppStore((s) => s.addToast);

  // ── Derived data ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...expenses];
    if (filterProject) list = list.filter((e) => e.project === filterProject);
    if (filterCategory) list = list.filter((e) => e.category === filterCategory);
    if (filterFrom) list = list.filter((e) => e.date >= filterFrom);
    if (filterTo) list = list.filter((e) => e.date <= filterTo);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.vendor.toLowerCase().includes(s) ||
          e.description.toLowerCase().includes(s) ||
          e.project.toLowerCase().includes(s)
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "project") cmp = a.project.localeCompare(b.project);
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      else if (sortKey === "vendor") cmp = a.vendor.localeCompare(b.vendor);
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [expenses, filterProject, filterCategory, filterFrom, filterTo, search, sortKey, sortDir]);

  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const materialsTotal = expenses.filter((e) => e.category === "Materials").reduce((a, e) => a + e.amount, 0);
  const laborSubsTotal = expenses.filter((e) => e.category === "Labor" || e.category === "Subcontractor").reduce((a, e) => a + e.amount, 0);
  const equipmentTotal = expenses.filter((e) => e.category === "Equipment").reduce((a, e) => a + e.amount, 0);
  const thisMonth = expenses.filter((e) => e.date >= "2026-03-01" && e.date <= "2026-03-31").reduce((a, e) => a + e.amount, 0);
  const uniqueProjects = new Set(expenses.filter((e) => e.project !== "General").map((e) => e.project));
  const avgPerJob = uniqueProjects.size > 0 ? Math.round(totalExpenses / uniqueProjects.size) : 0;

  const filteredTotal = filtered.reduce((a, e) => a + e.amount, 0);

  // Category breakdown for bar chart
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] || 0) + e.amount;
    }
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const max = entries.length > 0 ? entries[0][1] : 1;
    return entries.map(([cat, amt]) => ({ category: cat as ExpenseCategory, amount: amt, pct: (amt / max) * 100 }));
  }, [expenses]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (exp: Expense) => {
    setEditingId(exp.id);
    const { id: _, ...rest } = exp;
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = (addAnother: boolean) => {
    if (!form.project || !form.vendor || !form.description || form.amount <= 0) {
      addToast("Please fill in all required fields", "error");
      return;
    }
    if (editingId) {
      setExpenses((prev) => prev.map((e) => (e.id === editingId ? { ...e, ...form } : e)));
      addToast("Expense updated successfully", "success");
      setModalOpen(false);
      setEditingId(null);
    } else {
      const newExp: Expense = { id: `e${Date.now()}`, ...form };
      setExpenses((prev) => [newExp, ...prev]);
      addToast(`Expense added: ${fmt(form.amount)}`, "success");
      if (addAnother) {
        setForm({ ...emptyForm(), project: form.project, category: form.category });
      } else {
        setModalOpen(false);
      }
    }
  };

  const handleDelete = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
    addToast("Expense deleted", "success");
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "amount" ? "desc" : "asc");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Project", "Category", "Vendor", "Description", "Amount", "Receipt", "QB Synced", "Tax Deductible"];
    const rows = filtered.map((e) => [
      e.date, e.project, e.category, e.vendor, e.description,
      e.amount.toString(), e.receipt, e.qbSynced, e.taxDeductible ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Expenses exported to CSV", "success");
  };

  const handleQBSync = () => {
    setExpenses((prev) =>
      prev.map((e) => (e.qbSynced === "pending" ? { ...e, qbSynced: "yes" as const } : e))
    );
    addToast("All pending expenses synced to QuickBooks", "success");
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />
    ) : null;

  const receiptIcon = (r: Expense["receipt"]) =>
    r === "yes" ? <span className="text-green-600" title="Uploaded">&#10003;</span> :
    r === "pending" ? <span className="text-yellow-500" title="Pending">&#9203;</span> :
    <span className="text-gray-400" title="None">&mdash;</span>;

  const qbIcon = (q: Expense["qbSynced"]) =>
    q === "yes" ? <span className="text-green-600" title="Synced">&#10003;</span> :
    <span className="text-yellow-500" title="Pending sync">&#9203;</span>;

  const inputCls = "w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const marginColor = (margin: number) =>
    margin >= 40 ? "#10b981" : margin >= 20 ? "#f59e0b" : "#ef4444";

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track every cost per project for real profit visibility</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn color="#10b981" variant="outline" onClick={handleExportCSV}>
            <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> Export CSV</span>
          </Btn>
          <Btn color="#8b5cf6" variant="outline" onClick={handleQBSync}>
            <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Sync to QuickBooks</span>
          </Btn>
          <Btn color="#3b82f6" onClick={openAdd}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Expense</span>
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard icon={DollarSign} label="Total Expenses (YTD)" value={fmt(totalExpenses)} sub={`${expenses.length} expenses`} color="#ef4444" />
        <StatCard icon={Package} label="Materials" value={fmtK(materialsTotal)} sub={`${Math.round((materialsTotal / totalExpenses) * 100)}% of total`} color="#3b82f6" />
        <StatCard icon={Users} label="Labor / Subs" value={fmtK(laborSubsTotal)} sub={`${Math.round((laborSubsTotal / totalExpenses) * 100)}% of total`} color="#10b981" />
        <StatCard icon={Wrench} label="Equipment" value={fmtK(equipmentTotal)} sub={`${Math.round((equipmentTotal / totalExpenses) * 100)}% of total`} color="#f59e0b" />
        <StatCard icon={CalendarIcon} label="This Month" value={fmt(thisMonth)} sub="March 2026" color="#8b5cf6" />
        <StatCard icon={TrendingUp} label="Avg Per Job" value={fmt(avgPerJob)} sub={`${uniqueProjects.size} active jobs`} color="#06b6d4" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <SmartSelect
            value={filterProject}
            onChange={setFilterProject}
            options={["", ...projects]}
            placeholder="All Projects"
            label="Project"
          />
          <SmartSelect
            value={filterCategory}
            onChange={setFilterCategory}
            options={["", ...categories]}
            placeholder="All Categories"
            label="Category"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              className={inputCls}
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              className={inputCls}
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className={`${inputCls} pl-9`}
                placeholder="Vendor or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        {(filterProject || filterCategory || filterFrom || filterTo || search) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Showing {filtered.length} of {expenses.length} expenses ({fmt(filteredTotal)} total)
            </span>
            <button
              onClick={() => { setFilterProject(""); setFilterCategory(""); setFilterFrom(""); setFilterTo(""); setSearch(""); }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Expense Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => handleSort("date")}>
                  Date <SortIcon col="date" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => handleSort("project")}>
                  Project <SortIcon col="project" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => handleSort("category")}>
                  Category <SortIcon col="category" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => handleSort("vendor")}>
                  Vendor <SortIcon col="vendor" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 cursor-pointer select-none" onClick={() => handleSort("amount")}>
                  Amount <SortIcon col="amount" />
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Receipt</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">QB Synced</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => openEdit(exp)}
                >
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{fmtDate(exp.date)}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{exp.project}</td>
                  <td className="px-4 py-3">
                    <Badge color={CATEGORY_COLORS[exp.category]}>{exp.category}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{exp.vendor}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[250px] truncate">{exp.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(exp.amount)}</td>
                  <td className="px-4 py-3 text-center">{receiptIcon(exp.receipt)}</td>
                  <td className="px-4 py-3 text-center">{qbIcon(exp.qbSynced)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(exp)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(exp.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td colSpan={5} className="px-4 py-3 font-bold text-gray-900">
                  Total ({filtered.length} expenses)
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(filteredTotal)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Per-Job Profit Summary */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setProfitOpen(!profitOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition"
        >
          <span className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Per-Job Profit Summary
          </span>
          {profitOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
        {profitOpen && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Project</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Contract</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Expenses</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Profit</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {JOB_PROFITS.map((jp) => {
                  const profit = jp.contract - jp.expenses;
                  const margin = Math.round((profit / jp.contract) * 100);
                  return (
                    <tr key={jp.project} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{jp.projectLabel}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(jp.contract)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(jp.expenses)}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: marginColor(margin) }}>
                        {fmt(profit)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge color={marginColor(margin)}>{margin}%</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-300">
                  <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {fmt(JOB_PROFITS.reduce((a, j) => a + j.contract, 0))}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    {fmt(JOB_PROFITS.reduce((a, j) => a + j.expenses, 0))}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {fmt(JOB_PROFITS.reduce((a, j) => a + (j.contract - j.expenses), 0))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge color="#10b981">
                      {Math.round(
                        (JOB_PROFITS.reduce((a, j) => a + (j.contract - j.expenses), 0) /
                          JOB_PROFITS.reduce((a, j) => a + j.contract, 0)) *
                          100
                      )}%
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Category Breakdown Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Expense Breakdown by Category</h3>
        <div className="space-y-3">
          {categoryBreakdown.map(({ category, amount, pct }) => (
            <div key={category} className="flex items-center gap-3">
              <div className="w-28 text-sm font-medium text-gray-700 shrink-0">{category}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: CATEGORY_COLORS[category],
                  }}
                />
              </div>
              <div className="w-20 text-right text-sm font-medium text-gray-900">{fmt(amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); }} title={editingId ? "Edit Expense" : "Add Expense"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SmartSelect
              value={form.project}
              onChange={(v) => setForm((f) => ({ ...f, project: v }))}
              options={projects}
              onAddNew={(v) => setProjects((p) => [...p, v])}
              placeholder="Select project..."
              label="Project"
              required
            />
            <SmartSelect
              value={form.category}
              onChange={(v) => setForm((f) => ({ ...f, category: v as ExpenseCategory }))}
              options={categories}
              onAddNew={(v) => setCategories((c) => [...c, v as ExpenseCategory])}
              placeholder="Select category..."
              label="Category"
              required
            />
          </div>
          <SmartSelect
            value={form.vendor}
            onChange={(v) => setForm((f) => ({ ...f, vendor: v }))}
            options={vendors}
            onAddNew={(v) => setVendors((vs) => [...vs, v])}
            placeholder="Select or add vendor..."
            label="Vendor"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              placeholder="What was purchased or what service was provided..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount || ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                className={inputCls}
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Upload</label>
            <FileUploadSim
              fileName={form.receiptFile}
              onUpload={(name) => setForm((f) => ({ ...f, receiptFile: name, receipt: "yes" }))}
              onClear={() => setForm((f) => ({ ...f, receiptFile: "", receipt: "none" }))}
              label="receipt"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.taxDeductible}
                onChange={(e) => setForm((f) => ({ ...f, taxDeductible: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Tax Deductible</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="Additional notes (optional)..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => { setModalOpen(false); setEditingId(null); }}>
              Cancel
            </Btn>
            {!editingId && (
              <Btn color="#10b981" variant="outline" onClick={() => handleSave(true)}>
                Save &amp; Add Another
              </Btn>
            )}
            <Btn color="#3b82f6" onClick={() => handleSave(false)}>
              {editingId ? "Update Expense" : "Save"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Expense">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <span className="flex items-center gap-1.5"><Trash2 className="w-4 h-4" /> Delete</span>
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
