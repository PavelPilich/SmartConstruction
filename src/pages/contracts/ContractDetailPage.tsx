import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Btn, Modal } from "../../components/ui";
import {
  ArrowLeft, Lock, Edit3, Send, Download, Copy, Trash2, Printer,
  CheckCircle2, Clock, Eye, FileText, Shield, History, ChevronDown, ChevronUp,
  Bold, Italic, Underline, Save, X,
} from "lucide-react";
import { MOCK_CONTRACTS } from "./ContractsPage";
import type { ContractData } from "./ContractsPage";

/* ------------------------------------------------------------------ */
/*  Audit entry type                                                   */
/* ------------------------------------------------------------------ */
interface AuditEntry {
  date: string;
  time: string;
  action: string;
  user: string;
  meta?: string;
}

/* ------------------------------------------------------------------ */
/*  Version type                                                       */
/* ------------------------------------------------------------------ */
interface VersionEntry {
  version: number;
  date: string;
  changes: string;
  user: string;
}

/* ------------------------------------------------------------------ */
/*  Build mock audit trail per contract                                */
/* ------------------------------------------------------------------ */
function buildAuditTrail(c: ContractData): AuditEntry[] {
  const entries: AuditEntry[] = [
    { date: c.createdDate, time: "09:15 AM", action: `Contract created from '${c.template}' template`, user: "Pavel Pilich", meta: "Template auto-fill applied" },
    { date: c.createdDate, time: "09:22 AM", action: "Draft saved — v1", user: "Pavel Pilich" },
  ];
  if (c.version >= 2) {
    entries.push(
      { date: c.lastModified, time: "10:45 AM", action: "Scope of work updated", user: "Pavel Pilich", meta: "Materials and pricing revised" },
      { date: c.lastModified, time: "10:48 AM", action: `Draft saved — v${c.version}`, user: "Pavel Pilich" },
    );
  }
  if (c.status === "sent" || c.status === "viewed" || c.status === "signed") {
    entries.push({ date: c.lastModified, time: "11:00 AM", action: `Sent to customer via email (${c.customerName})`, user: "Pavel Pilich", meta: `Email: ${c.customerName.toLowerCase().replace(" ", ".")}@email.com` });
  }
  if (c.status === "viewed" || c.status === "signed") {
    entries.push({ date: c.lastModified, time: "02:33 PM", action: "Customer viewed contract", user: c.customerName, meta: "IP: 73.242.118.xxx" });
  }
  if (c.status === "signed" && c.signedDate) {
    entries.push(
      { date: c.signedDate, time: "03:15 PM", action: "Customer signed contract", user: c.customerName, meta: "IP: 73.242.118.xxx | Signature hash: sha256-a4f8c..." },
      { date: c.signedDate, time: "03:15 PM", action: "Contract locked — legally binding", user: "System", meta: "ESIGN Act compliant" },
    );
  }
  return entries;
}

