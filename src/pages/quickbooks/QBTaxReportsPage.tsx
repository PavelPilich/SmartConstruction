import { useState } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, FileText, BarChart3, PieChart,
  Download, Send, RefreshCw, ChevronDown, ChevronUp, Building2, CreditCard,
  Briefcase, Receipt,
} from "lucide-react";
import { Badge, Btn, StatCard, Modal } from "../../components/ui";

/* ── Data ── */
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthlyPL = [
  { month: "Jan", revenue: 68200, expenses: 41800, projected: false },
  { month: "Feb", revenue: 74600, expenses: 44200, projected: false },
  { month: "Mar", revenue: 82400, expenses: 48600, projected: false },
  { month: "Apr", revenue: 78000, expenses: 46000, projected: true },
  { month: "May", revenue: 86000, expenses: 52000, projected: true },
  { month: "Jun", revenue: 92000, expenses: 54000, projected: true },
  { month: "Jul", revenue: 88000, expenses: 52800, projected: true },
  { month: "Aug", revenue: 84000, expenses: 50400, projected: true },
  { month: "Sep", revenue: 76000, expenses: 45600, projected: true },
  { month: "Oct", revenue: 72000, expenses: 43200, projected: true },
  { month: "Nov", revenue: 56000, expenses: 32000, projected: true },
  { month: "Dec", revenue: 35200, expenses: 23600, projected: true },
];

const revenueCategories = [
  { name: "Roofing", amount: 412000, color: "#3b82f6", pct: 46 },
  { name: "Siding", amount: 186000, color: "#10b981", pct: 21 },
  { name: "Windows", amount: 124000, color: "#f59e0b", pct: 14 },
  { name: "General Remodel", amount: 170400, color: "#8b5cf6", pct: 19 },
];

const expenseCategories = [
  { name: "Materials", amount: 267100 },
  { name: "Labor / Subs", amount: 156200 },
  { name: "Equipment", amount: 42000 },
  { name: "Insurance", amount: 28400 },
  { name: "Marketing", amount: 18000 },
  { name: "Office / Admin", amount: 22500 },
];

const arAging = [
  { range: "0-30 days", amount: 46600, invoices: 3 },
  { range: "31-60 days", amount: 67800, invoices: 1 },
  { range: "61-90 days", amount: 0, invoices: 0 },
  { range: "90+ days", amount: 0, invoices: 0 },
];

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

type Report = "pl" | "balance" | "ar" | "salestax" | "quarterly" | null;

