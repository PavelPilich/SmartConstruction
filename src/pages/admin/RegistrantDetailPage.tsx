import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle, FileText, Shield,
  Loader2, Calendar, Mail, Phone, Building2, User, Clock,
} from "lucide-react";
import { Badge, Btn, Modal } from "../../components/ui";
import { useRegistrationStore } from "../../stores/useRegistrationStore";
import { useAppStore } from "../../stores/useAppStore";
import {
  DOC_STATUS_COLORS,
  REGISTRANT_STATUS_COLORS,
  REGISTRANT_STATUS_LABELS,
} from "../../types/registration";

export default function RegistrantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);
  const {
    registrants, positions, updateRegistrant, removeRegistrant,
    verifyDocument, unblockRegistrant, updateRegistrantDoc,
  } = useRegistrationStore();

  const registrant = registrants.find((r) => r.id === id);
  const position = registrant ? positions.find((p) => p.id === registrant.positionId) : null;

  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (!registrant) {
    return (
      <div className="p-6">
        <Btn variant="outline" color="#3b82f6" onClick={() => navigate("/admin/registrations")}>
          <ArrowLeft className="w-4 h-4 inline mr-1" />Back
        </Btn>
        <div className="text-center text-gray-400 py-12 text-sm">Registrant not found.</div>
      </div>
    );
  }

  const handleVerify = async (docId: string) => {
    setVerifyingDocId(docId);
    await verifyDocument(registrant.id, docId);
    setVerifyingDocId(null);
    addToast("Document verification complete");
  };

  const handleRejectDoc = () => {
    if (!rejectDocId || !rejectReason.trim()) return;
    updateRegistrantDoc(registrant.id, rejectDocId, {
      status: "rejected",
      rejectionReason: rejectReason.trim(),
    });
    addToast("Document rejected", "error");
    setRejectModalOpen(false);
    setRejectDocId(null);
    setRejectReason("");
  };

  const openRejectDoc = (docId: string) => {
    setRejectDocId(docId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleApprove = () => {
    updateRegistrant(registrant.id, { status: "active" });
    addToast(`${registrant.firstName} ${registrant.lastName} approved`);
  };

  const handleReject = () => {
    updateRegistrant(registrant.id, { status: "rejected" });
    addToast(`${registrant.firstName} ${registrant.lastName} rejected`, "error");
  };

  const handleUnblock = () => {
    unblockRegistrant(registrant.id);
    addToast(`${registrant.firstName} ${registrant.lastName} unblocked`);
  };

  const handleDelete = () => {
    removeRegistrant(registrant.id);
    addToast(`${registrant.firstName} ${registrant.lastName} deleted`, "error");
    navigate("/admin/registrations");
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  };

  const getExpirationStyle = (expDate: string | null) => {
    if (!expDate) return {};
    const now = new Date();
    const exp = new Date(expDate);
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
    if (daysLeft <= 0) return { color: "#ef4444", fontWeight: 600 };
    if (daysLeft <= 30) return { color: "#f59e0b", fontWeight: 600 };
    return {};
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Btn variant="outline" color="#3b82f6" onClick={() => navigate("/admin/registrations")}>
        <ArrowLeft className="w-4 h-4 inline mr-1" />Back to Registrations
      </Btn>

      {/* Blocked Banner */}
      {registrant.status === "blocked" && (
        <div className="bg-red-600 text-white rounded-xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">REGISTRANT BLOCKED</div>
              <div className="text-xs opacity-90">{registrant.blockedReason}</div>
            </div>
          </div>
          <Btn color="#ffffff" onClick={handleUnblock} size="sm">
            <span className="text-red-600 font-semibold">Unblock</span>
          </Btn>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {registrant.firstName} {registrant.lastName}
          </h1>
          <div className="flex gap-2 mt-1">
            {position && <Badge color={position.color}>{position.name}</Badge>}
            <Badge color={REGISTRANT_STATUS_COLORS[registrant.status]}>
              {REGISTRANT_STATUS_LABELS[registrant.status]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contact Info Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Contact Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <InfoCell icon={User} label="First Name" value={registrant.firstName} />
          <InfoCell icon={User} label="Last Name" value={registrant.lastName} />
          <InfoCell icon={Mail} label="Email" value={registrant.email} />
          <InfoCell icon={Phone} label="Phone" value={registrant.phone} />
          <InfoCell icon={Building2} label="Company" value={registrant.company} />
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Position</div>
              {position ? (
                <Badge color={position.color}>{position.name}</Badge>
              ) : (
                <span className="text-sm text-gray-400">Unknown</span>
              )}
            </div>
          </div>
          <InfoCell icon={Calendar} label="Registered" value={formatDate(registrant.registeredAt)} />
          <InfoCell icon={Clock} label="Last Verified" value={formatDate(registrant.lastVerifiedAt)} />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-900">Documents</h2>
          <span className="text-xs text-gray-400">({registrant.documents.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 font-medium">
                <th className="px-4 py-2">Form</th>
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2">Uploaded</th>
                <th className="px-4 py-2">Expires</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Verification</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrant.documents.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{doc.formName}</td>
                  <td className="px-4 py-3">
                    {doc.fileName ? (
                      <span className="text-gray-700">{doc.fileName}</span>
                    ) : (
                      <span className="text-gray-400 italic">Not uploaded</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(doc.uploadedAt)}</td>
                  <td className="px-4 py-3" style={getExpirationStyle(doc.expirationDate)}>
                    {formatDate(doc.expirationDate)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={DOC_STATUS_COLORS[doc.status]} sm>{doc.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {doc.verificationResult ? (
                      <div className="flex items-start gap-1.5">
                        {doc.verificationResult.verified ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-xs font-medium text-gray-700">{doc.verificationResult.source}</div>
                          <div className="text-[11px] text-gray-500">{doc.verificationResult.message}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not verified</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Btn
                        size="sm"
                        color="#3b82f6"
                        onClick={() => handleVerify(doc.id)}
                        disabled={verifyingDocId === doc.id || doc.status === "pending"}
                      >
                        {verifyingDocId === doc.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Btn>
                      <Btn size="sm" variant="outline" color="#ef4444" onClick={() => openRejectDoc(doc.id)}>
                        Reject
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        {registrant.status !== "active" && (
          <Btn color="#10b981" onClick={handleApprove}>Approve Registrant</Btn>
        )}
        {registrant.status !== "rejected" && (
          <Btn variant="outline" color="#ef4444" onClick={handleReject}>Reject Registrant</Btn>
        )}
        {registrant.status === "blocked" && (
          <Btn color="#3b82f6" onClick={handleUnblock}>Unblock</Btn>
        )}
        <Btn variant="outline" color="#ef4444" onClick={handleDelete}>Delete</Btn>
      </div>

      {/* Reject Doc Modal */}
      <Modal open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Document">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
            <input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Btn variant="outline" color="#94a3b8" onClick={() => setRejectModalOpen(false)}>Cancel</Btn>
            <Btn color="#ef4444" onClick={handleRejectDoc} disabled={!rejectReason.trim()}>Reject Document</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoCell({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-900">{value}</div>
      </div>
    </div>
  );
}
