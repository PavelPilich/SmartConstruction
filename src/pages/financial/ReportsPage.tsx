import { DollarSign, TrendingUp, TrendingDown, CreditCard, BarChart3, PieChart, Download } from "lucide-react";
import { Badge, Btn, StatCard } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });

const monthlyRevenue = [
  { month: "Jan 2026", revenue: 87500, expenses: 52200 },
  { month: "Feb 2026", revenue: 124300, expenses: 71800 },
  { month: "Mar 2026", revenue: 98600, expenses: 58400 },
];

const topProjects = [
  { name: "Davis Whole-Home Remodel", customer: "James Davis", revenue: 67800, status: "In Progress" },
  { name: "Garcia Siding & Gutters", customer: "Maria Garcia", revenue: 24200, status: "In Progress" },
  { name: "Thompson Roof Replacement", customer: "Robert Thompson", revenue: 18500, status: "Completed" },
  { name: "Park Bathroom Remodel", customer: "Linda Park", revenue: 15800, status: "Completed" },
  { name: "Anderson Window Install", customer: "Sarah Anderson", revenue: 12400, status: "In Progress" },
];

const paymentMethods = [
  { method: "Insurance", amount: 156200, pct: 50, color: "#3b82f6" },
  { method: "Direct Pay", amount: 93700, pct: 30, color: "#10b981" },
  { method: "Financing", amount: 62500, pct: 20, color: "#f59e0b" },
];

const agingReport = [
  { range: "0-30 days", amount: 46600, count: 3, color: "#10b981" },
  { range: "31-60 days", amount: 67800, count: 1, color: "#f59e0b" },
  { range: "61-90 days", amount: 0, count: 0, color: "#f97316" },
  { range: "90+ days", amount: 0, count: 0, color: "#ef4444" },
];

const totalRevenue = monthlyRevenue.reduce((a, m) => a + m.revenue, 0);
const totalExpenses = monthlyRevenue.reduce((a, m) => a + m.expenses, 0);
const outstanding = topProjects.filter((p) => p.status === "In Progress").reduce((a, p) => a + p.revenue, 0);
const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

export default function ReportsPage() {
  const addToast = useAppStore((s) => s.addToast);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Revenue, expenses, and financial analytics</p>
        </div>
        <Btn color="#3b82f6" onClick={() => {
          const rows = [
            ["Month", "Revenue", "Expenses", "Net"],
            ...monthlyRevenue.map((m) => [m.month, m.revenue, m.expenses, m.revenue - m.expenses]),
            [],
            ["Top Project", "Customer", "Revenue", "Status"],
            ...topProjects.map((p) => [p.name, p.customer, p.revenue, p.status]),
            [],
            ["Payment Method", "Amount", "Percentage"],
            ...paymentMethods.map((p) => [p.method, p.amount, p.pct + "%"]),
          ];
          const csv = rows.map((r) => r.join(",")).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "financial-report-q1-2026.csv"; a.click();
          URL.revokeObjectURL(url);
          addToast("Report exported as CSV", "success");
        }}>
          <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> Export Report</span>
        </Btn>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(totalRevenue)} sub="Q1 2026" color="#3b82f6" />
        <StatCard icon={TrendingUp} label="Outstanding" value={fmt(outstanding)} sub="Unpaid invoices" color="#f59e0b" />
        <StatCard icon={TrendingDown} label="Expenses" value={fmt(totalExpenses)} sub="Q1 2026" color="#ef4444" />
        <StatCard icon={CreditCard} label="Net Profit" value={fmt(totalRevenue - totalExpenses)} sub={`${Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100)}% margin`} color="#10b981" />
      </div>

      {/* Monthly Revenue Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-400" /> Monthly Revenue
          </h3>
          <span className="text-xs text-gray-500">Q1 2026</span>
        </div>
        <div className="space-y-4">
          {monthlyRevenue.map((m) => (
            <div key={m.month}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700">{m.month}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-900 font-medium">{fmt(m.revenue)}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-red-500">-{fmt(m.expenses)}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="h-5 bg-gray-100 rounded-full overflow-hidden flex-1">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
              <div className="h-3 mt-1">
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden" style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}>
                  <div
                    className="h-full bg-red-300 rounded-full"
                    style={{ width: `${(m.expenses / m.revenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /> Revenue</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-300" /> Expenses</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Projects by Revenue */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top Projects by Revenue</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {topProjects.map((p, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.customer}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{fmt(p.revenue)}</div>
                  <Badge color={p.status === "Completed" ? "#10b981" : "#3b82f6"} sm>{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-400" /> Payment Methods
          </h3>
          <div className="space-y-4">
            {paymentMethods.map((pm) => (
              <div key={pm.method}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-700">{pm.method}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{fmt(pm.amount)}</span>
                    <span className="text-xs text-gray-400">{pm.pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pm.pct}%`, backgroundColor: pm.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Aging Report */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-3">Aging Report</h4>
            <div className="grid grid-cols-2 gap-3">
              {agingReport.map((ar) => (
                <div key={ar.range} className="rounded-lg border border-gray-100 p-3">
                  <div className="text-xs text-gray-500 mb-1">{ar.range}</div>
                  <div className="text-lg font-bold" style={{ color: ar.amount > 0 ? ar.color : "#94a3b8" }}>
                    {fmt(ar.amount)}
                  </div>
                  <div className="text-xs text-gray-400">{ar.count} invoice{ar.count !== 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
