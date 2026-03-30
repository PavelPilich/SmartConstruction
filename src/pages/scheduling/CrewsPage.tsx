import { useState } from "react";
import { Users, UserPlus, MapPin, Phone, Star, Wrench, Plus, Mail, FileText, Shield, Building2, ClipboardCheck, Trash2, Edit3, ChevronDown, ChevronUp, AlertTriangle, Upload, X } from "lucide-react";
import { Badge, Btn, StatCard, Modal, SmartSelect, FileUploadSim } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

type CrewStatus = "available" | "on_site" | "en_route" | "off_duty";

/* ── Compliance document attached to a crew ── */
interface ComplianceDoc {
  id: string;
  name: string;       // "W-9 Form", "Liability Insurance", etc.
  status: "received" | "pending" | "expired";
  expDate?: string;    // ISO date or ""
  fileNote?: string;   // optional note about the file
}

interface Crew {
  id: string;
  name: string;
  leadName: string;
  email: string;
  members: number;
  specialty: string;
  status: CrewStatus;
  currentProject: string | null;
  phone: string;
  rating: number;
  compliance: ComplianceDoc[];
}

/* ── Default required forms for every subcontractor ── */
const DEFAULT_REQUIRED_FORMS = [
  "W-9 Form",
  "General Liability Insurance",
  "Workers Compensation Insurance",
  "State Contractor Registration",
  "Certificate of Insurance (COI)",
];

/* ── Manage the master list of required forms (extensible) ── */
let masterRequiredForms = [...DEFAULT_REQUIRED_FORMS];

function buildEmptyCompliance(): ComplianceDoc[] {
  return masterRequiredForms.map((name, i) => ({
    id: `doc-${Date.now()}-${i}`,
    name,
    status: "pending" as const,
    expDate: "",
    fileNote: "",
  }));
}

const initialCrews: Crew[] = [
  { id: "c1", name: "Alpha Team", leadName: "Mike Rodriguez", email: "mike@alpharoofing.com", members: 6, specialty: "Roofing", status: "on_site", currentProject: "Thompson Roof Replacement", phone: "(555) 123-4567", rating: 4.8,
    compliance: [
      { id: "d1", name: "W-9 Form", status: "received", expDate: "", fileNote: "Filed 01/15/2026" },
      { id: "d2", name: "General Liability Insurance", status: "received", expDate: "2027-01-15", fileNote: "$2M coverage" },
      { id: "d3", name: "Workers Compensation Insurance", status: "received", expDate: "2027-01-15", fileNote: "MN Policy #WC-44821" },
      { id: "d4", name: "State Contractor Registration", status: "received", expDate: "2027-06-30", fileNote: "MN License #CR-20198" },
      { id: "d5", name: "Certificate of Insurance (COI)", status: "received", expDate: "2027-01-15", fileNote: "Updated COI on file" },
    ],
  },
  { id: "c2", name: "Bravo Team", leadName: "James Wilson", email: "james@bravosiding.com", members: 5, specialty: "Siding", status: "available", currentProject: null, phone: "(555) 234-5678", rating: 4.6,
    compliance: [
      { id: "d6", name: "W-9 Form", status: "received", expDate: "", fileNote: "" },
      { id: "d7", name: "General Liability Insurance", status: "received", expDate: "2026-11-30", fileNote: "$1M coverage" },
      { id: "d8", name: "Workers Compensation Insurance", status: "expired", expDate: "2026-02-28", fileNote: "EXPIRED — needs renewal" },
      { id: "d9", name: "State Contractor Registration", status: "received", expDate: "2027-03-15", fileNote: "" },
      { id: "d10", name: "Certificate of Insurance (COI)", status: "pending", expDate: "", fileNote: "Requested 03/20" },
    ],
  },
  { id: "c3", name: "Charlie Team", leadName: "Carlos Mendez", email: "carlos@mendezwindows.com", members: 4, specialty: "Windows", status: "en_route", currentProject: "Anderson Window Install", phone: "(555) 345-6789", rating: 4.9,
    compliance: buildEmptyCompliance().map((d, i) => i < 3 ? { ...d, status: "received" as const, fileNote: "On file" } : d),
  },
  { id: "c4", name: "Delta Team", leadName: "David Park", email: "david@parkgeneral.com", members: 7, specialty: "General", status: "on_site", currentProject: "Davis Whole-Home Remodel", phone: "(555) 456-7890", rating: 4.5,
    compliance: buildEmptyCompliance().map((d) => ({ ...d, status: "received" as const, fileNote: "Verified" })),
  },
  { id: "c5", name: "Echo Team", leadName: "Tony Harris", email: "tony@harrisinteriors.com", members: 3, specialty: "Interior", status: "off_duty", currentProject: null, phone: "(555) 567-8901", rating: 4.7,
    compliance: buildEmptyCompliance(),
  },
  { id: "c6", name: "Foxtrot Team", leadName: "Sam Chen", email: "sam@chenroofing.com", members: 5, specialty: "Roofing", status: "available", currentProject: null, phone: "(555) 678-9012", rating: 4.4,
    compliance: buildEmptyCompliance().map((d, i) => i === 0 ? { ...d, status: "received" as const } : d),
  },
];

