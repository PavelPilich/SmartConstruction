import { useState } from "react";
import { Link2, CheckCircle2, Zap, RefreshCw, ArrowRight, Info } from "lucide-react";
import { Badge } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

interface ApiConnection {
  name: string;
  description: string;
  status: "connected" | "active";
}

const connections: ApiConnection[] = [
  { name: "Xactimate API", description: "Estimate import/export & pricing data", status: "connected" },
  { name: "XactAnalysis", description: "Claim assignment & workflow management", status: "connected" },
  { name: "Xactimate Pricing", description: "Real-time material & labor pricing", status: "active" },
  { name: "Verisk Data", description: "Property data & aerial measurements", status: "connected" },
  { name: "CRM Bidirectional Sync", description: "Two-way sync with project pipeline", status: "active" },
  { name: "QuickBooks Sync", description: "Accounting & invoice synchronization", status: "active" },
  { name: "Client Portal", description: "Homeowner-facing project updates", status: "connected" },
];

interface SyncRule {
  trigger: string;
  action: string;
  enabled: boolean;
}

const initialSyncRules: SyncRule[] = [
  { trigger: "New estimate created", action: "Auto-links to CRM project", enabled: true },
  { trigger: "Estimate approved", action: "CRM stage \u2192 Signed, auto-invoice in QB", enabled: true },
  { trigger: "Invoice paid (QB)", action: "CRM stage \u2192 Paid, update estimate status", enabled: true },
  { trigger: "Inspection scheduled", action: "Calendar event + crew notification", enabled: true },
  { trigger: "Material delivery confirmed", action: "Update project timeline & notify crew", enabled: true },
  { trigger: "Photo uploaded to project", action: "Sync to client portal & CRM", enabled: false },
  { trigger: "Change order approved", action: "Update estimate + QB invoice adjustment", enabled: true },
  { trigger: "Project completed", action: "Generate final invoice, request review, archive", enabled: true },
];

const insurancePartners = ["State Farm", "Allstate", "USAA", "Liberty Mutual", "Farmers", "Nationwide", "Progressive"];

export default function IntegrationPage() {
  const [syncRules, setSyncRules] = useState<SyncRule[]>(initialSyncRules);
  const addToast = useAppStore((s) => s.addToast);

  const toggleRule = (index: number) => {
    setSyncRules((prev) =>
      prev.map((rule, i) => (i === index ? { ...rule, enabled: !rule.enabled } : rule))
    );
    const rule = syncRules[index];
    addToast(rule.enabled ? "Rule disabled" : "Rule enabled");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Link2 className="w-6 h-6 text-blue-500" /> Xactimate API Integration
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage API connections and synchronization rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Connections */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> API Connections
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {connections.map((conn, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{conn.name}</div>
                  <div className="text-xs text-gray-500">{conn.description}</div>
                </div>
                <Badge color={conn.status === "connected" ? "#10b981" : "#3b82f6"}>
                  <CheckCircle2 className="w-3 h-3" /> {conn.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-Sync Rules */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-500" /> Auto-Sync Rules
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {syncRules.map((rule, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <div className="mt-0.5">
                  <div
                    onClick={() => toggleRule(i)}
                    className={`w-8 h-4.5 rounded-full flex items-center transition-colors cursor-pointer ${
                      rule.enabled ? "bg-blue-500 justify-end" : "bg-gray-300 justify-start"
                    }`}
                    style={{ padding: "2px", display: "flex", width: "32px", height: "18px" }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-900 flex items-center gap-1 flex-wrap">
                    <span className="font-medium">{rule.trigger}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">{rule.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insurance Company Integrations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Insurance Company Integrations</h4>
            <p className="text-xs text-blue-700 mb-2">
              Direct integration with major insurance carriers for seamless claim processing, estimate approvals, and supplement submissions.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {insurancePartners.map((name) => (
                <Badge key={name} color="#3b82f6">{name}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
