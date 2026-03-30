import { useState } from "react";
import {
  RefreshCw, CheckCircle, AlertTriangle, XCircle, ExternalLink,
  FileText, DollarSign, Clock, Users, Truck, MapPin, ArrowRight,
  Play, Download, Upload, Wifi, WifiOff,
} from "lucide-react";
import { Badge, Btn, StatCard, Modal } from "../../components/ui";

/* ── Types ── */
interface SyncItem {
  name: string;
  scCount: number | null;
  qbCount: number | null;
  status: "synced" | "pending" | "error";
  pendingCount?: number;
  lastSync: string;
}

interface SyncEvent {
  id: string;
  message: string;
  time: string;
  status: "success" | "warning" | "error";
}

/* ── Initial Data ── */
const initialSyncItems: SyncItem[] = [
  { name: "Invoices", scCount: 42, qbCount: 42, status: "synced", lastSync: "2 min ago" },
  { name: "Payments", scCount: 38, qbCount: 38, status: "synced", lastSync: "2 min ago" },
  { name: "Customers", scCount: 24, qbCount: 24, status: "synced", lastSync: "5 min ago" },
  { name: "Vendors (Subs)", scCount: 8, qbCount: 8, status: "synced", lastSync: "5 min ago" },
  { name: "Expenses", scCount: 156, qbCount: 153, status: "pending", pendingCount: 3, lastSync: "10 min ago" },
  { name: "Chart of Accounts", scCount: null, qbCount: null, status: "synced", lastSync: "Setup" },
];

const initialSyncEvents: SyncEvent[] = [
  { id: "e1", message: "Invoice INV-2026-042 synced to QB", time: "2 min ago", status: "success" },
  { id: "e2", message: "Payment $4,200 received — auto-marked paid", time: "1 hr ago", status: "success" },
  { id: "e3", message: "Customer Robert Thompson created in QB", time: "3 hrs ago", status: "success" },
  { id: "e4", message: "Expense sync failed — duplicate entry", time: "Yesterday", status: "warning" },
  { id: "e5", message: "Invoice INV-2026-041 synced to QB", time: "Yesterday", status: "success" },
  { id: "e6", message: "Payment $18,500 received — auto-marked paid", time: "Yesterday", status: "success" },
  { id: "e7", message: "Vendor Petrov Roofing LLC updated in QB", time: "2 days ago", status: "success" },
  { id: "e8", message: "Sales tax report auto-generated for Q1", time: "2 days ago", status: "success" },
  { id: "e9", message: "Bulk expense import — 12 items synced", time: "3 days ago", status: "success" },
  { id: "e10", message: "Customer Sarah Anderson created in QB", time: "3 days ago", status: "success" },
];

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

