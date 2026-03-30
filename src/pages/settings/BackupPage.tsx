import { useState, useEffect, useCallback } from "react";
import {
  HardDrive, Database, Clock, Shield, Download, Trash2, RotateCcw,
  CheckCircle2, AlertTriangle, FileJson, FileSpreadsheet, FileText,
  Archive, Info, Settings, Calendar, Upload, RefreshCw, Lock,
} from "lucide-react";
import { Badge, Btn, StatCard, Modal } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

/* ── Types ─────────────────────────────────────────────────────── */
interface BackupRow {
  id: string;
  date: string;
  time: string;
  type: "Auto" | "Manual";
  size: string;
  records: string;
  status: "success" | "partial";
}

interface ExportRow {
  date: string;
  format: string;
  size: string;
  exportedBy: string;
}

/* ── Seed data ─────────────────────────────────────────────────── */
const seedBackups: BackupRow[] = [
  { id: "b1", date: "Mar 30, 2026", time: "3:00 AM", type: "Auto", size: "28.4 MB", records: "4,082", status: "success" },
  { id: "b2", date: "Mar 29, 2026", time: "3:00 AM", type: "Auto", size: "28.2 MB", records: "4,067", status: "success" },
  { id: "b3", date: "Mar 28, 2026", time: "3:00 AM", type: "Auto", size: "28.1 MB", records: "4,051", status: "success" },
  { id: "b4", date: "Mar 27, 2026", time: "11:42 AM", type: "Manual", size: "28.0 MB", records: "4,038", status: "success" },
  { id: "b5", date: "Mar 27, 2026", time: "3:00 AM", type: "Auto", size: "27.9 MB", records: "4,035", status: "success" },
  { id: "b6", date: "Mar 26, 2026", time: "3:00 AM", type: "Auto", size: "27.8 MB", records: "4,021", status: "success" },
  { id: "b7", date: "Mar 25, 2026", time: "3:00 AM", type: "Auto", size: "27.6 MB", records: "4,008", status: "success" },
  { id: "b8", date: "Mar 24, 2026", time: "3:00 AM", type: "Auto", size: "27.5 MB", records: "3,995", status: "partial" },
  { id: "b9", date: "Mar 23, 2026", time: "3:00 AM", type: "Auto", size: "27.3 MB", records: "3,982", status: "success" },
  { id: "b10", date: "Mar 22, 2026", time: "3:00 AM", type: "Auto", size: "27.1 MB", records: "3,970", status: "success" },
  { id: "b11", date: "Mar 21, 2026", time: "3:00 AM", type: "Auto", size: "26.9 MB", records: "3,958", status: "success" },
  { id: "b12", date: "Mar 20, 2026", time: "3:00 AM", type: "Auto", size: "26.7 MB", records: "3,945", status: "success" },
  { id: "b13", date: "Mar 19, 2026", time: "3:00 AM", type: "Auto", size: "26.5 MB", records: "3,933", status: "success" },
  { id: "b14", date: "Mar 18, 2026", time: "3:00 AM", type: "Auto", size: "26.3 MB", records: "3,920", status: "success" },
  { id: "b15", date: "Mar 17, 2026", time: "3:00 AM", type: "Auto", size: "26.1 MB", records: "3,908", status: "success" },
];

const seedExports: ExportRow[] = [
  { date: "Mar 25, 2026", format: "JSON", size: "14.2 MB", exportedBy: "Pavel Pilich" },
  { date: "Mar 15, 2026", format: "CSV", size: "8.7 MB", exportedBy: "Pavel Pilich" },
  { date: "Mar 1, 2026", format: "Full ZIP", size: "1.9 GB", exportedBy: "Pavel Pilich" },
  { date: "Feb 15, 2026", format: "PDF", size: "2.4 MB", exportedBy: "Sarah Johnson" },
];

