import { useState } from "react";
import { FileText, DollarSign, AlertCircle, Clock, Plus, Send, Eye, CheckCircle } from "lucide-react";
import { Badge, Btn, StatCard, Modal } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  project: string;
  estimateId: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  createdDate: string;
}

const initialInvoices: Invoice[] = [
  { id: "i1", invoiceNumber: "INV-1041", customer: "Robert Thompson", project: "Roof Replacement", estimateId: "EST-301", amount: 18500, paidAmount: 18500, status: "paid", dueDate: "2026-02-28", createdDate: "2026-02-01" },
  { id: "i2", invoiceNumber: "INV-1042", customer: "Maria Garcia", project: "Siding & Gutters", estimateId: "EST-302", amount: 24200, paidAmount: 12100, status: "sent", dueDate: "2026-03-15", createdDate: "2026-02-15" },
  { id: "i3", invoiceNumber: "INV-1043", customer: "James Davis", project: "Whole-Home Remodel", estimateId: "EST-303", amount: 67800, paidAmount: 0, status: "overdue", dueDate: "2026-03-01", createdDate: "2026-02-01" },
  { id: "i4", invoiceNumber: "INV-1044", customer: "Sarah Anderson", project: "Window Installation", estimateId: "EST-304", amount: 12400, paidAmount: 0, status: "viewed", dueDate: "2026-03-30", createdDate: "2026-03-01" },
  { id: "i5", invoiceNumber: "INV-1045", customer: "Tom Mitchell", project: "Kitchen Renovation", estimateId: "EST-305", amount: 34500, paidAmount: 0, status: "draft", dueDate: "2026-04-15", createdDate: "2026-03-20" },
  { id: "i6", invoiceNumber: "INV-1046", customer: "Linda Park", project: "Bathroom Remodel", estimateId: "EST-306", amount: 15800, paidAmount: 15800, status: "paid", dueDate: "2026-03-10", createdDate: "2026-02-10" },
  { id: "i7", invoiceNumber: "INV-1047", customer: "Kevin Brown", project: "Deck Build", estimateId: "EST-307", amount: 9200, paidAmount: 0, status: "sent", dueDate: "2026-04-01", createdDate: "2026-03-15" },
];

const statusColors: Record<InvoiceStatus, string> = {
  draft: "#94a3b8",
  sent: "#3b82f6",
  viewed: "#8b5cf6",
  paid: "#10b981",
  overdue: "#ef4444",
};

const statusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  paid: "Paid",
  overdue: "Overdue",
};

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });

type Tab = "all" | InvoiceStatus;