/* ── Component ── */
export default function QuickBooksPage() {
  const [connected, setConnected] = useState(true);
  const [syncItems, setSyncItems] = useState(initialSyncItems);
  const [syncEvents, setSyncEvents] = useState(initialSyncEvents);
  const [syncing, setSyncing] = useState(false);
  const [syncingRow, setSyncingRow] = useState<string | null>(null);
  const [syncAllOpen, setSyncAllOpen] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  const handleConnect = () => {
    setConnected(true);
    setSyncEvents((prev) => [
      { id: `e${Date.now()}`, message: "Connected to QuickBooks Online", time: "Just now", status: "success" },
      ...prev,
    ]);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setDisconnectOpen(false);
    setSyncEvents((prev) => [
      { id: `e${Date.now()}`, message: "Disconnected from QuickBooks Online", time: "Just now", status: "warning" },
      ...prev,
    ]);
  };

  const handleRefreshSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncEvents((prev) => [
        { id: `e${Date.now()}`, message: "Quick sync completed — all items up to date", time: "Just now", status: "success" },
        ...prev,
      ]);
    }, 1500);
  };

  const handleSyncRow = (name: string) => {
    setSyncingRow(name);
    setTimeout(() => {
      setSyncItems((prev) =>
        prev.map((item) =>
          item.name === name
            ? { ...item, status: "synced" as const, pendingCount: undefined, qbCount: item.scCount, lastSync: "Just now" }
            : item
        )
      );
      setSyncingRow(null);
      setSyncEvents((prev) => [
        { id: `e${Date.now()}`, message: `${name} synced successfully`, time: "Just now", status: "success" },
        ...prev,
      ]);
    }, 1200);
  };

  const handleSyncAll = () => {
    setSyncAllOpen(true);
    setSyncProgress(0);
    const steps = syncItems.length;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSyncProgress(Math.round((step / steps) * 100));
      if (step >= steps) {
        clearInterval(interval);
        setSyncItems((prev) =>
          prev.map((item) => ({ ...item, status: "synced" as const, pendingCount: undefined, qbCount: item.scCount, lastSync: "Just now" }))
        );
        setSyncEvents((prev) => [
          { id: `e${Date.now()}`, message: "Full sync completed — all 6 categories synced", time: "Just now", status: "success" },
          ...prev,
        ]);
        setTimeout(() => setSyncAllOpen(false), 800);
      }
    }, 600);
  };

  const handleRetryEvent = (ev: SyncEvent) => {
    setSyncEvents((prev) =>
      prev.map((e) => (e.id === ev.id ? { ...e, status: "success" as const, message: e.message.replace("failed", "retried successfully") } : e))
    );
  };

  const statusIcon = (s: SyncItem["status"]) => {
    if (s === "synced") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === "pending") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const statusLabel = (s: SyncItem) => {
    if (s.status === "synced") return "Synced";
    if (s.status === "pending") return `${s.pendingCount ?? 0} Pending`;
    return "Error";
  };

  const eventIcon = (s: SyncEvent["status"]) => {
    if (s === "success") return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    if (s === "warning") return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Connection Header */}
      {connected ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-black text-sm">QB</div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">QuickBooks Online</h1>
                  <Badge color="#10b981">Connected</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">Smart Construction & Remodeling Inc.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-2">
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                Last sync: 2 minutes ago
              </div>
              <Btn size="sm" color="#3b82f6" variant="outline" onClick={handleRefreshSync} disabled={syncing}>
                <span className="flex items-center gap-1.5">
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Refresh"}
                </span>
              </Btn>
              <Btn size="sm" color="#ef4444" variant="outline" onClick={() => setDisconnectOpen(true)}>
                Disconnect
              </Btn>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <WifiOff className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-1">Connect to QuickBooks</h1>
          <p className="text-sm text-gray-600 mb-4">Sync invoices, payments, expenses, and generate tax-ready reports automatically.</p>
          <Btn color="#2CA01C" onClick={handleConnect}>
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center text-[10px] font-black text-green-700">QB</div>
              Connect to QuickBooks
            </span>
          </Btn>
        </div>
      )}

      {connected && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard icon={FileText} label="Invoices Synced" value="42" sub="All matched" color="#3b82f6" />
            <StatCard icon={DollarSign} label="Payments Received" value={fmt(284000)} sub="YTD 2026" color="#10b981" />
            <StatCard icon={Clock} label="Pending Sync" value="3" sub="Expenses" color="#f59e0b" />
            <StatCard icon={CheckCircle} label="Sync Errors" value="0" sub="No issues" color="#10b981" />
            <StatCard icon={Users} label="Subcontractors" value="8" sub="All synced" color="#8b5cf6" />
            <StatCard icon={MapPin} label="Mileage Logged" value="2,847 mi" sub="$1,745 deduction" color="#f97316" />
          </div>

          {/* Auto-Sync Status */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Auto-Sync Status</h2>
              <Btn size="sm" color="#3b82f6" onClick={handleSyncAll}>
                <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Sync All Now</span>
              </Btn>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Item</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">SC Count</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">QB Count</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Last Sync</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {syncItems.map((item) => (
                    <tr key={item.name} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.scCount ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{item.qbCount ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {statusIcon(item.status)}
                          <span className={item.status === "synced" ? "text-green-700" : item.status === "pending" ? "text-amber-700" : "text-red-700"}>
                            {statusLabel(item)}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.lastSync}</td>
                      <td className="px-4 py-3 text-right">
                        <Btn size="sm" color="#3b82f6" variant="outline" onClick={() => handleSyncRow(item.name)} disabled={syncingRow === item.name}>
                          <span className="flex items-center gap-1">
                            <RefreshCw className={`w-3 h-3 ${syncingRow === item.name ? "animate-spin" : ""}`} />
                            {syncingRow === item.name ? "Syncing..." : "Sync Now"}
                          </span>
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sync Activity */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Recent Sync Activity</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {syncEvents.slice(0, 10).map((ev) => (
                <div key={ev.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    {eventIcon(ev.status)}
                    <span className="text-sm text-gray-800">{ev.message}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{ev.time}</span>
                    {(ev.status === "warning" || ev.status === "error") && (
                      <Btn size="sm" color="#f59e0b" variant="outline" onClick={() => handleRetryEvent(ev)}>
                        <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Retry</span>
                      </Btn>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Btn color="#3b82f6" onClick={handleSyncAll}>
                <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Sync All Now</span>
              </Btn>
              <Btn color="#10b981" onClick={() => setSyncEvents((prev) => [{ id: `e${Date.now()}`, message: "Export to QuickBooks initiated — 42 invoices queued", time: "Just now", status: "success" }, ...prev])}>
                <span className="flex items-center gap-1.5"><Upload className="w-4 h-4" /> Export to QB</span>
              </Btn>
              <Btn color="#8b5cf6" onClick={() => setSyncEvents((prev) => [{ id: `e${Date.now()}`, message: "Import from QuickBooks completed — 3 new records", time: "Just now", status: "success" }, ...prev])}>
                <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> Import from QB</span>
              </Btn>
              <Btn color="#6b7280" variant="outline" onClick={() => window.open("https://app.qbo.intuit.com", "_blank")}>
                <span className="flex items-center gap-1.5"><ExternalLink className="w-4 h-4" /> View in QuickBooks</span>
              </Btn>
            </div>
          </div>
        </>
      )}

      {/* Sync All Progress Modal */}
      <Modal open={syncAllOpen} onClose={() => {}} title="Full Sync in Progress">
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-sm text-gray-700">Syncing all categories with QuickBooks...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full transition-all duration-300" style={{ width: `${syncProgress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{syncProgress}% complete</span>
            <span>{Math.round((syncProgress / 100) * 6)} / 6 categories</span>
          </div>
          {syncProgress >= 100 && (
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <CheckCircle className="w-4 h-4" /> All syncs completed successfully!
            </div>
          )}
        </div>
      </Modal>

      {/* Disconnect Confirmation Modal */}
      <Modal open={disconnectOpen} onClose={() => setDisconnectOpen(false)} title="Disconnect QuickBooks?">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will stop automatic syncing between Smart Construction and QuickBooks Online.
            Your data in both systems will remain intact, but new changes will not sync until reconnected.
          </p>
          <div className="flex justify-end gap-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setDisconnectOpen(false)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={handleDisconnect}>Disconnect</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