/* ── Backup categories ─────────────────────────────────────────── */
const backupCategories = [
  { key: "projects", label: "Projects & CRM Data", detail: "1,247 records" },
  { key: "estimates", label: "Estimates & Line Items", detail: "342 records" },
  { key: "invoices", label: "Invoices & Payments", detail: "156 records" },
  { key: "contracts", label: "Contracts & Signatures", detail: "42 records" },
  { key: "inspections", label: "Inspection Reports", detail: "89 records" },
  { key: "storm", label: "Storm Intelligence Data", detail: "12 events" },
  { key: "employees", label: "Employee & Sub Records", detail: "32 people" },
  { key: "compliance", label: "Compliance Documents", detail: "280 files" },
  { key: "photos", label: "Photos & Attachments", detail: "1,847 files — 1.8 GB" },
  { key: "training", label: "Training Progress", detail: "25 modules" },
  { key: "quickbooks", label: "QuickBooks Sync Data", detail: "" },
  { key: "settings", label: "System Settings & Templates", detail: "" },
];

const exportCategories = [
  "Projects & CRM", "Estimates & Supplements", "Invoices & Financial",
  "Contracts", "Inspections", "Storm Data", "Employee Records",
  "Compliance Documents", "Training Data", "Photos & Files",
];

const backupSteps = [
  "Backing up projects...", "Backing up estimates...", "Backing up invoices...",
  "Backing up contracts...", "Backing up inspections...", "Backing up photos...",
  "Backing up compliance data...", "Backing up settings...", "Finalizing backup...",
];

