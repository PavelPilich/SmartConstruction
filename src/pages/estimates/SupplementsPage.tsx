import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, Modal, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import { Plus } from "lucide-react";
import type { Supplement } from "../../types";

export default function SupplementsPage() {
  const navigate = useNavigate();
  const { estimates, supplements, addSupplement, addToast } = useAppStore();
  const [viewSup, setViewSup] = useState<Supplement | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ estimate: "", reason: "", items: "", amount: "" });

  const handleCreate = () => {
    if (!form.estimate || !form.reason || !form.items || !form.amount) return;
    const newSup: Supplement = {
      id: `SUP-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      estimate: form.estimate,
      date: new Date().toISOString().split("T")[0],
      reason: form.reason,
      addedItems: parseInt(form.items) || 0,
      addedAmount: parseFloat(form.amount) || 0,
      status: "pending",
    };
    addSupplement(newSup);
    addToast(`Supplement ${newSup.id} created`);
    setShowCreate(false);
    setForm({ estimate: "", reason: "", items: "", amount: "" });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-900">Supplements</h2>
      <div className="bg-white rounded-xl border p-5">
        <div className="text-sm text-gray-600 mb-4">
          Supplements are additional items discovered during work that were not visible during the original inspection. They are submitted to insurance for additional coverage.
        </div>
        {supplements.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">No supplements yet. Create one below.</div>
        )}
        {supplements.map((sup) => (
          <div key={sup.id} className={`rounded-xl border-2 p-4 mb-3 ${sup.status === "approved" ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{sup.id}</span>
                  <Badge color="#3b82f6" sm>{sup.estimate}</Badge>
                  <Badge color={sup.status === "approved" ? "#10b981" : "#f59e0b"}>{sup.status}</Badge>
                </div>
                <div className="text-sm text-gray-700 mt-1">{sup.reason}</div>
                <div className="text-xs text-gray-500 mt-1">{sup.date} | {sup.addedItems} items added</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">+${sup.addedAmount.toLocaleString()}</div>
                <Btn size="sm" variant="outline" className="mt-1" onClick={() => setViewSup(sup)}>View Details</Btn>
              </div>
            </div>
          </div>
        ))}
        <Btn onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 inline mr-1" />Create New Supplement</Btn>
      </div>

      <Modal open={!!viewSup} onClose={() => setViewSup(null)} title={viewSup ? `Supplement ${viewSup.id}` : ""}>
        {viewSup && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Supplement ID</div>
                <div className="font-semibold">{viewSup.id}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Linked Estimate</div>
                <div className="font-semibold">{viewSup.estimate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div className="font-semibold">{viewSup.date}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <Badge color={viewSup.status === "approved" ? "#10b981" : "#f59e0b"}>{viewSup.status}</Badge>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Reason</div>
              <div className="text-sm text-gray-800 mt-1">{viewSup.reason}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Items Added</div>
                <div className="text-lg font-bold">{viewSup.addedItems}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Amount Added</div>
                <div className="text-lg font-bold text-green-700">+${viewSup.addedAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Btn variant="outline" onClick={() => { setViewSup(null); navigate(`/estimates/${viewSup.estimate}`); }}>Go to Estimate</Btn>
              <Btn variant="outline" onClick={() => setViewSup(null)}>Close</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Supplement">
        <div className="space-y-4">
          <div>
            <SmartSelect
              label="Estimate"
              required
              value={form.estimate ? `${form.estimate} — ${estimates.find((e) => e.id === form.estimate)?.customer || ""}` : ""}
              onChange={(v) => {
                const estId = v.split(" — ")[0];
                setForm({ ...form, estimate: estId });
              }}
              options={estimates.map((est) => `${est.id} — ${est.customer}`)}
              onAddNew={() => { navigate("/estimates"); addToast("Create an estimate first, then come back to add a supplement", "info"); }}
              placeholder="Select estimate..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Describe additional items found..." rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items Count *</label>
              <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} type="number" placeholder="Number of items" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
              <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" placeholder="Additional amount" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" onClick={() => setShowCreate(false)}>Cancel</Btn>
            <Btn onClick={handleCreate}>Create Supplement</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
