import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, BookOpen, Clock, CheckCircle2, PlayCircle, Lock,
  Award, Download, Trophy, BarChart3, Star, AlertCircle,
} from "lucide-react";
import { Badge, Btn, StatCard, Modal } from "../../components/ui";

/* ───── training state (kept in-memory, shared via export) ───── */
export interface TrainingModule {
  id: string;
  title: string;
  duration: string;
  category: string;
  status: "completed" | "in-progress" | "not-started";
  progress: number; // 0-100
  completedDate?: string;
  required: boolean;
}

const initialModules: TrainingModule[] = [
  { id: "platform-overview", title: "Platform Overview", duration: "30 min", category: "Core", status: "completed", progress: 100, completedDate: "Mar 1", required: true },
  { id: "crm-projects", title: "CRM & Project Management", duration: "45 min", category: "Core", status: "completed", progress: 100, completedDate: "Mar 2", required: true },
  { id: "estimating", title: "Xactimate Estimating Basics", duration: "60 min", category: "Estimating", status: "completed", progress: 100, completedDate: "Mar 3", required: true },
  { id: "insurance-claims", title: "Insurance Claims Process", duration: "45 min", category: "Insurance", status: "completed", progress: 100, completedDate: "Mar 5", required: true },
  { id: "drone-inspection", title: "Drone Inspection Training", duration: "90 min", category: "Inspections", status: "completed", progress: 100, completedDate: "Mar 8", required: true },
  { id: "safety-osha", title: "Safety & OSHA Compliance", duration: "60 min", category: "Safety", status: "completed", progress: 100, completedDate: "Mar 10", required: true },
  { id: "sales-scripts", title: "Sales Scripts & Door Knocking", duration: "45 min", category: "Sales", status: "in-progress", progress: 60, required: true },
  { id: "customer-communication", title: "Customer Communication", duration: "30 min", category: "Sales", status: "not-started", progress: 0, required: true },
  { id: "storm-intel", title: "Storm Intelligence System", duration: "30 min", category: "Storm", status: "completed", progress: 100, completedDate: "Mar 12", required: false },
  { id: "quickbooks-integration", title: "QuickBooks Integration", duration: "20 min", category: "Finance", status: "completed", progress: 100, completedDate: "Mar 13", required: false },
  { id: "econtracts", title: "E-Contracts & Signatures", duration: "25 min", category: "Contracts", status: "completed", progress: 100, completedDate: "Mar 14", required: false },
  { id: "client-portal", title: "Client Portal Management", duration: "20 min", category: "Portal", status: "completed", progress: 100, completedDate: "Mar 15", required: false },
  { id: "instant-estimate", title: "Instant Estimate (Roofle) System", duration: "25 min", category: "Sales", status: "in-progress", progress: 40, required: false },
  { id: "subcontractor-mgmt", title: "Subcontractor Management", duration: "30 min", category: "Scheduling", status: "in-progress", progress: 20, required: false },
  { id: "calendar-scheduling", title: "Calendar & Scheduling", duration: "20 min", category: "Scheduling", status: "not-started", progress: 0, required: false },
  { id: "financial-reports", title: "Financial Reports & Invoicing", duration: "25 min", category: "Finance", status: "not-started", progress: 0, required: false },
  { id: "drone-flight-ops", title: "Drone Flight Operations — DJI Mavic", duration: "90 min", category: "Inspections", status: "not-started", progress: 0, required: false },
  { id: "ai-damage-detection", title: "AI Damage Detection System", duration: "45 min", category: "Inspections", status: "not-started", progress: 0, required: false },
  { id: "12-point-inspection", title: "12-Point Property Inspection", duration: "60 min", category: "Inspections", status: "not-started", progress: 0, required: false },
  { id: "metal-barn", title: "Metal Barn Inspection Specialist", duration: "45 min", category: "Inspections", status: "not-started", progress: 0, required: false },
  { id: "window-siding", title: "Window & Siding Inspection", duration: "30 min", category: "Inspections", status: "not-started", progress: 0, required: false },
  { id: "emergency-storm", title: "Emergency Storm Response Protocol", duration: "30 min", category: "Storm", status: "not-started", progress: 0, required: false },
  { id: "ad-campaigns", title: "Ad Campaign Management", duration: "20 min", category: "Marketing", status: "not-started", progress: 0, required: false },
  { id: "social-media", title: "Social Media for Construction", duration: "25 min", category: "Marketing", status: "not-started", progress: 0, required: false },
  { id: "advanced-xactimate", title: "Advanced Xactimate & Supplements", duration: "60 min", category: "Estimating", status: "not-started", progress: 0, required: false },
];

