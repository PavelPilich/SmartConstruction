import { useState } from "react";
import { Badge, Btn } from "../../components/ui";
import {
  Shield, AlertTriangle, CheckCircle2, Clock, Bell, Calendar,
  ChevronRight, ExternalLink, Eye, XCircle, RefreshCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LegalAlert {
  id: string;
  title: string;
  type: "state" | "federal";
  effectiveDate: string;
  impact: string;
  suggestedUpdate: string;
  severity: "high" | "medium" | "low";
  dismissed: boolean;
  applied: boolean;
  affectedTemplates: string[];
}

interface ComplianceItem {
  name: string;
  status: "current" | "needs_update" | "non_compliant";
  lastChecked: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const INITIAL_ALERTS: LegalAlert[] = [
  {
    id: "alert-001",
    title: "MN HF 2310 — Residential Contractor Licensing Update",
    type: "state",
    effectiveDate: "2026-07-01",
    impact: "License renewal requirements changed. Continuing education hours increased from 14 to 20 hours per renewal period. Update Section 12.3 of all templates to reference new CE requirements.",
    suggestedUpdate: "Update contractor licensing clause to read: 'Contractor maintains a current Minnesota residential contractor license (BC-789456) and completes all required continuing education, including a minimum of 20 hours per biennial renewal period as required by MN HF 2310, effective July 1, 2026.'",
    severity: "high",
    dismissed: false,
    applied: false,
    affectedTemplates: ["Standard Roof Replacement", "Siding Repair Agreement", "Full Exterior Restoration", "Emergency Repair Authorization"],
  },
  {
    id: "alert-002",
    title: "MN Statute 327A — Home Warranty Changes",
    type: "state",
    effectiveDate: "2027-01-01",
    impact: "Minimum statutory warranty period for home improvement work increased from 1 year to 2 years. All warranty clauses in templates must be updated to reflect the new minimum.",
    suggestedUpdate: "Update warranty clause: 'Contractor warrants all work against defects in workmanship for a minimum period of two (2) years from the date of substantial completion, in accordance with Minnesota Statute 327A as amended effective January 1, 2027. This warranty is in addition to, and does not limit, any manufacturer warranties on materials.'",
    severity: "high",
    dismissed: false,
    applied: false,
    affectedTemplates: ["Standard Roof Replacement", "Siding Repair Agreement", "Full Exterior Restoration"],
  },
  {
    id: "alert-003",
    title: "IRS W-9 Subcontractor Reporting Threshold",
    type: "federal",
    effectiveDate: "2027-01-01",
    impact: "1099-NEC reporting threshold lowered to $600 for all subcontractor payments. Update subcontractor agreement templates to include W-9 collection requirement.",
    suggestedUpdate: "Add clause: 'Subcontractor shall provide a completed IRS Form W-9 prior to receiving any payment. Contractor will issue Form 1099-NEC for all payments of $600 or more in a calendar year, as required by federal law effective January 1, 2027.'",
    severity: "medium",
    dismissed: false,
    applied: false,
    affectedTemplates: ["Custom Template"],
  },
];

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { name: "ESIGN Act Compliance", status: "current", lastChecked: "2026-03-25" },
  { name: "MN Contractor Licensing (326B)", status: "current", lastChecked: "2026-03-25" },
  { name: "MN Home Improvement Act (325F.65)", status: "current", lastChecked: "2026-03-25" },
  { name: "MN Consumer Protection (325D)", status: "current", lastChecked: "2026-03-25" },
  { name: "FTC Home Improvement Guidelines", status: "current", lastChecked: "2026-03-25" },
  { name: "MN Three-Day Cancellation (325G.06)", status: "current", lastChecked: "2026-03-25" },
  { name: "MN Mechanics Lien Law (514.01)", status: "current", lastChecked: "2026-03-25" },
  { name: "MN Warranty Statute (327A)", status: "needs_update", lastChecked: "2026-03-25" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ContractAiLegalPage() {
  const [alerts, setAlerts] = useState<LegalAlert[]>(INITIAL_ALERTS);
  const [compliance, setCompliance] = useState<ComplianceItem[]>(COMPLIANCE_ITEMS);
  const [lastReviewDate] = useState("2026-03-01");
  const [nextReviewDate] = useState("2027-03-01");

  const activeAlerts = alerts.filter((a) => !a.dismissed);
  const dismissedAlerts = alerts.filter((a) => a.dismissed);

  const handleApply = (id: string) => {
    setAlerts(alerts.map((a) => a.id === id ? { ...a, applied: true } : a));
  };

  const handleDismiss = (id: string) => {
    setAlerts(alerts.map((a) => a.id === id ? { ...a, dismissed: true } : a));
  };

  const handleUndismiss = (id: string) => {
    setAlerts(alerts.map((a) => a.id === id ? { ...a, dismissed: false } : a));
  };

  const handleRefreshCompliance = () => {
    const now = new Date().toISOString().split("T")[0];
    setCompliance(compliance.map((c) => ({ ...c, lastChecked: now })));
  };

  const severityColors: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#3b82f6",
  };

  const complianceColors: Record<string, { color: string; label: string }> = {
    current: { color: "#22c55e", label: "Current" },
    needs_update: { color: "#f59e0b", label: "Needs Update" },
    non_compliant: { color: "#ef4444", label: "Non-Compliant" },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" /> AI Legal Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Minnesota Construction Law &middot; Automated compliance monitoring</p>
        </div>
        <Btn variant="outline" color="#3b82f6" onClick={handleRefreshCompliance}>
          <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Refresh Compliance Check</span>
        </Btn>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-medium text-gray-500">Active Alerts</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{activeAlerts.length}</div>
          <div className="text-xs text-amber-600 mt-0.5">{activeAlerts.filter((a) => a.severity === "high").length} high priority</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-xs font-medium text-gray-500">Compliance Score</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Math.round((compliance.filter((c) => c.status === "current").length / compliance.length) * 100)}%
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{compliance.filter((c) => c.status === "current").length}/{compliance.length} items current</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Last Review</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{lastReviewDate}</div>
          <div className="text-xs text-gray-500 mt-0.5">6 templates reviewed by Pavel</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-medium text-gray-500">Next Review Due</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{nextReviewDate}</div>
          <div className="text-xs text-purple-600 mt-0.5">Annual review cycle</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Active alerts */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" /> Active Legal Alerts
          </h2>
          {activeAlerts.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-green-800">All Clear</p>
              <p className="text-sm text-green-600">No active legal alerts at this time.</p>
            </div>
          )}
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={severityColors[alert.severity]}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge color={alert.type === "state" ? "#6366f1" : "#059669"}>
                      {alert.type === "state" ? "State — MN" : "Federal"}
                    </Badge>
                    {alert.applied && <Badge color="#22c55e"><CheckCircle2 className="w-3 h-3 mr-0.5" /> Applied</Badge>}
                  </div>
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Effective: {alert.effectiveDate}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-amber-800 font-medium mb-1">Impact Assessment</p>
                <p className="text-sm text-amber-700">{alert.impact}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 font-medium mb-1">Suggested Template Update</p>
                <p className="text-xs text-gray-600 italic leading-relaxed">{alert.suggestedUpdate}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>Affected templates:</span>
                <div className="flex flex-wrap gap-1">
                  {alert.affectedTemplates.map((t) => (
                    <Badge key={t} color="#6b7280" sm>{t}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {!alert.applied && (
                  <Btn size="sm" color="#3b82f6" onClick={() => handleApply(alert.id)}>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Apply Update</span>
                  </Btn>
                )}
                <Btn size="sm" variant="outline" color="#6b7280" onClick={() => handleDismiss(alert.id)}>
                  <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Dismiss</span>
                </Btn>
              </div>
            </div>
          ))}

          {/* Dismissed alerts */}
          {dismissedAlerts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Dismissed Alerts ({dismissedAlerts.length})</h3>
              {dismissedAlerts.map((alert) => (
                <div key={alert.id} className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-2 opacity-70">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{alert.title}</p>
                      <p className="text-xs text-gray-500">Effective: {alert.effectiveDate}</p>
                    </div>
                    <Btn size="sm" variant="outline" color="#6b7280" onClick={() => handleUndismiss(alert.id)}>Restore</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Annual Review */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" /> Annual Contract Review
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 font-medium">Next Review Due</p>
                <p className="text-lg font-bold text-purple-800">{nextReviewDate}</p>
                <p className="text-xs text-purple-600">6 templates to review</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 font-medium">Last Completed Review</p>
                <p className="text-lg font-bold text-gray-800">{lastReviewDate}</p>
                <p className="text-xs text-gray-500">All 6 templates reviewed by Pavel</p>
              </div>
            </div>
            <Btn variant="outline" color="#7c3aed">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Schedule Review</span>
            </Btn>
          </div>
        </div>

        {/* Compliance dashboard sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Compliance Dashboard</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            {compliance.map((item, i) => {
              const c = complianceColors[item.status];
              return (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.status === "current" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : item.status === "needs_update" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className="text-sm text-gray-700 truncate">{item.name}</span>
                  </div>
                  <Badge color={c.color} sm>{c.label}</Badge>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium mb-2">Last Compliance Scan</p>
            <p className="text-sm font-medium text-gray-900">{compliance[0].lastChecked}</p>
            <p className="text-xs text-gray-400 mt-1">Automated daily scans monitor state and federal regulations affecting your contract templates.</p>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">AI Monitoring Active</p>
            <p className="text-xs text-blue-600">The system monitors Minnesota construction regulations, federal ESIGN compliance, FTC guidelines, and IRS reporting requirements. Alerts are generated automatically when changes are detected that affect your templates.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
