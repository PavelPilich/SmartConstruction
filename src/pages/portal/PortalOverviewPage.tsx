import { useNavigate } from "react-router-dom";
import { usePortalAuth } from "../../components/layout/PortalLayout";
import {
  CalendarDays, Percent, Target, UserCircle, Clock, Camera, Receipt,
  Package, FileCheck, CloudSun, Phone, Mail, ArrowRight,
  CheckCircle2, Loader2, Circle,
} from "lucide-react";

const steps = [
  { label: "Insurance Filed", status: "done" as const },
  { label: "Inspection Complete", status: "done" as const },
  { label: "Estimate Approved", status: "done" as const },
  { label: "Materials Ordered", status: "done" as const },
  { label: "Work In Progress", status: "current" as const },
  { label: "Final Inspection", status: "pending" as const },
  { label: "Project Complete", status: "pending" as const },
];

const recentActivity = [
  { text: "Crew installed new shingles on south slope", time: "2 hours ago", icon: Package, color: "#3b82f6" },
  { text: "3 new progress photos uploaded", time: "Yesterday", icon: Camera, color: "#8b5cf6" },
  { text: "Invoice #INV-003 sent — $4,200", time: "2 days ago", icon: Receipt, color: "#f59e0b" },
  { text: "Materials delivered to site", time: "3 days ago", icon: Package, color: "#10b981" },
  { text: "Estimate approved by State Farm", time: "1 week ago", icon: FileCheck, color: "#3b82f6" },
];

const team = [
  { role: "Project Manager", name: "Pavel Korotkov", initials: "PK", color: "#3b82f6" },
  { role: "Lead Installer", name: "Mike Rodriguez", initials: "MR", color: "#10b981" },
  { role: "Office Contact", name: "Sarah Mitchell", initials: "SM", color: "#8b5cf6" },
];

export default function PortalOverviewPage() {
  const navigate = useNavigate();
  const { customerName, isLoggedIn } = usePortalAuth();

  if (!isLoggedIn) {
    navigate("/portal", { replace: true });
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Welcome, {customerName.split(" ")[0]}!</h2>
        <p className="text-blue-200 text-sm mt-1">1847 Maple Grove Dr, Plymouth, MN 55442</p>
        <p className="text-blue-300 text-xs mt-0.5">State Farm Claim #HB-2026-4821 &bull; Roof Replacement</p>
      </div>

      {/* Project Status Stepper */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Project Status</h3>
        <div className="flex items-start justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" style={{ left: "7%", right: "7%" }} />
          <div
            className="absolute top-4 h-0.5 bg-green-500 z-0"
            style={{
              left: "7%",
              width: `${(4 / 6) * 86}%`,
            }}
          />
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center relative z-10" style={{ width: `${100 / steps.length}%` }}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  step.status === "done"
                    ? "bg-green-500"
                    : step.status === "current"
                    ? "bg-blue-500 ring-4 ring-blue-200 animate-pulse"
                    : "bg-gray-300"
                }`}
              >
                {step.status === "done" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : step.status === "current" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 text-center leading-tight font-medium ${
                  step.status === "done"
                    ? "text-green-700"
                    : step.status === "current"
                    ? "text-blue-700"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: CalendarDays, label: "Days Since Start", value: "18", color: "#3b82f6" },
          { icon: Percent, label: "Completion", value: "65%", color: "#10b981" },
          { icon: Target, label: "Next Milestone", value: "Final Inspection", color: "#f59e0b" },
          { icon: UserCircle, label: "Your Rep", value: "Pavel", color: "#8b5cf6" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-xs font-medium">{stat.label}</span>
              <div style={{ background: stat.color + "15" }} className="p-1.5 rounded-lg">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" /> Recent Activity
          </h3>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              onClick={() => {
                if (item.icon === Camera) navigate("/portal/photos");
                else if (item.icon === Receipt) navigate("/portal/invoices");
              }}
            >
              <div style={{ background: item.color + "15" }} className="p-2 rounded-lg flex-shrink-0">
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{item.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Your Team */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Your Team</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {team.map((member) => (
            <div key={member.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div
                style={{ backgroundColor: member.color }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              >
                {member.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                <div className="text-xs text-gray-500">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> (612) 555-0190</span>
          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> info@smartconstruction.com</span>
        </div>
      </div>

      {/* Weather Alert */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CloudSun className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-sky-900">Weather Forecast</h4>
            <p className="text-xs text-sky-700 mt-0.5">
              Tomorrow: Clear skies, 62&deg;F &mdash; Good conditions for exterior work
            </p>
            <p className="text-xs text-sky-500 mt-0.5">
              Wednesday: Partly cloudy, 58&deg;F &bull; Thursday: Rain likely, 52&deg;F
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
