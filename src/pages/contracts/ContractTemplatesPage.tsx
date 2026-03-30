import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, Modal, FileUploadSim } from "../../components/ui";
import {
  FileText, Plus, Edit3, Copy, ChevronRight, Upload, Star, Layers,
  GripVertical, Trash2, ArrowUp, ArrowDown, X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Template {
  id: string;
  name: string;
  description: string;
  clauseCount: number;
  lastUpdated: string;
  isDefault: boolean;
  usageCount: number;
  sections: string[];
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const INITIAL_TEMPLATES: Template[] = [
  {
    id: "tpl-001", name: "Standard Roof Replacement", description: "Comprehensive agreement for full roof replacement projects including tear-off, decking repair, and shingle installation.",
    clauseCount: 10, lastUpdated: "2026-03-01", isDefault: true, usageCount: 24,
    sections: ["Parties", "Scope of Work", "Project Details", "Materials", "Pricing", "Insurance", "Warranty", "Terms & Conditions", "Signatures", "Addendum"],
  },
  {
    id: "tpl-002", name: "Siding Repair Agreement", description: "Standard contract for siding repair and replacement work, covering partial or full siding projects.",
    clauseCount: 8, lastUpdated: "2026-02-15", isDefault: true, usageCount: 12,
    sections: ["Parties", "Scope of Work", "Project Details", "Materials", "Pricing", "Warranty", "Terms & Conditions", "Signatures"],
  },
  {
    id: "tpl-003", name: "Full Exterior Restoration", description: "Multi-trade agreement covering roof, siding, gutters, windows, and other exterior restoration work.",
    clauseCount: 12, lastUpdated: "2026-02-20", isDefault: true, usageCount: 8,
    sections: ["Parties", "Scope of Work", "Project Details", "Materials Breakdown", "Pricing", "Payment Schedule", "Insurance", "Warranty", "Terms & Conditions", "Change Order Process", "Signatures", "Appendix"],
  },
  {
    id: "tpl-004", name: "Emergency Repair Authorization", description: "Short-form authorization for urgent/emergency repair work that needs to begin immediately.",
    clauseCount: 5, lastUpdated: "2026-01-10", isDefault: true, usageCount: 6,
    sections: ["Authorization", "Emergency Scope", "Pricing Estimate", "Terms", "Signatures"],
  },
  {
    id: "tpl-005", name: "Insurance Supplement Agreement", description: "Agreement for additional work identified after initial insurance scope, covering supplement claims.",
    clauseCount: 7, lastUpdated: "2026-03-10", isDefault: true, usageCount: 9,
    sections: ["Parties", "Original Scope Reference", "Supplement Scope", "Additional Pricing", "Insurance Details", "Terms", "Signatures"],
  },
  {
    id: "tpl-006", name: "Custom Template", description: "User-created blank template for custom contract types.",
    clauseCount: 3, lastUpdated: "2026-03-18", isDefault: false, usageCount: 2,
    sections: ["Parties", "Scope of Work", "Signatures"],
  },
];

const PLACEHOLDERS = [
  "{{customer_name}}", "{{address}}", "{{project_number}}", "{{total_price}}",
  "{{start_date}}", "{{completion_date}}", "{{insurance_company}}", "{{claim_number}}",
  "{{deductible}}", "{{contractor_name}}", "{{license_number}}", "{{phone}}",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ContractTemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Template | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState("");
  const [uploadConverted, setUploadConverted] = useState(false);

  // Create form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBase, setNewBase] = useState<string>("scratch");
  const [newSections, setNewSections] = useState<string[]>(["Parties", "Scope of Work", "Signatures"]);
  const [newSectionInput, setNewSectionInput] = useState("");

  // Edit form
  const [editSections, setEditSections] = useState<string[]>([]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const tpl: Template = {
      id: `tpl-${String(Date.now()).slice(-6)}`,
      name: newName,
      description: newDesc || "Custom template",
      clauseCount: newSections.length,
      lastUpdated: new Date().toISOString().split("T")[0],
      isDefault: false,
      usageCount: 0,
      sections: [...newSections],
    };
    setTemplates([...templates, tpl]);
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    setNewBase("scratch");
    setNewSections(["Parties", "Scope of Work", "Signatures"]);
  };

  const handleUseTemplate = (tpl: Template) => {
    setTemplates(templates.map((t) => t.id === tpl.id ? { ...t, usageCount: t.usageCount + 1 } : t));
    navigate("/contracts");
  };

  const openEdit = (tpl: Template) => {
    setShowEdit(tpl);
    setEditSections([...tpl.sections]);
  };

  const handleSaveEdit = () => {
    if (!showEdit) return;
    setTemplates(templates.map((t) =>
      t.id === showEdit.id
        ? { ...t, sections: editSections, clauseCount: editSections.length, lastUpdated: new Date().toISOString().split("T")[0] }
        : t
    ));
    setShowEdit(null);
  };

  const moveSection = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= editSections.length) return;
    const copy = [...editSections];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setEditSections(copy);
  };

  const handleBaseChange = (base: string) => {
    setNewBase(base);
    if (base === "scratch") {
      setNewSections(["Parties", "Scope of Work", "Signatures"]);
    } else {
      const source = templates.find((t) => t.id === base);
      if (source) setNewSections([...source.sections]);
    }
  };

  const handleUploadConvert = () => {
    setUploadConverted(true);
  };

  const handleUploadDone = () => {
    if (!uploadFile) return;
    const name = uploadFile.replace(/\.[^.]+$/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const tpl: Template = {
      id: `tpl-${String(Date.now()).slice(-6)}`,
      name,
      description: `Converted from uploaded file: ${uploadFile}`,
      clauseCount: 6,
      lastUpdated: new Date().toISOString().split("T")[0],
      isDefault: false,
      usageCount: 0,
      sections: ["Parties", "Scope of Work", "Materials", "Pricing", "Terms & Conditions", "Signatures"],
    };
    setTemplates([...templates, tpl]);
    setShowUpload(false);
    setUploadFile("");
    setUploadConverted(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contract Templates</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage reusable contract templates with variable placeholders</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" color="#6b7280" onClick={() => setShowUpload(true)}>
            <span className="flex items-center gap-1.5"><Upload className="w-4 h-4" /> Upload Contract</span>
          </Btn>
          <Btn color="#3b82f6" onClick={() => setShowCreate(true)}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Create Template</span>
          </Btn>
        </div>
      </div>

      {/* Placeholders info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">Available Placeholders</p>
        <div className="flex flex-wrap gap-1.5">
          {PLACEHOLDERS.map((p) => (
            <code key={p} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono">{p}</code>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-2">These placeholders are automatically replaced with project data when creating a contract from a template.</p>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {tpl.isDefault && <Badge color="#f59e0b" sm><Star className="w-3 h-3 mr-0.5" /> Default</Badge>}
                    <span className="text-xs text-gray-400">{tpl.clauseCount} sections</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tpl.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
              <span>Last updated: {tpl.lastUpdated}</span>
              <span>Used {tpl.usageCount} times</span>
            </div>

            <div className="flex items-center gap-2">
              <Btn size="sm" color="#3b82f6" onClick={() => handleUseTemplate(tpl)}>
                <span className="flex items-center gap-1"><ChevronRight className="w-3.5 h-3.5" /> Use Template</span>
              </Btn>
              <Btn size="sm" variant="outline" color="#6b7280" onClick={() => openEdit(tpl)}>
                <span className="flex items-center gap-1"><Edit3 className="w-3.5 h-3.5" /> Edit</span>
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Template" wide>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Custom Gutters Agreement"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Brief description of when this template is used..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Template</label>
            <select
              value={newBase}
              onChange={(e) => handleBaseChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="scratch">Start from Scratch</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>Duplicate: {t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sections <span className="text-gray-400">({newSections.length})</span>
            </label>
            <div className="space-y-1 mb-2">
              {newSections.map((sec, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span className="flex-1">{sec}</span>
                  <button onClick={() => setNewSections(newSections.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSectionInput}
                onChange={(e) => setNewSectionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSectionInput.trim()) {
                    setNewSections([...newSections, newSectionInput.trim()]);
                    setNewSectionInput("");
                  }
                }}
                placeholder="Add section name..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <Btn size="sm" color="#3b82f6" onClick={() => {
                if (newSectionInput.trim()) {
                  setNewSections([...newSections, newSectionInput.trim()]);
                  setNewSectionInput("");
                }
              }}>Add</Btn>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" color="#6b7280" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleCreate}>Create Template</Btn>
          </div>
        </div>
      </Modal>

      {/* Edit Template Modal */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title={showEdit ? `Edit: ${showEdit.name}` : ""} wide>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sections <span className="text-gray-400">({editSections.length})</span>
            </label>
            <div className="space-y-1 mb-2">
              {editSections.map((sec, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg text-sm group">
                  <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                  <span className="flex-1">{sec}</span>
                  <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-30">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveSection(i, 1)} disabled={i === editSections.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-30">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditSections(editSections.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="edit-section-input"
                placeholder="Add section name..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                onKeyDown={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === "Enter" && target.value.trim()) {
                    setEditSections([...editSections, target.value.trim()]);
                    target.value = "";
                  }
                }}
              />
              <Btn size="sm" color="#3b82f6" onClick={() => {
                const el = document.getElementById("edit-section-input") as HTMLInputElement;
                if (el && el.value.trim()) {
                  setEditSections([...editSections, el.value.trim()]);
                  el.value = "";
                }
              }}>Add</Btn>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" color="#6b7280" onClick={() => setShowEdit(null)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleSaveEdit}>Save Changes</Btn>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => { setShowUpload(false); setUploadFile(""); setUploadConverted(false); }} title="Upload Existing Contract">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Upload a PDF or DOCX file to convert it into an editable template.</p>
          <FileUploadSim
            fileName={uploadFile}
            onUpload={(f) => setUploadFile(f)}
            onClear={() => { setUploadFile(""); setUploadConverted(false); }}
            label="contract"
          />
          {uploadFile && !uploadConverted && (
            <Btn color="#3b82f6" onClick={handleUploadConvert} className="w-full">
              <span className="flex items-center gap-1.5 justify-center"><Layers className="w-4 h-4" /> Convert to Template</span>
            </Btn>
          )}
          {uploadConverted && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">Conversion Complete</p>
                <p className="text-xs text-green-600 mt-1">Extracted 6 sections from the uploaded document. Placeholders have been identified and mapped.</p>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Detected sections:</p>
                <div className="flex flex-wrap gap-1">
                  {["Parties", "Scope of Work", "Materials", "Pricing", "Terms & Conditions", "Signatures"].map((s) => (
                    <Badge key={s} color="#6366f1" sm>{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Btn variant="outline" color="#6b7280" onClick={() => { setShowUpload(false); setUploadFile(""); setUploadConverted(false); }}>Cancel</Btn>
                <Btn color="#22c55e" onClick={handleUploadDone}>Save as Template</Btn>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