const statusColors: Record<CrewStatus, string> = {
  available: "#10b981", on_site: "#3b82f6", en_route: "#f59e0b", off_duty: "#94a3b8",
};
const statusLabels: Record<CrewStatus, string> = {
  available: "Available", on_site: "On Site", en_route: "En Route", off_duty: "Off Duty",
};
const specialtyColors: Record<string, string> = {
  Roofing: "#ef4444", Siding: "#3b82f6", General: "#94a3b8", Windows: "#8b5cf6", Interior: "#10b981",
};
const docStatusColors = { received: "#10b981", pending: "#f59e0b", expired: "#ef4444" };

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5" fill={i < full ? "#f59e0b" : i === full && half ? "url(#half)" : "none"} stroke={i < full || (i === full && half) ? "#f59e0b" : "#d1d5db"} />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ComplianceBadge({ crew }: { crew: Crew }) {
  const total = crew.compliance.length;
  const received = crew.compliance.filter((d) => d.status === "received").length;
  const expired = crew.compliance.filter((d) => d.status === "expired").length;
  if (expired > 0) return <Badge color="#ef4444" sm><AlertTriangle className="w-3 h-3 inline mr-0.5" />{expired} expired</Badge>;
  if (received === total) return <Badge color="#10b981" sm><Shield className="w-3 h-3 inline mr-0.5" />Compliant</Badge>;
  return <Badge color="#f59e0b" sm>{total - received} pending</Badge>;
}

/* ─── Initial specialties list (extensible) ─── */
const INITIAL_SPECIALTIES = ["Roofing", "Siding", "General", "Windows", "Interior"];

const EMPTY_CREW_FORM = {
  name: "", leadName: "", email: "", members: "4", specialty: "General", phone: "",
};

