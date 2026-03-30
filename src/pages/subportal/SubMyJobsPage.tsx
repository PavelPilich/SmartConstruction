import { useState } from "react";
import { Badge, Btn, Modal, FileUploadSim } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import { CheckCircle2, Camera, FileText, Clock, MapPin, DollarSign, Send, AlertTriangle } from "lucide-react";

interface JobTask { name: string; done: boolean; }
interface MyJob {
  id: string; project: string; customer: string; address: string; scope: string; pay: number;
  startDate: string; dueDate: string; status: "Scheduled" | "In Progress" | "Completed";
  progress: number; beforePhotos: string[]; afterPhotos: string[];
  tasks: JobTask[]; cocSigned: boolean; salesRep: string;
}

const initialJobs: MyJob[] = [
  { id: "j1", project: "MN-0247", customer: "Thompson", address: "4821 Maple Dr, Plymouth, MN 55441", scope: "Complete roof replacement — 24.5 sq OC Duration architectural shingles, tear-off, underlayment, ice shield, ridge vent, flashings, cleanup", pay: 4800, startDate: "2026-03-28", dueDate: "2026-04-02", status: "In Progress", progress: 60, beforePhotos: ["before-south-slope.jpg", "before-north-slope.jpg", "before-gutters.jpg"], afterPhotos: ["after-south-slope.jpg"], tasks: [{ name: "Tear-off old shingles", done: true }, { name: "Install underlayment + ice shield", done: true }, { name: "Install new shingles", done: false }, { name: "Flashings + ridge vent", done: false }, { name: "Cleanup + magnetic sweep", done: false }], cocSigned: false, salesRep: "Pavel Pilich" },
  { id: "j2", project: "MN-0089", customer: "Garcia", address: "612 Oak Ave, Maple Grove, MN 55369", scope: "Vinyl siding install — east & north walls, J-channel, corners, trim", pay: 4200, startDate: "2026-03-31", dueDate: "2026-04-03", status: "Scheduled", progress: 0, beforePhotos: [], afterPhotos: [], tasks: [{ name: "Remove old siding", done: false }, { name: "Install housewrap", done: false }, { name: "Install new siding panels", done: false }, { name: "Trim + J-channel", done: false }, { name: "Cleanup", done: false }], cocSigned: false, salesRep: "Pavel Pilich" },
  { id: "j3", project: "MN-0156", customer: "Chen", address: "7234 Cedar Ln, Maple Grove, MN 55369", scope: "8 window replacement — Pella 250 series double-hung", pay: 3600, startDate: "2026-03-20", dueDate: "2026-03-22", status: "Completed", progress: 100, beforePhotos: ["before-windows-front.jpg", "before-windows-side.jpg"], afterPhotos: ["after-windows-front.jpg", "after-windows-side.jpg", "after-windows-detail.jpg"], tasks: [{ name: "Remove old windows", done: true }, { name: "Prep openings", done: true }, { name: "Install new windows", done: true }, { name: "Insulate + trim", done: true }, { name: "Cleanup", done: true }], cocSigned: true, salesRep: "Sarah Johnson" },
];

