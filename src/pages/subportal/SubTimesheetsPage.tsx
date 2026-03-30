import { useState } from "react";
import { Badge, Btn, Modal, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import { Clock, Plus, Calendar } from "lucide-react";

interface TimesheetEntry { id: string; date: string; project: string; hours: number; crew: number; work: string; weather: string; status: "Approved" | "Pending" | "Rejected"; }

const initialEntries: TimesheetEntry[] = [
  { id: "ts1", date: "2026-03-30", project: "MN-0247 Thompson", hours: 8.0, crew: 6, work: "Shingle install south slope — 12 sq completed", weather: "Clear", status: "Pending" },
  { id: "ts2", date: "2026-03-29", project: "MN-0247 Thompson", hours: 7.5, crew: 6, work: "Underlayment + ice shield full deck", weather: "Partly Cloudy", status: "Approved" },
  { id: "ts3", date: "2026-03-28", project: "MN-0247 Thompson", hours: 8.0, crew: 6, work: "Complete tear-off, old shingles removed + disposal", weather: "Clear", status: "Approved" },
  { id: "ts4", date: "2026-03-27", project: "MN-0089 Garcia", hours: 6.0, crew: 4, work: "Siding east wall — panels installed, J-channel started", weather: "Overcast", status: "Approved" },
  { id: "ts5", date: "2026-03-26", project: "MN-0089 Garcia", hours: 7.0, crew: 4, work: "Remove old siding east/north, housewrap installed", weather: "Clear", status: "Approved" },
  { id: "ts6", date: "2026-03-25", project: "MN-0156 Chen", hours: 8.0, crew: 3, work: "Window install complete — 8 windows, trim + insulate", weather: "Clear", status: "Approved" },
  { id: "ts7", date: "2026-03-24", project: "MN-0156 Chen", hours: 7.0, crew: 3, work: "Remove old windows, prep openings, install 5 of 8", weather: "Clear", status: "Approved" },
  { id: "ts8", date: "2026-03-22", project: "MN-0312 Andersen", hours: 8.0, crew: 5, work: "Exterior fascia replacement — front + west side", weather: "Windy", status: "Approved" },
];

const statusColors = { Approved: "#10b981", Pending: "#f59e0b", Rejected: "#ef4444" };
const PROJECTS = ["MN-0247 Thompson", "MN-0089 Garcia", "MN-0156 Chen", "MN-0312 Andersen", "MN-0419 Erickson"];
const WEATHER_OPTS = ["Clear", "Partly Cloudy", "Overcast", "Windy", "Rain (indoor only)"];

export default function SubTimesheetsPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [entries, setEntries] = useState<TimesheetEntry[]>(initialEntries);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], project: PROJECTS[0], startTime: "07:00", endTime: "15:00", crew: "6", work: "", weather: "Clear" });

  const totalHours = entries.reduce((a, e) => a + e.hours, 0);
  const totalCrewHours = entries.reduce((a, e) => a + e.hours * e.crew, 0);
  const projectsWorked = new Set(entries.map((e) => e.project)).size;
  const thisWeek = entries.filter((e) => { const d = new Date(e.date); const now = new Date(); return (now.getTime() - d.getTime()) / 86400000 <= 7; });

  const handleAdd = () => {
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const hours = Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
    if (hours <= 0) { addToast("End time must be after start time", "error"); return; }
    if (!form.work.trim()) { addToast("Describe work performed", "error"); return; }
    const entry: TimesheetEntry = { id: `ts-${Date.now()}`, date: form.date, project: form.project, hours, crew: parseInt(form.crew) || 1, work: form.work.trim(), weather: form.weather, status: "Pending" };
    setEntries((prev) => [entry, ...prev]);
    setShowAdd(false);
    setForm({ ...form, work: "" });
    addToast(`${hours} hours logged for ${form.project}`, "success");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Timesheets</h2>
        <Btn color="#3b82f6" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1 inline" />Log Hours</Btn>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-bold text-gray-900">{totalHours}</div><div className="text-xs text-gray-500">Total Hours</div></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-bold text-blue-600">{totalCrewHours}</div><div className="text-xs text-gray-500">Crew-Hours</div></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-bold text-gray-900">{projectsWorked}</div><div className="text-xs text-gray-500">Projects Worked</div></div>
        <div className="bg-white rounded-xl border p-4 text-center"><div className="text-2xl font-bold text-green-600">{thisWeek.reduce((a, e) => a + e.hours, 0)}</div><div className="text-xs text-gray-500">This Week</div></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500"><tr>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium">Project</th>
            <th className="text-left px-4 py-3 font-medium">Hours</th>
            <th className="text-left px-4 py-3 font-medium">Crew</th>
            <th className="text-left px-4 py-3 font-medium">Work Performed</th>
            <th className="text-left px-4 py-3 font-medium">Weather</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{e.date}</td>
                <td className="px-4 py-3"><Badge color="#3b82f6" sm>{e.project}</Badge></td>
                <td className="px-4 py-3 font-bold">{e.hours}</td>
                <td className="px-4 py-3">{e.crew}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{e.work}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.weather}</td>
                <td className="px-4 py-3"><Badge color={statusColors[e.status]} sm>{e.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Log Hours Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Log Hours">
        <div className="space-y-4">
          <SmartSelect label="Project" value={form.project} onChange={(v) => setForm({ ...form, project: v })} options={PROJECTS} placeholder="Select project" />
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Crew Size</label><input type="number" min="1" max="20" value={form.crew} onChange={(e) => setForm({ ...form, crew: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Work Performed *</label><textarea value={form.work} onChange={(e) => setForm({ ...form, work: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200" placeholder="Describe work completed..." /></div>
          <SmartSelect label="Weather" value={form.weather} onChange={(v) => setForm({ ...form, weather: v })} options={WEATHER_OPTS} />
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleAdd}>Log Hours</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