export interface Certificate {
  id: string;
  title: string;
  date: string;
  moduleId: string;
}

const initialCerts: Certificate[] = [
  { id: "cert-1", title: "Platform Certified — Smart Construction", date: "Mar 10, 2025", moduleId: "platform-overview" },
  { id: "cert-2", title: "Drone Operator — Level 1", date: "Mar 8, 2025", moduleId: "drone-inspection" },
  { id: "cert-3", title: "Insurance Claims Specialist", date: "Mar 5, 2025", moduleId: "insurance-claims" },
  { id: "cert-4", title: "Safety & OSHA Compliant", date: "Mar 10, 2025", moduleId: "safety-osha" },
];

/* global mutable store so TrainingModulePage can update it */
let _modules = [...initialModules];
let _certs = [...initialCerts];
let _listeners: (() => void)[] = [];
export function getTrainingModules() { return _modules; }
export function getCertificates() { return _certs; }
export function completeModule(id: string, certTitle?: string) {
  _modules = _modules.map((m) => m.id === id ? { ...m, status: "completed" as const, progress: 100, completedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } : m);
  if (certTitle) {
    _certs = [..._certs, { id: `cert-${Date.now()}`, title: certTitle, date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), moduleId: id }];
  }
  _listeners.forEach((l) => l());
}
export function updateModuleProgress(id: string, progress: number) {
  _modules = _modules.map((m) => m.id === id ? { ...m, status: progress >= 100 ? "completed" as const : "in-progress" as const, progress: Math.min(progress, 100) } : m);
  _listeners.forEach((l) => l());
}
export function subscribeTraining(fn: () => void) { _listeners.push(fn); return () => { _listeners = _listeners.filter((l) => l !== fn); }; }

