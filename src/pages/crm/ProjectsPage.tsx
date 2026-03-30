import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, StatCard, Modal, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import {
  FolderKanban,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Trash2,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

export type ProjectStage =
  | "Lead"
  | "Contacted"
  | "Inspected"
  | "Quoted"
  | "Signed"
  | "In Progress"
  | "Complete";

export type Project = {
  id: string;
  projectNumber: string;
  customerName: string;
  address: string;
  type: string;
  stage: ProjectStage;
  assignedRep: string;
  quoteAmount: number;
  insurance: { company: string; claim: string; deductible: number };
  phone: string;
  email: string;
  dateCreated: string;
  notes: string[];
  activities: {
    id: string;
    date: string;
    type: "inspection" | "estimate" | "call" | "note" | "status" | "photo";
    title: string;
    description: string;
  }[];
};

/* ── Stage colors ──────────────────────────────────── */

export const STAGE_COLORS: Record<ProjectStage, string> = {
  Lead: "#6b7280",
  Contacted: "#3b82f6",
  Inspected: "#8b5cf6",
  Quoted: "#f59e0b",
  Signed: "#10b981",
  "In Progress": "#0ea5e9",
  Complete: "#22c55e",
};

const ALL_STAGES: ProjectStage[] = [
  "Lead",
  "Contacted",
  "Inspected",
  "Quoted",
  "Signed",
  "In Progress",
  "Complete",
];

/* ── Initial data ─────────────────────────────────── */

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    projectNumber: "MN-0247",
    customerName: "James Wilson",
    address: "4821 Maple Dr, Plymouth, MN 55441",
    type: "Roof Replacement",
    stage: "In Progress",
    assignedRep: "Mike Thompson",
    quoteAmount: 28742.5,
    insurance: { company: "State Farm", claim: "CLM-78432", deductible: 1000 },
    phone: "(763) 555-0142",
    email: "jwilson@email.com",
    dateCreated: "2026-02-18",
    notes: [],
    activities: [
      { id: "a1", date: "2026-03-28", type: "status", title: "Stage changed to In Progress", description: "Materials delivered. Crew scheduled for Monday." },
      { id: "a2", date: "2026-03-20", type: "estimate", title: "Estimate approved", description: "XE-2026-0247 approved by State Farm adjuster Tom Bradley." },
      { id: "a3", date: "2026-03-12", type: "call", title: "Customer call", description: "Confirmed shingle color selection: Onyx Black." },
      { id: "a4", date: "2026-03-05", type: "inspection", title: "Inspection completed", description: "Hail damage confirmed on south and west facing slopes. 24.5 SQ affected." },
      { id: "a5", date: "2026-02-28", type: "photo", title: "Photos uploaded", description: "32 photos uploaded from initial property assessment." },
      { id: "a6", date: "2026-02-18", type: "note", title: "Lead created", description: "Homeowner called regarding storm damage from 2/14 hail event." },
    ],
  },
  {
    id: "p2",
    projectNumber: "MN-0089",
    customerName: "Mary Johnson",
    address: "612 Oak Ave, Maple Grove, MN 55369",
    type: "Siding & Windows",
    stage: "Quoted",
    assignedRep: "Sarah Davis",
    quoteAmount: 18450.0,
    insurance: { company: "State Farm", claim: "CLM-45291", deductible: 1000 },
    phone: "(763) 555-0298",
    email: "mjohnson@email.com",
    dateCreated: "2026-03-02",
    notes: [],
    activities: [
      { id: "a7", date: "2026-03-16", type: "estimate", title: "Estimate created", description: "XE-2026-0089 submitted to State Farm for review." },
      { id: "a8", date: "2026-03-10", type: "inspection", title: "Inspection completed", description: "Siding and window damage documented on all elevations." },
      { id: "a9", date: "2026-03-04", type: "call", title: "Customer contacted", description: "Scheduled inspection for 3/10." },
      { id: "a10", date: "2026-03-02", type: "note", title: "Lead created", description: "Referral from James Wilson." },
    ],
  },
  {
    id: "p3",
    projectNumber: "MN-0156",
    customerName: "Robert Chen",
    address: "7234 Cedar Ln, Maple Grove, MN 55369",
    type: "Full Exterior",
    stage: "Inspected",
    assignedRep: "Mike Thompson",
    quoteAmount: 0,
    insurance: { company: "Allstate", claim: "ALT-92471", deductible: 1500 },
    phone: "(612) 555-0177",
    email: "rchen@email.com",
    dateCreated: "2026-03-10",
    notes: [],
    activities: [],
  },
  {
    id: "p4",
    projectNumber: "MN-0312",
    customerName: "Lisa Andersen",
    address: "1590 Birch St, Edina, MN 55424",
    type: "Roof Replacement",
    stage: "Complete",
    assignedRep: "Sarah Davis",
    quoteAmount: 22100.0,
    insurance: { company: "Travelers", claim: "TRV-33102", deductible: 2000 },
    phone: "(952) 555-0364",
    email: "landersen@email.com",
    dateCreated: "2026-01-15",
    notes: [],
    activities: [],
  },
  {
    id: "p5",
    projectNumber: "MN-0388",
    customerName: "David Nguyen",
    address: "903 Elm Ct, Bloomington, MN 55431",
    type: "Windows",
    stage: "Lead",
    assignedRep: "Mike Thompson",
    quoteAmount: 0,
    insurance: { company: "USAA", claim: "", deductible: 0 },
    phone: "(952) 555-0511",
    email: "dnguyen@email.com",
    dateCreated: "2026-03-22",
    notes: [],
    activities: [],
  },
  {
    id: "p6",
    projectNumber: "MN-0401",
    customerName: "Karen Olson",
    address: "2475 Lakeview Blvd, Minnetonka, MN 55345",
    type: "Siding",
    stage: "Contacted",
    assignedRep: "Sarah Davis",
    quoteAmount: 0,
    insurance: { company: "American Family", claim: "AF-60814", deductible: 1000 },
    phone: "(952) 555-0623",
    email: "kolson@email.com",
    dateCreated: "2026-03-18",
    notes: [],
    activities: [],
  },
  {
    id: "p7",
    projectNumber: "MN-0419",
    customerName: "Tom Erickson",
    address: "830 Summit Ave, St. Paul, MN 55105",
    type: "Full Exterior",
    stage: "Signed",
    assignedRep: "Mike Thompson",
    quoteAmount: 47250.0,
    insurance: { company: "State Farm", claim: "CLM-88210", deductible: 1000 },
    phone: "(651) 555-0789",
    email: "terickson@email.com",
    dateCreated: "2026-03-05",
    notes: [],
    activities: [],
  },
  {
    id: "p8",
    projectNumber: "MN-0435",
    customerName: "Jennifer Park",
    address: "1122 Ridgeway Dr, Woodbury, MN 55125",
    type: "Roof Replacement",
    stage: "Lead",
    assignedRep: "Sarah Davis",
    quoteAmount: 0,
    insurance: { company: "Liberty Mutual", claim: "", deductible: 0 },
    phone: "(651) 555-0945",
    email: "jpark@email.com",
    dateCreated: "2026-03-25",
    notes: [],
    activities: [],
  },
  {
    id: "p9",
    projectNumber: "MN-0452",
    customerName: "Brian Murphy",
    address: "5600 France Ave S, Edina, MN 55410",
    type: "Siding & Windows",
    stage: "Complete",
    assignedRep: "Mike Thompson",
    quoteAmount: 34800.0,
    insurance: { company: "Allstate", claim: "ALT-71093", deductible: 1500 },
    phone: "(612) 555-1102",
    email: "bmurphy@email.com",
    dateCreated: "2025-12-10",
    notes: [],
    activities: [],
  },
  {
    id: "p10",
    projectNumber: "MN-0470",
    customerName: "Amanda Swenson",
    address: "340 River Rd, Eagan, MN 55121",
    type: "Roof Replacement",
    stage: "Quoted",
    assignedRep: "Sarah Davis",
    quoteAmount: 19500.0,
    insurance: { company: "Travelers", claim: "TRV-44820", deductible: 1000 },
    phone: "(651) 555-1247",
    email: "aswenson@email.com",
    dateCreated: "2026-03-12",
    notes: [],
    activities: [],
  },
];

