import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Btn, Modal, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
// estimates from store, not static mock data
import { useProjectStore, STAGE_COLORS } from "./ProjectsPage";
import type { ProjectStage, Project } from "./ProjectsPage";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  FileText,
  CalendarDays,
  DollarSign,
  Hammer,
  ClipboardList,
  PenLine,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Camera,
  Trash2,
  ChevronRight,
  Plus,
} from "lucide-react";

/* ── Helpers ────────────────────────────────────────── */

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const fmtFull = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const today = () => new Date().toISOString().split("T")[0];

const ACTIVITY_ICONS: Record<string, typeof Clock> = {
  inspection: ClipboardList,
  estimate: FileText,
  call: Phone,
  note: MessageSquare,
  status: CheckCircle2,
  photo: Camera,
};

const ACTIVITY_COLORS: Record<string, string> = {
  inspection: "#8b5cf6",
  estimate: "#3b82f6",
  call: "#0ea5e9",
  note: "#6b7280",
  status: "#10b981",
  photo: "#f59e0b",
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

/* ── Component ─────────────────────────────────────── */

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);
  const estimates = useAppStore((s) => s.estimates);
  const [allProjects, updateProjects] = useProjectStore();

  const project = allProjects.find((p) => p.id === id);

  /* ── Modal state ── */
  const [showEdit, setShowEdit] = useState(false);
  const [showInspection, setShowInspection] = useState(false);
  const [showStageChange, setShowStageChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editForm, setEditForm] = useState({ customerName: "", address: "", phone: "", email: "", type: "", assignedRep: "" });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [inspectionForm, setInspectionForm] = useState({ date: "", time: "09:00", notes: "" });
  const [inspectionErrors, setInspectionErrors] = useState<Record<string, string>>({});
  const [newStage, setNewStage] = useState<ProjectStage>("Lead");
  const [noteText, setNoteText] = useState("");

  // helper to update this project in the store
  const updateProject = (updates: Partial<Project>) => {
    updateProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  if (!project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Project not found.</p>
        <Btn color="#3b82f6" className="mt-4" onClick={() => navigate("/crm/projects")}>
          Back to Projects
        </Btn>
      </div>
    );
  }

  /* ── Edit ── */
  const openEditModal = () => {
    setEditForm({
      customerName: project.customerName,
      address: project.address,
      phone: project.phone,
      email: project.email,
      type: project.type,
      assignedRep: project.assignedRep,
    });
    setEditErrors({});
    setShowEdit(true);
  };

  const handleSaveEdit = () => {
    const errors: Record<string, string> = {};
    if (!editForm.customerName.trim()) errors.customerName = "Required";
    if (!editForm.address.trim()) errors.address = "Required";
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    updateProject({
      customerName: editForm.customerName.trim(),
      address: editForm.address.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      type: editForm.type,
      assignedRep: editForm.assignedRep.trim(),
    });
    setShowEdit(false);
    addToast(`Project ${project.projectNumber} updated`, "success");
  };

  /* ── Create Estimate ── */
  const handleCreateEstimate = () => {
    navigate("/estimates");
    addToast(`Create a new estimate for ${project.customerName} (${project.projectNumber})`, "info");
  };

  /* ── Schedule Inspection ── */
  const openInspectionModal = () => {
    setInspectionForm({ date: "", time: "09:00", notes: "" });
    setInspectionErrors({});
    setShowInspection(true);
  };

  const handleScheduleInspection = () => {
    const errors: Record<string, string> = {};
    if (!inspectionForm.date) errors.date = "Date is required";
    setInspectionErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const activity = {
      id: `a${Date.now()}`,
      date: inspectionForm.date,
      type: "inspection" as const,
      title: `Inspection scheduled`,
      description: `Inspection scheduled for ${inspectionForm.date} at ${inspectionForm.time}.${inspectionForm.notes ? ` Notes: ${inspectionForm.notes}` : ""}`,
    };
    updateProject({
      activities: [activity, ...project.activities],
    });
    setShowInspection(false);
    addToast(`Inspection scheduled for ${project.customerName} on ${inspectionForm.date} at ${inspectionForm.time}`, "success");
  };

  /* ── Stage Change ── */
  const openStageModal = () => {
    setNewStage(project.stage);
    setShowStageChange(true);
  };

  const handleStageChange = () => {
    if (newStage === project.stage) {
      setShowStageChange(false);
      return;
    }
    const oldStage = project.stage;
    const activity = {
      id: `a${Date.now()}`,
      date: today(),
      type: "status" as const,
      title: `Stage changed to ${newStage}`,
      description: `Stage changed from ${oldStage} to ${newStage}.`,
    };
    updateProject({
      stage: newStage,
      activities: [activity, ...project.activities],
    });
    setShowStageChange(false);
    addToast(`Stage changed to ${newStage}`, "success");
  };

  /* ── Delete ── */
  const handleDeleteProject = () => {
    updateProjects((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(false);
    addToast(`Project ${project.projectNumber} deleted`, "success");
    navigate("/crm/projects");
  };

  /* ── Add Note ── */
  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const activity = {
      id: `a${Date.now()}`,
      date: today(),
      type: "note" as const,
      title: "Note added",
      description: noteText.trim(),
    };
    updateProject({
      notes: [...project.notes, noteText.trim()],
      activities: [activity, ...project.activities],
    });
    setNoteText("");
    setShowAddNote(false);
    addToast("Note added", "success");
  };

  const linkedEstimates = estimates.filter((e) => e.project === project.projectNumber);
  const activities = project.activities ?? [];

  const estimatedCost = project.quoteAmount * 0.62;
  const profit = project.quoteAmount - estimatedCost;
  const margin = project.quoteAmount > 0 ? (profit / project.quoteAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/crm/projects")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{project.projectNumber}</h1>
            <button onClick={openStageModal} className="group flex items-center gap-1" title="Change stage">
              <Badge color={STAGE_COLORS[project.stage]}>{project.stage}</Badge>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition" />
            </button>
          </div>
          <p className="text-sm text-gray-500">{project.type}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Btn color="#3b82f6" size="sm" onClick={openEditModal}>
          <PenLine className="w-3.5 h-3.5 mr-1 inline" />
          Edit
        </Btn>
        <Btn color="#10b981" size="sm" onClick={handleCreateEstimate}>
          <FileText className="w-3.5 h-3.5 mr-1 inline" />
          Create Estimate
        </Btn>
        <Btn color="#8b5cf6" size="sm" variant="outline" onClick={openInspectionModal}>
          <CalendarDays className="w-3.5 h-3.5 mr-1 inline" />
          Schedule Inspection
        </Btn>
        <Btn color="#6b7280" size="sm" variant="outline" onClick={() => setShowAddNote(true)}>
          <Plus className="w-3.5 h-3.5 mr-1 inline" />
          Add Note
        </Btn>
        <Btn color="#ef4444" size="sm" variant="outline" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 className="w-3.5 h-3.5 mr-1 inline" />
          Delete
        </Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            Customer Information
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-gray-900">{project.customerName}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-600">{project.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-600">{project.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-600">{project.email || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Insurance Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            Insurance Information
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Company</span>
              <span className="font-medium text-gray-900">{project.insurance.company}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Claim #</span>
              <span className="font-mono text-gray-900">
                {project.insurance.claim || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Deductible</span>
              <span className="font-medium text-gray-900">
                {project.insurance.deductible > 0
                  ? fmt(project.insurance.deductible)
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Hammer className="w-4 h-4 text-amber-500" />
            Project Details
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium text-gray-900">{project.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Assigned Rep</span>
              <span className="font-medium text-gray-900">{project.assignedRep}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date Created</span>
              <span className="text-gray-900">{project.dateCreated}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Project Number</span>
              <span className="font-mono text-gray-900">{project.projectNumber}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            Financial Summary
          </h2>
          {project.quoteAmount > 0 ? (
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Quote Amount</span>
                <span className="font-bold text-gray-900">{fmtFull(project.quoteAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Costs</span>
                <span className="text-gray-900">{fmtFull(estimatedCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Profit</span>
                <span className="font-semibold text-green-600">{fmtFull(profit)}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-gray-500">Profit Margin</span>
                <Badge color={margin >= 30 ? "#22c55e" : "#f59e0b"}>{margin.toFixed(1)}%</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No quote created yet.</p>
          )}
        </div>
      </div>

      {/* Linked Estimates */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          Linked Estimates
        </h2>
        {linkedEstimates.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No estimates linked to this project.</p>
        ) : (
          <div className="space-y-2">
            {linkedEstimates.map((e) => (
              <div
                key={e.id}
                onClick={() => navigate(`/estimates/${e.id}`)}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
              >
                <div>
                  <span className="font-mono text-sm font-medium text-gray-900">{e.id}</span>
                  <span className="text-xs text-gray-400 ml-2">v{e.version}</span>
                  <div className="text-xs text-gray-500 mt-0.5">{e.dateCreated}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    color={
                      e.status === "approved"
                        ? "#22c55e"
                        : e.status === "pending"
                          ? "#f59e0b"
                          : "#6b7280"
                    }
                  >
                    {e.status}
                  </Badge>
                  {e.totalRCV > 0 && (
                    <span className="font-semibold text-sm text-gray-900">
                      {fmtFull(e.totalRCV)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {project.notes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            Notes
          </h2>
          <div className="space-y-2">
            {project.notes.map((note, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                {note}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          Activity Timeline
        </h2>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No activity recorded yet.</p>
        ) : (
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />
            <div className="space-y-4">
              {activities.map((a) => {
                const Icon = ACTIVITY_ICONS[a.type] ?? MessageSquare;
                const color = ACTIVITY_COLORS[a.type] ?? "#6b7280";
                return (
                  <div key={a.id} className="flex gap-3 relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10"
                      style={{ background: color + "18", border: `2px solid ${color}` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900">{a.title}</span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{a.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title={`Edit ${project.projectNumber}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input value={editForm.customerName} onChange={(e) => { setEditForm({ ...editForm, customerName: e.target.value }); if (editErrors.customerName) setEditErrors((prev) => { const n = { ...prev }; delete n.customerName; return n; }); }}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${editErrors.customerName ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`} />
            {editErrors.customerName && <p className="text-xs text-red-500 mt-1">{editErrors.customerName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input value={editForm.address} onChange={(e) => { setEditForm({ ...editForm, address: e.target.value }); if (editErrors.address) setEditErrors((prev) => { const n = { ...prev }; delete n.address; return n; }); }}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${editErrors.address ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`} />
            {editErrors.address && <p className="text-xs text-red-500 mt-1">{editErrors.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
            <input value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Rep</label>
            <input value={editForm.assignedRep} onChange={(e) => setEditForm({ ...editForm, assignedRep: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleSaveEdit}>Save Changes</Btn>
          </div>
        </div>
      </Modal>

      {/* Schedule Inspection Modal */}
      <Modal open={showInspection} onClose={() => setShowInspection(false)} title="Schedule Inspection">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" value={inspectionForm.date} onChange={(e) => { setInspectionForm({ ...inspectionForm, date: e.target.value }); if (inspectionErrors.date) setInspectionErrors({}); }}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${inspectionErrors.date ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`} />
            {inspectionErrors.date && <p className="text-xs text-red-500 mt-1">{inspectionErrors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input type="time" value={inspectionForm.time} onChange={(e) => setInspectionForm({ ...inspectionForm, time: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={inspectionForm.notes} onChange={(e) => setInspectionForm({ ...inspectionForm, notes: e.target.value })}
              rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Any special instructions..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowInspection(false)}>Cancel</Btn>
            <Btn color="#8b5cf6" onClick={handleScheduleInspection}>Schedule</Btn>
          </div>
        </div>
      </Modal>

      {/* Change Stage Modal */}
      <Modal open={showStageChange} onClose={() => setShowStageChange(false)} title="Change Project Stage">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Current stage: <Badge color={STAGE_COLORS[project.stage]}>{project.stage}</Badge>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setNewStage(stage)}
                className={`px-3 py-2.5 text-sm rounded-lg font-medium transition border-2 text-left ${
                  newStage === stage
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                  style={{ background: STAGE_COLORS[stage] }}
                />
                {stage}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowStageChange(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleStageChange}>
              {newStage === project.stage ? "No Change" : `Move to ${newStage}`}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Project">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete project{" "}
            <span className="font-semibold text-gray-900">{project.projectNumber}</span> for{" "}
            <span className="font-semibold text-gray-900">{project.customerName}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={handleDeleteProject}>Delete</Btn>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal open={showAddNote} onClose={() => setShowAddNote(false)} title="Add Note">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Enter your note..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => { setShowAddNote(false); setNoteText(""); }}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleAddNote} disabled={!noteText.trim()}>Add Note</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
