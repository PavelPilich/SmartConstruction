import { useState } from "react";
import {
  FileText, DollarSign, Users, AlertTriangle, CheckCircle, Calendar,
  Download, Send, Eye, ChevronDown, ChevronUp, FileSpreadsheet,
} from "lucide-react";
import { Badge, Btn, StatCard, Modal } from "../../components/ui";

/* ── Types ── */
interface SubPayment {
  date: string;
  ref: string;
  amount: number;
  project: string;
}

interface Subcontractor {
  id: string;
  name: string;
  ein: string;
  einMasked: string;
  address: string;
  w9Status: "on_file" | "missing";
  ytdPayments: number;
  threshold: boolean;
  status1099: "not_filed" | "generated" | "filed" | "blocked" | "na";
  payments: SubPayment[];
}

/* ── Data ── */
const subs: Subcontractor[] = [
  {
    id: "s1", name: "Petrov Roofing LLC", ein: "41-XXX7821", einMasked: "41-***7821",
    address: "1240 Industrial Blvd, Minneapolis, MN 55401",
    w9Status: "on_file", ytdPayments: 28400, threshold: true, status1099: "not_filed",
    payments: [
      { date: "2026-01-15", ref: "CHK-4201", amount: 8200, project: "Thompson Roof" },
      { date: "2026-02-10", ref: "CHK-4218", amount: 12400, project: "Garcia Siding" },
      { date: "2026-03-05", ref: "CHK-4235", amount: 7800, project: "Anderson Windows" },
    ],
  },
  {
    id: "s2", name: "Mendez Windows Inc", ein: "27-XXX4512", einMasked: "27-***4512",
    address: "890 Commerce St, St. Paul, MN 55102",
    w9Status: "on_file", ytdPayments: 14200, threshold: true, status1099: "not_filed",
    payments: [
      { date: "2026-01-22", ref: "CHK-4205", amount: 6800, project: "Davis Remodel" },
      { date: "2026-03-12", ref: "CHK-4240", amount: 7400, project: "Mitchell Kitchen" },
    ],
  },
  {
    id: "s3", name: "Wilson Siding Co", ein: "83-XXX9034", einMasked: "83-***9034",
    address: "456 Maple Dr, Bloomington, MN 55420",
    w9Status: "on_file", ytdPayments: 19800, threshold: true, status1099: "not_filed",
    payments: [
      { date: "2026-01-08", ref: "CHK-4198", amount: 9200, project: "Park Bathroom" },
      { date: "2026-02-20", ref: "CHK-4222", amount: 6100, project: "Brown Deck" },
      { date: "2026-03-18", ref: "CHK-4248", amount: 4500, project: "Garcia Siding" },
    ],
  },
  {
    id: "s4", name: "Harris Interiors", ein: "55-XXX2367", einMasked: "55-***2367",
    address: "2100 Hennepin Ave, Minneapolis, MN 55405",
    w9Status: "on_file", ytdPayments: 8600, threshold: true, status1099: "not_filed",
    payments: [
      { date: "2026-02-14", ref: "CHK-4220", amount: 4800, project: "Mitchell Kitchen" },
      { date: "2026-03-22", ref: "CHK-4252", amount: 3800, project: "Davis Remodel" },
    ],
  },
  {
    id: "s5", name: "Chen Roofing", ein: "61-XXX8845", einMasked: "61-***8845",
    address: "780 University Ave, St. Paul, MN 55104",
    w9Status: "on_file", ytdPayments: 22100, threshold: true, status1099: "not_filed",
    payments: [
      { date: "2026-01-28", ref: "CHK-4210", amount: 11400, project: "Thompson Roof" },
      { date: "2026-03-08", ref: "CHK-4238", amount: 10700, project: "Anderson Windows" },
    ],
  },
  {
    id: "s6", name: "Park General", ein: "44-XXX1278", einMasked: "44-***1278",
    address: "3350 Excelsior Blvd, Hopkins, MN 55343",
    w9Status: "on_file", ytdPayments: 31500, threshold: true, status1099: "not_filed",
    payments: [
      { date: "2026-01-05", ref: "CHK-4195", amount: 14200, project: "Davis Remodel" },
      { date: "2026-02-18", ref: "CHK-4221", amount: 9800, project: "Brown Deck" },
      { date: "2026-03-25", ref: "CHK-4255", amount: 7500, project: "Mitchell Kitchen" },
    ],
  },
  {
    id: "s7", name: "Delta Painting", ein: "72-XXX5590", einMasked: "72-***5590",
    address: "920 Lake St, Minneapolis, MN 55408",
    w9Status: "missing", ytdPayments: 2400, threshold: true, status1099: "blocked",
    payments: [
      { date: "2026-02-28", ref: "CHK-4230", amount: 1200, project: "Park Bathroom" },
      { date: "2026-03-15", ref: "CHK-4245", amount: 1200, project: "Garcia Siding" },
    ],
  },
  {
    id: "s8", name: "Quick Clean LLC", ein: "39-XXX0123", einMasked: "39-***0123",
    address: "5500 Lyndale Ave S, Minneapolis, MN 55419",
    w9Status: "on_file", ytdPayments: 450, threshold: false, status1099: "na",
    payments: [
      { date: "2026-03-20", ref: "CHK-4250", amount: 450, project: "Thompson Roof" },
    ],
  },
];

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

