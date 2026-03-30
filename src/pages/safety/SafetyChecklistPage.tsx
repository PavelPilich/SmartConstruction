import { useState } from "react";
import { Badge, Btn, StatCard, Modal, SmartSelect, FileUploadSim } from "../../components/ui";
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, XCircle, Clock, Camera,
  Plus, Printer, Flag, ChevronDown, ChevronUp, CloudSun,
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ChecklistItem {
  id: number;
  label: string;
  section: string;
  checked: boolean;
  photo: string;
  notes: string;
}

interface Checklist {
  id: string;
  foreman: string;
  crew: string;
  project: string;
  date: string;
  time: string;
  status: "complete" | "issues" | "not-required";
  score: number;
  total: number;
  issues: string[];
  items: ChecklistItem[];
  weather: string;
}

/* ------------------------------------------------------------------ */
/*  Default 20-item OSHA checklist template                            */
/* ------------------------------------------------------------------ */
function defaultItems(): ChecklistItem[] {
  const raw = [
    { s: "PPE", l: "All crew wearing hard hats" },
    { s: "PPE", l: "Safety glasses/goggles available" },
    { s: "PPE", l: "Work gloves worn by all" },
    { s: "PPE", l: "Safety harnesses inspected (if >6ft)" },
    { s: "PPE", l: "Steel-toe boots on all crew" },
    { s: "Fall Protection", l: "Roof brackets/jacks installed" },
    { s: "Fall Protection", l: "Guardrails in place where needed" },
    { s: "Fall Protection", l: "Ladder secured and inspected" },
    { s: "Fall Protection", l: "Safety nets/catch platforms if needed" },
    { s: "Fall Protection", l: "Warning line system for flat roofs" },
    { s: "Equipment", l: "Power tools inspected" },
    { s: "Equipment", l: "Extension cords in good condition" },
    { s: "Equipment", l: "Nail guns with safety engaged" },
    { s: "Equipment", l: "Scaffolding inspected (if used)" },
    { s: "Site Safety", l: "Work zone clearly marked" },
    { s: "Site Safety", l: "Debris chute in place (if 2+ stories)" },
    { s: "Site Safety", l: "First aid kit fully stocked" },
    { s: "Site Safety", l: "Fire extinguisher accessible" },
    { s: "Site Safety", l: "Emergency contact info posted" },
    { s: "Site Safety", l: "Tailgate safety meeting conducted" },
  ];
  return raw.map((r, i) => ({
    id: i + 1,
    label: r.l,
    section: r.s,
    checked: true,
    photo: "",
    notes: "",
  }));
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
function makeMockChecklists(): Checklist[] {
  const full = defaultItems();
  const issueItems = defaultItems().map((it) =>
    it.id === 4
      ? { ...it, checked: false, notes: "Harness inspection needed — fraying detected on unit #3" }
      : it.id === 17
        ? { ...it, checked: false, notes: "First aid kit low — missing burn cream and eye wash" }
        : it,
  );
  return [
    { id: "CL-001", foreman: "Mike Rodriguez", crew: "Alpha Team", project: "MN-0247 Thompson", date: "Mar 30, 2026", time: "7:05 AM", status: "complete", score: 20, total: 20, issues: [], items: full, weather: "Sunny, 52\u00b0F" },
    { id: "CL-002", foreman: "James Wilson", crew: "Bravo Team", project: "MN-0089 Garcia", date: "Mar 30, 2026", time: "7:15 AM", status: "issues", score: 18, total: 20, issues: ["Harness inspection needed", "First aid kit low"], items: issueItems, weather: "Partly Cloudy, 48\u00b0F" },
    { id: "CL-003", foreman: "Carlos Mendez", crew: "Charlie Team", project: "MN-0156 Chen", date: "Mar 30, 2026", time: "6:55 AM", status: "complete", score: 20, total: 20, issues: [], items: full, weather: "Clear, 45\u00b0F" },
    { id: "CL-004", foreman: "David Park", crew: "Delta Team", project: "MN-0312 Andersen", date: "Mar 30, 2026", time: "7:20 AM", status: "complete", score: 20, total: 20, issues: [], items: full, weather: "Overcast, 50\u00b0F" },
    { id: "CL-005", foreman: "Tony Harris", crew: "Echo Team", project: "Off Duty", date: "Mar 30, 2026", time: "", status: "not-required", score: 0, total: 20, issues: [], items: [], weather: "" },
    { id: "CL-006", foreman: "Sam Chen", crew: "Foxtrot Team", project: "Available", date: "Mar 30, 2026", time: "", status: "not-required", score: 0, total: 20, issues: [], items: [], weather: "" },
  ];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function SafetyChecklistPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [checklists, setChecklists] = useState<Checklist[]>(makeMockChecklists);
  const [showNew, setShowNew] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);

  // New checklist form state
  const [newProject, setNewProject] = useState("");
  const [newForeman, setNewForeman] = useState("");
  const [newCrew, setNewCrew] = useState("");
  const [newWeather, setNewWeather] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newItems, setNewItems] = useState<ChecklistItem[]>(defaultItems);

  const completedToday = checklists.filter((c) => c.status === "complete" || c.status === "issues").length;
  const issueCount = checklists.filter((c) => c.status === "issues").length;
  const complianceRate = completedToday > 0
    ? Math.round((checklists.filter((c) => c.status === "complete").length / completedToday) * 100)
    : 100;

  const viewChecklist = checklists.find((c) => c.id === viewId);

  function toggleItem(idx: number) {
    setNewItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, checked: !it.checked } : it)),
    );
  }

  function setItemPhoto(idx: number, photo: string) {
    setNewItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, photo } : it)),
    );
  }

  function setItemNotes(idx: number, notes: string) {
    setNewItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, notes } : it)),
    );
  }

  function submitChecklist() {
    // Validate: unchecked items must have notes
    const uncheckedNoNotes = newItems.filter((it) => !it.checked && !it.notes.trim());
    if (uncheckedNoNotes.length > 0) {
      addToast(`Please add notes for ${uncheckedNoNotes.length} unchecked item(s) explaining why not compliant.`, "error");
      return;
    }
    if (!newProject || !newForeman || !newCrew) {
      addToast("Please fill in project, foreman, and crew fields.", "error");
      return;
    }

    const score = newItems.filter((it) => it.checked).length;
    const issues = newItems.filter((it) => !it.checked).map((it) => it.label);
    const cl: Checklist = {
      id: `CL-${String(Date.now()).slice(-3)}`,
      foreman: newForeman,
      crew: newCrew,
      project: newProject,
      date: "Mar 30, 2026",
      time: newTime || new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      status: issues.length > 0 ? "issues" : "complete",
      score,
      total: 20,
      issues,
      items: newItems,
      weather: newWeather,
    };

    setChecklists((prev) => [cl, ...prev]);
    setShowNew(false);
    resetForm();
    addToast("Safety checklist submitted successfully!", "success");
  }

  function resetForm() {
    setNewProject("");
    setNewForeman("");
    setNewCrew("");
    setNewWeather("");
    setNewTime("");
    setNewItems(defaultItems());
  }

  /* Status rendering helpers */
  function statusBadge(status: Checklist["status"]) {
    switch (status) {
      case "complete":
        return <Badge color="#22c55e"><CheckCircle2 className="w-3 h-3" /> Complete</Badge>;
      case "issues":
        return <Badge color="#f59e0b"><AlertTriangle className="w-3 h-3" /> Issues Found</Badge>;
      case "not-required":
        return <Badge color="#6b7280"><XCircle className="w-3 h-3" /> Not Required</Badge>;
    }
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
            <ClipboardCheck className="w-7 h-7 text-blue-600" /> Daily Safety Checklists
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">OSHA Compliance</p>
        </div>
        <Btn color="#3b82f6" onClick={() => setShowNew(true)}>
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> New Checklist</span>
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} label="Completed Today" value={completedToday} color="#22c55e" />
        <StatCard icon={ClipboardCheck} label="This Week" value={22} color="#3b82f6" />
        <StatCard icon={ClipboardCheck} label="Compliance Rate" value={`${complianceRate}%`} color="#8b5cf6" />
        <StatCard icon={AlertTriangle} label="Open Issues" value={issueCount} color="#ef4444" />
      </div>

      {/* Today's Checklists */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Today's Checklists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checklists.map((cl) => (
            <div
              key={cl.id}
              onClick={() => cl.items.length > 0 ? setViewId(cl.id) : undefined}
              className={`bg-white rounded-xl border p-4 transition ${cl.items.length > 0 ? "cursor-pointer hover:shadow-md hover:border-blue-300" : ""} ${
                cl.status === "issues" ? "border-yellow-300 bg-yellow-50/30" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{cl.foreman}</span>
                {statusBadge(cl.status)}
              </div>
              <div className="text-sm text-gray-500">{cl.crew}</div>
              <div className="text-sm text-gray-500">{cl.project}</div>
              {cl.time && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3" /> {cl.time}
                </div>
              )}
              {cl.status !== "not-required" && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Score: {cl.score}/{cl.total}
                  </span>
                  {cl.issues.length > 0 && (
                    <Badge color="#ef4444" sm>{cl.issues.length} issue{cl.issues.length > 1 ? "s" : ""}</Badge>
                  )}
                </div>
              )}
              {cl.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  {cl.issues.map((iss, i) => (
                    <div key={i} className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {iss}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  VIEW COMPLETED CHECKLIST MODAL                               */}
      {/* ============================================================ */}
      <Modal open={!!viewChecklist} onClose={() => setViewId(null)} title={`Checklist: ${viewChecklist?.foreman || ""}`} wide>
        {viewChecklist && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-500">Crew:</span> <span className="font-medium">{viewChecklist.crew}</span></div>
              <div><span className="text-gray-500">Project:</span> <span className="font-medium">{viewChecklist.project}</span></div>
              <div><span className="text-gray-500">Time:</span> <span className="font-medium">{viewChecklist.time}</span></div>
              <div><span className="text-gray-500">Weather:</span> <span className="font-medium">{viewChecklist.weather}</span></div>
              <div><span className="text-gray-500">Score:</span> <span className="font-medium">{viewChecklist.score}/{viewChecklist.total}</span></div>
              <div>{statusBadge(viewChecklist.status)}</div>
            </div>

            {/* Items */}
            {(() => {
              const sections = [...new Set(viewChecklist.items.map((it) => it.section))];
              return sections.map((sec) => (
                <div key={sec}>
                  <h4 className="text-sm font-bold text-gray-700 mt-3 mb-1">{sec}</h4>
                  {viewChecklist.items
                    .filter((it) => it.section === sec)
                    .map((it) => (
                      <div key={it.id} className={`flex items-start gap-2 py-1.5 px-2 rounded text-sm ${!it.checked ? "bg-red-50" : ""}`}>
                        {it.checked ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <span className={it.checked ? "text-gray-700" : "text-red-700 font-medium"}>{it.label}</span>
                          {it.notes && <div className="text-xs text-red-600 mt-0.5">{it.notes}</div>}
                          {it.photo && (
                            <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                              <Camera className="w-3 h-3" /> {it.photo}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ));
            })()}

            <div className="flex gap-2 pt-3 border-t">
              <Btn color="#3b82f6" variant="outline" onClick={() => addToast("Print report sent to printer.", "info")}>
                <span className="flex items-center gap-1"><Printer className="w-4 h-4" /> Print Report</span>
              </Btn>
              <Btn color="#f59e0b" variant="outline" onClick={() => addToast("Checklist flagged for review.", "info")}>
                <span className="flex items-center gap-1"><Flag className="w-4 h-4" /> Flag for Review</span>
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/*  NEW CHECKLIST MODAL                                          */}
      {/* ============================================================ */}
      <Modal open={showNew} onClose={() => { setShowNew(false); resetForm(); }} title="New Safety Checklist" wide>
        <div className="space-y-5">
          {/* Project Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">Project Info</h3>
            <div className="grid grid-cols-2 gap-3">
              <SmartSelect
                label="Project"
                required
                value={newProject}
                onChange={setNewProject}
                options={["MN-0247 Thompson", "MN-0089 Garcia", "MN-0156 Chen", "MN-0312 Andersen"]}
                onAddNew={() => {}}
                placeholder="Select project..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foreman <span className="text-red-500">*</span></label>
                <input value={newForeman} onChange={(e) => setNewForeman(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Foreman name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crew <span className="text-red-500">*</span></label>
                <input value={newCrew} onChange={(e) => setNewCrew(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Crew name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input value="Mar 30, 2026" readOnly className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-100 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><CloudSun className="w-3.5 h-3.5" /> Weather</label>
                <input value={newWeather} onChange={(e) => setNewWeather(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="e.g. Sunny, 55\u00b0F" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
            </div>
          </div>

          {/* OSHA Safety Checklist */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-2">OSHA Safety Checklist (20 Items)</h3>
            {(() => {
              const sections = [...new Set(newItems.map((it) => it.section))];
              return sections.map((sec) => (
                <div key={sec} className="mb-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{sec}</h4>
                  <div className="space-y-2">
                    {newItems
                      .filter((it) => it.section === sec)
                      .map((it) => {
                        const idx = newItems.findIndex((x) => x.id === it.id);
                        return (
                          <div key={it.id} className={`rounded-lg border p-3 ${!it.checked ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-white"}`}>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleItem(idx)}
                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${
                                  it.checked ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-red-400"
                                }`}
                              >
                                {it.checked && <CheckCircle2 className="w-4 h-4" />}
                              </button>
                              <span className={`text-sm flex-1 ${it.checked ? "text-gray-700" : "text-red-700 font-medium"}`}>
                                {it.id}. {it.label}
                              </span>
                              <div className="w-32">
                                <FileUploadSim
                                  fileName={it.photo}
                                  onUpload={(f) => setItemPhoto(idx, f)}
                                  onClear={() => setItemPhoto(idx, "")}
                                  label={`photo-item-${it.id}`}
                                />
                              </div>
                            </div>
                            {!it.checked && (
                              <div className="mt-2 ml-9">
                                <textarea
                                  value={it.notes}
                                  onChange={(e) => setItemNotes(idx, e.target.value)}
                                  placeholder="Required: Why is this item not compliant?"
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 bg-white"
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Btn color="#6b7280" variant="outline" onClick={() => { setShowNew(false); resetForm(); }}>Cancel</Btn>
            <Btn color="#22c55e" onClick={submitChecklist}>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Submit Checklist</span>
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