function buildVersionHistory(c: ContractData): VersionEntry[] {
  const entries: VersionEntry[] = [
    { version: 1, date: c.createdDate, changes: "Initial draft from template", user: "Pavel Pilich" },
  ];
  if (c.version >= 2) {
    entries.push({ version: 2, date: c.lastModified, changes: "Updated scope of work, pricing, and materials", user: "Pavel Pilich" });
  }
  if (c.version >= 3) {
    entries.push({ version: 3, date: c.lastModified, changes: "Revised payment schedule per customer request", user: "Pavel Pilich" });
  }
  return entries;
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const STATUS_MAP: Record<ContractData["status"], { label: string; color: string }> = {
  draft: { label: "Draft", color: "#6b7280" },
  sent: { label: "Sent", color: "#3b82f6" },
  viewed: { label: "Viewed", color: "#f59e0b" },
  signed: { label: "Signed", color: "#22c55e" },
  expired: { label: "Expired", color: "#ef4444" },
};

const money = (n: number) => "$" + n.toLocaleString("en-US");

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ContractDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const base = MOCK_CONTRACTS.find((c) => c.id === id);

  const [contract, setContract] = useState<ContractData | null>(base ?? null);
  const [editing, setEditing] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [signName, setSignName] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  // Editable contract sections
  const [scopeText, setScopeText] = useState(
    base ? `Complete roof replacement at ${base.address}. Removal of existing roofing materials down to deck, inspection and repair of any damaged decking, installation of new Owens Corning Duration series architectural shingles (color selected by homeowner), new synthetic underlayment, drip edge, ice and water shield in valleys and at eaves (minimum 6 feet from edge), new pipe boots and flashing, and complete cleanup of all debris.` : ""
  );
  const [materialsText, setMaterialsText] = useState(
    "Owens Corning Duration Series Architectural Shingles, Owens Corning ProArmor Synthetic Underlayment, Aluminum Drip Edge, Grace Ice & Water Shield, Galvanized Pipe Boots, Step/Counter Flashing, Ridge Vent (if applicable)"
  );
  const [termsText, setTermsText] = useState(
    `1. RIGHT TO CANCEL: The Homeowner may cancel this contract within three (3) business days of signing, per Minnesota Statute 325G.06.\n\n2. CHANGE ORDERS: Any changes to the scope of work must be agreed upon in writing by both parties. Additional work may result in additional charges.\n\n3. PERMITS: Contractor shall obtain all necessary building permits required by local jurisdiction. Permit costs are included in the contract price unless otherwise noted.\n\n4. LIABILITY & INSURANCE: Contractor maintains general liability insurance and workers' compensation coverage. Certificates of insurance available upon request.\n\n5. CLEANUP: Contractor shall perform daily cleanup and final cleanup upon project completion, including magnetic sweep for nails and debris removal.\n\n6. WARRANTY: Contractor provides a 5-year workmanship warranty. Manufacturer warranty on materials per manufacturer terms (typically 30-50 years for Duration shingles).\n\n7. PAYMENT: Payment schedule as outlined in the Pricing section. Final payment due upon completion and final inspection.\n\n8. DISPUTE RESOLUTION: Any disputes shall be resolved through mediation in Ramsey County, Minnesota, before pursuing legal action.\n\n9. FORCE MAJEURE: Contractor is not liable for delays caused by weather, material shortages, or other circumstances beyond reasonable control.\n\n10. ENTIRE AGREEMENT: This contract constitutes the entire agreement between the parties and supersedes all prior discussions, negotiations, and agreements.`
  );

  if (!contract) {
    return (
      <div className="text-center py-20">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Contract Not Found</h2>
        <p className="text-gray-500 mb-4">The contract you're looking for doesn't exist.</p>
        <Btn onClick={() => navigate("/contracts")}>Back to Contracts</Btn>
      </div>
    );
  }

  const s = STATUS_MAP[contract.status];
  const isSigned = contract.status === "signed";
  const isDraft = contract.status === "draft";
  const isSent = contract.status === "sent" || contract.status === "viewed";
  const auditTrail = useMemo(() => buildAuditTrail(contract), [contract]);
  const versions = useMemo(() => buildVersionHistory(contract), [contract]);

  const handleSaveDraft = () => {
    setContract({ ...contract, version: contract.version + 1, lastModified: new Date().toISOString().split("T")[0] });
    setEditing(false);
  };

  const handleSendForSigning = () => {
    setContract({ ...contract, status: "sent", lastModified: new Date().toISOString().split("T")[0] });
    setShowSendModal(false);
  };

  const handleSign = () => {
    if (!agreedTerms || !signName.trim()) return;
    const now = new Date().toISOString().split("T")[0];
    setContract({ ...contract, status: "signed", signedDate: now, lastModified: now });
    setSignName("");
    setAgreedTerms(false);
  };

  const handleDuplicate = () => {
    navigate("/contracts");
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    navigate("/contracts");
  };

  const handleDownloadPdf = () => {
    const el = document.createElement("a");
    el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(`${contract.title}\nContract #${contract.id}\nGenerated PDF simulation`));
    el.setAttribute("download", `${contract.id}.pdf`);
    el.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/contracts")} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{contract.title}</h1>
              <Badge color={s.color}>{s.label}</Badge>
              <Badge color="#6366f1" sm>v{contract.version}</Badge>
              {isSigned && <Lock className="w-4 h-4 text-green-600" />}
            </div>
            <p className="text-sm text-gray-500">{contract.id} &middot; {contract.customerName} &middot; {contract.projectNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && !editing && <Btn color="#3b82f6" onClick={() => setEditing(true)}><span className="flex items-center gap-1.5"><Edit3 className="w-4 h-4" /> Edit</span></Btn>}
          {isDraft && <Btn color="#22c55e" onClick={() => setShowSendModal(true)}><span className="flex items-center gap-1.5"><Send className="w-4 h-4" /> Send for Signing</span></Btn>}
          <Btn variant="outline" color="#6b7280" onClick={handleDownloadPdf}><span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> PDF</span></Btn>
          <Btn variant="outline" color="#6b7280" onClick={handleDuplicate}><span className="flex items-center gap-1.5"><Copy className="w-4 h-4" /> Duplicate</span></Btn>
          <Btn variant="outline" color="#6b7280" onClick={handlePrint}><span className="flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print</span></Btn>
          {isDraft && <Btn variant="outline" color="#ef4444" onClick={() => setShowDeleteConfirm(true)}><span className="flex items-center gap-1.5"><Trash2 className="w-4 h-4" /> Delete</span></Btn>}
        </div>
      </div>

      {/* Signed locked banner */}
      {isSigned && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full"><Lock className="w-5 h-5 text-green-700" /></div>
          <div>
            <p className="font-semibold text-green-800">This contract was signed on {contract.signedDate} and is permanently locked.</p>
            <p className="text-sm text-green-700">It cannot be modified. Any changes require a new contract or amendment.</p>
          </div>
        </div>
      )}

      {/* Editing toolbar */}
      {editing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-800">Editing Mode</span>
            <div className="flex gap-1 ml-4">
              <button className="p-1.5 hover:bg-blue-100 rounded transition"><Bold className="w-4 h-4 text-blue-700" /></button>
              <button className="p-1.5 hover:bg-blue-100 rounded transition"><Italic className="w-4 h-4 text-blue-700" /></button>
              <button className="p-1.5 hover:bg-blue-100 rounded transition"><Underline className="w-4 h-4 text-blue-700" /></button>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn size="sm" variant="outline" color="#6b7280" onClick={() => setEditing(false)}><span className="flex items-center gap-1"><X className="w-3.5 h-3.5" /> Cancel</span></Btn>
            <Btn size="sm" color="#3b82f6" onClick={handleSaveDraft}><span className="flex items-center gap-1"><Save className="w-3.5 h-3.5" /> Save Draft (v{contract.version + 1})</span></Btn>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        {/* Main document */}
        <div className="col-span-2 space-y-5">
          {/* Contract document */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-md" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {/* Letterhead */}
            <div className="border-b border-gray-200 p-8 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">SC</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>Smart Construction & Remodeling Inc.</h2>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Minnesota Licensed General Contractor — Lic# BC-789456</p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>1847 University Ave W, Saint Paul, MN 55104</p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>(651) 555-0123 &middot; info@smartconstruction.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Contract #: <strong>{contract.id}</strong></p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Date: {contract.createdDate}</p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Version: v{contract.version}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 text-sm leading-relaxed text-gray-800">
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
                {contract.title.split(" — ")[0]}
              </h1>

              {/* Parties */}
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Parties</h3>
                <p>This agreement is entered into on <strong>{contract.createdDate}</strong> between <strong>Smart Construction & Remodeling Inc.</strong> ("Contractor"), a Minnesota corporation, and <strong>{contract.customerName}</strong> ("Homeowner"), for the property located at <strong>{contract.address}</strong>.</p>
              </div>

              {/* Scope of Work */}
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Scope of Work</h3>
                {editing ? (
                  <textarea
                    value={scopeText}
                    onChange={(e) => setScopeText(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg text-sm leading-relaxed bg-blue-50/30 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{ fontFamily: "'Georgia', serif" }}
                  />
                ) : (
                  <p>{scopeText}</p>
                )}
              </div>

              {/* Project Details */}
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Project Details</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500 w-48">Property Address</td><td className="py-1.5 font-medium">{contract.address}</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Project Number</td><td className="py-1.5 font-medium">{contract.projectNumber}</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Estimated Start Date</td><td className="py-1.5 font-medium">Within 5 business days of signed contract</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Estimated Completion</td><td className="py-1.5 font-medium">2-4 business days (weather permitting)</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Materials */}
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Materials</h3>
                {editing ? (
                  <textarea
                    value={materialsText}
                    onChange={(e) => setMaterialsText(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg text-sm leading-relaxed bg-blue-50/30 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{ fontFamily: "'Georgia', serif" }}
                  />
                ) : (
                  <p>{materialsText}</p>
                )}
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Pricing & Payment Schedule</h3>
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <tbody>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td className="py-2 px-3 font-semibold">Total Contract Price</td>
                      <td className="py-2 px-3 text-right font-bold text-lg">{money(contract.totalPrice)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-600">Deposit (upon signing)</td>
                      <td className="py-2 px-3 text-right">{money(Math.round(contract.totalPrice * 0.33))}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-600">Progress payment (50% completion)</td>
                      <td className="py-2 px-3 text-right">{money(Math.round(contract.totalPrice * 0.34))}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-gray-600">Final payment (upon completion)</td>
                      <td className="py-2 px-3 text-right">{money(contract.totalPrice - Math.round(contract.totalPrice * 0.33) - Math.round(contract.totalPrice * 0.34))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Insurance */}
              {contract.insuranceClaim && (
                <div>
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Insurance Information</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500 w-48">Insurance Company</td><td className="py-1.5 font-medium">State Farm Insurance</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Claim Number</td><td className="py-1.5 font-medium">CLM-2026-{contract.id.slice(-3)}892</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Adjuster</td><td className="py-1.5 font-medium">Michael Roberts</td></tr>
                      <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-500">Deductible</td><td className="py-1.5 font-medium">$1,000</td></tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2 italic">Homeowner is responsible for payment of the deductible amount. Contractor will work directly with the insurance company for all covered work.</p>
                </div>
              )}

              {/* Warranty */}
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Warranty</h3>
                <p><strong>Workmanship Warranty:</strong> Smart Construction & Remodeling Inc. warrants all labor and installation for a period of five (5) years from the date of completion.</p>
                <p className="mt-2"><strong>Manufacturer Warranty:</strong> All materials carry the manufacturer's standard warranty. Owens Corning Duration shingles include a Limited Lifetime Warranty (see manufacturer documentation for full terms and conditions).</p>
              </div>

              {/* Terms */}
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Terms & Conditions</h3>
                {editing ? (
                  <textarea
                    value={termsText}
                    onChange={(e) => setTermsText(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg text-sm leading-relaxed bg-blue-50/30 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{ fontFamily: "'Georgia', serif" }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{termsText}</div>
                )}
              </div>

              {/* Signatures */}
              <div className="border-t border-gray-300 pt-6 mt-8">
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Signatures</h3>
                <div className="grid grid-cols-2 gap-8">
                  {/* Contractor */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CONTRACTOR</p>
                    <div className="border-b-2 border-gray-400 pb-1 mb-1 min-h-[40px] flex items-end">
                      <span className="text-xl italic text-gray-800" style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}>Pavel Pilich</span>
                    </div>
                    <p className="text-xs text-gray-600">Pavel Pilich, Owner</p>
                    <p className="text-xs text-gray-600">Smart Construction & Remodeling Inc.</p>
                    <p className="text-xs text-gray-400 mt-1">Date: {contract.createdDate}</p>
                  </div>
                  {/* Homeowner */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">HOMEOWNER</p>
                    <div className="border-b-2 border-gray-400 pb-1 mb-1 min-h-[40px] flex items-end">
                      {isSigned ? (
                        <span className="text-xl italic text-gray-800" style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}>
                          {contract.customerName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Awaiting signature...</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{contract.customerName}</p>
                    <p className="text-xs text-gray-400 mt-1">Date: {isSigned ? contract.signedDate : "___________"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* E-Signature Section (for sent contracts) */}
          {isSent && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" /> Sign This Contract
              </h3>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">I have read and agree to all terms and conditions outlined in this contract. I understand this creates a legally binding agreement.</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type your full legal name to sign</label>
                  <input
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    placeholder="Full legal name"
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  {signName && (
                    <div className="mt-3 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                      <p className="text-xs text-gray-400 mb-1">Signature Preview</p>
                      <p className="text-3xl italic text-gray-800" style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}>
                        {signName}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Date: {new Date().toISOString().split("T")[0]}</span>
                  <span>IP: 73.242.118.xxx (simulated)</span>
                </div>

                <div className="flex gap-2">
                  <Btn color="#22c55e" onClick={handleSign} disabled={!agreedTerms || !signName.trim()}>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Sign Contract</span>
                  </Btn>
                  <Btn variant="outline" color="#6b7280" onClick={() => { setSignName(""); setAgreedTerms(false); }}>
                    Clear Signature
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {/* Audit Trail */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" /> Audit Trail
            </h3>
            <div className="space-y-0">
              {auditTrail.map((entry, i) => (
                <div key={i} className="flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                      entry.action.includes("locked") ? "bg-green-500" :
                      entry.action.includes("signed") ? "bg-green-400" :
                      entry.action.includes("Sent") ? "bg-blue-500" :
                      "bg-gray-300"
                    }`} />
                    {i < auditTrail.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{entry.date} at {entry.time}</span>
                      <span className="text-gray-300">|</span>
                      <span>By: {entry.user}</span>
                    </div>
                    {entry.meta && <p className="text-xs text-gray-400 mt-0.5">{entry.meta}</p>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Badge color="#22c55e"><Shield className="w-3 h-3 mr-1" /> ESIGN Act Compliant</Badge>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contract Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">Contract Info</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge color={s.color}>{s.label}</Badge></div>
              <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="font-medium">v{contract.version}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Template</span><span className="font-medium">{contract.template}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-medium">{contract.customerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Project</span><span className="font-medium">{contract.projectNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-green-600">{money(contract.totalPrice)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-medium">{contract.createdDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Modified</span><span className="font-medium">{contract.lastModified}</span></div>
              {contract.signedDate && <div className="flex justify-between"><span className="text-gray-500">Signed</span><span className="font-medium text-green-600">{contract.signedDate}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Insurance</span><span className="font-medium">{contract.insuranceClaim ? "Yes" : "No"}</span></div>
            </div>
          </div>

          {/* Version History */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="flex items-center justify-between w-full"
            >
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                <History className="w-4 h-4" /> Version History
              </h4>
              {showVersions ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showVersions && (
              <div className="mt-3 space-y-3">
                {versions.map((v) => (
                  <div
                    key={v.version}
                    className={`p-2 rounded-lg border text-xs ${
                      v.version === contract.version
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold">v{v.version}</span>
                      {v.version === contract.version && <Badge color="#3b82f6" sm>Current</Badge>}
                    </div>
                    <p className="text-gray-600">{v.changes}</p>
                    <p className="text-gray-400 mt-0.5">{v.date} by {v.user}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Quick Actions</h4>
            {isDraft && (
              <Btn color="#3b82f6" onClick={() => setEditing(true)} className="w-full">
                <span className="flex items-center gap-1.5 justify-center"><Edit3 className="w-4 h-4" /> Edit Contract</span>
              </Btn>
            )}
            {isDraft && (
              <Btn color="#22c55e" onClick={() => setShowSendModal(true)} className="w-full">
                <span className="flex items-center gap-1.5 justify-center"><Send className="w-4 h-4" /> Send for Signing</span>
              </Btn>
            )}
            <Btn variant="outline" color="#6b7280" onClick={handleDownloadPdf} className="w-full">
              <span className="flex items-center gap-1.5 justify-center"><Download className="w-4 h-4" /> Download PDF</span>
            </Btn>
            <Btn variant="outline" color="#6b7280" onClick={handlePrint} className="w-full">
              <span className="flex items-center gap-1.5 justify-center"><Printer className="w-4 h-4" /> Print Contract</span>
            </Btn>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      <Modal open={showSendModal} onClose={() => setShowSendModal(false)} title="Send Contract for Signing">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-900">Email Preview</p>
            <div className="text-xs space-y-1 text-gray-600">
              <p><strong>To:</strong> {contract.customerName.toLowerCase().replace(" ", ".")}@email.com</p>
              <p><strong>From:</strong> contracts@smartconstruction.com</p>
              <p><strong>Subject:</strong> Contract Ready for Your Signature — {contract.title}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs text-gray-700 mt-2">
              <p>Dear {contract.customerName.split(" ")[0]},</p>
              <p className="mt-2">Your contract for {contract.title.split(" — ")[0].toLowerCase()} is ready for review and signature. Please click the link below to review the contract and sign electronically.</p>
              <p className="mt-2 text-blue-600 underline">[View & Sign Contract]</p>
              <p className="mt-2">If you have any questions, please don't hesitate to contact us.</p>
              <p className="mt-2">Best regards,<br />Pavel Pilich<br />Smart Construction & Remodeling Inc.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Btn variant="outline" color="#6b7280" onClick={() => setShowSendModal(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleSendForSigning}>
              <span className="flex items-center gap-1.5"><Send className="w-4 h-4" /> Send Now</span>
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Contract">
        <div className="space-y-4">
          <p className="text-sm text-gray-700">Are you sure you want to delete <strong>{contract.title}</strong>? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Btn variant="outline" color="#6b7280" onClick={() => setShowDeleteConfirm(false)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={handleDelete}>Delete Contract</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