/* ── Component ─────────────────────────────────────────────────── */
export default function BackupPage() {
  const addToast = useAppStore((s) => s.addToast);

  /* state */
  const [backups, setBackups] = useState<BackupRow[]>(seedBackups);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupTime, setBackupTime] = useState("03:00");
  const [retention, setRetention] = useState(90);
  const [categories, setCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(backupCategories.map((c) => [c.key, true]))
  );

  /* export state */
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf" | "zip">("json");
  const [exportAll, setExportAll] = useState(true);
  const [exportCats, setExportCats] = useState<Record<string, boolean>>(
    Object.fromEntries(exportCategories.map((c) => [c, true]))
  );
  const [exports] = useState<ExportRow[]>(seedExports);

  /* modals */
  const [restoreTarget, setRestoreTarget] = useState<BackupRow | null>(null);
  const [restoreInput, setRestoreInput] = useState("");
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoreDone, setRestoreDone] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BackupRow | null>(null);

  const [creating, setCreating] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [createDone, setCreateDone] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  /* toggle category */
  const toggleCat = (key: string) => setCategories((p) => ({ ...p, [key]: !p[key] }));

  /* toggle export categories */
  const toggleExportCat = (cat: string) => {
    setExportCats((p) => {
      const next = { ...p, [cat]: !p[cat] };
      setExportAll(Object.values(next).every(Boolean));
      return next;
    });
  };
  const toggleExportAll = () => {
    const newVal = !exportAll;
    setExportAll(newVal);
    setExportCats(Object.fromEntries(exportCategories.map((c) => [c, newVal])));
  };

  /* create backup */
  const startCreate = useCallback(() => {
    setCreating(true);
    setCreateStep(0);
    setCreateDone(false);
  }, []);

  useEffect(() => {
    if (!creating || createDone) return;
    if (createStep >= backupSteps.length) {
      setCreateDone(true);
      const newRow: BackupRow = {
        id: `b-manual-${Date.now()}`,
        date: "Mar 30, 2026",
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        type: "Manual",
        size: "28.4 MB",
        records: "4,082",
        status: "success",
      };
      setBackups((prev) => [newRow, ...prev]);
      return;
    }
    const timer = setTimeout(() => setCreateStep((s) => s + 1), 300);
    return () => clearTimeout(timer);
  }, [creating, createStep, createDone]);

  /* restore */
  const startRestore = useCallback(() => {
    setRestoring(true);
    setRestoreProgress(0);
    setRestoreDone(false);
  }, []);

  useEffect(() => {
    if (!restoring || restoreDone) return;
    if (restoreProgress >= 100) {
      setRestoreDone(true);
      addToast("Restore complete — all data restored successfully", "success");
      return;
    }
    const timer = setTimeout(() => setRestoreProgress((p) => Math.min(p + 5, 100)), 80);
    return () => clearTimeout(timer);
  }, [restoring, restoreProgress, restoreDone, addToast]);

  /* export data */
  const handleExport = useCallback(() => {
    if (exportFormat === "pdf") {
      addToast("PDF report generated — smart-construction-report.pdf", "success");
      return;
    }
    if (exportFormat === "zip") {
      setExporting(true);
      setExportProgress(0);
      return;
    }
    const fname = exportFormat === "json" ? "smart-construction-export.json" : "smart-construction-data.csv";
    addToast(`Downloaded ${fname}`, "success");
  }, [exportFormat, addToast]);

  useEffect(() => {
    if (!exporting) return;
    if (exportProgress >= 100) {
      setExporting(false);
      setExportProgress(0);
      addToast("Full archive downloaded — smart-construction-full-backup.zip", "success");
      return;
    }
    const timer = setTimeout(() => setExportProgress((p) => Math.min(p + 4, 100)), 60);
    return () => clearTimeout(timer);
  }, [exporting, exportProgress, addToast]);

  /* delete */
  const confirmDelete = () => {
    if (!deleteTarget) return;
    setBackups((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    addToast(`Backup from ${deleteTarget.date} deleted`, "info");
    setDeleteTarget(null);
  };

  /* save config */
  const saveConfig = () => addToast("Backup configuration saved", "success");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HardDrive className="w-7 h-7 text-blue-600" />
            Backup &amp; Data Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Protect your data with automated backups and easy exports</p>
        </div>
        <Btn color="#3b82f6" onClick={startCreate}>
          <span className="flex items-center gap-1.5"><Upload className="w-4 h-4" /> Create Backup Now</span>
        </Btn>
      </div>

      {/* Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <span className="text-green-800 font-semibold text-sm">System Healthy</span>
            <span className="text-green-700 text-sm ml-2">— Last backup: Today 3:00 AM — Next: Tomorrow 3:00 AM</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Auto-backup</span>
            <button
              onClick={() => setAutoBackup(!autoBackup)}
              className={`w-10 h-5 rounded-full transition relative ${autoBackup ? "bg-green-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoBackup ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
          <Badge color="#059669">90 days retention</Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Database} label="Total Backups" value={87} sub="Since Dec 2025" color="#3b82f6" />
        <StatCard icon={HardDrive} label="Storage Used" value="2.4 GB" sub="of 10 GB" color="#8b5cf6" />
        <StatCard icon={Clock} label="Last Backup" value="3 hrs ago" sub="Auto — Success" color="#059669" />
        <StatCard icon={Calendar} label="Retention Days" value={retention} sub="Configurable" color="#f59e0b" />
        <StatCard icon={RotateCcw} label="Restores" value={0} sub="No restores needed" color="#6366f1" />
        <StatCard icon={Download} label="Export History" value={4} sub="Last: Mar 25" color="#ec4899" />
      </div>

      {/* Auto-Backup Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-blue-600" /> Auto-Backup Configuration
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Schedule — Daily at</label>
            <input
              type="time"
              value={backupTime}
              onChange={(e) => setBackupTime(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36"
            />
            <span className="text-xs text-gray-500 ml-2">CST</span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Retention: {retention} days</label>
            <input
              type="range" min={30} max={365} value={retention}
              onChange={(e) => setRetention(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400"><span>30</span><span>365</span></div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">What&apos;s Backed Up</h3>
          <div className="grid grid-cols-3 gap-2">
            {backupCategories.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 hover:bg-blue-50 transition cursor-pointer">
                <input type="checkbox" checked={categories[c.key]} onChange={() => toggleCat(c.key)} className="accent-blue-600 w-4 h-4" />
                <span>{c.label}</span>
                {c.detail && <span className="text-xs text-gray-400 ml-auto">{c.detail}</span>}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Btn color="#3b82f6" onClick={saveConfig}>Save Configuration</Btn>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-600" /> Backup History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="pb-2 text-gray-500 font-medium">Date</th>
                <th className="pb-2 text-gray-500 font-medium">Time</th>
                <th className="pb-2 text-gray-500 font-medium">Type</th>
                <th className="pb-2 text-gray-500 font-medium">Size</th>
                <th className="pb-2 text-gray-500 font-medium">Records</th>
                <th className="pb-2 text-gray-500 font-medium">Status</th>
                <th className="pb-2 text-gray-500 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 text-gray-800 font-medium">{b.date}</td>
                  <td className="py-2.5 text-gray-600">{b.time}</td>
                  <td className="py-2.5">
                    <Badge color={b.type === "Manual" ? "#8b5cf6" : "#3b82f6"} sm>{b.type}</Badge>
                  </td>
                  <td className="py-2.5 text-gray-600">{b.size}</td>
                  <td className="py-2.5 text-gray-600">{b.records}</td>
                  <td className="py-2.5">
                    {b.status === "success" ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" /> Partial
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right space-x-1">
                    <Btn size="sm" color="#059669" variant="outline" onClick={() => { setRestoreTarget(b); setRestoreInput(""); setRestoring(false); setRestoreDone(false); setRestoreProgress(0); }}>
                      <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Restore</span>
                    </Btn>
                    <Btn size="sm" color="#3b82f6" variant="outline" onClick={() => addToast(`Downloaded backup-${b.date.replace(/,?\s/g, "-").toLowerCase()}.zip`, "success")}>
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" /> Download</span>
                    </Btn>
                    <Btn size="sm" color="#ef4444" variant="outline" onClick={() => setDeleteTarget(b)}>
                      <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</span>
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Export Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
          <Download className="w-5 h-5 text-blue-600" /> Export All Data — No Lock-In Guarantee
        </h2>
        <p className="text-sm text-gray-500 mb-4">Your data belongs to you. Export everything at any time.</p>

        {/* Format selection */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Export Format</h3>
          <div className="flex gap-3">
            {([
              { id: "json" as const, label: "JSON", desc: "Complete, machine-readable", icon: FileJson },
              { id: "csv" as const, label: "CSV", desc: "Spreadsheet-friendly, per table", icon: FileSpreadsheet },
              { id: "pdf" as const, label: "PDF Reports", desc: "Human-readable summaries", icon: FileText },
              { id: "zip" as const, label: "Full Archive", desc: "ZIP with all files + data", icon: Archive },
            ]).map((f) => (
              <label
                key={f.id}
                className={`flex-1 border rounded-xl p-3 cursor-pointer transition ${
                  exportFormat === f.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input type="radio" name="format" checked={exportFormat === f.id} onChange={() => setExportFormat(f.id)} className="sr-only" />
                <div className="flex items-center gap-2">
                  <f.icon className={`w-5 h-5 ${exportFormat === f.id ? "text-blue-600" : "text-gray-400"}`} />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{f.label}</div>
                    <div className="text-xs text-gray-500">{f.desc}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Data categories */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Data Categories</h3>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-blue-50 rounded-lg px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={exportAll} onChange={toggleExportAll} className="accent-blue-600 w-4 h-4" />
              All Data (select all)
            </label>
            {exportCategories.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 hover:bg-blue-50 transition cursor-pointer">
                <input type="checkbox" checked={exportCats[c]} onChange={() => toggleExportCat(c)} className="accent-blue-600 w-4 h-4" />
                {c}
              </label>
            ))}
          </div>
        </div>

        <Btn color="#3b82f6" onClick={handleExport}>
          <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> Export Data</span>
        </Btn>

        {/* Export progress (ZIP) */}
        {exporting && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="text-sm font-medium text-blue-800 mb-2">Preparing archive... {exportProgress}%</div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 rounded-full h-2 transition-all" style={{ width: `${exportProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Export History */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-blue-600" /> Export History
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-2 text-gray-500 font-medium">Date</th>
              <th className="pb-2 text-gray-500 font-medium">Format</th>
              <th className="pb-2 text-gray-500 font-medium">Size</th>
              <th className="pb-2 text-gray-500 font-medium">Exported By</th>
            </tr>
          </thead>
          <tbody>
            {exports.map((e, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2.5 text-gray-800">{e.date}</td>
                <td className="py-2.5"><Badge color="#3b82f6" sm>{e.format}</Badge></td>
                <td className="py-2.5 text-gray-600">{e.size}</td>
                <td className="py-2.5 text-gray-600">{e.exportedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-600" /> Storage Usage
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-sm text-gray-700 font-medium">2.4 GB <span className="text-gray-400">of 10 GB</span></div>
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: "24%" }} />
          </div>
          <span className="text-sm text-gray-500 font-medium">24%</span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {([
            { label: "Photos & Files", size: "1.8 GB", pct: 75, color: "#3b82f6" },
            { label: "Backups", size: "420 MB", pct: 18, color: "#8b5cf6" },
            { label: "Data", size: "180 MB", pct: 7, color: "#059669" },
          ]).map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">{s.label}</span>
                <span className="text-xs text-gray-500">{s.pct}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 mb-1">
                <div className="rounded-full h-2" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
              <span className="text-xs text-gray-500">{s.size}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Btn color="#3b82f6" variant="outline" onClick={() => addToast("Opening storage manager...", "info")}>Manage Storage</Btn>
          <Btn color="#8b5cf6" onClick={() => addToast("Storage upgrade options coming soon", "info")}>Upgrade Storage</Btn>
        </div>
      </div>

      {/* No Lock-In Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-blue-900 font-bold text-sm mb-1">No Vendor Lock-In</h3>
          <p className="text-blue-800 text-sm">
            Smart Construction believes your data is yours. You can export ALL your data at any time in standard formats (JSON, CSV, PDF).
            All photos, documents, contracts, and records are included. If you ever decide to switch platforms, your data goes with you
            — no export fees, no restrictions, no delays.
          </p>
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}

      {/* Restore Modal */}
      <Modal open={!!restoreTarget} onClose={() => setRestoreTarget(null)} title="Restore Backup">
        {restoreTarget && !restoring && !restoreDone && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-yellow-800">Restore backup from {restoreTarget.date}?</div>
                <div className="text-sm text-yellow-700 mt-1">
                  This will replace ALL current data with the backup from {restoreTarget.date} {restoreTarget.time}.
                </div>
                <div className="text-sm text-yellow-700 mt-1">Current data will be backed up before restore.</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Type <span className="font-bold text-red-600">RESTORE</span> to confirm
              </label>
              <input
                value={restoreInput}
                onChange={(e) => setRestoreInput(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
                placeholder="Type RESTORE"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Btn color="#6b7280" variant="outline" onClick={() => setRestoreTarget(null)}>Cancel</Btn>
              <Btn color="#ef4444" disabled={restoreInput !== "RESTORE"} onClick={startRestore}>Restore Now</Btn>
            </div>
          </div>
        )}
        {restoring && !restoreDone && (
          <div className="space-y-3 py-4">
            <div className="text-sm font-medium text-gray-800">Restoring... {restoreProgress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 rounded-full h-3 transition-all" style={{ width: `${restoreProgress}%` }} />
            </div>
            <p className="text-xs text-gray-500">Please do not close this window.</p>
          </div>
        )}
        {restoreDone && (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div className="text-lg font-bold text-gray-900">Restore Complete</div>
            <p className="text-sm text-gray-500">All data has been restored from {restoreTarget?.date} {restoreTarget?.time}.</p>
            <Btn color="#3b82f6" onClick={() => setRestoreTarget(null)}>Done</Btn>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Backup">
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete the backup from <strong>{deleteTarget.date} {deleteTarget.time}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Btn color="#6b7280" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
              <Btn color="#ef4444" onClick={confirmDelete}>Delete Backup</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Backup Modal */}
      <Modal open={creating} onClose={() => { if (createDone) setCreating(false); }} title="Create Manual Backup">
        {!createDone ? (
          <div className="space-y-3 py-4">
            <div className="text-sm font-medium text-gray-800">Creating manual backup...</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 rounded-full h-3 transition-all" style={{ width: `${(createStep / backupSteps.length) * 100}%` }} />
            </div>
            <div className="space-y-1">
              {backupSteps.map((step, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${i < createStep ? "text-green-600" : i === createStep ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                  {i < createStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5" />}
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div className="text-lg font-bold text-gray-900">Backup Complete</div>
            <p className="text-sm text-gray-500">28.4 MB, 4,082 records backed up successfully.</p>
            <Btn color="#3b82f6" onClick={() => setCreating(false)}>Done</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