/* ── Component ── */
export default function QBTaxReportsPage() {
  const [activeReport, setActiveReport] = useState<Report>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const totalRevenue = 892400;
  const totalExpenses = 534200;
  const netIncome = totalRevenue - totalExpenses;
  const totalAR = arAging.reduce((a, b) => a + b.amount, 0);
  const maxMonthly = Math.max(...monthlyPL.map((m) => Math.max(m.revenue, m.expenses)));

  const handleExportPdf = (reportName: string) => {
    setExportingPdf(true);
    setTimeout(() => {
      setExportingPdf(false);
      alert(`${reportName} exported as PDF successfully.`);
    }, 1500);
  };

  const handleSendAccountant = (reportName: string) => {
    alert(`${reportName} sent to accountant via email.`);
  };

  const handleSyncQB = (reportName: string) => {
    alert(`${reportName} synced with QuickBooks.`);
  };

  const ReportActions = ({ name }: { name: string }) => (
    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
      <Btn size="sm" color="#3b82f6" onClick={() => handleExportPdf(name)} disabled={exportingPdf}>
        <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> {exportingPdf ? "Exporting..." : "Export PDF"}</span>
      </Btn>
      <Btn size="sm" color="#10b981" variant="outline" onClick={() => handleSendAccountant(name)}>
        <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Send to Accountant</span>
      </Btn>
      <Btn size="sm" color="#8b5cf6" variant="outline" onClick={() => handleSyncQB(name)}>
        <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Sync with QB</span>
      </Btn>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tax-Ready Financial Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Fiscal Year 2026 — Smart Construction & Remodeling Inc.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Revenue" value={fmt(totalRevenue)} sub="YTD 2026" color="#10b981" />
        <StatCard icon={TrendingDown} label="Total Expenses" value={fmt(totalExpenses)} sub="YTD 2026" color="#ef4444" />
        <StatCard icon={DollarSign} label="Net Income" value={fmt(netIncome)} sub={`${((netIncome / totalRevenue) * 100).toFixed(1)}% margin`} color="#3b82f6" />
        <StatCard icon={FileText} label="Accounts Receivable" value={fmt(totalAR)} sub={`${arAging.reduce((a, b) => a + b.invoices, 0)} invoices`} color="#f59e0b" />
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* P&L */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition" onClick={() => setActiveReport(activeReport === "pl" ? null : "pl")}>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: "#3b82f615" }}><BarChart3 className="w-5 h-5 text-blue-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Profit & Loss Statement</h3>
                <p className="text-xs text-gray-500">Revenue: {fmt(totalRevenue)} | Expenses: {fmt(totalExpenses)} | Net: {fmt(netIncome)}</p>
              </div>
            </div>
            {activeReport === "pl" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
          {activeReport === "pl" && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
              {/* Revenue Chart */}
              <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Monthly Revenue vs Expenses</h4>
              <div className="flex items-end gap-1 h-40 mb-4">
                {monthlyPL.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: 120 }}>
                      <div
                        className={`w-2.5 rounded-t ${m.projected ? "bg-blue-300" : "bg-blue-500"}`}
                        style={{ height: `${(m.revenue / maxMonthly) * 100}%` }}
                        title={`Revenue: ${fmt(m.revenue)}`}
                      />
                      <div
                        className={`w-2.5 rounded-t ${m.projected ? "bg-red-300" : "bg-red-400"}`}
                        style={{ height: `${(m.expenses / maxMonthly) * 100}%` }}
                        title={`Expenses: ${fmt(m.expenses)}`}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400">{m.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mb-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded" /> Revenue</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-400 rounded" /> Expenses</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-300 rounded" /> Projected</span>
              </div>

              {/* Revenue Categories */}
              <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Revenue by Category</h4>
              <div className="space-y-2 mb-4">
                {revenueCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-28">{cat.name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full" style={{ width: `${cat.pct}%`, background: cat.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-900 w-20 text-right">{fmt(cat.amount)}</span>
                  </div>
                ))}
              </div>

              {/* Expense Categories */}
              <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Expenses by Category</h4>
              <div className="space-y-1.5 mb-2">
                {expenseCategories.map((cat) => (
                  <div key={cat.name} className="flex justify-between text-xs">
                    <span className="text-gray-600">{cat.name}</span>
                    <span className="font-medium text-gray-900">{fmt(cat.amount)}</span>
                  </div>
                ))}
              </div>

              <ReportActions name="Profit & Loss Statement" />
            </div>
          )}
        </div>

        {/* Balance Sheet */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition" onClick={() => setActiveReport(activeReport === "balance" ? null : "balance")}>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: "#10b98115" }}><Building2 className="w-5 h-5 text-green-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Balance Sheet</h3>
                <p className="text-xs text-gray-500">Assets: $486,200 | Liabilities: $128,400 | Equity: $357,800</p>
              </div>
            </div>
            {activeReport === "balance" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
          {activeReport === "balance" && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-1 gap-4">
                {/* Assets */}
                <div>
                  <h4 className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">Assets — $486,200</h4>
                  <div className="space-y-1.5 pl-3">
                    {[
                      { name: "Cash & Checking", amount: 142800 },
                      { name: "Accounts Receivable", amount: 114400 },
                      { name: "Equipment", amount: 128000 },
                      { name: "Vehicles", amount: 86000 },
                      { name: "Other Assets", amount: 15000 },
                    ].map((a) => (
                      <div key={a.name} className="flex justify-between text-xs">
                        <span className="text-gray-600">{a.name}</span>
                        <span className="font-medium text-gray-900">{fmt(a.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities */}
                <div>
                  <h4 className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">Liabilities — $128,400</h4>
                  <div className="space-y-1.5 pl-3">
                    {[
                      { name: "Accounts Payable", amount: 38400 },
                      { name: "Equipment Loans", amount: 52000 },
                      { name: "Credit Line Balance", amount: 24000 },
                      { name: "Accrued Taxes", amount: 14000 },
                    ].map((l) => (
                      <div key={l.name} className="flex justify-between text-xs">
                        <span className="text-gray-600">{l.name}</span>
                        <span className="font-medium text-gray-900">{fmt(l.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equity */}
                <div>
                  <h4 className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">Owner's Equity — $357,800</h4>
                  <div className="space-y-1.5 pl-3">
                    {[
                      { name: "Owner's Equity", amount: 218600 },
                      { name: "Retained Earnings", amount: 139200 },
                    ].map((eq) => (
                      <div key={eq.name} className="flex justify-between text-xs">
                        <span className="text-gray-600">{eq.name}</span>
                        <span className="font-medium text-gray-900">{fmt(eq.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <ReportActions name="Balance Sheet" />
            </div>
          )}
        </div>

        {/* AR Aging */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition" onClick={() => setActiveReport(activeReport === "ar" ? null : "ar")}>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: "#f59e0b15" }}><CreditCard className="w-5 h-5 text-amber-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Accounts Receivable Aging</h3>
                <p className="text-xs text-gray-500">Total AR: {fmt(totalAR)} — {arAging.reduce((a, b) => a + b.invoices, 0)} open invoices</p>
              </div>
            </div>
            {activeReport === "ar" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
          {activeReport === "ar" && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="text-left py-2">Aging Period</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Invoices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {arAging.map((a) => (
                    <tr key={a.range}>
                      <td className="py-2.5 text-gray-700">{a.range}</td>
                      <td className="py-2.5 text-right font-medium text-gray-900">{fmt(a.amount)}</td>
                      <td className="py-2.5 text-right text-gray-600">{a.invoices}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold bg-gray-50">
                    <td className="py-2.5 text-gray-900">Total</td>
                    <td className="py-2.5 text-right text-gray-900">{fmt(totalAR)}</td>
                    <td className="py-2.5 text-right text-gray-900">{arAging.reduce((a, b) => a + b.invoices, 0)}</td>
                  </tr>
                </tbody>
              </table>
              {/* Visual bar */}
              <div className="flex h-4 rounded-full overflow-hidden bg-gray-100 mb-2">
                {arAging.filter((a) => a.amount > 0).map((a, i) => {
                  const colors = ["#10b981", "#f59e0b", "#ef4444", "#991b1b"];
                  return (
                    <div
                      key={a.range}
                      style={{ width: `${(a.amount / totalAR) * 100}%`, background: colors[i] }}
                      className="h-full"
                      title={`${a.range}: ${fmt(a.amount)}`}
                    />
                  );
                })}
              </div>
              <div className="flex gap-3 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500" /> 0-30 days</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> 31-60 days</span>
              </div>
              <ReportActions name="AR Aging Report" />
            </div>
          )}
        </div>

        {/* Sales Tax */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition" onClick={() => setActiveReport(activeReport === "salestax" ? null : "salestax")}>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: "#8b5cf615" }}><Receipt className="w-5 h-5 text-purple-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Sales Tax Report</h3>
                <p className="text-xs text-gray-500">MN State Rate: 6.875% — Filing: Current</p>
              </div>
            </div>
            {activeReport === "salestax" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
          {activeReport === "salestax" && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MN State Sales Tax Rate</span>
                  <span className="font-semibold text-gray-900">6.875%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Taxable Sales (Q1 2026)</span>
                  <span className="font-semibold text-gray-900">{fmt(225200)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sales Tax Collected</span>
                  <span className="font-semibold text-gray-900">{fmt(15482)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sales Tax Remitted</span>
                  <span className="font-semibold text-green-600">{fmt(15482)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance Due</span>
                  <span className="font-semibold text-gray-900">$0</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Filing Status</span>
                  <Badge color="#10b981">Current</Badge>
                </div>
              </div>
              <ReportActions name="Sales Tax Report" />
            </div>
          )}
        </div>

        {/* Quarterly Estimated Tax */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition" onClick={() => setActiveReport(activeReport === "quarterly" ? null : "quarterly")}>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: "#ef444415" }}><Briefcase className="w-5 h-5 text-red-500" /></div>
              <div>
                <h3 className="font-bold text-gray-900">Quarterly Estimated Tax</h3>
                <p className="text-xs text-gray-500">Q1 2026 — Federal & State Estimates</p>
              </div>
            </div>
            {activeReport === "quarterly" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
          {activeReport === "quarterly" && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr className="text-xs text-gray-400">
                    <th className="text-left py-2">Quarter</th>
                    <th className="text-right py-2">Estimated</th>
                    <th className="text-right py-2">Paid</th>
                    <th className="text-left py-2 pl-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2.5 text-gray-700">Q1 2026 (Apr 15)</td>
                    <td className="py-2.5 text-right font-medium text-gray-900">{fmt(24600)}</td>
                    <td className="py-2.5 text-right font-medium text-green-600">{fmt(24600)}</td>
                    <td className="py-2.5 pl-3"><Badge color="#10b981">Paid</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-gray-700">Q2 2026 (Jun 15)</td>
                    <td className="py-2.5 text-right font-medium text-gray-900">{fmt(26200)}</td>
                    <td className="py-2.5 text-right font-medium text-gray-400">$0</td>
                    <td className="py-2.5 pl-3"><Badge color="#f59e0b">Due Jun 15</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-gray-700">Q3 2026 (Sep 15)</td>
                    <td className="py-2.5 text-right font-medium text-gray-400">TBD</td>
                    <td className="py-2.5 text-right font-medium text-gray-400">$0</td>
                    <td className="py-2.5 pl-3"><Badge color="#94a3b8">Upcoming</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-gray-700">Q4 2026 (Jan 15, 2027)</td>
                    <td className="py-2.5 text-right font-medium text-gray-400">TBD</td>
                    <td className="py-2.5 text-right font-medium text-gray-400">$0</td>
                    <td className="py-2.5 pl-3"><Badge color="#94a3b8">Upcoming</Badge></td>
                  </tr>
                </tbody>
              </table>
              <ReportActions name="Quarterly Estimated Tax" />
            </div>
          )}
        </div>
      </div>

      {/* Revenue Pie Chart (visual) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-900 mb-4">Revenue by Category</h2>
        <div className="flex items-center gap-8">
          {/* Simple SVG pie chart */}
          <svg width="160" height="160" viewBox="0 0 160 160" className="flex-shrink-0">
            {(() => {
              let cumulative = 0;
              return revenueCategories.map((cat) => {
                const start = cumulative;
                cumulative += cat.pct;
                const startAngle = (start / 100) * 360 - 90;
                const endAngle = (cumulative / 100) * 360 - 90;
                const largeArc = cat.pct > 50 ? 1 : 0;
                const r = 70;
                const cx = 80;
                const cy = 80;
                const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
                const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
                const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
                const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
                return (
                  <path
                    key={cat.name}
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={cat.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              });
            })()}
          </svg>
          <div className="space-y-2.5">
            {revenueCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="text-sm text-gray-700 w-32">{cat.name}</span>
                <span className="text-sm font-semibold text-gray-900">{fmt(cat.amount)}</span>
                <span className="text-xs text-gray-400">({cat.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