export default function InvoicesPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(initialInvoices);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ customer: "", project: "", amount: "", dueDate: "" });
  const addToast = useAppStore((s) => s.addToast);

  const filtered = tab === "all" ? invoiceList : invoiceList.filter((i) => i.status === tab);

  const totalOutstanding = invoiceList
    .filter((i) => i.status !== "paid" && i.status !== "draft")
    .reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const paidThisMonth = invoiceList
    .filter((i) => i.status === "paid" && i.createdDate >= "2026-03-01")
    .reduce((a, i) => a + i.paidAmount, 0);
  const overdue = invoiceList.filter((i) => i.status === "overdue").reduce((a, i) => a + (i.amount - i.paidAmount), 0);
  const draftCount = invoiceList.filter((i) => i.status === "draft").length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Draft" },
    { key: "sent", label: "Sent" },
    { key: "paid", label: "Paid" },
    { key: "overdue", label: "Overdue" },
  ];

  const handleCreate = () => {
    const amt = parseFloat(form.amount);
    if (!form.customer || !form.project || isNaN(amt) || amt <= 0 || !form.dueDate) {
      addToast("Please fill in all fields", "error");
      return;
    }
    const num = 1048 + invoiceList.length;
    const newInv: Invoice = {
      id: `i${Date.now()}`,
      invoiceNumber: `INV-${num}`,
      customer: form.customer,
      project: form.project,
      estimateId: "",
      amount: amt,
      paidAmount: 0,
      status: "draft",
      dueDate: form.dueDate,
      createdDate: new Date().toISOString().split("T")[0],
    };
    setInvoiceList((prev) => [...prev, newInv]);
    setForm({ customer: "", project: "", amount: "", dueDate: "" });
    setCreateOpen(false);
    addToast(`Invoice ${newInv.invoiceNumber} created`);
  };

  const handleSend = (inv: Invoice) => {
    setInvoiceList((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: "sent" as InvoiceStatus } : i))
    );
    addToast("Invoice sent to customer");
  };

  const handleMarkPaid = (inv: Invoice) => {
    setInvoiceList((prev) =>
      prev.map((i) => (i.id === inv.id ? { ...i, status: "paid" as InvoiceStatus, paidAmount: i.amount } : i))
    );
    if (viewInvoice?.id === inv.id) {
      setViewInvoice({ ...inv, status: "paid", paidAmount: inv.amount });
    }
    addToast(`Invoice ${inv.invoiceNumber} marked as paid`, "success");
  };

  const inputCls = "w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing and payments</p>
        </div>
        <Btn color="#3b82f6" onClick={() => setCreateOpen(true)}>
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Create Invoice</span>
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Outstanding" value={fmt(totalOutstanding)} sub={`${invoiceList.filter((i) => !["paid", "draft"].includes(i.status)).length} invoices`} color="#3b82f6" />
        <StatCard icon={FileText} label="Paid This Month" value={fmt(paidThisMonth)} sub="March 2026" color="#10b981" />
        <StatCard icon={AlertCircle} label="Overdue" value={fmt(overdue)} sub={`${invoiceList.filter((i) => i.status === "overdue").length} invoices`} color="#ef4444" />
        <StatCard icon={Clock} label="Draft" value={draftCount} sub="Pending send" color="#94a3b8" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Project</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Paid</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Balance</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Due Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{inv.customer}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.project}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(inv.amount)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(inv.paidAmount)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(inv.amount - inv.paidAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge color={statusColors[inv.status]}>{statusLabels[inv.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(inv.dueDate).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewInvoice(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      {inv.status === "draft" && (
                        <button onClick={() => handleSend(inv)} className="p-1.5 rounded-lg hover:bg-blue-50 transition text-blue-500 hover:text-blue-700" title="Send">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {(inv.status === "sent" || inv.status === "viewed" || inv.status === "overdue") && (
                        <button onClick={() => handleMarkPaid(inv)} className="p-1.5 rounded-lg hover:bg-green-50 transition text-green-500 hover:text-green-700" title="Mark as Paid">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Invoice">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Customer Name</label>
            <input className={inputCls} placeholder="Enter customer name" value={form.customer} onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Project</label>
            <input className={inputCls} placeholder="Enter project name" value={form.project} onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Amount ($)</label>
            <input className={inputCls} type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Due Date</label>
            <input className={inputCls} type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#94a3b8" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleCreate}>Create Invoice</Btn>
          </div>
        </div>
      </Modal>

      {/* View Invoice Modal */}
      <Modal open={!!viewInvoice} onClose={() => setViewInvoice(null)} title={viewInvoice ? `Invoice ${viewInvoice.invoiceNumber}` : ""}>
        {viewInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Customer</div>
                <div className="text-sm font-medium text-gray-900">{viewInvoice.customer}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Project</div>
                <div className="text-sm font-medium text-gray-900">{viewInvoice.project}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Estimate ID</div>
                <div className="text-sm font-medium text-gray-900">{viewInvoice.estimateId || "N/A"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Status</div>
                <Badge color={statusColors[viewInvoice.status]}>{statusLabels[viewInvoice.status]}</Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Amount</div>
                <div className="text-sm font-bold text-gray-900">{fmt(viewInvoice.amount)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Paid</div>
                <div className="text-sm font-bold text-green-600">{fmt(viewInvoice.paidAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Balance Due</div>
                <div className="text-sm font-bold text-gray-900">{fmt(viewInvoice.amount - viewInvoice.paidAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Due Date</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(viewInvoice.dueDate).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Created</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(viewInvoice.createdDate).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              {viewInvoice.status === "draft" && (
                <Btn color="#3b82f6" onClick={() => { handleSend(viewInvoice); setViewInvoice({ ...viewInvoice, status: "sent" }); }}>
                  <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Send Invoice</span>
                </Btn>
              )}
              {(viewInvoice.status === "sent" || viewInvoice.status === "viewed" || viewInvoice.status === "overdue") && (
                <Btn color="#10b981" onClick={() => handleMarkPaid(viewInvoice)}>
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Mark as Paid</span>
                </Btn>
              )}
              <Btn color="#94a3b8" variant="outline" onClick={() => setViewInvoice(null)}>Close</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