/* ───── component ───── */
export default function TrainingDashboardPage() {
  const nav = useNavigate();
  const [, setTick] = useState(0);
  const [certModal, setCertModal] = useState<Certificate | null>(null);

  // subscribe to changes
  useEffect(() => {
    const unsub = subscribeTraining(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const modules = getTrainingModules();
  const certs = getCertificates();
  const completed = modules.filter((m) => m.status === "completed").length;
  const inProgress = modules.filter((m) => m.status === "in-progress").length;
  const requiredTotal = modules.filter((m) => m.required).length;
  const pct = Math.round((completed / modules.length) * 100);

  const required = modules.filter((m) => m.required);
  const additional = modules.filter((m) => !m.required);

  const statusIcon = (s: TrainingModule["status"]) =>
    s === "completed" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
    s === "in-progress" ? <PlayCircle className="w-5 h-5 text-blue-500" /> :
    <Lock className="w-5 h-5 text-gray-400" />;

  const statusBadge = (s: TrainingModule["status"]) =>
    s === "completed" ? <Badge color="#10b981">Completed</Badge> :
    s === "in-progress" ? <Badge color="#3b82f6">In Progress</Badge> :
    <Badge color="#6b7280">Not Started</Badge>;

  const actionLabel = (s: TrainingModule["status"]) =>
    s === "completed" ? "Review" : s === "in-progress" ? "Continue" : "Start";

  const actionColor = (s: TrainingModule["status"]) =>
    s === "completed" ? "#10b981" : s === "in-progress" ? "#3b82f6" : "#6b7280";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl"><GraduationCap className="w-7 h-7 text-blue-600" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training Center</h1>
            <p className="text-sm text-gray-500">Employee development &amp; certification</p>
          </div>
        </div>
        <Btn color="#3b82f6" onClick={() => nav("/training/guide")}>
          <BookOpen className="w-4 h-4 inline mr-1" /> Platform Guide
        </Btn>
      </div>

      {/* Overall progress */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-lg">Your Training Progress</span>
          <span className="text-blue-100 text-sm">{completed} of {modules.length} modules complete</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4 mb-1">
          <div className="bg-white rounded-full h-4 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm text-blue-100">{pct}% Complete</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <StatCard icon={BookOpen} label="Total Modules" value={modules.length} color="#3b82f6" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed} color="#10b981" />
        <StatCard icon={PlayCircle} label="In Progress" value={inProgress} color="#f59e0b" />
        <StatCard icon={AlertCircle} label="Required Before Leads" value={requiredTotal} color="#ef4444" />
        <StatCard icon={Award} label="Certificates Earned" value={certs.length} color="#8b5cf6" />
      </div>

      {/* Required modules */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-500" /> Required — Complete Before Getting Leads
        </h2>
        <p className="text-xs text-gray-500 mb-3">You must finish all {requiredTotal} required modules before receiving customer leads.</p>
        <div className="space-y-2">
          {required.map((m, i) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition cursor-pointer" onClick={() => nav(`/training/${m.id}`)}>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">{i + 1}</div>
              {statusIcon(m.status)}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{m.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{m.duration}</span>
                  <Badge color="#6366f1" sm>{m.category}</Badge>
                  {m.completedDate && <span className="text-xs text-gray-400">Completed {m.completedDate}</span>}
                </div>
                {m.status === "in-progress" && (
                  <div className="w-40 bg-gray-100 rounded-full h-1.5 mt-1.5">
                    <div className="bg-blue-500 rounded-full h-1.5" style={{ width: `${m.progress}%` }} />
                  </div>
                )}
              </div>
              {statusBadge(m.status)}
              <Btn size="sm" color={actionColor(m.status)} onClick={(e) => { e?.stopPropagation(); nav(`/training/${m.id}`); }}>
                {actionLabel(m.status)}
              </Btn>
            </div>
          ))}
        </div>
      </div>

      {/* Additional modules */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" /> Additional Training
        </h2>
        <p className="text-xs text-gray-500 mb-3">Expand your skills with advanced modules.</p>
        <div className="space-y-2">
          {additional.map((m, i) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition cursor-pointer" onClick={() => nav(`/training/${m.id}`)}>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">{required.length + i + 1}</div>
              {statusIcon(m.status)}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{m.title}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{m.duration}</span>
                  <Badge color="#6366f1" sm>{m.category}</Badge>
                  {m.completedDate && <span className="text-xs text-gray-400">Completed {m.completedDate}</span>}
                </div>
                {m.status === "in-progress" && (
                  <div className="w-40 bg-gray-100 rounded-full h-1.5 mt-1.5">
                    <div className="bg-blue-500 rounded-full h-1.5" style={{ width: `${m.progress}%` }} />
                  </div>
                )}
              </div>
              {statusBadge(m.status)}
              <Btn size="sm" color={actionColor(m.status)} onClick={(e) => { e?.stopPropagation(); nav(`/training/${m.id}`); }}>
                {actionLabel(m.status)}
              </Btn>
            </div>
          ))}
        </div>
      </div>

      {/* Certificates */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-500" /> Certificates Earned
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {certs.map((c) => (
            <div key={c.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <Award className="w-8 h-8 text-indigo-600" />
                <Badge color="#8b5cf6">{c.date}</Badge>
              </div>
              <div className="font-bold text-gray-900 mb-3">{c.title}</div>
              <div className="flex gap-2">
                <Btn size="sm" color="#8b5cf6" onClick={() => setCertModal(c)}>View Certificate</Btn>
                <Btn size="sm" color="#6b7280" variant="outline" onClick={() => alert("Certificate downloaded (simulated)")}>
                  <Download className="w-3 h-3 inline mr-1" /> Download
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate preview modal */}
      <Modal open={!!certModal} onClose={() => setCertModal(null)} title="Certificate Preview" wide>
        {certModal && (
          <div className="text-center py-6">
            <div className="border-4 border-double border-indigo-300 rounded-xl p-8 mx-auto max-w-lg bg-gradient-to-b from-white to-indigo-50">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-black">SC</div>
                <span className="text-lg font-bold text-gray-900">Smart Construction & Remodeling</span>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-6">Certificate of Completion</div>
              <div className="text-sm text-gray-600 mb-1">This certifies that</div>
              <div className="text-2xl font-bold text-indigo-700 mb-1">Employee Name</div>
              <div className="text-sm text-gray-600 mb-4">has successfully completed</div>
              <div className="text-xl font-bold text-gray-900 mb-1">{certModal.title}</div>
              <div className="text-sm text-gray-500 mb-6">{certModal.date}</div>
              <div className="flex items-center justify-center gap-8 pt-4 border-t border-indigo-200">
                <div className="text-center">
                  <div className="font-script text-lg text-indigo-600 italic">Pavel Pilich</div>
                  <div className="text-xs text-gray-400 border-t border-gray-300 pt-1 mt-1">Owner, Smart Construction</div>
                </div>
                <div className="text-center">
                  <Award className="w-8 h-8 text-yellow-500 mx-auto" />
                  <div className="text-xs text-gray-400 mt-1">Official Seal</div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Btn color="#8b5cf6" onClick={() => alert("Certificate PDF downloaded (simulated)")}>
                <Download className="w-4 h-4 inline mr-1" /> Download PDF
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
