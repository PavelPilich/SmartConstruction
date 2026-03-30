import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Receipt, DollarSign, Shield, CreditCard, CheckCircle2, Clock,
  FileText, Send, ArrowRight,
} from "lucide-react";
import { Badge, Btn, Modal } from "../../components/ui";
import { usePortalAuth } from "../../components/layout/PortalLayout";

interface Invoice {
  id: string;
  description: string;
  amount: number;
  status: "Paid" | "Sent" | "Draft";
  date: string;
  dueDate: string;
  paidBy?: string;
  paidDate?: string;
}

const invoices: Invoice[] = [
  {
    id: "INV-001", description: "Initial deposit", amount: 1000,
    status: "Paid", date: "Mar 10, 2026", dueDate: "Mar 10, 2026",
    paidBy: "Credit Card (Visa ending 4821)", paidDate: "Mar 10, 2026",
  },
  {
    id: "INV-002", description: "Materials — GAF shingles, underlayment, flashing",
    amount: 8400, status: "Paid", date: "Mar 20, 2026", dueDate: "Mar 25, 2026",
    paidBy: "State Farm Insurance (check #104892)", paidDate: "Mar 22, 2026",
  },
  {
    id: "INV-003", description: "Labor progress — tear-off and installation (60%)",
    amount: 4200, status: "Sent", date: "Mar 28, 2026", dueDate: "Apr 2, 2026",
  },
  {
    id: "INV-004", description: "Final balance — completion, cleanup, inspection",
    amount: 4900, status: "Draft", date: "", dueDate: "",
  },
];

const paymentHistory = [
  { date: "Mar 10, 2026", desc: "Deposit received — Visa ending 4821", amount: 1000, type: "payment" as const },
  { date: "Mar 22, 2026", desc: "Insurance payment — State Farm check #104892", amount: 8400, type: "payment" as const },
  { date: "Mar 28, 2026", desc: "Invoice INV-003 sent to customer", amount: 4200, type: "invoice" as const },
];

const statusColors: Record<string, string> = {
  Paid: "#10b981",
  Sent: "#f59e0b",
  Draft: "#94a3b8",
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  Paid: CheckCircle2,
  Sent: Send,
  Draft: FileText,
};