/* ── Component ── */
export default function QB1099Page() {
  const [subList, setSubList] = useState(subs);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [previewSub, setPreviewSub] = useState<Subcontractor | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);

  const overThreshold = subList.filter((s) => s.threshold).length;
  const generated = subList.filter((s) => s.status1099 === "generated" || s.status1099 === "filed").length;

  const handleGenerate = (id: string) => {
    setSubList((prev) =>
      prev.map((s) => (s.id === id && s.w9Status === "on_file" ? { ...s, status1099: "generated" as const } : s))
    );
  };

  const handleGenerateAll = () => {
    setGeneratingAll(true);
    setTimeout(() => {
      setSubList((prev) =>
        prev.map((s) =>
          s.w9Status === "on_file" && s.threshold ? { ...s, status1099: "generated" as const } : s
        )
      );
      setGeneratingAll(false);
    }, 2000);
  };

  const handleSendIRS = (id: string) => {
    setSubList((prev) =>
      prev.map((s) => (s.id === id && s.status1099 === "generated" ? { ...s, status1099: "filed" as const } : s))
    );
  };

  const handleDownloadCSV = () => {
    const header = "Subcontractor,EIN,W-9 Status,YTD Payments,1099 Required,1099 Status\n";
    const rows = subList.map((s) =>
      `"${s.name}","${s.ein}","${s.w9Status === "on_file" ? "On File" : "Missing"}","${s.ytdPayments}","${s.threshold ? "Yes" : "No"}","${s.status1099}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "1099_tracking_2026.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (s: Subcontractor) => {
    if (s.status1099 === "filed") return <Badge color="#10b981">Filed</Badge>;
    if (s.status1099 === "generated") return <Badge color="#3b82f6">Generated</Badge>;
    if (s.status1099 === "blocked") return <Badge color="#ef4444">Blocked</Badge>;
    if (s.status1099 === "na") return <Badge color="#94a3b8">N/A</Badge>;
    return <Badge color="#f59e0b">Not Filed</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">1099-NEC Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Tax Year 2026 — Subcontractor Payments</p>
        </div>
        <div className="flex gap-2">
          <Btn color="#10b981" onClick={handleGenerateAll} disabled={generatingAll}>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              {generatingAll ? "Generating..." : "Generate All 1099s"}
            </span>
          </Btn>
          <Btn color="#6b7280" variant="outline" onClick={handleDownloadCSV}>
            <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> Download All</span>
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Subs" value={subList.length.toString()} sub="Active vendors" color="#8b5cf6" />
        <StatCard icon={DollarSign} label="Over $600 Threshold" value={overThreshold.toString()} sub="1099 required" color="#f59e0b" />
        <StatCard icon={FileText} label="1099s Generated" value={generated.toString()} sub={`of ${overThreshold} required`} color="#3b82f6" />
        <StatCard icon={Calendar} label="Filing Deadline" value="Jan 31, 2027" sub="1099-NEC due" color="#ef4444" />
      </div>

      {/* Subcontractor Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-8" />
                <th className="text-left px-4 py-3 font-medium text-gray-500">Subcontractor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">EIN/SSN</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">W-9 Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">YTD Payments</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">1099 Req</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">1099 Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subList.map((sub) => (
                <tr key={sub.id}>
                  <td colSpan={8} className="p-0">
                    <div>
                      <div className="flex items-center hover:bg-gray-50 transition cursor-pointer" onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}>
                        <td className="px-4 py-3 w-8">
                          {expanded === sub.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 flex-1">{sub.name}</td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{sub.einMasked}</td>
                        <td className="px-4 py-3">
                          {sub.w9Status === "on_file" ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="w-3.5 h-3.5" /> On File</span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 text-xs"><AlertTriangle className="w-3.5 h-3.5" /> Missing</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(sub.ytdPayments)}</td>
                        <td className="px-4 py-3 text-center">{sub.threshold ? "Yes" : "No"}</td>
                        <td className="px-4 py-3">{statusBadge(sub)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {sub.status1099 === "not_filed" && sub.w9Status === "on_file" && (
                              <Btn size="sm" color="#3b82f6" variant="outline" onClick={() => handleGenerate(sub.id)}>Generate</Btn>
                            )}
                            {sub.status1099 === "generated" && (
                              <>
                                <Btn size="sm" color="#8b5cf6" variant="outline" onClick={() => setPreviewSub(sub)}>
                                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Preview</span>
                                </Btn>
                                <Btn size="sm" color="#10b981" onClick={() => handleSendIRS(sub.id)}>
                                  <span className="flex items-center gap-1"><Send className="w-3 h-3" /> Send to IRS</span>
                                </Btn>
                              </>
                            )}
                            {sub.status1099 === "filed" && (
                              <Btn size="sm" color="#8b5cf6" variant="outline" onClick={() => setPreviewSub(sub)}>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> View</span>
                              </Btn>
                            )}
                            {sub.status1099 === "blocked" && (
                              <Badge color="#ef4444">W-9 Required</Badge>
                            )}
                          </div>
                        </td>
                      </div>
                      {/* Expanded Payment History */}
                      {expanded === sub.id && (
                        <div className="bg-gray-50 px-8 py-3 border-t border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Payment History</h4>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="text-left py-1.5">Date</th>
                                <th className="text-left py-1.5">Reference</th>
                                <th className="text-right py-1.5">Amount</th>
                                <th className="text-left py-1.5">Project</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {sub.payments.map((p, idx) => (
                                <tr key={idx}>
                                  <td className="py-1.5 text-gray-600">{new Date(p.date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</td>
                                  <td className="py-1.5 text-gray-600 font-mono">{p.ref}</td>
                                  <td className="py-1.5 text-right font-medium text-gray-900">{fmt(p.amount)}</td>
                                  <td className="py-1.5 text-gray-600">{p.project}</td>
                                </tr>
                              ))}
                              <tr className="font-semibold">
                                <td className="py-1.5 text-gray-900" colSpan={2}>Total</td>
                                <td className="py-1.5 text-right text-gray-900">{fmt(sub.ytdPayments)}</td>
                                <td />
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1099 Preview Modal */}
      <Modal open={!!previewSub} onClose={() => setPreviewSub(null)} title="1099-NEC Preview" wide>
        {previewSub && (
          <div className="space-y-4">
            <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
              {/* Form Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Form</div>
                  <div className="text-3xl font-black text-gray-900">1099-NEC</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Tax Year</div>
                  <div className="text-2xl font-bold text-gray-900">2026</div>
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 font-medium mb-6 pb-3 border-b border-gray-300">
                Nonemployee Compensation
              </div>

              {/* Payer Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-300 rounded p-3 bg-white">
                  <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Payer's Name, Address, EIN</div>
                  <div className="text-sm font-semibold text-gray-900">Smart Construction & Remodeling Inc.</div>
                  <div className="text-xs text-gray-600">7800 Metro Blvd, Suite 200</div>
                  <div className="text-xs text-gray-600">Edina, MN 55439</div>
                  <div className="text-xs text-gray-600 mt-1">EIN: 41-3847291</div>
                </div>
                <div className="border border-gray-300 rounded p-3 bg-white">
                  <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Recipient's Name, Address, TIN</div>
                  <div className="text-sm font-semibold text-gray-900">{previewSub.name}</div>
                  <div className="text-xs text-gray-600">{previewSub.address}</div>
                  <div className="text-xs text-gray-600 mt-1">TIN: {previewSub.ein}</div>
                </div>
              </div>

              {/* Box 1 */}
              <div className="border border-gray-300 rounded p-4 bg-white">
                <div className="text-[10px] uppercase text-gray-400 font-semibold mb-1">Box 1 — Nonemployee Compensation</div>
                <div className="text-3xl font-bold text-gray-900">{fmt(previewSub.ytdPayments)}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Btn color="#94a3b8" variant="outline" onClick={() => setPreviewSub(null)}>Close</Btn>
              {previewSub.status1099 === "generated" && (
                <Btn color="#10b981" onClick={() => { handleSendIRS(previewSub.id); setPreviewSub(null); }}>
                  <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Send to IRS</span>
                </Btn>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
