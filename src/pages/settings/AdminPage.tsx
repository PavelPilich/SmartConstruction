import { useState } from "react";
import { Building2, MapPin, Phone, Mail, Users, Shield, Bell, RefreshCw, Database, Download, Trash2 } from "lucide-react";
import { Badge, Btn, Modal, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

interface TeamMember {
  name: string;
  email: string;
  role: string;
  roleColor: string;
  status: "active" | "inactive";
}

const initialTeamMembers: TeamMember[] = [
  { name: "Alex Martinez", email: "alex@smartconstruction.com", role: "Owner / Admin", roleColor: "#ef4444", status: "active" },
  { name: "Mike Rodriguez", email: "mike@smartconstruction.com", role: "Project Manager", roleColor: "#3b82f6", status: "active" },
  { name: "Sarah Kim", email: "sarah@smartconstruction.com", role: "Estimator", roleColor: "#8b5cf6", status: "active" },
  { name: "James Wilson", email: "james@smartconstruction.com", role: "Crew Lead", roleColor: "#f59e0b", status: "active" },
  { name: "Lisa Chen", email: "lisa@smartconstruction.com", role: "Office Manager", roleColor: "#10b981", status: "inactive" },
];

interface Preference {
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
}

const initialPreferences: Preference[] = [
  { label: "Email Notifications", description: "Receive email alerts for new estimates, approvals, and payments", enabled: true, icon: Bell },
  { label: "Push Notifications", description: "Browser push notifications for real-time updates", enabled: true, icon: Bell },
  { label: "Auto-Sync Estimates", description: "Automatically sync Xactimate estimates on import", enabled: true, icon: RefreshCw },
  { label: "Auto-Generate Invoices", description: "Create invoices automatically when estimates are approved", enabled: false, icon: Database },
  { label: "Two-Factor Authentication", description: "Require 2FA for all team member logins", enabled: true, icon: Shield },
];

const roleOptions = [
  { value: "Project Manager", color: "#3b82f6" },
  { value: "Estimator", color: "#8b5cf6" },
  { value: "Crew Lead", color: "#f59e0b" },
  { value: "Office Manager", color: "#10b981" },
  { value: "Field Tech", color: "#06b6d4" },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`w-9 h-5 rounded-full flex items-center cursor-pointer transition-colors ${
        enabled ? "bg-blue-500 justify-end" : "bg-gray-300 justify-start"
      }`}
      style={{ padding: "2px" }}
    >
      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
    </div>
  );
}

export default function AdminPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [prefs, setPrefs] = useState<Preference[]>(initialPreferences);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [clearCacheOpen, setClearCacheOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Project Manager" });
  const [roleOptionsList, setRoleOptionsList] = useState<string[]>(roleOptions.map((r) => r.value));
  const addToast = useAppStore((s) => s.addToast);

  const handleInvite = () => {
    if (!inviteForm.name || !inviteForm.email) {
      addToast("Please fill in all fields", "error");
      return;
    }
    const roleOpt = roleOptions.find((r) => r.value === inviteForm.role);
    const newMember: TeamMember = {
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      roleColor: roleOpt?.color ?? "#3b82f6",
      status: "active",
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteForm({ name: "", email: "", role: "Project Manager" });
    setInviteOpen(false);
    addToast(`Invitation sent to ${newMember.email}`);
  };

  const togglePref = (index: number) => {
    setPrefs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const inputCls = "w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Company information, team, and system preferences</p>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-400" /> Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Company Name</label>
            <div className="text-sm font-medium text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              Smart Construction & Remodeling
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">License #</label>
            <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              CBC-058741
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3" /> Address
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              1234 Construction Blvd, Suite 200, Orlando, FL 32801
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3" /> Phone
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                (407) 555-0123
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                info@smartconstruction.com
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" /> Team Members
          </h3>
          <Btn color="#3b82f6" size="sm" onClick={() => setInviteOpen(true)}>Invite Member</Btn>
        </div>
        <div className="divide-y divide-gray-100">
          {teamMembers.map((member, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={member.roleColor}>{member.role}</Badge>
                <Badge color={member.status === "active" ? "#10b981" : "#94a3b8"} sm>
                  {member.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">System Preferences</h3>
        <div className="space-y-4">
          {prefs.map((pref, i) => {
            const Icon = pref.icon;
            return (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-gray-100 rounded-lg mt-0.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{pref.label}</div>
                    <div className="text-xs text-gray-500">{pref.description}</div>
                  </div>
                </div>
                <Toggle enabled={pref.enabled} onToggle={() => togglePref(i)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-400" /> Data Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">Export Data</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Download all project data, estimates, invoices, and reports as CSV or JSON.</p>
            <Btn color="#3b82f6" variant="outline" size="sm" onClick={() => {
              const data = {
                exportDate: new Date().toISOString(),
                company: "Smart Construction & Remodeling Inc.",
                team: teamMembers.map((m) => ({ name: m.name, email: m.email, role: m.role })),
                preferences: prefs.map((p) => ({ label: p.label, enabled: p.enabled })),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "smart-construction-export.json"; a.click();
              URL.revokeObjectURL(url);
              addToast("Data exported as JSON", "success");
            }}>
              <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Export All Data</span>
            </Btn>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-900">Clear Cache</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Clear local cache and temporary data. This does not delete any project data.</p>
            <Btn color="#ef4444" variant="outline" size="sm" onClick={() => setClearCacheOpen(true)}>
              <span className="flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Clear Cache</span>
            </Btn>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
            <input className={inputCls} placeholder="Enter full name" value={inviteForm.name} onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Email Address</label>
            <input className={inputCls} type="email" placeholder="Enter email address" value={inviteForm.email} onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <SmartSelect
              label="Role"
              value={inviteForm.role}
              onChange={(v) => setInviteForm((f) => ({ ...f, role: v }))}
              options={roleOptionsList}
              onAddNew={(v) => setRoleOptionsList((prev) => [...prev, v])}
              placeholder="Select role..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleInvite}>Send Invite</Btn>
          </div>
        </div>
      </Modal>

      {/* Clear Cache Confirmation Modal */}
      <Modal open={clearCacheOpen} onClose={() => setClearCacheOpen(false)} title="Clear Cache">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to clear the local cache? This will remove temporary data but will not delete any project data.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setClearCacheOpen(false)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={() => { setClearCacheOpen(false); addToast("Cache cleared"); }}>Clear Cache</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
