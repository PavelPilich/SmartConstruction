import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, StatCard, Modal, SmartSelect } from "../../components/ui";
import {
  FileText, Search, Plus, Lock, Clock, Send, Edit3, AlertTriangle,
  Eye, MoreVertical, Copy, Trash2, Filter,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export interface ContractData {
  id: string;
  title: string;
  template: string;
  customerName: string;
  projectNumber: string;
  status: "draft" | "sent" | "viewed" | "signed" | "expired";
  version: number;
  createdDate: string;
  lastModified: string;
  signedDate: string | null;
  address: string;
  totalPrice: number;
  insuranceClaim: boolean;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
export const MOCK_CONTRACTS: ContractData[] = [
  {
    id: "CTR-2026-001", title: "Roof Replacement Agreement — Thompson", template: "Standard Roof Replacement",
    customerName: "James Thompson", projectNumber: "PRJ-4021", status: "signed", version: 2,
    createdDate: "2026-02-20", lastModified: "2026-03-14", signedDate: "2026-03-15",
    address: "1482 Summit Ave, Saint Paul, MN 55105", totalPrice: 18750, insuranceClaim: true,
  },
  {
    id: "CTR-2026-002", title: "Siding Repair Contract — Garcia", template: "Siding Repair Agreement",
    customerName: "Maria Garcia", projectNumber: "PRJ-4035", status: "signed", version: 1,
    createdDate: "2026-02-28", lastModified: "2026-03-05", signedDate: "2026-03-06",
    address: "923 Randolph Ave, Saint Paul, MN 55102", totalPrice: 8420, insuranceClaim: false,
  },
  {
    id: "CTR-2026-003", title: "Full Exterior Restoration — Davis", template: "Full Exterior Restoration",
    customerName: "Robert Davis", projectNumber: "PRJ-4042", status: "sent", version: 3,
    createdDate: "2026-03-01", lastModified: "2026-03-22", signedDate: null,
    address: "5501 Nicollet Ave, Minneapolis, MN 55419", totalPrice: 34200, insuranceClaim: true,
  },
  {
    id: "CTR-2026-004", title: "Window Replacement Agreement — Anderson", template: "Custom Template",
    customerName: "Lisa Anderson", projectNumber: "PRJ-4048", status: "draft", version: 1,
    createdDate: "2026-03-18", lastModified: "2026-03-18", signedDate: null,
    address: "2200 Hennepin Ave, Minneapolis, MN 55405", totalPrice: 12600, insuranceClaim: false,
  },
  {
    id: "CTR-2026-005", title: "Emergency Repair Authorization — Park", template: "Emergency Repair Authorization",
    customerName: "David Park", projectNumber: "PRJ-4050", status: "signed", version: 1,
    createdDate: "2026-03-10", lastModified: "2026-03-10", signedDate: "2026-03-10",
    address: "745 Grand Ave, Saint Paul, MN 55105", totalPrice: 3200, insuranceClaim: true,
  },
  {
    id: "CTR-2026-006", title: "Gutter Installation Contract — Swenson", template: "Standard Roof Replacement",
    customerName: "Karen Swenson", projectNumber: "PRJ-4055", status: "sent", version: 1,
    createdDate: "2026-03-20", lastModified: "2026-03-20", signedDate: null,
    address: "1100 Marshall Ave, Saint Paul, MN 55104", totalPrice: 4850, insuranceClaim: false,
  },
  {
    id: "CTR-2026-007", title: "Insurance Supplement Agreement — Chen", template: "Insurance Supplement Agreement",
    customerName: "Wei Chen", projectNumber: "PRJ-4021", status: "draft", version: 2,
    createdDate: "2026-03-15", lastModified: "2026-03-25", signedDate: null,
    address: "1482 Summit Ave, Saint Paul, MN 55105", totalPrice: 6340, insuranceClaim: true,
  },
  {
    id: "CTR-2026-008", title: "Metal Barn Restoration — Erickson", template: "Full Exterior Restoration",
    customerName: "Tom Erickson", projectNumber: "PRJ-3998", status: "expired", version: 1,
    createdDate: "2026-01-10", lastModified: "2026-01-10", signedDate: null,
    address: "8820 County Rd 24, Lakeville, MN 55044", totalPrice: 45000, insuranceClaim: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const STATUS_MAP: Record<ContractData["status"], { label: string; color: string }> = {
  draft: { label: "Draft", color: "#6b7280" },
  sent: { label: "Sent", color: "#3b82f6" },
  viewed: { label: "Viewed", color: "#f59e0b" },
  signed: { label: "Signed", color: "#22c55e" },
  expired: { label: "Expired", color: "#ef4444" },
};

const money = (n: number) => "$" + n.toLocaleString("en-US");

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractData[]>(MOCK_CONTRACTS);
  const [searchQ, setSearchQ] = useState("");
  const [tab, setTab] = useState<"all" | ContractData["status"]>("all");
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", customer: "", project: "", template: "Standard Roof Replacement" });
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const templates = [
    "Standard Roof Replacement", "Siding Repair Agreement", "Full Exterior Restoration",
    "Emergency Repair Authorization", "Insurance Supplement Agreement", "Custom Template",
  ];

  const filtered = contracts.filter((c) => {
    if (tab !== "all" && c.status !== tab) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.projectNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    total: contracts.length,
    draft: contracts.filter((c) => c.status === "draft").length,
    sent: contracts.filter((c) => c.status === "sent" || c.status === "viewed").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    expired: contracts.filter((c) => c.status === "expired").length,
  };

  const handleCreate = () => {
    if (!newForm.title || !newForm.customer) return;
    const id = `CTR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const now = new Date().toISOString().split("T")[0];
    const fresh: ContractData = {
      id, title: newForm.title, template: newForm.template, customerName: newForm.customer,
      projectNumber: newForm.project || "PRJ-NEW", status: "draft", version: 1,
      createdDate: now, lastModified: now, signedDate: null,
      address: "", totalPrice: 0, insuranceClaim: false,
    };
    setContracts([fresh, ...contracts]);
    setShowNew(false);
    setNewForm({ title: "", customer: "", project: "", template: "Standard Roof Replacement" });
    navigate(`/contracts/${id}`);
  };

  const handleDuplicate = (c: ContractData) => {
    const id = `CTR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const now = new Date().toISOString().split("T")[0];
    setContracts([{ ...c, id, status: "draft", version: 1, createdDate: now, lastModified: now, signedDate: null, title: c.title + " (Copy)" }, ...contracts]);
    setMenuOpen(null);
  };

  const handleDelete = (id: string) => {
    setContracts(contracts.filter((c) => c.id !== id));
    setMenuOpen(null);
  };

  const tabs: { key: "all" | ContractData["status"]; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.total },
    { key: "draft", label: "Draft", count: counts.draft },
    { key: "sent", label: "Sent", count: counts.sent },
    { key: "signed", label: "Signed", count: counts.signed },
    { key: "expired", label: "Expired", count: counts.expired },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-Contracts & Signatures</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage contracts, templates, and electronic signatures</p>
        </div>
        <Btn color="#3b82f6" onClick={() => setShowNew(true)}>
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> New Contract</span>
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <StatCard icon={FileText} label="Total Contracts" value={counts.total} color="#3b82f6" />
        <StatCard icon={Edit3} label="Drafts" value={counts.draft} color="#6b7280" />
        <StatCard icon={Send} label="Sent for Signing" value={counts.sent} color="#3b82f6" />
        <StatCard icon={Lock} label="Signed (Locked)" value={counts.signed} color="#22c55e" />
        <StatCard icon={AlertTriangle} label="Expired" value={counts.expired} color="#ef4444" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label} <span className="text-gray-400 ml-1">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search contracts..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      {/* Contract cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No contracts found</p>
          </div>
        )}
        {filtered.map((c) => {
          const s = STATUS_MAP[c.status];
          return (
            <div
              key={c.id}
              onClick={() => navigate(`/contracts/${c.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{c.title}</h3>
                    {c.status === "signed" && <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <Badge color={s.color}>{s.label}</Badge>
                    <Badge color="#6366f1" sm>{c.template}</Badge>
                    <span>v{c.version}</span>
                    <span className="text-gray-300">|</span>
                    <span>{c.customerName}</span>
                    <span className="text-gray-300">|</span>
                    <span>{c.projectNumber}</span>
                    <span className="text-gray-300">|</span>
                    <span>{money(c.totalPrice)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>Created: {c.createdDate}</span>
                    <span>Modified: {c.lastModified}</span>
                    {c.signedDate && <span className="text-green-600 font-medium">Signed: {c.signedDate}</span>}
                    {c.status === "signed" && (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative flex-shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  {menuOpen === c.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 w-40">
                      <button onClick={() => { navigate(`/contracts/${c.id}`); setMenuOpen(null); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button onClick={() => handleDuplicate(c)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                      </button>
                      {c.status === "draft" && (
                        <button onClick={() => handleDelete(c.id)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Contract Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Create New Contract">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title *</label>
            <input
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              placeholder="e.g. Roof Replacement Agreement — Smith"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input
              value={newForm.customer}
              onChange={(e) => setNewForm({ ...newForm, customer: e.target.value })}
              placeholder="Full name"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Number</label>
            <input
              value={newForm.project}
              onChange={(e) => setNewForm({ ...newForm, project: e.target.value })}
              placeholder="PRJ-XXXX"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <SmartSelect
            label="Template"
            value={newForm.template}
            onChange={(v) => setNewForm({ ...newForm, template: v })}
            options={templates}
            placeholder="Select template..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" color="#6b7280" onClick={() => setShowNew(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleCreate}>Create Contract</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
