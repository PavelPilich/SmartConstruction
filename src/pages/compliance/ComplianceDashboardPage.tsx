import { useState, useMemo } from "react";
import { Badge, Btn, Modal } from "../../components/ui";
import {
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock,
  Bell, ChevronDown, ChevronUp, FileText, Upload, Download, Printer,
  Ban, Mail, MessageSquare, UserPlus, Search, RefreshCw, Eye, Scale,
  Calendar, Zap, BookOpen, BellRing, Shield,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type DocStatus = "current" | "expiring" | "expired" | "missing";

interface TrackedDoc {
  name: string;
  status: DocStatus;
  expirationDate: string | null; // null = no expiry (e.g. W-9)
  daysRemaining: number | null;
  lastVerified: string;
  fileUploaded: boolean;
}

interface PersonCompliance {
  id: string;
  name: string;
  role: "subcontractor" | "drone_operator" | "sales_rep";
  blocked: boolean;
  documents: TrackedDoc[];
}

interface Notification {
  id: string;
  timestamp: string;
  person: string;
  document: string;
  action: string;
  tier: "reminder" | "warning" | "urgent" | "blocked";
}

interface LegalAlert {
  id: string;
  title: string;
  impact: string;
  affectedCount: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function statusBadge(s: DocStatus) {
  switch (s) {
    case "current":  return <Badge color="#22c55e">Current</Badge>;
    case "expiring": return <Badge color="#f59e0b">Expiring</Badge>;
    case "expired":  return <Badge color="#ef4444">Expired</Badge>;
    case "missing":  return <Badge color="#6b7280">Missing</Badge>;
  }
}

function daysColor(days: number | null): string {
  if (days === null) return "#6b7280";
  if (days <= 0) return "#ef4444";
  if (days <= 30) return "#f97316";
  if (days <= 60) return "#eab308";
  return "#22c55e";
}

function tierIcon(tier: Notification["tier"]) {
  switch (tier) {
    case "reminder": return <Mail className="w-4 h-4 text-blue-400" />;
    case "warning":  return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case "urgent":   return <BellRing className="w-4 h-4 text-red-400" />;
    case "blocked":  return <Ban className="w-4 h-4 text-red-600" />;
  }
}

function tierBadge(tier: Notification["tier"]) {
  const m: Record<string, [string, string]> = {
    reminder: ["#3b82f6", "Reminder"],
    warning: ["#f59e0b", "Warning"],
    urgent: ["#ef4444", "Urgent"],
    blocked: ["#dc2626", "Blocked"],
  };
  const [c, l] = m[tier];
  return <Badge color={c}>{l}</Badge>;
}

/* helper: make doc row */
function mkDoc(
  name: string, status: DocStatus, exp: string | null, days: number | null, verified: string, file: boolean
): TrackedDoc {
  return { name, status, expirationDate: exp, daysRemaining: days, lastVerified: verified, fileUploaded: file };
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */
const DOC_NAMES = [
  "Liability Insurance", "Workers Compensation", "Auto Insurance", "Driver License",
  "Contractor License", "W-9 Form", "NDA", "OSHA Certifications",
  "FAA Part 107", "Background Check",
];

function allCurrent(verified: string): TrackedDoc[] {
  return DOC_NAMES.map((n) => {
    const noExpiry = n === "W-9 Form" || n === "NDA";
    return mkDoc(n, "current", noExpiry ? null : "2027-06-15", noExpiry ? null : 440, verified, true);
  });
}

const INITIAL_PEOPLE: PersonCompliance[] = [
  {
    id: "p1", name: "Petrov Roofing", role: "subcontractor", blocked: false,
    documents: DOC_NAMES.map((n) => {
      if (n === "Auto Insurance") return mkDoc(n, "expiring", "2026-04-27", 28, "2026-03-01", true);
      const noExpiry = n === "W-9 Form" || n === "NDA";
      return mkDoc(n, "current", noExpiry ? null : "2027-03-15", noExpiry ? null : 350, "2026-03-01", true);
    }),
  },
  { id: "p2", name: "Mendez Windows", role: "subcontractor", blocked: false, documents: allCurrent("2026-03-10") },
  { id: "p3", name: "Wilson Siding", role: "subcontractor", blocked: false, documents: allCurrent("2026-03-05") },
  {
    id: "p4", name: "Harris Interiors", role: "subcontractor", blocked: false,
    documents: DOC_NAMES.map((n) => {
      if (n === "OSHA Certifications") return mkDoc(n, "expiring", "2026-04-21", 22, "2026-02-15", true);
      if (n === "Background Check") return mkDoc(n, "missing", null, null, "-", false);
      const noExpiry = n === "W-9 Form" || n === "NDA";
      return mkDoc(n, "current", noExpiry ? null : "2027-05-01", noExpiry ? null : 397, "2026-02-15", true);
    }),
  },
  {
    id: "p5", name: "Chen Roofing", role: "drone_operator", blocked: false,
    documents: DOC_NAMES.map((n) => {
      if (n === "Driver License") return mkDoc(n, "expiring", "2026-05-14", 45, "2026-01-20", true);
      const noExpiry = n === "W-9 Form" || n === "NDA";
      return mkDoc(n, "current", noExpiry ? null : "2027-04-10", noExpiry ? null : 376, "2026-01-20", true);
    }),
  },
  { id: "p6", name: "Park General", role: "subcontractor", blocked: false, documents: allCurrent("2026-03-12") },
  {
    id: "p7", name: "Volkov Siding", role: "subcontractor", blocked: true,
    documents: DOC_NAMES.map((n) => {
      if (n === "Workers Compensation") return mkDoc(n, "expired", "2026-02-28", -30, "2025-12-10", true);
      if (n === "FAA Part 107") return mkDoc(n, "missing", null, null, "-", false);
      const noExpiry = n === "W-9 Form" || n === "NDA";
      return mkDoc(n, "current", noExpiry ? null : "2027-01-20", noExpiry ? null : 296, "2025-12-10", true);
    }),
  },
  {
    id: "p8", name: "Delta Painting", role: "subcontractor", blocked: true,
    documents: DOC_NAMES.map((n) => {
      if (n === "W-9 Form") return mkDoc(n, "missing", null, null, "-", false);
      if (n === "OSHA Certifications") return mkDoc(n, "missing", null, null, "-", false);
      if (n === "FAA Part 107") return mkDoc(n, "missing", null, null, "-", false);
      const noExpiry = n === "NDA";
      return mkDoc(n, "current", noExpiry ? null : "2027-02-20", noExpiry ? null : 327, "2026-01-05", true);
    }),
  },
];

const NOTIFICATIONS: Notification[] = [
  { id: "n1", timestamp: "2026-01-28 09:00", person: "Petrov Roofing", document: "Auto Insurance", action: "Reminder sent — Auto Insurance renewing", tier: "reminder" },
  { id: "n2", timestamp: "2026-02-27 08:30", person: "Petrov Roofing", document: "Auto Insurance", action: "WARNING — Auto Insurance expires Apr 27", tier: "warning" },
  { id: "n3", timestamp: "2026-03-09 07:00", person: "Elena Kozlov", document: "COI", action: "WARNING — COI expires Apr 9", tier: "warning" },
  { id: "n4", timestamp: "2026-03-16 07:00", person: "Harris Interiors", document: "OSHA Certifications", action: "URGENT — OSHA cert expires Apr 21", tier: "urgent" },
  { id: "n5", timestamp: "2026-02-28 00:01", person: "Volkov Siding", document: "Workers Compensation", action: "AUTO-BLOCKED — Workers Comp expired", tier: "blocked" },
  { id: "n6", timestamp: "2026-03-20 08:00", person: "Chen Roofing", document: "Driver License", action: "Reminder sent — Driver License renewing", tier: "reminder" },
  { id: "n7", timestamp: "2026-03-01 09:15", person: "Delta Painting", document: "W-9 Form", action: "AUTO-BLOCKED — W-9 missing", tier: "blocked" },
  { id: "n8", timestamp: "2026-03-15 10:00", person: "Harris Interiors", document: "Background Check", action: "WARNING — Background Check still missing", tier: "warning" },
];

const LEGAL_ALERTS: LegalAlert[] = [
  { id: "la1", title: "MN Workers Comp minimum coverage increased to $500K effective July 2026", impact: "2 subs need policy update", affectedCount: 2 },
  { id: "la2", title: "MN Contractor License renewal process changed — online only starting 2027", impact: "All subs must register for online portal", affectedCount: 8 },
];

/* ------------------------------------------------------------------ */
/*  Onboarding Checklists                                              */
/* ------------------------------------------------------------------ */
const ONBOARDING_SUB = [
  "W-9 Form", "Liability Insurance ($1M min)", "Workers Compensation",
  "Auto Insurance", "Contractor License (MN)", "Driver License",
  "NDA", "Background Check", "OSHA 10-Hour (within 90 days)",
];
const ONBOARDING_DRONE = [
  ...ONBOARDING_SUB, "FAA Part 107 Certificate", "Drone Insurance Rider", "DJI Flight Training Certificate",
];
const ONBOARDING_SALES = [
  "W-9 Form", "Driver License", "Auto Insurance", "NDA",
  "Background Check", "Sales Training Certificate",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ComplianceDashboardPage() {
  const [people, setPeople] = useState<PersonCompliance[]>(INITIAL_PEOPLE);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [autoBlock, setAutoBlock] = useState(true);
  const [autoRemind, setAutoRemind] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<null | { total: number; docs: number; pct: number; issues: number }>(null);
  const [assignModal, setAssignModal] = useState<string | null>(null); // role name
  const [assignName, setAssignName] = useState("");
  const [assignedList, setAssignedList] = useState<{ name: string; role: string }[]>([]);
  const [showNotifAll, setShowNotifAll] = useState(false);

  // stats
  const stats = useMemo(() => {
    let expired = 0, expiring = 0, current = 0;
    const expiredItems: string[] = [];
    const expiringItems: string[] = [];
    people.forEach((p) => {
      p.documents.forEach((d) => {
        if (d.status === "expired" || d.status === "missing") {
          expired++;
          expiredItems.push(`${p.name} — ${d.name} ${d.status === "expired" ? "EXPIRED" : "MISSING"}`);
        } else if (d.status === "expiring") {
          expiring++;
          expiringItems.push(`${p.name} — ${d.name} expires in ${d.daysRemaining}d`);
        } else {
          current++;
        }
      });
    });
    const compliantPeople = people.filter((p) => p.documents.every((d) => d.status === "current")).length;
    return { expired, expiring, current, expiredItems, expiringItems, compliantPeople };
  }, [people]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return people;
    const q = searchQuery.toLowerCase();
    return people.filter((p) => p.name.toLowerCase().includes(q));
  }, [people, searchQuery]);

  const notifs = showNotifAll ? NOTIFICATIONS : NOTIFICATIONS.slice(0, 4);

  function runFullAudit() {
    setAuditRunning(true);
    setAuditResult(null);
    setTimeout(() => {
      const totalDocs = people.reduce((s, p) => s + p.documents.length, 0);
      const issues = stats.expired + stats.expiring;
      setAuditResult({ total: people.length, docs: totalDocs, pct: Math.round(((totalDocs - issues) / totalDocs) * 100), issues });
      setAuditRunning(false);
    }, 1500);
  }

  function toggleBlock(personId: string) {
    setPeople((prev) =>
      prev.map((p) => (p.id === personId ? { ...p, blocked: !p.blocked } : p))
    );
  }

  function handleAssign() {
    if (!assignName.trim() || !assignModal) return;
    setAssignedList((prev) => [...prev, { name: assignName.trim(), role: assignModal }]);
    setAssignName("");
    setAssignModal(null);
  }

  function exportCSV() {
    const rows = [["Name", "Role", "Blocked", "Document", "Status", "Expiration", "Days Remaining", "Last Verified", "File"]];
    people.forEach((p) => {
      p.documents.forEach((d) => {
        rows.push([p.name, p.role, String(p.blocked), d.name, d.status, d.expirationDate || "N/A", String(d.daysRemaining ?? "N/A"), d.lastVerified, d.fileUploaded ? "Yes" : "No"]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compliance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function printSummary() {
    window.print();
  }

  function docCountLabel(p: PersonCompliance) {
    const total = p.documents.length;
    const ok = p.documents.filter((d) => d.status === "current").length;
    return `${ok}/${total}`;
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-blue-600" /> AI Compliance Command Center
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Last Scan: 2 min ago
          </p>
        </div>
        <div className="flex gap-2">
          <Btn color="#3b82f6" onClick={runFullAudit} size="sm">
            <span className="flex items-center gap-1.5"><RefreshCw className={`w-4 h-4 ${auditRunning ? "animate-spin" : ""}`} /> Run Full Audit</span>
          </Btn>
          <Btn color="#6b7280" variant="outline" onClick={exportCSV} size="sm">
            <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> Export CSV</span>
          </Btn>
          <Btn color="#6b7280" variant="outline" onClick={printSummary} size="sm">
            <span className="flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print</span>
          </Btn>
        </div>
      </div>

      {/* Audit Result */}
      {auditResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Audit Complete</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div><div className="text-2xl font-bold text-blue-700">{auditResult.total}</div><div className="text-xs text-gray-500">Personnel</div></div>
            <div><div className="text-2xl font-bold text-blue-700">{auditResult.docs}</div><div className="text-xs text-gray-500">Docs Checked</div></div>
            <div><div className="text-2xl font-bold text-green-600">{auditResult.pct}%</div><div className="text-xs text-gray-500">Compliant</div></div>
            <div><div className="text-2xl font-bold text-red-600">{auditResult.issues}</div><div className="text-xs text-gray-500">Issues Found</div></div>
          </div>
        </div>
      )}

      {/* ======================== STATUS OVERVIEW ======================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RED - EXPIRED */}
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"><XCircle className="w-6 h-6 text-white" /></div>
            <div>
              <div className="font-bold text-red-800 text-lg">{stats.expired} EXPIRED / MISSING</div>
              <div className="text-xs text-red-600">Auto-blocked from jobs</div>
            </div>
          </div>
          <div className="space-y-2">
            {stats.expiredItems.map((item, i) => (
              <div key={i} className="bg-red-100 rounded-lg px-3 py-2 text-sm text-red-900 font-medium flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-600 flex-shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>

        {/* YELLOW - EXPIRING */}
        <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-white" /></div>
            <div>
              <div className="font-bold text-yellow-800 text-lg">{stats.expiring} EXPIRING SOON</div>
              <div className="text-xs text-yellow-700">Action required</div>
            </div>
          </div>
          <div className="space-y-2">
            {stats.expiringItems.map((item, i) => (
              <div key={i} className="bg-yellow-100 rounded-lg px-3 py-2 text-sm text-yellow-900 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>

        {/* GREEN - CURRENT */}
        <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-white" /></div>
            <div>
              <div className="font-bold text-green-800 text-lg">{stats.current} CURRENT</div>
              <div className="text-xs text-green-700">{stats.compliantPeople} personnel fully compliant</div>
            </div>
          </div>
          <div className="bg-green-100 rounded-lg px-3 py-3 text-sm text-green-800">
            <div className="font-semibold mb-1">{stats.compliantPeople} personnel fully compliant</div>
            <div className="text-xs text-green-600">All documents verified and current</div>
          </div>
        </div>
      </div>

      {/* ======================== NOTIFICATION TIMELINE ======================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" /> Notification Timeline
        </h2>
        <div className="space-y-3">
          {notifs.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="mt-0.5">{tierIcon(n.tier)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{n.action}</div>
                <div className="text-xs text-gray-500 mt-0.5">{n.person} &middot; {n.document}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {tierBadge(n.tier)}
                <span className="text-xs text-gray-400">{n.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
        {NOTIFICATIONS.length > 4 && (
          <button onClick={() => setShowNotifAll(!showNotifAll)} className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            {showNotifAll ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All ({NOTIFICATIONS.length})</>}
          </button>
        )}
      </div>

      {/* ======================== DOCUMENT TRACKING TABLE ======================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Document Tracking Per Person
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personnel..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-64"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((p) => {
            const isExpanded = expanded === p.id;
            const okCount = p.documents.filter((d) => d.status === "current").length;
            const total = p.documents.length;
            const pctOk = Math.round((okCount / total) * 100);

            return (
              <div key={p.id} className={`border rounded-xl overflow-hidden ${p.blocked ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}>
                {/* Row header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : p.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.blocked ? "bg-red-500" : okCount === total ? "bg-green-500" : "bg-yellow-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{p.name}</span>
                      {p.blocked && <Badge color="#ef4444">BLOCKED</Badge>}
                      <Badge color="#6b7280" sm>{p.role.replace("_", " ")}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {docCountLabel(p)} documents current &middot; {pctOk}% compliant
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* progress bar */}
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pctOk}%`, background: pctOk === 100 ? "#22c55e" : pctOk >= 80 ? "#eab308" : "#ef4444" }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: pctOk === 100 ? "#22c55e" : pctOk >= 80 ? "#eab308" : "#ef4444" }}>{pctOk}%</span>
                    {p.blocked && (
                      <Btn size="sm" color="#ef4444" variant="outline" onClick={(e) => { e?.stopPropagation(); toggleBlock(p.id); }}>Unblock</Btn>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded docs */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Document</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Status</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Expiration</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Days Left</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">Last Verified</th>
                          <th className="px-4 py-2 text-xs font-semibold text-gray-500">File</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.documents.map((d, i) => (
                          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-900">{d.name}</td>
                            <td className="px-4 py-2.5">{statusBadge(d.status)}</td>
                            <td className="px-4 py-2.5">
                              {d.expirationDate ? (
                                <span className="font-medium" style={{ color: daysColor(d.daysRemaining) }}>{d.expirationDate}</span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {d.daysRemaining !== null ? (
                                <span className="font-bold" style={{ color: daysColor(d.daysRemaining) }}>
                                  {d.daysRemaining <= 0 ? `${Math.abs(d.daysRemaining)}d overdue` : `${d.daysRemaining}d`}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500">{d.lastVerified}</td>
                            <td className="px-4 py-2.5">
                              {d.fileUploaded ? (
                                <span className="flex items-center gap-1 text-green-600"><FileText className="w-3.5 h-3.5" /> Uploaded</span>
                              ) : (
                                <span className="flex items-center gap-1 text-gray-400"><Upload className="w-3.5 h-3.5" /> None</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================== AUTO-BLOCK RULES ======================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" /> Auto-Block Rules &amp; Alert Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          {[
            { days: "60 days", icon: <Mail className="w-5 h-5 text-blue-500" />, label: "Email reminder", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800" },
            { days: "30 days", icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />, label: "Warning + SMS", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800" },
            { days: "14 days", icon: <BellRing className="w-5 h-5 text-red-500" />, label: "URGENT + manager notified", bg: "bg-red-50", border: "border-red-200", text: "text-red-800" },
            { days: "0 days", icon: <Ban className="w-5 h-5 text-red-700" />, label: "AUTO-BLOCK — cannot accept jobs", bg: "bg-red-100", border: "border-red-300", text: "text-red-900" },
          ].map((tier, i) => (
            <div key={i} className={`${tier.bg} ${tier.border} border rounded-xl p-4 text-center`}>
              <div className="flex justify-center mb-2">{tier.icon}</div>
              <div className={`font-bold text-sm ${tier.text}`}>{tier.days}</div>
              <div className={`text-xs mt-1 ${tier.text} opacity-80`}>{tier.label}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={autoBlock} onChange={() => setAutoBlock(!autoBlock)} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-red-500 transition" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition" />
            </div>
            <span className="text-sm font-medium text-gray-700">Auto-block on expiry</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={autoRemind} onChange={() => setAutoRemind(!autoRemind)} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition" />
            </div>
            <span className="text-sm font-medium text-gray-700">Auto-send reminders</span>
          </label>
        </div>
      </div>

      {/* ======================== ONBOARDING CHECKLISTS ======================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" /> Onboarding Checklists by Role
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Subcontractor", items: ONBOARDING_SUB, role: "subcontractor", color: "#3b82f6" },
            { title: "Drone Operator", items: ONBOARDING_DRONE, role: "drone_operator", color: "#8b5cf6" },
            { title: "Sales Rep", items: ONBOARDING_SALES, role: "sales_rep", color: "#06b6d4" },
          ].map((card) => (
            <div key={card.role} className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: card.color }}>
                <UserPlus className="w-4 h-4" /> {card.title} Onboarding
              </h3>
              <div className="space-y-1.5 mb-3">
                {card.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mb-3 italic">Cannot activate until ALL docs uploaded</div>
              <Btn color={card.color} size="sm" onClick={() => setAssignModal(card.role)} className="w-full">
                <span className="flex items-center gap-1.5 justify-center"><UserPlus className="w-4 h-4" /> Assign to New Hire</span>
              </Btn>
            </div>
          ))}
        </div>

        {/* Assigned list */}
        {assignedList.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Recently Assigned</h4>
            <div className="space-y-1">
              {assignedList.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" /> {a.name} — <span className="capitalize">{a.role.replace("_", " ")}</span> checklist assigned
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================== AI LEGAL MONITOR ======================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" /> AI Legal Monitor
        </h2>
        <p className="text-xs text-gray-500 mb-4">AI monitors Minnesota employment law changes</p>

        <div className="space-y-3 mb-5">
          {LEGAL_ALERTS.map((la) => (
            <div key={la.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-amber-900">{la.title}</div>
                  <div className="text-xs text-amber-700 mt-0.5">Impact: {la.impact}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Annual compliance audit */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" /> Annual Compliance Audit
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div><span className="text-gray-500">Last audit:</span> <span className="font-medium text-gray-900">Feb 15, 2026</span></div>
            <div><span className="text-gray-500">Next audit due:</span> <span className="font-medium text-gray-900">Feb 15, 2027</span></div>
          </div>
          <Btn color="#3b82f6" size="sm" onClick={runFullAudit}>
            <span className="flex items-center gap-1.5"><Zap className={`w-4 h-4 ${auditRunning ? "animate-spin" : ""}`} /> Run Audit Now</span>
          </Btn>
          {auditResult && (
            <div className="mt-3 grid grid-cols-4 gap-3 text-center">
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-lg font-bold text-gray-900">{auditResult.total}</div>
                <div className="text-[10px] text-gray-500">Personnel</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-lg font-bold text-gray-900">{auditResult.docs}</div>
                <div className="text-[10px] text-gray-500">Docs Checked</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-lg font-bold text-green-600">{auditResult.pct}%</div>
                <div className="text-[10px] text-gray-500">Compliant</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-lg font-bold text-red-600">{auditResult.issues}</div>
                <div className="text-[10px] text-gray-500">Issues</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================== ASSIGN MODAL ======================== */}
      <Modal open={!!assignModal} onClose={() => { setAssignModal(null); setAssignName(""); }} title={`Assign ${(assignModal || "").replace("_", " ")} Checklist`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Select or enter the name of the new hire to assign the <strong className="capitalize">{(assignModal || "").replace("_", " ")}</strong> onboarding checklist.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Person Name</label>
            <input
              value={assignName}
              onChange={(e) => setAssignName(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              onKeyDown={(e) => { if (e.key === "Enter") handleAssign(); }}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Btn color="#6b7280" variant="outline" size="sm" onClick={() => { setAssignModal(null); setAssignName(""); }}>Cancel</Btn>
            <Btn color="#3b82f6" size="sm" onClick={handleAssign} disabled={!assignName.trim()}>
              <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Assign Checklist</span>
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
