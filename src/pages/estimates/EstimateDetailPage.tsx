import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Btn, Modal } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import { xactCategories, priceList } from "../../data/xactimate";
import type { PriceItem } from "../../types";
import { Download, Send, Camera, Edit, Copy, Plus, X, Search, CheckCircle2, Link2, Trash2 } from "lucide-react";

export default function EstimateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estimates, addLineToEstimate, removeLineFromEstimate, updateEstimate, duplicateEstimate, addToast } = useAppStore();
  const est = estimates.find((e) => e.id === id);

  const [newLineItem, setNewLineItem] = useState<boolean | PriceItem | null>(null);
  const [addQty, setAddQty] = useState("");
  const [plSearch, setPlSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ customer: "", address: "", company: "", claim: "", adjuster: "", adjPhone: "", deductible: "" });

  const filteredPL = useMemo(() => {
    let items = [...priceList];
    if (catFilter !== "all") items = items.filter((i) => i.cat === catFilter);
    if (plSearch) {
      const q = plSearch.toLowerCase();
      items = items.filter((i) => i.code.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    }
    return items;
  }, [catFilter, plSearch]);

  if (!est) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/estimates")} className="text-blue-600 text-sm hover:underline">{"\u2190"} Back</button>
          <h2 className="text-2xl font-bold text-gray-900">Estimate Not Found</h2>
        </div>
        <div className="bg-white rounded-xl border p-8 text-center">
          <div className="text-gray-500 mb-4">Estimate <span className="font-mono font-semibold">{id}</span> does not exist.</div>
          <Btn onClick={() => navigate("/estimates")}>Go to Estimates</Btn>
        </div>
      </div>
    );
  }

  const subtotal = est.lines.reduce((a, l) => a + l.total, 0);
  const ohp = Math.round(subtotal * 0.10 * 100) / 100;
  const tax = Math.round(subtotal * 0.07125 * 100) / 100;
  const grandTotal = subtotal + ohp + tax;

  const handleConfirmAdd = () => {
    if (typeof newLineItem === "object" && newLineItem !== null && "code" in newLineItem && addQty) {
      const qty = parseFloat(addQty);
      if (isNaN(qty) || qty <= 0) return;
      addLineToEstimate(est.id, {
        code: newLineItem.code,
        desc: newLineItem.desc,
        qty,
        unit: newLineItem.unit,
        price: newLineItem.price,
        total: Math.round(qty * newLineItem.price * 100) / 100,
      });
      addToast(`Added ${newLineItem.code} to estimate`);
      setNewLineItem(true);
      setAddQty("");
    }
  };

  const handleExportESX = () => {
    addToast("ESX file exported successfully");
  };

  const handleSubmitInsurance = () => {
    updateEstimate(est.id, { status: "pending" });
    addToast(`Submitted to ${est.insurance.company}`);
  };

  const handleAttachPhotos = () => {
    addToast("Photo upload coming soon", "info");
  };

  const handleOpenEdit = () => {
    setEditForm({
      customer: est.customer,
      address: est.address,
      company: est.insurance.company,
      claim: est.insurance.claim,
      adjuster: est.insurance.adjuster,
      adjPhone: est.insurance.adjPhone,
      deductible: String(est.insurance.deductible),
    });
    setShowEdit(true);
  };

  const handleSaveEdit = () => {
    updateEstimate(est.id, {
      customer: editForm.customer,
      address: editForm.address,
      insurance: {
        company: editForm.company,
        claim: editForm.claim,
        adjuster: editForm.adjuster,
        adjPhone: editForm.adjPhone,
        deductible: parseFloat(editForm.deductible) || 0,
      },
    });
    addToast("Estimate updated");
    setShowEdit(false);
  };

  const handleDuplicate = () => {
    duplicateEstimate(est.id);
    const duped = useAppStore.getState().estimates;
    const newest = duped[duped.length - 1];
    navigate(`/estimates/${newest.id}`);
  };

  const handleDownloadPDF = () => {
    addToast("PDF downloaded");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/estimates")} className="text-blue-600 text-sm hover:underline">{"\u2190"} Back</button>
        <h2 className="text-2xl font-bold text-gray-900">Estimate {est.id}</h2>
        <Badge color={est.status === "approved" ? "#10b981" : est.status === "pending" ? "#f59e0b" : "#94a3b8"}>{est.status}</Badge>
        <span className="text-sm text-gray-500">v{est.version}</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-1">Project / Customer</div>
          <div className="font-semibold text-gray-900">{est.customer}</div>
          <div className="text-sm text-gray-600">{est.address}</div>
          <div className="flex items-center gap-2 mt-2"><Badge color="#3b82f6">{est.project}</Badge><span className="text-xs text-gray-500">CRM Linked</span></div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-1">Insurance</div>
          <div className="font-semibold text-gray-900">{est.insurance.company}</div>
          <div className="text-sm text-gray-600">Claim: {est.insurance.claim}</div>
          <div className="text-sm text-gray-600">Adjuster: {est.insurance.adjuster}</div>
          <div className="text-sm text-gray-600">Deductible: ${est.insurance.deductible.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-xs text-gray-500 mb-1">Totals</div>
          <div className="flex justify-between text-sm"><span>RCV:</span><span className="font-bold text-green-700">${est.totalRCV.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>Depreciation:</span><span className="text-red-600">-${est.depreciation.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm border-t mt-1 pt-1"><span>ACV:</span><span className="font-bold">${est.totalACV.toLocaleString()}</span></div>
          <div className="text-xs text-gray-500 mt-1">Created: {est.dateCreated}{est.dateApproved ? ` | Approved: ${est.dateApproved}` : ""}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-900">Xactimate Line Items ({est.lines.length})</h3>
          <div className="flex gap-2">
            <Btn size="sm" onClick={() => setNewLineItem(true)}><Plus className="w-3 h-3 inline mr-1" />Add Line</Btn>
            <Btn size="sm" variant="outline" color="#8b5cf6" onClick={() => navigate("/estimates/supplements")}>Supplement</Btn>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {["Xactimate Code", "Description", "Qty", "Unit", "Unit Price", "Total", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {est.lines.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No line items yet. Click "Add Line" to get started.</td></tr>
              )}
              {est.lines.map((line, i) => {
                const cat = xactCategories.find((c) => c.code === line.code.split(" ")[0]);
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-blue-50 transition group">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ background: cat?.color || "#94a3b8" }}>{line.code.split(" ")[0]}</span>
                        <span className="font-mono text-xs text-blue-700">{line.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-800">{line.desc}</td>
                    <td className="px-4 py-2.5 font-semibold">{line.qty}</td>
                    <td className="px-4 py-2.5 text-gray-500">{line.unit}</td>
                    <td className="px-4 py-2.5">${line.price.toFixed(2)}</td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">${line.total.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => { removeLineFromEstimate(est.id, i); addToast("Line item removed"); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition" title="Remove line">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t"><td colSpan={6} className="px-4 py-2 text-right font-medium text-gray-700">Subtotal</td><td className="px-4 py-2 font-semibold">${subtotal.toLocaleString()}</td></tr>
              <tr><td colSpan={6} className="px-4 py-2 text-right font-medium text-gray-700">O&amp;P (10%)</td><td className="px-4 py-2 font-semibold">${ohp.toLocaleString()}</td></tr>
              <tr><td colSpan={6} className="px-4 py-2 text-right font-medium text-gray-700">Tax (7.125%)</td><td className="px-4 py-2 font-semibold">${tax.toLocaleString()}</td></tr>
              <tr className="border-t-2 border-gray-400"><td colSpan={6} className="px-4 py-3 text-right font-bold text-gray-900 text-lg">RCV Total</td><td className="px-4 py-3 font-bold text-green-700 text-lg">${grandTotal.toLocaleString()}</td></tr>
            </tfoot>
          </table>
        </div>
      </div>

      {newLineItem && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">Add Line Item from Xactimate Price List</h3>
            <button onClick={() => setNewLineItem(null)} className="p-1 hover:bg-blue-100 rounded"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input value={plSearch} onChange={(e) => setPlSearch(e.target.value)} placeholder="Search codes or descriptions..." className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-1">
              {[{ id: "all", label: "All", code: "" }, ...xactCategories.slice(0, 5)].map((c) => (
                <button key={c.code || "all"} onClick={() => setCatFilter(c.code || "all")}
                  className={`px-2.5 py-1.5 text-xs rounded-lg font-medium ${catFilter === (c.code || "all") ? "bg-blue-600 text-white" : "bg-white border text-gray-600"}`}>
                  {"label" in c ? c.label : c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto bg-white rounded-lg border">
            {filteredPL.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">No items match your search or filter.</div>
            )}
            {filteredPL.map((item, i) => {
              const cat = xactCategories.find((c) => c.code === item.cat);
              return (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0 hover:bg-blue-50 cursor-pointer transition" onClick={() => setNewLineItem(item)}>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold text-white" style={{ background: cat?.color || "#94a3b8" }}>{item.cat}</span>
                    <span className="font-mono text-xs text-blue-700">{item.code}</span>
                    <span className="text-sm text-gray-800">{item.desc}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">${item.price.toFixed(2)}/{item.unit}</span>
                    <Btn size="sm" color="#10b981">Add</Btn>
                  </div>
                </div>
              );
            })}
          </div>
          {typeof newLineItem === "object" && newLineItem !== null && "code" in newLineItem && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
              <span className="text-sm font-medium text-green-800">Adding: {newLineItem.code} — {newLineItem.desc}</span>
              <input value={addQty} onChange={(e) => setAddQty(e.target.value)} placeholder="Qty" className="w-20 px-2 py-1 border rounded text-sm" />
              <span className="text-sm text-gray-500">{newLineItem.unit}</span>
              <span className="text-sm font-semibold">${addQty ? (parseFloat(addQty) * newLineItem.price).toFixed(2) : "0.00"}</span>
              <Btn size="sm" color="#10b981" onClick={handleConfirmAdd}>Confirm Add</Btn>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Btn color="#3b82f6" onClick={handleExportESX}><Download className="w-4 h-4 inline mr-1" />Export Xactimate ESX</Btn>
        <Btn color="#10b981" onClick={handleSubmitInsurance}><Send className="w-4 h-4 inline mr-1" />Submit to {est.insurance.company}</Btn>
        <Btn variant="outline" color="#8b5cf6" onClick={handleAttachPhotos}><Camera className="w-4 h-4 inline mr-1" />Attach Drone Photos</Btn>
        <Btn variant="outline" onClick={handleOpenEdit}><Edit className="w-4 h-4 inline mr-1" />Edit Estimate</Btn>
        <Btn variant="outline" onClick={handleDuplicate}><Copy className="w-4 h-4 inline mr-1" />Duplicate</Btn>
        <Btn variant="outline" color="#ef4444" onClick={handleDownloadPDF}><Download className="w-4 h-4 inline mr-1" />Download PDF</Btn>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Estimate">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input value={editForm.customer} onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company</label>
            <input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Claim #</label>
              <input value={editForm.claim} onChange={(e) => setEditForm({ ...editForm, claim: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjuster</label>
              <input value={editForm.adjuster} onChange={(e) => setEditForm({ ...editForm, adjuster: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjuster Phone</label>
              <input value={editForm.adjPhone} onChange={(e) => setEditForm({ ...editForm, adjPhone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deductible</label>
              <input value={editForm.deductible} onChange={(e) => setEditForm({ ...editForm, deductible: e.target.value })} type="number" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" onClick={() => setShowEdit(false)}>Cancel</Btn>
            <Btn onClick={handleSaveEdit}>Save Changes</Btn>
          </div>
        </div>
      </Modal>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 space-y-1">
        <div className="font-semibold flex items-center gap-2"><Link2 className="w-4 h-4" /> CRM Auto-Sync Active</div>
        <div>This estimate is linked to project {est.project} in CRM. Changes sync bidirectionally:</div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            "Line items \u2192 CRM project costs",
            "RCV total \u2192 CRM quote amount",
            "Approval status \u2192 CRM pipeline stage",
            "Insurance data \u2192 CRM insurance tab",
            "Photos \u2192 CRM + Xactimate attachments",
            "Supplement \u2192 CRM change order",
            "Payment received \u2192 QB auto-sync",
            "PDF \u2192 Client Portal documents",
          ].map((s) => (
            <div key={s} className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="w-3 h-3 text-green-600" />{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
