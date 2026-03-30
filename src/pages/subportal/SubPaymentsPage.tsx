import { useState } from "react";
import { Badge, Btn, StatCard, Modal } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import { DollarSign, Clock, CheckCircle2, Download, FileText, TrendingUp } from "lucide-react";

interface Payment { id: string; date: string; project: string; description: string; amount: number; method: string; status: "Paid" | "Pending" | "Processing"; }

const initialPayments: Payment[] = [
  { id: "pay1", date: "2026-03-25", project: "MN-0156 Chen", description: "Window installation — complete", amount: 3600, method: "Check #4421", status: "Paid" },
  { id: "pay2", date: "2026-03-18", project: "MN-0312 Andersen", description: "Exterior — progress payment 2", amount: 4800, method: "ACH Transfer", status: "Paid" },
  { id: "pay3", date: "2026-03-10", project: "MN-0089 Garcia", description: "Siding — deposit (50%)", amount: 2100, method: "Check #4398", status: "Paid" },
  { id: "pay4", date: "2026-03-03", project: "MN-0312 Andersen", description: "Exterior — progress payment 1", amount: 4800, method: "ACH Transfer", status: "Paid" },
  { id: "pay5", date: "2026-02-25", project: "MN-0410 Park", description: "Deck restoration — final", amount: 3200, method: "Check #4376", status: "Paid" },
  { id: "pay6", date: "2026-02-15", project: "MN-0410 Park", description: "Deck restoration — deposit", amount: 1600, method: "Check #4355", status: "Paid" },
  { id: "pay7", date: "2026-02-08", project: "MN-0380 Wilson", description: "Gutter replacement — complete", amount: 1800, method: "ACH Transfer", status: "Paid" },
  { id: "pay8", date: "2026-01-28", project: "MN-0365 Brown", description: "Emergency roof repair", amount: 2400, method: "Check #4332", status: "Paid" },
  { id: "pay9", date: "Pending", project: "MN-0247 Thompson", description: "Roof replacement — progress", amount: 4800, method: "—", status: "Pending" },
  { id: "pay10", date: "Pending", project: "MN-0089 Garcia", description: "Siding — final payment (50%)", amount: 3600, method: "—", status: "Pending" },
  { id: "pay11", date: "Processing", project: "MN-0247 Thompson", description: "Roof — materials reimbursement", amount: 342, method: "ACH", status: "Processing" },
];

const statusColors = { Paid: "#10b981", Pending: "#f59e0b", Processing: "#3b82f6" };

export default function SubPaymentsPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [payments] = useState<Payment[]>(initialPayments);
  const [showDetail, setShowDetail] = useState<Payment | null>(null);

  const totalPaid = payments.filter((p) => p.status === "Paid").reduce((a, p) => a + p.amount, 0);
  const pending = payments.filter((p) => p.status === "Pending" || p.status === "Processing").reduce((a, p) => a + p.amount, 0);
  const lastPayment = payments.find((p) => p.status === "Paid");
  const ytd = totalPaid + pending;

  // Per-project summary
  const projectTotals: Record<string, number> = {};
  payments.forEach((p) => { projectTotals[p.project] = (projectTotals[p.project] || 0) + p.amount; });

  const handleExport = () => {
    const rows = [["Date", "Project", "Description", "Amount", "Method", "Status"], ...payments.map((p) => [p.date, p.project, p.description, `$${p.amount}`, p.method, p.status])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "payment-history-2026.csv"; a.click();
    URL.revokeObjectURL(url);
    addToast("Payment history exported", "success");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Payments</h2>
        <Btn color="#3b82f6" variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-1 inline" />Export History</Btn>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="YTD Earnings" value={`$${ytd.toLocaleString()}`} color="#10b981" />
        <StatCard icon={Clock} label="Pending" value={`$${pending.toLocaleString()}`} sub={`${payments.filter((p) => p.status !== "Paid").length} payments`} color="#f59e0b" />
        <StatCard icon={CheckCircle2} label="Last Payment" value={lastPayment ? `$${lastPayment.amount.toLocaleString()}` : "—"} sub={lastPayment?.date || ""} color="#3b82f6" />
        <StatCard icon={TrendingUp} label="Avg Per Job" value={`$${Math.round(ytd / Object.keys(projectTotals).length).toLocaleString()}`} color="#8b5cf6" />
      </div>

      {/* 1099 Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <div className="text-sm font-semibold text-blue-900">1099-NEC Information</div>
          <div className="text-xs text-blue-700 mt-0.5">Your YTD payments: <strong>${ytd.toLocaleString()}</strong> — A 1099-NEC form will be issued by January 31, 2027 for tax year 2026.</div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500"><tr>
            <th className="text-left px-4 py-3 font-medium">Date</th>
            <th className="text-left px-4 py-3 font-medium">Project</th>
            <th className="text-left px-4 py-3 font-medium">Description</th>
            <th className="text-right px-4 py-3 font-medium">Amount</th>
            <th className="text-left px-4 py-3 font-medium">Method</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 cursor-pointer transition" onClick={() => setShowDetail(p)}>
                <td className="px-4 py-3 font-medium text-gray-900">{p.date}</td>
                <td className="px-4 py-3"><Badge color="#3b82f6" sm>{p.project}</Badge></td>
                <td className="px-4 py-3 text-gray-600">{p.description}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">${p.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.method}</td>
                <td className="px-4 py-3"><Badge color={statusColors[p.status]} sm>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-bold">
            <tr>
              <td colSpan={3} className="px-4 py-3 text-gray-900">Total</td>
              <td className="px-4 py-3 text-right text-gray-900">${payments.reduce((a, p) => a + p.amount, 0).toLocaleString()}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Per-Project Summary */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Earnings by Project</h3>
        <div className="space-y-2">
          {Object.entries(projectTotals).sort((a, b) => b[1] - a[1]).map(([proj, total]) => (
            <div key={proj} className="flex items-center gap-3">
              <Badge color="#3b82f6" sm>{proj}</Badge>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${(total / ytd) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-gray-900 w-20 text-right">${total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title="Payment Details">
        {showDetail && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{showDetail.date}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Project</span><Badge color="#3b82f6">{showDetail.project}</Badge></div>
            <div className="flex justify-between"><span className="text-gray-500">Description</span><span className="font-medium">{showDetail.description}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-xl font-bold text-green-600">${showDetail.amount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium">{showDetail.method}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge color={statusColors[showDetail.status]}>{showDetail.status}</Badge></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
