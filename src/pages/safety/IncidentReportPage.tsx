import { useState } from "react";
import { Badge, Btn, StatCard, Modal, SmartSelect, FileUploadSim } from "../../components/ui";
import {
  AlertTriangle, Shield, Clock, CheckCircle2, XCircle, FileText,
  Plus, Camera, Eye, Download, MessageSquare, Calendar, AlertOctagon,
  Mail, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Severity = "near-miss" | "minor-no-injury" | "minor-first-aid" | "moderate-medical" | "severe-emergency";
type IncidentStatus = "open" | "investigating" | "closed";
type IncidentType = "Fall" | "Equipment" | "Vehicle" | "Chemical" | "Weather" | "Other";

interface TimelineEntry {
  date: string;
  note: string;
  by: string;
}

interface Incident {
  id: string;
  title: string;
  project: string;
  date: string;
  time: string;
  status: IncidentStatus;
  severity: Severity;
  type: IncidentType;
  worker: string;
  description: string;
  photos: string[];
  witnesses: string;
  immediateAction: string;
  resolution: string;
  closedDate: string;
  timeline: TimelineEntry[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function severityLabel(s: Severity): string {
  const m: Record<Severity, string> = {
    "near-miss": "Near Miss",
    "minor-no-injury": "Minor \u2014 No Injury",
    "minor-first-aid": "Minor \u2014 First Aid",
    "moderate-medical": "Moderate \u2014 Medical",
    "severe-emergency": "Severe \u2014 Emergency",
  };
  return m[s];
}

function severityColor(s: Severity): string {
  const m: Record<Severity, string> = {
    "near-miss": "#6b7280",
    "minor-no-injury": "#eab308",
    "minor-first-aid": "#f97316",
    "moderate-medical": "#ef4444",
    "severe-emergency": "#dc2626",
  };
  return m[s];
}

function statusColor(s: IncidentStatus): string {
  return s === "open" ? "#ef4444" : s === "investigating" ? "#eab308" : "#22c55e";
}

function statusLabel(s: IncidentStatus): string {
  return s === "open" ? "Open" : s === "investigating" ? "Under Investigation" : "Closed";
}

function statusDot(s: IncidentStatus): string {
  return s === "open" ? "\uD83D\uDD34" : s === "investigating" ? "\uD83D\uDFE1" : "\uD83D\uDFE2";
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    title: "Minor Ladder Slip \u2014 MN-0312 Andersen",
    project: "MN-0312 Andersen",
    date: "Mar 15, 2026",
    time: "7:45 AM",
    status: "open",
    severity: "minor-no-injury",
    type: "Fall",
    worker: "Tony Harris",
    description: "Tony slipped on wet ladder rung during morning dew. Caught himself, no fall. Ladder inspection revealed worn rubber feet.",
    photos: ["ladder-slip-1.jpg", "worn-feet-detail.jpg"],
    witnesses: "Mike Rodriguez, Carlos Mendez",
    immediateAction: "Ladder removed from service. Worker checked by crew lead.",
    resolution: "",
    closedDate: "",
    timeline: [
      { date: "Mar 15, 2026 8:00 AM", note: "Incident reported by Tony Harris", by: "Tony Harris" },
      { date: "Mar 15, 2026 8:30 AM", note: "Admin notified. Ladder removed from service.", by: "Mike Rodriguez" },
      { date: "Mar 16, 2026 9:00 AM", note: "All ladders scheduled for rubber feet inspection.", by: "Pavel Pilich" },
    ],
  },
  {
    id: "INC-002",
    title: "Nail Gun Misfire \u2014 MN-0247 Thompson",
    project: "MN-0247 Thompson",
    date: "Feb 22, 2026",
    time: "10:15 AM",
    status: "investigating",
    severity: "minor-first-aid",
    type: "Equipment",
    worker: "Jake (Bravo Team)",
    description: "Nail gun misfired, nail ricocheted off flashing. Worker received minor cut on forearm. First aid applied on site.",
    photos: ["nail-gun-1.jpg", "wound-photo.jpg", "flashing-impact.jpg"],
    witnesses: "James Wilson, David Park",
    immediateAction: "First aid applied. Nail gun tagged out of service. Worker continued light duty.",
    resolution: "",
    closedDate: "",
    timeline: [
      { date: "Feb 22, 2026 10:30 AM", note: "Incident reported. First aid applied on site.", by: "James Wilson" },
      { date: "Feb 22, 2026 11:00 AM", note: "Nail gun removed from service, sent for inspection.", by: "James Wilson" },
      { date: "Feb 23, 2026 9:00 AM", note: "Insurance carrier notified. Claim #WC-2026-0087 opened.", by: "Pavel Pilich" },
      { date: "Mar 1, 2026 2:00 PM", note: "Insurance review pending. Awaiting manufacturer report on nail gun model.", by: "State Farm Rep" },
    ],
  },
  {
    id: "INC-003",
    title: "Material Falling from Roof \u2014 MN-0089 Garcia",
    project: "MN-0089 Garcia",
    date: "Jan 8, 2026",
    time: "2:30 PM",
    status: "closed",
    severity: "near-miss",
    type: "Fall",
    worker: "",
    description: "Bundle of shingles slid off roof during tear-off. Work zone was properly marked, no one in area.",
    photos: ["fallen-shingles.jpg"],
    witnesses: "Carlos Mendez",
    immediateAction: "Work stopped. Additional roof brackets installed before resuming.",
    resolution: "Added roof brackets earlier in tear-off process. Updated SOP.",
    closedDate: "Jan 12, 2026",
    timeline: [
      { date: "Jan 8, 2026 2:45 PM", note: "Incident reported. Work stopped for safety review.", by: "Carlos Mendez" },
      { date: "Jan 8, 2026 3:30 PM", note: "Additional roof brackets installed. Work resumed.", by: "Carlos Mendez" },
      { date: "Jan 10, 2026 9:00 AM", note: "SOP updated: roof brackets must be installed before tear-off begins.", by: "Pavel Pilich" },
      { date: "Jan 12, 2026 10:00 AM", note: "Incident closed. Corrective action verified.", by: "Pavel Pilich" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function IncidentReportPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [showReport, setShowReport] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [updateNote, setUpdateNote] = useState("");
  const [closeResolution, setCloseResolution] = useState("");
  const [showClose, setShowClose] = useState(false);

  // Report form state
  const [formDate, setFormDate] = useState("2026-03-30");
  const [formTime, setFormTime] = useState("");
  const [formProject, setFormProject] = useState("");
  const [formWorker, setFormWorker] = useState("");
  const [formSeverity, setFormSeverity] = useState("");
  const [formType, setFormType] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formWitnesses, setFormWitnesses] = useState("");
  const [formAction, setFormAction] = useState("");

  const viewIncident = incidents.find((i) => i.id === viewId);

  const openCount = incidents.filter((i) => i.status === "open").length;
  const investigatingCount = incidents.filter((i) => i.status === "investigating").length;
  const closedCount = incidents.filter((i) => i.status === "closed").length;

  // Days since last incident
  const lastIncidentDate = new Date("2026-02-22"); // most recent non-closed
  const today = new Date("2026-03-30");
  const daysSince = Math.floor((today.getTime() - lastIncidentDate.getTime()) / (1000 * 60 * 60 * 24));

  function resetForm() {
    setFormDate("2026-03-30");
    setFormTime("");
    setFormProject("");
    setFormWorker("");
    setFormSeverity("");
    setFormType("");
    setFormDescription("");
    setFormPhotos([]);
    setFormWitnesses("");
    setFormAction("");
  }

  function submitReport() {
    if (!formProject || !formSeverity || !formType || !formDescription.trim()) {
      addToast("Please fill in project, severity, type, and description.", "error");
      return;
    }

    const inc: Incident = {
      id: `INC-${String(Date.now()).slice(-3)}`,
      title: `${formType} Incident \u2014 ${formProject}`,
      project: formProject,
      date: "Mar 30, 2026",
      time: formTime || new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      status: "open",
      severity: formSeverity as Severity,
      type: formType as IncidentType,
      worker: formWorker,
      description: formDescription,
      photos: formPhotos,
      witnesses: formWitnesses,
      immediateAction: formAction,
      resolution: "",
      closedDate: "",
      timeline: [
        { date: "Mar 30, 2026", note: "Incident reported.", by: formWorker || "Admin" },
      ],
    };

    setIncidents((prev) => [inc, ...prev]);
    setShowReport(false);
    resetForm();
    addToast("Incident reported. Admin and insurance carrier notified automatically.", "success");
    setTimeout(() => addToast("Admin notified: Pavel Pilich", "info"), 500);
    setTimeout(() => addToast("Insurance notified: State Farm Workers Comp", "info"), 1000);
  }

  function addUpdate() {
    if (!updateNote.trim() || !viewId) return;
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === viewId
          ? { ...i, timeline: [...i.timeline, { date: "Mar 30, 2026", note: updateNote, by: "Admin" }] }
          : i,
      ),
    );
    setUpdateNote("");
    setShowAddUpdate(false);
    addToast("Update added to incident timeline.", "success");
  }

  function closeIncident() {
    if (!closeResolution.trim() || !viewId) {
      addToast("Resolution is required to close the incident.", "error");
      return;
    }
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === viewId
          ? {
              ...i,
              status: "closed" as IncidentStatus,
              resolution: closeResolution,
              closedDate: "Mar 30, 2026",
              timeline: [...i.timeline, { date: "Mar 30, 2026", note: `Incident closed. Resolution: ${closeResolution}`, by: "Admin" }],
            }
          : i,
      ),
    );
    setCloseResolution("");
    setShowClose(false);
    addToast("Incident closed successfully.", "success");
  }

  function addPhoto(f: string) {
    setFormPhotos((prev) => [...prev, f]);
  }

  function removePhoto(idx: number) {
    setFormPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-red-600" /> Incident Reports
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Track, report, and resolve workplace incidents</p>
        </div>
        <Btn color="#ef4444" onClick={() => setShowReport(true)}>
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Report Incident</span>
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <StatCard icon={AlertTriangle} label="Total Incidents (YTD)" value={incidents.length} color="#ef4444" />
        <StatCard icon={XCircle} label="Open" value={openCount} color="#ef4444" />
        <StatCard icon={Eye} label="Under Investigation" value={investigatingCount} color="#eab308" />
        <StatCard icon={CheckCircle2} label="Closed" value={closedCount} color="#22c55e" />
        <StatCard icon={Shield} label="Days Since Last" value={daysSince} color="#3b82f6" sub="No incidents" />
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            onClick={() => setViewId(inc.id)}
            className={`bg-white rounded-xl border p-5 cursor-pointer hover:shadow-md transition ${
              inc.status === "open" ? "border-red-200" : inc.status === "investigating" ? "border-yellow-200" : "border-green-200"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{statusDot(inc.status)}</span>
                <h3 className="font-bold text-gray-900">{inc.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={severityColor(inc.severity)}>{severityLabel(inc.severity)}</Badge>
                <Badge color={statusColor(inc.status)}>{statusLabel(inc.status)}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {inc.date}</span>
              {inc.worker && <span>Worker: <span className="font-medium text-gray-700">{inc.worker}</span></span>}
            </div>
            <p className="text-sm text-gray-600 mb-2">{inc.description}</p>
            {inc.photos.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                <Camera className="w-3 h-3" /> {inc.photos.length} photo{inc.photos.length > 1 ? "s" : ""} attached
              </div>
            )}
            {inc.immediateAction && (
              <div className="text-sm">
                <span className="text-gray-500">Action: </span>
                <span className="text-gray-700">{inc.immediateAction}</span>
              </div>
            )}
            {inc.resolution && (
              <div className="text-sm mt-1">
                <span className="text-gray-500">Resolution: </span>
                <span className="text-green-700">{inc.resolution}</span>
              </div>
            )}
            {inc.closedDate && (
              <div className="text-xs text-gray-400 mt-1">Closed: {inc.closedDate}</div>
            )}
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/*  VIEW INCIDENT DETAIL MODAL                                   */}
      {/* ============================================================ */}
      <Modal open={!!viewIncident} onClose={() => { setViewId(null); setShowAddUpdate(false); setShowClose(false); }} title={viewIncident?.title || ""} wide>
        {viewIncident && (
          <div className="space-y-4">
            {/* Info grid */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-500">Status:</span> <Badge color={statusColor(viewIncident.status)}>{statusLabel(viewIncident.status)}</Badge></div>
              <div><span className="text-gray-500">Severity:</span> <Badge color={severityColor(viewIncident.severity)}>{severityLabel(viewIncident.severity)}</Badge></div>
              <div><span className="text-gray-500">Type:</span> <span className="font-medium">{viewIncident.type}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{viewIncident.date} {viewIncident.time}</span></div>
              <div><span className="text-gray-500">Project:</span> <span className="font-medium">{viewIncident.project}</span></div>
              <div><span className="text-gray-500">Worker:</span> <span className="font-medium">{viewIncident.worker || "N/A"}</span></div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{viewIncident.description}</p>
            </div>

            {/* Photos */}
            {viewIncident.photos.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-1">Photos</h4>
                <div className="flex gap-2 flex-wrap">
                  {viewIncident.photos.map((p, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Witnesses / Action */}
            {viewIncident.witnesses && (
              <div className="text-sm"><span className="text-gray-500 font-medium">Witnesses:</span> {viewIncident.witnesses}</div>
            )}
            {viewIncident.immediateAction && (
              <div className="text-sm"><span className="text-gray-500 font-medium">Immediate Action:</span> {viewIncident.immediateAction}</div>
            )}
            {viewIncident.resolution && (
              <div className="text-sm"><span className="text-gray-500 font-medium">Resolution:</span> <span className="text-green-700">{viewIncident.resolution}</span></div>
            )}

            {/* Investigation Timeline */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2">Investigation Timeline</h4>
              <div className="space-y-2 ml-3 border-l-2 border-gray-200 pl-4">
                {viewIncident.timeline.map((entry, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                    <div className="text-xs text-gray-400">{entry.date} &middot; {entry.by}</div>
                    <div className="text-sm text-gray-700">{entry.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Update inline */}
            {showAddUpdate && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="Add an update note..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Btn color="#3b82f6" size="sm" onClick={addUpdate}>Save Update</Btn>
                  <Btn color="#6b7280" variant="outline" size="sm" onClick={() => { setShowAddUpdate(false); setUpdateNote(""); }}>Cancel</Btn>
                </div>
              </div>
            )}

            {/* Close Incident inline */}
            {showClose && (
              <div className="bg-red-50 rounded-lg p-3 space-y-2 border border-red-200">
                <label className="text-sm font-medium text-red-700">Resolution Required to Close</label>
                <textarea
                  value={closeResolution}
                  onChange={(e) => setCloseResolution(e.target.value)}
                  placeholder="Describe the resolution and corrective actions taken..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Btn color="#22c55e" size="sm" onClick={closeIncident}>Close Incident</Btn>
                  <Btn color="#6b7280" variant="outline" size="sm" onClick={() => { setShowClose(false); setCloseResolution(""); }}>Cancel</Btn>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-3 border-t">
              {!showAddUpdate && (
                <Btn color="#3b82f6" variant="outline" size="sm" onClick={() => setShowAddUpdate(true)}>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Add Update</span>
                </Btn>
              )}
              {viewIncident.status !== "closed" && !showClose && (
                <Btn color="#22c55e" variant="outline" size="sm" onClick={() => setShowClose(true)}>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Close Incident</span>
                </Btn>
              )}
              <Btn color="#6b7280" variant="outline" size="sm" onClick={() => addToast("PDF report downloaded.", "info")}>
                <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Download Report</span>
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/*  REPORT INCIDENT MODAL                                        */}
      {/* ============================================================ */}
      <Modal open={showReport} onClose={() => { setShowReport(false); resetForm(); }} title="Report New Incident" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          <SmartSelect
            label="Location / Project"
            required
            value={formProject}
            onChange={setFormProject}
            options={["MN-0247 Thompson", "MN-0089 Garcia", "MN-0156 Chen", "MN-0312 Andersen"]}
            onAddNew={() => {}}
            placeholder="Select project..."
          />

          <SmartSelect
            label="Worker(s) Involved"
            value={formWorker}
            onChange={setFormWorker}
            options={["Tony Harris", "Mike Rodriguez", "James Wilson", "Carlos Mendez", "David Park", "Sam Chen", "Jake Morrison"]}
            onAddNew={() => {}}
            placeholder="Select worker..."
          />

          <SmartSelect
            label="Severity"
            required
            value={formSeverity ? severityLabel(formSeverity as Severity) : ""}
            onChange={(v) => {
              const m: Record<string, Severity> = {
                "Near Miss": "near-miss",
                "Minor \u2014 No Injury": "minor-no-injury",
                "Minor \u2014 First Aid": "minor-first-aid",
                "Moderate \u2014 Medical": "moderate-medical",
                "Severe \u2014 Emergency": "severe-emergency",
              };
              setFormSeverity(m[v] || "");
            }}
            options={["Near Miss", "Minor \u2014 No Injury", "Minor \u2014 First Aid", "Moderate \u2014 Medical", "Severe \u2014 Emergency"]}
            placeholder="Select severity..."
          />

          <SmartSelect
            label="Incident Type"
            required
            value={formType}
            onChange={setFormType}
            options={["Fall", "Equipment", "Vehicle", "Chemical", "Weather", "Other"]}
            placeholder="Select type..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Describe what happened in detail..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              rows={4}
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
            <div className="space-y-2">
              {formPhotos.map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 flex-1">{p}</span>
                  <button onClick={() => removePhoto(i)} className="text-blue-400 hover:text-red-500 text-sm">Remove</button>
                </div>
              ))}
              <FileUploadSim
                fileName=""
                onUpload={addPhoto}
                onClear={() => {}}
                label="incident-photo"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Witnesses</label>
            <input
              value={formWitnesses}
              onChange={(e) => setFormWitnesses(e.target.value)}
              placeholder="Names of witnesses..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Action Taken</label>
            <textarea
              value={formAction}
              onChange={(e) => setFormAction(e.target.value)}
              placeholder="What was done immediately after the incident?"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Btn color="#6b7280" variant="outline" onClick={() => { setShowReport(false); resetForm(); }}>Cancel</Btn>
            <Btn color="#ef4444" onClick={submitReport}>
              <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Submit Report</span>
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