/* ── Shared project store (module-level for cross-page reactivity) ── */

type Listener = () => void;
const listeners = new Set<Listener>();
let _projects: Project[] = [...INITIAL_PROJECTS];

export function getProjects(): Project[] {
  return _projects;
}

export function setProjects(updater: (prev: Project[]) => Project[]) {
  _projects = updater(_projects);
  listeners.forEach((l) => l());
}

export function useProjects(): [Project[], (updater: (prev: Project[]) => Project[]) => void] {
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);
  // subscribe
  useState(() => {
    listeners.add(rerender);
    return () => listeners.delete(rerender);
  });
  // also add via useEffect-like pattern for cleanup
  // We use a simpler approach: just subscribe in render and unsub below
  return [_projects, setProjects];
}

// Hook to subscribe to project store changes
import { useEffect } from "react";

export function useProjectStore(): [Project[], (updater: (prev: Project[]) => Project[]) => void] {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    listeners.add(rerender);
    return () => { listeners.delete(rerender); };
  }, []);

  return [_projects, setProjects];
}

/* ── Helpers ────────────────────────────────────────── */

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/* ── Component ─────────────────────────────────────── */

const DEFAULT_PROJECT_TYPES = ["Roof Replacement", "Siding", "Windows", "Siding & Windows", "Full Exterior", "Interior"];