export default function PortalInvoicesPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = usePortalAuth();
  const [payModal, setPayModal] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);

  if (!isLoggedIn) {
    navigate("/portal", { replace: true });
    return null;
  }

  const totalProject = 18500;
  const insuranceCovers = 15200;
  const deductible = 1000;
  const remaining = 2300;

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaySuccess(true);
    }, 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Invoices & Payments</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          1847 Maple Grove Dr &bull; State Farm Claim #HB-2026-4821
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Total Project", value: `$${totalProject.toLocaleString()}`, color: "#3b82f6" },
          { icon: Shield, label: "Insurance Covers", value: `$${insuranceCovers.toLocaleString()}`, color: "#10b981" },
          { icon: CreditCard, label: "Your Deductible", value: `$${deductible.toLocaleString()}`, color: "#f59e0b" },
          { icon: Receipt, label: "Remaining Balance", value: `$${remaining.toLocaleString()}`, color: "#ef4444" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-xs font-medium">{card.label}</span>
              <div style={{ background: card.color + "15" }} className="p-1.5 rounded-lg">
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Invoice List</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {invoices.map((inv) => {
            const StatusIcon = statusIcons[inv.status];
            return (
              <div
                key={inv.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => setDetailInvoice(inv)}
              >
                <div style={{ background: statusColors[inv.status] + "15" }} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <StatusIcon className="w-5 h-5" style={{ color: statusColors[inv.status] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{inv.id}</span>
                    <Badge color={statusColors[inv.status]}>{inv.status}</Badge>
                    {inv.paidBy && inv.paidBy.includes("Insurance") && (
                      <Badge color="#3b82f6" sm>Insurance</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{inv.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {inv.date ? `Issued: ${inv.date}` : "Not yet issued"}
                    {inv.dueDate ? ` \u2022 Due: ${inv.dueDate}` : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-gray-900">${inv.amount.toLocaleString()}</div>
                  {inv.status === "Sent" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPayModal(inv); setPaySuccess(false); }}
                      className="text-xs text-blue-600 font-medium hover:underline mt-0.5"
                    >
                      Pay Now &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" /> Payment History
        </h3>
        <div className="space-y-4">
          {paymentHistory.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${item.type === "payment" ? "bg-green-500" : "bg-blue-500"}`} />
                {i < paymentHistory.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
              </div>
              <div className="pb-4">
                <p className="text-sm text-gray-800">{item.desc}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{item.date}</span>
                  <span className={`text-xs font-semibold ${item.type === "payment" ? "text-green-600" : "text-blue-600"}`}>
                    {item.type === "payment" ? `+$${item.amount.toLocaleString()} received` : `$${item.amount.toLocaleString()} billed`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <Modal
        open={!!detailInvoice}
        onClose={() => setDetailInvoice(null)}
        title={detailInvoice ? `Invoice ${detailInvoice.id}` : "Invoice"}
      >
        {detailInvoice && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge color={statusColors[detailInvoice.status]}>{detailInvoice.status}</Badge>
              {detailInvoice.paidBy && detailInvoice.paidBy.includes("Insurance") && (
                <Badge color="#3b82f6">Insurance Payment</Badge>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Description</span>
                <span className="text-gray-900 font-medium">{detailInvoice.description}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="text-gray-900 font-bold">${detailInvoice.amount.toLocaleString()}</span>
              </div>
              {detailInvoice.date && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Issued</span>
                  <span className="text-gray-900">{detailInvoice.date}</span>
                </div>
              )}
              {detailInvoice.dueDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Due Date</span>
                  <span className="text-gray-900">{detailInvoice.dueDate}</span>
                </div>
              )}
              {detailInvoice.paidBy && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid By</span>
                  <span className="text-gray-900">{detailInvoice.paidBy}</span>
                </div>
              )}
              {detailInvoice.paidDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid Date</span>
                  <span className="text-gray-900">{detailInvoice.paidDate}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="outline" color="#6b7280" onClick={() => setDetailInvoice(null)}>Close</Btn>
              {detailInvoice.status === "Sent" && (
                <Btn color="#3b82f6" onClick={() => { setDetailInvoice(null); setPayModal(detailInvoice); setPaySuccess(false); }}>
                  Pay Now <ArrowRight className="w-4 h-4 inline ml-1" />
                </Btn>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Pay Now Modal */}
      <Modal
        open={!!payModal}
        onClose={() => { setPayModal(null); setPaySuccess(false); }}
        title={paySuccess ? "Payment Confirmed" : `Pay ${payModal?.id || ""}`}
      >
        {payModal && !paySuccess && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-700">Amount due</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">${payModal.amount.toLocaleString()}</p>
              <p className="text-xs text-blue-500 mt-1">{payModal.description}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Select payment method:</p>
              <div className="space-y-2">
                {["Credit/Debit Card", "Bank Transfer (ACH)", "Check by Mail"].map((method) => (
                  <label key={method} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                    <input type="radio" name="paymethod" defaultChecked={method === "Credit/Debit Card"} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{method}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="outline" color="#6b7280" onClick={() => { setPayModal(null); setPaySuccess(false); }}>Cancel</Btn>
              <Btn color="#3b82f6" onClick={handlePay} disabled={paying}>
                {paying ? "Processing..." : `Pay $${payModal.amount.toLocaleString()}`}
              </Btn>
            </div>
          </div>
        )}
        {payModal && paySuccess && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
              <p className="text-sm text-gray-500 mt-1">
                ${payModal.amount.toLocaleString()} has been processed for {payModal.id}
              </p>
              <p className="text-xs text-gray-400 mt-2">A receipt has been sent to your email.</p>
            </div>
            <Btn color="#10b981" onClick={() => { setPayModal(null); setPaySuccess(false); }}>Done</Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}