export default function CrewsPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [showAddModal, setShowAddModal] = useState(false);
  const [crewForm, setCrewForm] = useState({ ...EMPTY_CREW_FORM });
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [editCrew, setEditCrew] = useState<Crew | null>(null);
  const [specialties, setSpecialties] = useState<string[]>(INITIAL_SPECIALTIES);
  const [requiredForms, setRequiredForms] = useState<string[]>([...masterRequiredForms]);
  const [showFormsManager, setShowFormsManager] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [complianceExpanded, setComplianceExpanded] = useState(false);
  // Per-crew doc uploads in Add modal: { formName: { fileName, expDate } }
  const [addCrewDocs, setAddCrewDocs] = useState<Record<string, { fileName: string; expDate: string }>>({});
  const [extraDocName, setExtraDocName] = useState("");
  const [detailExtraDocName, setDetailExtraDocName] = useState("");
  const [extraForms, setExtraForms] = useState<string[]>([]);

  const handleAddCrew = () => {
    if (!crewForm.name.trim() || !crewForm.leadName.trim() || !crewForm.email.trim()) {
      addToast("Crew name, lead name, and email are required", "error");
      return;
    }
    const allForms = [...requiredForms, ...extraForms];
    const newCrew: Crew = {
      id: `c${Date.now()}`,
      name: crewForm.name.trim(),
      leadName: crewForm.leadName.trim(),
      email: crewForm.email.trim(),
      members: parseInt(crewForm.members) || 4,
      specialty: crewForm.specialty,
      status: "available",
      currentProject: null,
      phone: crewForm.phone.trim(),
      rating: 0,
      compliance: allForms.map((name, i) => {
        const uploaded = addCrewDocs[name];
        return {
          id: `doc-${Date.now()}-${i}`,
          name,
          status: (uploaded?.fileName ? "received" : "pending") as ComplianceDoc["status"],
          expDate: uploaded?.expDate || "",
          fileNote: uploaded?.fileName || "",
        };
      }),
    };
    setCrews((prev) => [...prev, newCrew]);
    setShowAddModal(false);
    setCrewForm({ ...EMPTY_CREW_FORM });
    setAddCrewDocs({});
    setExtraForms([]);
    setExtraDocName("");
    const uploadedCount = allForms.filter((f) => addCrewDocs[f]?.fileName).length;
    addToast(`Crew "${crewForm.name}" added — ${uploadedCount}/${allForms.length} docs uploaded`, "success");
  };

  const handleAddRequiredForm = () => {
    const trimmed = newFormName.trim();
    if (!trimmed) return;
    if (requiredForms.includes(trimmed)) { addToast("Form already exists", "error"); return; }
    setRequiredForms((prev) => [...prev, trimmed]);
    masterRequiredForms = [...masterRequiredForms, trimmed];
    setNewFormName("");
    addToast(`"${trimmed}" added to required forms`, "success");
  };

  const handleRemoveRequiredForm = (form: string) => {
    setRequiredForms((prev) => prev.filter((f) => f !== form));
    masterRequiredForms = masterRequiredForms.filter((f) => f !== form);
    addToast(`"${form}" removed from required forms`, "success");
  };

  const updateComplianceDoc = (crewId: string, docId: string, updates: Partial<ComplianceDoc>) => {
    setCrews((prev) => prev.map((c) =>
      c.id === crewId ? { ...c, compliance: c.compliance.map((d) => d.id === docId ? { ...d, ...updates } : d) } : c
    ));
  };

  const onSite = crews.filter((c) => c.status === "on_site").length;
  const available = crews.filter((c) => c.status === "available").length;
  const enRoute = crews.filter((c) => c.status === "en_route").length;
  const totalExpired = crews.reduce((a, c) => a + c.compliance.filter((d) => d.status === "expired").length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crews & Subcontractors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage crews, compliance documents, and assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <Btn color="#6b7280" variant="outline" onClick={() => setShowFormsManager(true)}>
            <span className="flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4" /> Manage Required Forms</span>
          </Btn>
          <Btn color="#3b82f6" onClick={() => { setCrewForm({ ...EMPTY_CREW_FORM }); setAddCrewDocs({}); setExtraForms([]); setExtraDocName(""); setComplianceExpanded(false); setShowAddModal(true); }}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Crew</span>
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Crews" value={crews.length} sub={`${crews.reduce((a, c) => a + c.members, 0)} members`} color="#3b82f6" />
        <StatCard icon={MapPin} label="On Site" value={onSite} sub="Currently working" color="#3b82f6" />
        <StatCard icon={UserPlus} label="Available" value={available} sub="Ready to deploy" color="#10b981" />
        <StatCard icon={Wrench} label="En Route" value={enRoute} sub="Heading to site" color="#f59e0b" />
        <StatCard icon={AlertTriangle} label="Expired Docs" value={totalExpired} sub="Need attention" color="#ef4444" />
      </div>

      {/* Crew Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {crews.map((crew) => (
          <div key={crew.id} onClick={() => { setDetailExtraDocName(""); setSelectedCrew(crew); }} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{crew.name}</h3>
                <p className="text-sm text-gray-500">Lead: {crew.leadName}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{crew.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge color={statusColors[crew.status]}>{statusLabels[crew.status]}</Badge>
                <ComplianceBadge crew={crew} />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <Badge color={specialtyColors[crew.specialty] || "#94a3b8"}>{crew.specialty}</Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500"><Users className="w-3.5 h-3.5" /> {crew.members} members</div>
            </div>

            {crew.currentProject && (
              <div className="bg-blue-50 text-blue-700 text-xs rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />{crew.currentProject}
              </div>
            )}

            {/* Compliance mini-bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Compliance</span>
                <span>{crew.compliance.filter((d) => d.status === "received").length}/{crew.compliance.length} docs</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                {crew.compliance.map((d) => (
                  <div key={d.id} className="h-full" style={{ width: `${100 / crew.compliance.length}%`, backgroundColor: docStatusColors[d.status] }} />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone className="w-3.5 h-3.5" /> {crew.phone}</div>
              <RatingStars rating={crew.rating} />
            </div>
          </div>
        ))}
      </div>

      {/* Availability Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Availability Overview</h3>
        <div className="space-y-3">
          {(Object.keys(statusColors) as CrewStatus[]).map((status) => {
            const count = crews.filter((c) => c.status === status).length;
            const pct = crews.length > 0 ? Math.round((count / crews.length) * 100) : 0;
            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{statusLabels[status]}</span>
                  <span className="text-sm font-medium text-gray-900">{count} crews ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: statusColors[status] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════ ADD CREW MODAL ═══════ */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Crew / Subcontractor" wide>
        <div className="space-y-4">
          {/* Contact info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crew / Company Name <span className="text-red-500">*</span></label>
              <input value={crewForm.name} onChange={(e) => setCrewForm({ ...crewForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. Alpha Roofing LLC" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead / Contact Name <span className="text-red-500">*</span></label>
              <input value={crewForm.leadName} onChange={(e) => setCrewForm({ ...crewForm, leadName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Full name" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" value={crewForm.email} onChange={(e) => setCrewForm({ ...crewForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="email@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={crewForm.phone} onChange={(e) => setCrewForm({ ...crewForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
              <input type="number" min="1" max="50" value={crewForm.members} onChange={(e) => setCrewForm({ ...crewForm, members: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div>
            <SmartSelect
              label="Specialty"
              value={crewForm.specialty}
              onChange={(v) => setCrewForm({ ...crewForm, specialty: v })}
              options={specialties}
              onAddNew={(v) => {
                setSpecialties((prev) => [...prev, v]);
                specialtyColors[v] = "#6366f1";
              }}
              placeholder="Select specialty..."
            />
          </div>

          {/* Compliance Documents Section */}
          <div className="border-t border-gray-200 pt-4">
            <button type="button" onClick={() => setComplianceExpanded(!complianceExpanded)} className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">Required Compliance Documents</span>
                <Badge color="#3b82f6" sm>{requiredForms.length + extraForms.length} forms</Badge>
                {Object.values(addCrewDocs).filter((d) => d.fileName).length > 0 && (
                  <Badge color="#10b981" sm>{Object.values(addCrewDocs).filter((d) => d.fileName).length} uploaded</Badge>
                )}
              </div>
              {complianceExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {complianceExpanded && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500">Upload documents now or leave as pending — you can update later from the crew detail view.</p>

                {/* Required forms with upload */}
                {[...requiredForms, ...extraForms].map((form) => {
                  const docData = addCrewDocs[form] || { fileName: "", expDate: "" };
                  const isExtra = extraForms.includes(form);
                  return (
                    <div key={form} className="p-3 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 flex-1">{form}</span>
                        {docData.fileName ? (
                          <Badge color="#10b981" sm>Uploaded</Badge>
                        ) : (
                          <Badge color="#f59e0b" sm>Pending</Badge>
                        )}
                        {isExtra && (
                          <button onClick={() => {
                            setExtraForms((prev) => prev.filter((f) => f !== form));
                            setAddCrewDocs((prev) => { const n = { ...prev }; delete n[form]; return n; });
                          }} className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <FileUploadSim
                          fileName={docData.fileName}
                          label={form}
                          onUpload={(name) => setAddCrewDocs((prev) => ({ ...prev, [form]: { ...prev[form], fileName: name, expDate: prev[form]?.expDate || "" } }))}
                          onClear={() => setAddCrewDocs((prev) => ({ ...prev, [form]: { ...prev[form], fileName: "", expDate: prev[form]?.expDate || "" } }))}
                        />
                        <input
                          type="date"
                          value={docData.expDate}
                          onChange={(e) => setAddCrewDocs((prev) => ({ ...prev, [form]: { ...prev[form], fileName: prev[form]?.fileName || "", expDate: e.target.value } }))}
                          placeholder="Exp. date"
                          className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Add additional document */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-xs text-gray-500 mb-2">Need additional documents for this specific crew?</p>
                  <div className="flex gap-2">
                    <input
                      value={extraDocName}
                      onChange={(e) => setExtraDocName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && extraDocName.trim()) {
                          const name = extraDocName.trim();
                          if ([...requiredForms, ...extraForms].includes(name)) { addToast("Document already exists", "error"); return; }
                          setExtraForms((prev) => [...prev, name]);
                          setExtraDocName("");
                        }
                      }}
                      placeholder="e.g. EPA Lead Certification, Bonding Certificate..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <Btn color="#3b82f6" size="sm" onClick={() => {
                      const name = extraDocName.trim();
                      if (!name) return;
                      if ([...requiredForms, ...extraForms].includes(name)) { addToast("Document already exists", "error"); return; }
                      setExtraForms((prev) => [...prev, name]);
                      setExtraDocName("");
                    }}>
                      <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</span>
                    </Btn>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => { setShowAddModal(false); setCrewForm({ ...EMPTY_CREW_FORM }); }}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleAddCrew}>Add Crew</Btn>
          </div>
        </div>
      </Modal>

      {/* ═══════ CREW DETAIL MODAL ═══════ */}
      <Modal open={!!selectedCrew} onClose={() => setSelectedCrew(null)} title={selectedCrew?.name ?? "Crew Details"} wide>
        {selectedCrew && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge color={statusColors[selectedCrew.status]}>{statusLabels[selectedCrew.status]}</Badge>
                <Badge color={specialtyColors[selectedCrew.specialty] || "#94a3b8"}>{selectedCrew.specialty}</Badge>
              </div>
              <ComplianceBadge crew={selectedCrew} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Lead</div>
                <div className="font-medium text-gray-900">{selectedCrew.leadName}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="font-medium text-gray-900">{selectedCrew.email}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                <div className="font-medium text-gray-900">{selectedCrew.phone}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Members</div>
                <div className="font-medium text-gray-900">{selectedCrew.members}</div>
              </div>
              {selectedCrew.currentProject && (
                <div className="bg-blue-50 rounded-lg p-3 col-span-2">
                  <div className="text-xs text-blue-500 mb-1">Current Project</div>
                  <div className="font-medium text-blue-900">{selectedCrew.currentProject}</div>
                </div>
              )}
            </div>

            {/* Compliance Documents Table */}
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-600" /> Compliance Documents
              </h4>
              <div className="space-y-2">
                {selectedCrew.compliance.map((doc) => (
                  <div key={doc.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        {doc.expDate && <div className="text-xs text-gray-400">Expires: {new Date(doc.expDate).toLocaleDateString()}</div>}
                      </div>
                      <Badge color={doc.status === "received" ? "#10b981" : doc.status === "expired" ? "#ef4444" : "#f59e0b"} sm>
                        {doc.status}
                      </Badge>
                    </div>
                    {/* File upload row */}
                    <div className="flex items-center gap-2">
                      <FileUploadSim
                        fileName={doc.fileNote || ""}
                        label={doc.name}
                        onUpload={(name) => {
                          updateComplianceDoc(selectedCrew.id, doc.id, { fileNote: name, status: "received" });
                          setSelectedCrew((prev) => prev ? { ...prev, compliance: prev.compliance.map((d) => d.id === doc.id ? { ...d, fileNote: name, status: "received" } : d) } : null);
                          addToast(`${doc.name}: file uploaded`, "success");
                        }}
                        onClear={() => {
                          updateComplianceDoc(selectedCrew.id, doc.id, { fileNote: "", status: "pending" });
                          setSelectedCrew((prev) => prev ? { ...prev, compliance: prev.compliance.map((d) => d.id === doc.id ? { ...d, fileNote: "", status: "pending" } : d) } : null);
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Add extra doc to existing crew */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex gap-2">
                    <input
                      value={detailExtraDocName}
                      onChange={(e) => setDetailExtraDocName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && detailExtraDocName.trim()) {
                          const name = detailExtraDocName.trim();
                          if (selectedCrew.compliance.some((d) => d.name === name)) { addToast("Document already exists", "error"); return; }
                          const newDoc: ComplianceDoc = { id: `doc-${Date.now()}`, name, status: "pending", expDate: "", fileNote: "" };
                          setCrews((prev) => prev.map((c) => c.id === selectedCrew.id ? { ...c, compliance: [...c.compliance, newDoc] } : c));
                          setSelectedCrew((prev) => prev ? { ...prev, compliance: [...prev.compliance, newDoc] } : null);
                          setDetailExtraDocName("");
                          addToast(`"${name}" added`, "success");
                        }
                      }}
                      placeholder="Add additional document..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <Btn color="#3b82f6" size="sm" onClick={() => {
                      const name = detailExtraDocName.trim();
                      if (!name) return;
                      if (selectedCrew.compliance.some((d) => d.name === name)) { addToast("Document already exists", "error"); return; }
                      const newDoc: ComplianceDoc = { id: `doc-${Date.now()}`, name, status: "pending", expDate: "", fileNote: "" };
                      setCrews((prev) => prev.map((c) => c.id === selectedCrew.id ? { ...c, compliance: [...c.compliance, newDoc] } : c));
                      setSelectedCrew((prev) => prev ? { ...prev, compliance: [...prev.compliance, newDoc] } : null);
                      setDetailExtraDocName("");
                      addToast(`"${name}" added`, "success");
                    }}>
                      <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</span>
                    </Btn>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Btn color="#6b7280" variant="outline" onClick={() => setSelectedCrew(null)}>Close</Btn>
              <Btn color="#3b82f6" onClick={() => { setEditCrew({ ...selectedCrew }); setSelectedCrew(null); }}>
                <span className="flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5" /> Edit Crew</span>
              </Btn>
              <Btn color="#ef4444" variant="outline" onClick={() => {
                setCrews((prev) => prev.filter((c) => c.id !== selectedCrew.id));
                setSelectedCrew(null);
                addToast(`Crew "${selectedCrew.name}" removed`, "success");
              }}>Remove</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════ EDIT CREW MODAL ═══════ */}
      <Modal open={!!editCrew} onClose={() => setEditCrew(null)} title="Edit Crew" wide>
        {editCrew && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crew Name *</label>
                <input value={editCrew.name} onChange={(e) => setEditCrew({ ...editCrew, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name *</label>
                <input value={editCrew.leadName} onChange={(e) => setEditCrew({ ...editCrew, leadName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={editCrew.email} onChange={(e) => setEditCrew({ ...editCrew, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={editCrew.phone} onChange={(e) => setEditCrew({ ...editCrew, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members</label>
                <input type="number" min="1" max="50" value={editCrew.members} onChange={(e) => setEditCrew({ ...editCrew, members: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SmartSelect
                label="Specialty"
                value={editCrew.specialty}
                onChange={(v) => setEditCrew({ ...editCrew, specialty: v })}
                options={specialties}
                onAddNew={(v) => { setSpecialties((prev) => [...prev, v]); specialtyColors[v] = "#6366f1"; }}
              />
              <SmartSelect
                label="Status"
                value={editCrew.status}
                onChange={(v) => setEditCrew({ ...editCrew, status: v as CrewStatus })}
                options={["available", "on_site", "en_route", "off_duty"]}
              />
            </div>

            {/* Edit compliance docs */}
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-600" /> Compliance Documents
              </h4>
              <div className="space-y-2">
                {editCrew.compliance.map((doc, idx) => (
                  <div key={doc.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 rounded-lg">
                    <div className="col-span-3 text-sm font-medium text-gray-700 truncate">{doc.name}</div>
                    <div className="col-span-2">
                      <select value={doc.status} onChange={(e) => {
                        const updated = [...editCrew.compliance];
                        updated[idx] = { ...updated[idx], status: e.target.value as ComplianceDoc["status"] };
                        setEditCrew({ ...editCrew, compliance: updated });
                      }} className="w-full px-2 py-1 text-xs rounded border border-gray-200 bg-white">
                        <option value="received">Received</option>
                        <option value="pending">Pending</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div className="col-span-3">
                      <input type="date" value={doc.expDate || ""} onChange={(e) => {
                        const updated = [...editCrew.compliance];
                        updated[idx] = { ...updated[idx], expDate: e.target.value };
                        setEditCrew({ ...editCrew, compliance: updated });
                      }} className="w-full px-2 py-1 text-xs rounded border border-gray-200" />
                    </div>
                    <div className="col-span-4">
                      <input value={doc.fileNote || ""} onChange={(e) => {
                        const updated = [...editCrew.compliance];
                        updated[idx] = { ...updated[idx], fileNote: e.target.value };
                        setEditCrew({ ...editCrew, compliance: updated });
                      }} placeholder="Notes..." className="w-full px-2 py-1 text-xs rounded border border-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Btn color="#6b7280" variant="outline" onClick={() => setEditCrew(null)}>Cancel</Btn>
              <Btn color="#3b82f6" onClick={() => {
                if (!editCrew.name.trim() || !editCrew.leadName.trim() || !editCrew.email.trim()) {
                  addToast("Crew name, lead name, and email are required", "error");
                  return;
                }
                setCrews((prev) => prev.map((c) => c.id === editCrew.id ? editCrew : c));
                setEditCrew(null);
                addToast(`Crew "${editCrew.name}" updated`, "success");
              }}>Save Changes</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════ MANAGE REQUIRED FORMS MODAL ═══════ */}
      <Modal open={showFormsManager} onClose={() => setShowFormsManager(false)} title="Manage Required Compliance Forms">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">These forms are required from every new subcontractor/crew. Add or remove as needed — changes apply to new crews.</p>

          <div className="space-y-2">
            {requiredForms.map((form) => (
              <div key={form} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-900">{form}</span>
                </div>
                {!DEFAULT_REQUIRED_FORMS.includes(form) ? (
                  <button onClick={() => handleRemoveRequiredForm(form)} className="text-red-500 hover:text-red-700 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <Badge color="#3b82f6" sm>Default</Badge>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newFormName}
              onChange={(e) => setNewFormName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddRequiredForm(); }}
              placeholder="New form name (e.g. Business License, EPA Certification...)"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <Btn color="#3b82f6" onClick={handleAddRequiredForm}>
              <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Form</span>
            </Btn>
          </div>

          <div className="flex justify-end pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowFormsManager(false)}>Done</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