export default function SubMyJobsPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [jobs, setJobs] = useState<MyJob[]>(initialJobs);
  const [tab, setTab] = useState<"Active" | "Completed" | "All">("Active");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCoc, setShowCoc] = useState<string | null>(null);

  const filtered = tab === "All" ? jobs : tab === "Active" ? jobs.filter((j) => j.status !== "Completed") : jobs.filter((j) => j.status === "Completed");

  const toggleTask = (jobId: string, taskIdx: number) => {
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, tasks: j.tasks.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t), progress: Math.round(j.tasks.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t).filter((t) => t.done).length / j.tasks.length * 100) } : j));
  };

  const uploadPhoto = (jobId: string, type: "before" | "after") => {
    const name = `${type}-photo-${Date.now().toString(36)}.jpg`;
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, [type === "before" ? "beforePhotos" : "afterPhotos"]: [...(type === "before" ? j.beforePhotos : j.afterPhotos), name] } : j));
    addToast(`${type === "before" ? "Before" : "After"} photo uploaded`, "success");
  };

  const markComplete = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    if (job.beforePhotos.length === 0) { addToast("Upload at least 1 before photo", "error"); return; }
    if (job.afterPhotos.length === 0) { addToast("Upload at least 1 after photo", "error"); return; }
    if (job.tasks.some((t) => !t.done)) { addToast("Complete all tasks first", "error"); return; }
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: "Completed", progress: 100 } : j));
    addToast("Job marked complete! COC ready for customer signature.", "success");
  };

  const startJob = (jobId: string) => {
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: "In Progress" } : j));
    addToast("Job started", "success");
  };

  const cocJob = jobs.find((j) => j.id === showCoc);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">My Jobs</h2>

      <div className="flex gap-2">
        {(["Active", "Completed", "All"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-xs rounded-full font-medium transition ${tab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No jobs found.</div>}

      <div className="space-y-4">
        {filtered.map((job) => (
          <div key={job.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 cursor-pointer hover:bg-gray-50 transition" onClick={() => setExpanded(expanded === job.id ? null : job.id)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{job.project} — {job.customer}</span>
                    <Badge color={job.status === "Completed" ? "#10b981" : job.status === "In Progress" ? "#f59e0b" : "#3b82f6"}>{job.status}</Badge>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{job.address}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Sales Rep: <span className="font-medium text-gray-700">{job.salesRep}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">${job.pay.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400">Your pay</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span><span>{job.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${job.progress}%`, background: job.progress === 100 ? "#10b981" : "#3b82f6" }} />
                </div>
              </div>
            </div>

            {/* Expanded Detail */}
            {expanded === job.id && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700"><strong>Scope:</strong> {job.scope}</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Start:</span> <span className="font-medium">{job.startDate}</span></div>
                  <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Due:</span> <span className="font-medium">{job.dueDate}</span></div>
                </div>

                {/* Tasks Checklist */}
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-2">Task Checklist</div>
                  <div className="space-y-1.5">
                    {job.tasks.map((task, i) => (
                      <label key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                        <input type="checkbox" checked={task.done} onChange={() => toggleTask(job.id, i)} className="w-4 h-4 rounded border-gray-300 text-blue-600" disabled={job.status === "Completed"} />
                        <span className={`text-sm ${task.done ? "line-through text-gray-400" : "text-gray-700"}`}>{task.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Before Photos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">Before Photos ({job.beforePhotos.length})</span>
                    {job.status !== "Completed" && <Btn size="sm" color="#3b82f6" onClick={() => uploadPhoto(job.id, "before")}><Camera className="w-3.5 h-3.5 mr-1 inline" />Upload</Btn>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {job.beforePhotos.map((p, i) => (
                      <div key={i} className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center text-[8px] text-orange-600 font-medium text-center p-1">{p}</div>
                    ))}
                    {job.beforePhotos.length === 0 && <div className="text-xs text-gray-400 italic">No before photos yet</div>}
                  </div>
                </div>

                {/* After Photos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">After Photos ({job.afterPhotos.length})</span>
                    {job.status !== "Completed" && <Btn size="sm" color="#10b981" onClick={() => uploadPhoto(job.id, "after")}><Camera className="w-3.5 h-3.5 mr-1 inline" />Upload</Btn>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {job.afterPhotos.map((p, i) => (
                      <div key={i} className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center text-[8px] text-green-600 font-medium text-center p-1">{p}</div>
                    ))}
                    {job.afterPhotos.length === 0 && <div className="text-xs text-gray-400 italic">No after photos yet</div>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-200">
                  {job.status === "Scheduled" && <Btn color="#3b82f6" onClick={() => startJob(job.id)}>Start Job</Btn>}
                  {job.status === "In Progress" && <Btn color="#10b981" onClick={() => markComplete(job.id)}><CheckCircle2 className="w-4 h-4 mr-1 inline" />Mark Complete</Btn>}
                  <Btn color="#8b5cf6" variant="outline" onClick={() => setShowCoc(job.id)}><FileText className="w-4 h-4 mr-1 inline" />{job.cocSigned ? "View COC" : "Generate COC"}</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* COC Modal */}
      <Modal open={!!showCoc} onClose={() => setShowCoc(null)} title="Certificate of Completion" wide>
        {cocJob && (
          <div className="space-y-4">
            {cocJob.cocSigned && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />This COC has been signed by the customer.</div>}
            <div className="bg-white border-2 border-gray-300 rounded-xl p-8" style={{ fontFamily: "Georgia, serif" }}>
              <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
                <div className="text-xl font-bold text-gray-900">Smart Construction & Remodeling Inc.</div>
                <div className="text-sm text-gray-600">123 Main Street, Minneapolis, MN 55401 | (612) 555-0100</div>
                <div className="text-sm text-gray-600">MN License #BC-789012</div>
                <div className="text-lg font-bold text-blue-900 mt-4">CERTIFICATE OF COMPLETION</div>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 mb-4">This certifies that the work described below has been completed in accordance with the contract dated {cocJob.startDate} for the following project:</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
                <div><strong>Project:</strong> {cocJob.project}</div>
                <div><strong>Customer:</strong> {cocJob.customer}</div>
                <div><strong>Address:</strong> {cocJob.address}</div>
                <div><strong>Scope:</strong> {cocJob.scope}</div>
                <div><strong>Completion Date:</strong> {new Date().toLocaleDateString()}</div>
              </div>
              <p className="text-sm text-gray-700 mb-6">The above work has been inspected and completed to the satisfaction of all parties. All materials and workmanship meet or exceed industry standards and contract specifications.</p>
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="border-t-2 border-gray-400 pt-2">
                  <div className="text-sm italic text-gray-600">Contractor Signature</div>
                  <div className="text-lg font-bold mt-1" style={{ fontFamily: "'Brush Script MT', cursive" }}>Mike Rodriguez</div>
                  <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
                </div>
                <div className="border-t-2 border-gray-400 pt-2">
                  <div className="text-sm italic text-gray-600">Customer Signature</div>
                  {cocJob.cocSigned ? (
                    <div className="text-lg font-bold mt-1" style={{ fontFamily: "'Brush Script MT', cursive" }}>{cocJob.customer}</div>
                  ) : (
                    <div className="text-sm text-gray-400 italic mt-1">Awaiting signature</div>
                  )}
                  <div className="text-xs text-gray-500">{cocJob.cocSigned ? new Date().toLocaleDateString() : ""}</div>
                </div>
              </div>
            </div>
            {!cocJob.cocSigned && (
              <div className="flex justify-end gap-2">
                <Btn color="#3b82f6" onClick={() => { addToast("COC sent to customer for signature", "success"); setShowCoc(null); }}>
                  <Send className="w-4 h-4 mr-1 inline" />Send to Customer
                </Btn>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
