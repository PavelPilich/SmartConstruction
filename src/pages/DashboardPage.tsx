import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard, Badge, Btn, Modal } from "../components/ui";
import { useAppStore } from "../stores/useAppStore";
import { useRegistrationStore } from "../stores/useRegistrationStore";
import { getExpirationAlerts } from "../lib/verificationService";
import {
  FileText, CheckCircle2, Clock, DollarSign, PlusCircle,
  Camera, Upload, List, Send, Plus, ArrowRight, BarChart3,
  AlertTriangle, UserCheck, ShieldAlert, ExternalLink, Zap, CloudLightning,
} from "lucide-react";
import { REGISTRANT_STATUS_COLORS, REGISTRANT_STATUS_LABELS } from "../types/registration";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { estimates, supplements, addToast, updateEstimate } = useAppStore();
  const { registrants, positions } = useRegistrationStore();
  const approved = estimates.filter((e) => e.status === "approved");
  const pending = estimates.filter((e) => e.status === "pending");
  const drafts = estimates.filter((e) => e.status === "draft");
  const totalRCV = estimates.reduce((a, e) => a + e.totalRCV, 0);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  // Upload simulation state for Import Data modal
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string }[]>([]);
  const [droneImporting, setDroneImporting] = useState(false);
  const [measureImporting, setMeasureImporting] = useState(false);

  // Submit modal state
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const blockedRegistrants = registrants.filter((r) => r.status === "blocked");
  const recentRegistrations = [...registrants]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 3);

  // Expiration alerts from verification service
  const expirationAlerts = getExpirationAlerts(registrants);
  const urgentAlerts = expirationAlerts.filter((a) => a.tier === "urgent" || a.tier === "expired");

  const workflowSteps = [
    { s: "1", t: "Inspection", d: "Drone + manual", icon: Camera, route: "/inspections", action: "Schedule and manage drone inspections" },
    { s: "2", t: "Import Data", d: "Photos, measurements", icon: Upload, route: null, action: "Upload photos and measurements to your estimate" },
    { s: "3", t: "Build Estimate", d: "Xactimate line items", icon: List, route: "/estimates", action: "Create or edit Xactimate estimates with line items" },
    { s: "4", t: "Price Auto-Fill", d: "Regional pricing", icon: DollarSign, route: "/estimates/pricelist", action: "View and sync Xactimate regional pricing" },
    { s: "5", t: "Submit to Ins.", d: "Direct to adjuster", icon: Send, route: null, action: "Submit estimate directly to insurance adjuster" },
    { s: "6", t: "Track Status", d: "Approved/Denied", icon: Clock, route: "/crm/projects", action: "Track estimate approval status in Projects" },
    { s: "7", t: "Supplement", d: "Add items if needed", icon: Plus, route: "/estimates/supplements", action: "Create supplement requests for additional items" },
  ];

  const handleStepClick = (step: typeof workflowSteps[0]) => {
    if (step.route) {
      navigate(step.route);
    } else {
      // Reset modal state when opening
      if (step.s === "2") {
        setUploadedFiles([]);
        setDroneImporting(false);
        setMeasureImporting(false);
      }
      if (step.s === "5") {
        setSubmittingId(null);
      }
      setActiveStep(step.s);
    }
  };

  const handleSimulateUpload = () => {
    const extensions = ["jpg", "png", "pdf", "heic"];
    const prefixes = ["inspection-photo", "roof-damage", "siding-detail", "gutter-closeup", "overview-shot"];
    const ext = extensions[Math.floor(Math.random() * extensions.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const newFile = { name: `${prefix}-${Date.now().toString(36)}.${ext}`, type: ext.toUpperCase() };
    setUploadedFiles((prev) => [...prev, newFile]);
    addToast(`Uploaded ${newFile.name}`, "success");
  };

  const handleDroneImport = () => {
    setDroneImporting(true);
    setTimeout(() => {
      const droneFiles = [
        { name: `drone-aerial-north-${Date.now().toString(36)}.jpg`, type: "JPG" },
        { name: `drone-aerial-south-${Date.now().toString(36)}.jpg`, type: "JPG" },
        { name: `drone-roof-overview-${Date.now().toString(36)}.jpg`, type: "JPG" },
      ];
      setUploadedFiles((prev) => [...prev, ...droneFiles]);
      setDroneImporting(false);
      addToast(`Imported ${droneFiles.length} drone photos`, "success");
    }, 1500);
  };

  const handleMeasureImport = () => {
    setMeasureImporting(true);
    setTimeout(() => {
      const measureFiles = [
        { name: `roof-measurements-${Date.now().toString(36)}.pdf`, type: "PDF" },
        { name: `field-sketch-${Date.now().toString(36)}.pdf`, type: "PDF" },
      ];
      setUploadedFiles((prev) => [...prev, ...measureFiles]);
      setMeasureImporting(false);
      addToast(`Imported ${measureFiles.length} measurement files`, "success");
    }, 1200);
  };

  const handleSubmitToInsurance = (estId: string) => {
    setSubmittingId(estId);
    setTimeout(() => {
      updateEstimate(estId, { status: "pending" });
      addToast(`Estimate ${estId} submitted to insurance adjuster`, "success");
      setSubmittingId(null);
    }, 1500);
  };

  const getPositionName = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    return pos ? pos.name : "Unknown";
  };

  const getPositionColor = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    return pos ? pos.color : "#94a3b8";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Xactimate Estimating</h2>
          <p className="text-sm text-gray-500">Integrated with CRM. Create, edit, submit estimates without leaving the platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700 font-medium">Xactimate API Connected</span>
          </span>
          <Btn size="sm" onClick={() => navigate("/estimates")}>
            <Plus className="w-4 h-4 inline mr-1" />New Estimate
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatCard icon={FileText} label="Total Estimates" value={estimates.length} color="#3b82f6" onClick={() => navigate("/estimates")} />
        <StatCard icon={CheckCircle2} label="Approved" value={approved.length} color="#10b981" onClick={() => navigate("/estimates")} />
        <StatCard icon={Clock} label="Pending" value={pending.length} sub="Awaiting adjuster" color="#f59e0b" onClick={() => navigate("/crm/projects")} />
        <StatCard icon={DollarSign} label="Total RCV" value={`$${Math.round(totalRCV).toLocaleString()}`} color="#8b5cf6" onClick={() => navigate("/financial/reports")} />
        <StatCard icon={PlusCircle} label="Supplements" value={supplements.length} sub={`$${supplements.reduce((a, s) => a + s.addedAmount, 0).toLocaleString()} added`} color="#ef4444" onClick={() => navigate("/estimates/supplements")} />
      </div>

      {/* Workflow Steps - ALL CLICKABLE */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-3">Xactimate Workflow — CRM Integrated</h3>
        <div className="grid grid-cols-7 gap-2">
          {workflowSteps.map((step, i) => (
            <div
              key={step.s}
              onClick={() => handleStepClick(step)}
              className="bg-white/10 rounded-xl p-3 text-center cursor-pointer hover:bg-white/25 transition-all hover:scale-105 active:scale-95 group relative"
            >
              <div className="w-8 h-8 bg-white/20 group-hover:bg-white/40 rounded-full flex items-center justify-center mx-auto mb-2 transition">
                <step.icon className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold">{step.t}</div>
              <div className="text-xs text-blue-200 mt-0.5">{step.d}</div>
              {i < workflowSteps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-blue-300 absolute -right-1.5 top-1/2 -translate-y-1/2 hidden lg:block" />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-300 mt-3 text-center">Click any step to jump directly into that workflow stage</p>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-6 gap-3">
        <button onClick={() => navigate("/estimate")} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition text-left group">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition">
            <Zap className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Instant Estimates</div>
            <div className="text-xs text-gray-500">Roofle-style</div>
          </div>
        </button>
        <button onClick={() => navigate("/estimates")} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition text-left group">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">View Estimates</div>
            <div className="text-xs text-gray-500">{estimates.length} total</div>
          </div>
        </button>
        <button onClick={() => navigate("/crm/projects")} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition text-left group">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">CRM Projects</div>
            <div className="text-xs text-gray-500">Track all jobs</div>
          </div>
        </button>
        <button onClick={() => navigate("/inspections")} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition text-left group">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition">
            <Camera className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Drone Inspections</div>
            <div className="text-xs text-gray-500">Schedule & manage</div>
          </div>
        </button>
        <button onClick={() => navigate("/financial/invoices")} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition text-left group">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Invoices</div>
            <div className="text-xs text-gray-500">Billing & payments</div>
          </div>
        </button>
        <button onClick={() => navigate("/portal")} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition text-left group">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition">
            <ExternalLink className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Client Portal</div>
            <div className="text-xs text-gray-500">Customer view</div>
          </div>
        </button>
      </div>

      {/* Storm Alert Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-red-50 border border-amber-300 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CloudLightning className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-900">Active Storm Alert</span>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <p className="text-sm text-amber-700">Hail Watch in Plymouth, Maple Grove — Next 2 hours | Wind Advisory Hennepin County</p>
            </div>
          </div>
          <Btn size="sm" color="#f59e0b" onClick={() => navigate("/storm")}>
            <Zap className="w-4 h-4 inline mr-1" />View Storm Center
          </Btn>
        </div>
      </div>

      {/* Storm Risk Tool — Lead Magnet Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CloudLightning className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Storm Risk Tool — Lead Magnet</h3>
          </div>
          <Btn size="sm" variant="outline" color="#8b5cf6" onClick={() => navigate("/storm-check")}>
            Open Tool <ExternalLink className="w-3.5 h-3.5 inline ml-1" />
          </Btn>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-purple-700">2,400</div>
            <div className="text-xs text-purple-600 font-medium mt-0.5">Checks This Month</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-green-700">342</div>
            <div className="text-xs text-green-600 font-medium mt-0.5">Leads Captured</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-blue-700">14%</div>
            <div className="text-xs text-blue-600 font-medium mt-0.5">Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Expiration Alerts */}
      {urgentAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Document Expiration Alerts</h3>
                <p className="text-sm text-amber-700 mt-0.5">
                  {urgentAlerts.length} document{urgentAlerts.length !== 1 ? "s" : ""} expired or expiring within 7 days
                </p>
                <div className="flex flex-col gap-1.5 mt-2">
                  {urgentAlerts.slice(0, 5).map((alert) => (
                    <span
                      key={`${alert.registrantId}-${alert.docId}`}
                      className="inline-flex items-center gap-2 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium cursor-pointer hover:bg-amber-200 transition"
                      onClick={() => navigate(`/admin/registrations/${alert.registrantId}`)}
                    >
                      <span className={`w-2 h-2 rounded-full ${alert.tier === "expired" ? "bg-red-500" : "bg-amber-500"}`} />
                      {alert.registrantName} — {alert.formName}
                      {alert.tier === "expired"
                        ? ` (expired ${Math.abs(alert.daysUntilExpiry)}d ago)`
                        : ` (expires in ${alert.daysUntilExpiry}d)`}
                    </span>
                  ))}
                  {urgentAlerts.length > 5 && (
                    <span className="text-xs text-amber-600">+ {urgentAlerts.length - 5} more alerts</span>
                  )}
                </div>
              </div>
            </div>
            <Btn size="sm" color="#f59e0b" onClick={() => navigate("/admin/registrations")}>
              Review All
            </Btn>
          </div>
        </div>
      )}

      {/* Blocked Personnel Alert */}
      {blockedRegistrants.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Blocked Personnel Alert</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {blockedRegistrants.length} registrant{blockedRegistrants.length !== 1 ? "s" : ""} currently blocked due to compliance issues
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {blockedRegistrants.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium cursor-pointer hover:bg-red-200 transition"
                      onClick={() => navigate(`/admin/registrations/${r.id}`)}
                    >
                      {r.firstName} {r.lastName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Btn size="sm" color="#ef4444" onClick={() => navigate("/admin/registrations?status=blocked")}>
              View All
            </Btn>
          </div>
        </div>
      )}

      {/* Recent Registrations */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Recent Registrations</h3>
          </div>
          <Btn size="sm" variant="outline" color="#3b82f6" onClick={() => navigate("/admin/registrations")}>
            View All <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
          </Btn>
        </div>
        {recentRegistrations.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">No registrations yet.</div>
        ) : (
          recentRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition rounded-lg px-2"
              onClick={() => navigate(`/admin/registrations/${reg.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: getPositionColor(reg.positionId) }}>
                  {reg.firstName.charAt(0)}{reg.lastName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{reg.firstName} {reg.lastName}</span>
                    <Badge color={getPositionColor(reg.positionId)} sm>{getPositionName(reg.positionId)}</Badge>
                    <Badge color={REGISTRANT_STATUS_COLORS[reg.status]}>{REGISTRANT_STATUS_LABELS[reg.status]}</Badge>
                  </div>
                  <div className="text-xs text-gray-500">{reg.company} | Registered {new Date(reg.registeredAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Estimates */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Estimates</h3>
          <Btn size="sm" variant="outline" color="#3b82f6" onClick={() => navigate("/estimates")}>
            View All <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
          </Btn>
        </div>
        {estimates.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No estimates yet.</p>
            <Btn size="sm" className="mt-2" onClick={() => navigate("/estimates")}>Create First Estimate</Btn>
          </div>
        ) : (
          estimates.map((est) => (
            <div
              key={est.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition rounded-lg px-2"
              onClick={() => navigate(`/estimates/${est.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold ${est.status === "approved" ? "bg-green-500" : est.status === "pending" ? "bg-yellow-500" : "bg-gray-400"}`}>
                  XE
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{est.id}</span>
                    <Badge color="#3b82f6" sm>{est.project}</Badge>
                    <Badge color={est.status === "approved" ? "#10b981" : est.status === "pending" ? "#f59e0b" : "#94a3b8"}>{est.status}</Badge>
                    {est.supplement && <Badge color="#ef4444" sm>Has Supplement</Badge>}
                  </div>
                  <div className="text-xs text-gray-500">{est.customer} | {est.address}</div>
                  <div className="text-xs text-gray-500">{est.insurance.company} — Claim #{est.insurance.claim}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">${est.totalRCV.toLocaleString()}</div>
                <div className="text-xs text-gray-500">RCV | v{est.version}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Import Data Modal (Step 2) */}
      <Modal open={activeStep === "2"} onClose={() => setActiveStep(null)} title="Import Data — Photos & Measurements">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Upload inspection photos, drone imagery, and field measurements to attach to your estimate.</p>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition cursor-pointer"
            onClick={handleSimulateUpload}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <div className="text-sm font-medium text-gray-700">Drop files here or click to upload</div>
            <div className="text-xs text-gray-500 mt-1">Supports JPG, PNG, PDF, HEIC — up to 50MB per file</div>
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {uploadedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-blue-800 truncate">{f.name}</span>
                    <Badge color="#3b82f6" sm>{f.type}</Badge>
                  </div>
                  <button onClick={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-blue-400 hover:text-red-500 transition text-xs px-1">
                    Remove
                  </button>
                </div>
              ))}
              <div className="text-xs text-gray-500 text-right">{uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""} uploaded</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDroneImport}
              disabled={droneImporting}
              className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
            >
              <Camera className={`w-4 h-4 ${droneImporting ? "animate-spin" : ""}`} />
              {droneImporting ? "Importing..." : "Import Drone Photos"}
            </button>
            <button
              onClick={handleMeasureImport}
              disabled={measureImporting}
              className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm font-medium text-green-700 hover:bg-green-100 transition disabled:opacity-50"
            >
              <BarChart3 className={`w-4 h-4 ${measureImporting ? "animate-spin" : ""}`} />
              {measureImporting ? "Importing..." : "Import Measurements"}
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setActiveStep(null)}>Close</Btn>
            <Btn color="#3b82f6" onClick={() => {
              if (uploadedFiles.length > 0) {
                addToast(`${uploadedFiles.length} files ready — opening estimates to attach`, "success");
              }
              setActiveStep(null);
              navigate("/estimates");
            }}>
              Go to Estimates
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Submit to Insurance Modal (Step 5) */}
      <Modal open={activeStep === "5"} onClose={() => setActiveStep(null)} title="Submit to Insurance">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Select an estimate to submit directly to the insurance adjuster for review.</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {drafts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">All estimates have been submitted!</p>
                <p className="text-xs text-gray-500 mt-1">Check pending estimates for approval status.</p>
              </div>
            ) : drafts.map((est) => (
              <div key={est.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div>
                  <div className="text-sm font-medium text-gray-900">{est.id} — {est.customer}</div>
                  <div className="text-xs text-gray-500">{est.insurance.company} | ${est.totalRCV.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  {submittingId === est.id ? (
                    <span className="text-xs text-blue-600 font-medium animate-pulse">Submitting...</span>
                  ) : (
                    <Btn size="sm" color="#3b82f6" onClick={() => handleSubmitToInsurance(est.id)}>
                      <Send className="w-3.5 h-3.5 inline mr-1" />Submit
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setActiveStep(null)}>Close</Btn>
            <Btn color="#3b82f6" onClick={() => { setActiveStep(null); navigate("/estimates"); }}>View All Estimates</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
