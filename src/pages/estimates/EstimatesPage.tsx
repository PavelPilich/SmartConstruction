import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, Modal, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import { Plus, Search } from "lucide-react";
import type { Estimate } from "../../types";

export default function EstimatesPage() {
  const navigate = useNavigate();
  const { estimates, addEstimate } = useAppStore();
  const [searchQ, setSearchQ] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ customer: "", address: "", project: "", insurance: "" });
  const [projectTypes, setProjectTypes] = useState(["Roof Replace", "Siding + Gutters", "Interior Water", "Storm Damage", "Fire Damage", "Full Exterior"]);

  const filtered = estimates.filter(
    (e) =>
      !searchQ ||
      e.customer.toLowerCase().includes(searchQ.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQ.toLowerCase()) ||
      e.project.toLowerCase().includes(searchQ.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.customer || !form.address || !form.project) return;
    const newId = `XE-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const newEst: Estimate = {
      id: newId,
      project: form.project,
      customer: form.customer,
      address: form.address,
      insurance: { company: form.insurance || "TBD", claim: "", adjuster: "", adjPhone: "", deductible: 0 },
      status: "draft",
      dateCreated: new Date().toISOString().split("T")[0],
      dateApproved: null,
      totalRCV: 0,
      totalACV: 0,
      depreciation: 0,
      supplement: false,
      version: 1,
      lines: [],
    };
    addEstimate(newEst);
    setShowNew(false);
    setForm({ customer: "", address: "", project: "", insurance: "" });
    navigate(`/estimates/${newId}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Estimates</h2>
        <Btn onClick={() => setShowNew(true)}><Plus className="w-4 h-4 inline mr-1" />New Xactimate Estimate</Btn>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search estimates, projects, customers..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {["Estimate", "Project", "Customer", "Insurance", "Claim #", "Status", "RCV", "Lines", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-sm">{searchQ ? "No estimates match your search." : "No estimates yet. Create one to get started."}</td></tr>
            )}
            {filtered.map((est) => (
              <tr key={est.id} className="border-b hover:bg-blue-50 cursor-pointer" onClick={() => navigate(`/estimates/${est.id}`)}>
                <td className="px-4 py-3 font-mono text-blue-700 font-semibold">{est.id}</td>
                <td className="px-4 py-3"><Badge color="#3b82f6">{est.project}</Badge></td>
                <td className="px-4 py-3 font-medium">{est.customer}</td>
                <td className="px-4 py-3">{est.insurance.company}</td>
                <td className="px-4 py-3 font-mono text-xs">{est.insurance.claim}</td>
                <td className="px-4 py-3"><Badge color={est.status === "approved" ? "#10b981" : est.status === "pending" ? "#f59e0b" : "#94a3b8"}>{est.status}</Badge></td>
                <td className="px-4 py-3 font-semibold">${est.totalRCV.toLocaleString()}</td>
                <td className="px-4 py-3">{est.lines.length}</td>
                <td className="px-4 py-3"><Btn size="sm" variant="outline" onClick={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/estimates/${est.id}`); }}>Open</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Xactimate Estimate">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Property address" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <SmartSelect
              label="Project Type *"
              value={form.project}
              onChange={(v) => setForm({ ...form, project: v })}
              options={projectTypes}
              onAddNew={(v) => setProjectTypes((prev) => [...prev, v])}
              placeholder="Select project type..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company</label>
            <input value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} placeholder="Insurance company (optional)" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" onClick={() => setShowNew(false)}>Cancel</Btn>
            <Btn onClick={handleCreate}>Create Estimate</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
