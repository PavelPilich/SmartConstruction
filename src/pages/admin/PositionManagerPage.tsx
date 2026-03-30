import { useState } from "react";
import { Briefcase, FileText, Plus, Edit3, Trash2, X } from "lucide-react";
import { Badge, Btn, StatCard, Modal, SmartSelect } from "../../components/ui";
import { useRegistrationStore } from "../../stores/useRegistrationStore";
import type { PositionType } from "../../types/registration";

const PREDEFINED_COLORS = [
  "#ef4444", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

const DEFAULT_FORM_OPTIONS = [
  "W-9 Form",
  "General Liability Insurance",
  "Workers Compensation Insurance",
  "State Contractor Registration",
  "Certificate of Insurance (COI)",
  "Non-Compete Agreement",
  "Sales License",
  "PMP Certification",
  "Background Check",
  "I-9 Employment Eligibility",
];

const EMPTY_FORM = { name: "", color: "#3b82f6", requiredForms: [] as string[] };

export default function PositionManagerPage() {
  const { positions, addPosition, updatePosition, removePosition } = useRegistrationStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; color: string; requiredForms: string[] }>({ ...EMPTY_FORM });
  const [newFormInput, setNewFormInput] = useState("");

  const totalForms = positions.reduce((acc, p) => acc + p.requiredForms.length, 0);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (pos: PositionType) => {
    setEditingId(pos.id);
    setForm({ name: pos.name, color: pos.color, requiredForms: [...pos.requiredForms] });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updatePosition(editingId, { name: form.name.trim(), color: form.color, requiredForms: form.requiredForms });
    } else {
      const newPos: PositionType = {
        id: `pos-${Date.now()}`,
        name: form.name.trim(),
        color: form.color,
        requiredForms: form.requiredForms,
        isDefault: false,
      };
      addPosition(newPos);
    }
    setModalOpen(false);
  };

  const addFormToList = (formName: string) => {
    if (formName && !form.requiredForms.includes(formName)) {
      setForm((f) => ({ ...f, requiredForms: [...f.requiredForms, formName] }));
    }
  };

  const removeFormFromList = (formName: string) => {
    setForm((f) => ({ ...f, requiredForms: f.requiredForms.filter((fn) => fn !== formName) }));
  };

  const handleAddCustomForm = () => {
    const trimmed = newFormInput.trim();
    if (trimmed && !form.requiredForms.includes(trimmed)) {
      setForm((f) => ({ ...f, requiredForms: [...f.requiredForms, trimmed] }));
      setNewFormInput("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Position Manager</h1>
        <Btn color="#3b82f6" onClick={openAdd}>
          <Plus className="w-4 h-4 inline mr-1" />Add Position
        </Btn>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Briefcase} label="Total Positions" value={positions.length} color="#3b82f6" />
        <StatCard icon={FileText} label="Total Forms Required" value={totalForms} color="#f59e0b" />
      </div>

      {/* Positions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map((pos) => (
          <div key={pos.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <Badge color={pos.color}>{pos.name}</Badge>
              <div className="flex gap-1">
                {pos.isDefault && <Badge color="#94a3b8" sm>Default</Badge>}
              </div>
            </div>
            <div className="mb-3">
              <span className="text-xs font-medium text-gray-500">Required Forms ({pos.requiredForms.length})</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {pos.requiredForms.length === 0 && (
                  <span className="text-xs text-gray-400 italic">No forms required</span>
                )}
                {pos.requiredForms.map((f) => (
                  <span key={f} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end border-t border-gray-100 pt-3">
              <Btn size="sm" variant="outline" color="#3b82f6" onClick={() => openEdit(pos)}>
                <Edit3 className="w-3.5 h-3.5 inline mr-1" />Edit
              </Btn>
              {!pos.isDefault && (
                <Btn size="sm" variant="outline" color="#ef4444" onClick={() => removePosition(pos.id)}>
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />Delete
                </Btn>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Position" : "Add Position"}>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position Name <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Subcontractor"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full border-2 transition"
                  style={{ background: c, borderColor: form.color === c ? "#1e293b" : "transparent" }}
                />
              ))}
            </div>
          </div>

          {/* Required Forms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Forms</label>
            <SmartSelect
              value=""
              onChange={addFormToList}
              options={DEFAULT_FORM_OPTIONS.filter((f) => !form.requiredForms.includes(f))}
              placeholder="Add a form..."
            />
            <div className="flex gap-1 mt-2">
              <input
                value={newFormInput}
                onChange={(e) => setNewFormInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomForm(); } }}
                placeholder="Or type custom form name..."
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <Btn size="sm" onClick={handleAddCustomForm}>Add</Btn>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {form.requiredForms.map((f) => (
                <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {f}
                  <button type="button" onClick={() => removeFormFromList(f)} className="hover:text-red-500 transition">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Btn variant="outline" color="#94a3b8" onClick={() => setModalOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleSave} disabled={!form.name.trim()}>
              {editingId ? "Update Position" : "Create Position"}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