const EMPTY_FORM = {
  customerName: "",
  address: "",
  phone: "",
  email: "",
  type: "Roof Replacement",
  insurance: "",
  assignedRep: "",
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);
  const [activeStage, setActiveStage] = useState<"All" | ProjectStage>("All");
  const [search, setSearch] = useState("");
  const [allProjects, updateProjects] = useProjectStore();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [projectTypes, setProjectTypes] = useState(DEFAULT_PROJECT_TYPES);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.customerName.trim()) errors.customerName = "Customer name is required";
    if (!form.address.trim()) errors.address = "Address is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = () => {
    if (!validateForm()) return;
    const num = `MN-${String(allProjects.length + 500).padStart(4, "0")}`;
    const newProject: Project = {
      id: `p${Date.now()}`,
      projectNumber: num,
      customerName: form.customerName.trim(),
      address: form.address.trim(),
      type: form.type,
      stage: "Lead",
      assignedRep: form.assignedRep.trim() || "Unassigned",
      quoteAmount: 0,
      insurance: { company: form.insurance.trim() || "N/A", claim: "", deductible: 0 },
      phone: form.phone.trim(),
      email: form.email.trim(),
      dateCreated: new Date().toISOString().split("T")[0],
      notes: [],
      activities: [
        {
          id: `a${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          type: "note",
          title: "Lead created",
          description: `Project created for ${form.customerName.trim()}.`,
        },
      ],
    };
    updateProjects((prev) => [...prev, newProject]);
    setShowNewModal(false);
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    addToast(`Project ${num} created for ${form.customerName}`, "success");
  };

  const handleDeleteProject = (projectId: string) => {
    const proj = allProjects.find((p) => p.id === projectId);
    updateProjects((prev) => prev.filter((p) => p.id !== projectId));
    setShowDeleteConfirm(null);
    addToast(`Project ${proj?.projectNumber ?? ""} deleted`, "success");
  };

  const filtered = useMemo(() => {
    let list = allProjects;
    if (activeStage !== "All") list = list.filter((p) => p.stage === activeStage);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.customerName.toLowerCase().includes(q) ||
          p.projectNumber.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeStage, search, allProjects]);

  const totalPipeline = allProjects
    .filter((p) => p.stage !== "Complete")
    .reduce((s, p) => s + p.quoteAmount, 0);
  const activeCount = allProjects.filter(
    (p) => !["Complete", "Lead"].includes(p.stage)
  ).length;
  const completeCount = allProjects.filter((p) => p.stage === "Complete").length;

  const deleteProject = allProjects.find((p) => p.id === showDeleteConfirm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your construction projects pipeline
          </p>
        </div>
        <Btn color="#3b82f6" onClick={() => { setShowNewModal(true); setFormErrors({}); }}>
          <Plus className="w-4 h-4 mr-1.5 inline" />
          New Project
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={allProjects.length} color="#6366f1" />
        <StatCard icon={Clock} label="Active" value={activeCount} color="#0ea5e9" />
        <StatCard icon={CheckCircle2} label="Completed" value={completeCount} color="#22c55e" />
        <StatCard
          icon={TrendingUp}
          label="Pipeline Value"
          value={fmt(totalPipeline)}
          color="#f59e0b"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveStage("All")}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
              activeStage === "All"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({allProjects.length})
          </button>
          {ALL_STAGES.map((s) => {
            const count = allProjects.filter((p) => p.stage === s).length;
            return (
              <button
                key={s}
                onClick={() => setActiveStage(s)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
                  activeStage === s
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={activeStage === s ? { background: STAGE_COLORS[s] } : undefined}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No projects found.</div>
        )}
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/crm/projects/${p.id}`)}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              {/* Left */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">{p.projectNumber}</span>
                  <Badge color={STAGE_COLORS[p.stage]}>{p.stage}</Badge>
                  <Badge color="#6366f1" sm>
                    {p.type}
                  </Badge>
                </div>
                <div className="font-semibold text-gray-900">{p.customerName}</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {p.address}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {p.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {p.email}
                  </span>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-row sm:flex-col items-end gap-2 shrink-0">
                {p.quoteAmount > 0 && (
                  <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    {fmt(p.quoteAmount)}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Shield className="w-3.5 h-3.5" />
                  {p.insurance.company}
                </div>
                <div className="text-xs text-gray-400">Rep: {p.assignedRep}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(p.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition text-gray-300 hover:text-red-500"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="New Project">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input value={form.customerName} onChange={(e) => { setForm({ ...form, customerName: e.target.value }); if (formErrors.customerName) setFormErrors((prev) => { const n = { ...prev }; delete n.customerName; return n; }); }}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${formErrors.customerName ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`} placeholder="Full name" />
            {formErrors.customerName && <p className="text-xs text-red-500 mt-1">{formErrors.customerName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input value={form.address} onChange={(e) => { setForm({ ...form, address: e.target.value }); if (formErrors.address) setFormErrors((prev) => { const n = { ...prev }; delete n.address; return n; }); }}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${formErrors.address ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`} placeholder="Street address" />
            {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <SmartSelect
              label="Project Type"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={projectTypes}
              onAddNew={(v) => setProjectTypes((prev) => [...prev, v])}
              placeholder="Select project type..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company</label>
            <input value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. State Farm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Rep</label>
            <input value={form.assignedRep} onChange={(e) => setForm({ ...form, assignedRep: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Rep name" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => { setShowNewModal(false); setFormErrors({}); }}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleCreateProject}>Create Project</Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteConfirm !== null} onClose={() => setShowDeleteConfirm(null)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete project{" "}
            <span className="font-semibold text-gray-900">{deleteProject?.projectNumber}</span> for{" "}
            <span className="font-semibold text-gray-900">{deleteProject?.customerName}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={() => showDeleteConfirm && handleDeleteProject(showDeleteConfirm)}>Delete</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
