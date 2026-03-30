import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Shield, ClipboardCheck, ScrollText, Building, Plane,
  FilePlus, Award, Download, Eye,
} from "lucide-react";
import { Badge, Btn, Modal } from "../../components/ui";
import { usePortalAuth } from "../../components/layout/PortalLayout";

type DocCategory = "All" | "Insurance" | "Estimates" | "Contracts" | "Permits" | "Inspection Reports";

interface Document {
  id: number;
  name: string;
  category: Exclude<DocCategory, "All">;
  date: string;
  status: "Submitted" | "Approved" | "Pending" | "Signed";
  detail: string;
  icon: typeof FileText;
  iconColor: string;
}

const documents: Document[] = [
  {
    id: 1, name: "Insurance Claim Filed", category: "Insurance",
    date: "Mar 8, 2026", status: "Submitted",
    detail: "State Farm Claim #HB-2026-4821. Filed for hail damage to roof, gutters, and siding. Adjuster assigned: Tom Williams.",
    icon: Shield, iconColor: "#3b82f6",
  },
  {
    id: 2, name: "Insurance Adjuster Report", category: "Insurance",
    date: "Mar 12, 2026", status: "Approved",
    detail: "Adjuster confirmed hail damage. RCV approved at $18,500. ACV payment of $15,200 issued. Depreciation holdback: $3,300.",
    icon: Shield, iconColor: "#3b82f6",
  },
  {
    id: 3, name: "Xactimate Estimate v2", category: "Estimates",
    date: "Mar 14, 2026", status: "Approved",
    detail: "Full Xactimate estimate version 2. Total RCV: $18,500. Includes roof replacement, gutters, ice & water shield, and ridge vent.",
    icon: FileText, iconColor: "#8b5cf6",
  },
  {
    id: 4, name: "Contract — Roof Replacement", category: "Contracts",
    date: "Mar 10, 2026", status: "Signed",
    detail: "Digital signature executed 03/10/2026 by Robert Johnson. Scope: full roof replacement, gutter replacement, and cleanup. Terms: Net 30.",
    icon: ScrollText, iconColor: "#10b981",
  },
  {
    id: 5, name: "Building Permit", category: "Permits",
    date: "Mar 18, 2026", status: "Approved",
    detail: "City of Plymouth Building Permit #BP-2026-0447. Approved for residential roof replacement. Expires Sep 18, 2026.",
    icon: Building, iconColor: "#f59e0b",
  },
  {
    id: 6, name: "Drone Inspection Report", category: "Inspection Reports",
    date: "Mar 11, 2026", status: "Approved",
    detail: "DJI Mavic 3 drone inspection. 47 aerial photos captured. Damage assessment: 23 hail impacts on south slope, 14 on west slope. PDF report attached.",
    icon: Plane, iconColor: "#6366f1",
  },
  {
    id: 7, name: "Supplement Request #1", category: "Estimates",
    date: "Mar 25, 2026", status: "Pending",
    detail: "Supplement for additional OSB decking replacement on south slope. 3 sheets of 7/16\" OSB found damaged during tear-off. Amount: $480.",
    icon: FilePlus, iconColor: "#ef4444",
  },
  {
    id: 8, name: "Certificate of Completion", category: "Inspection Reports",
    date: "", status: "Pending",
    detail: "Will be issued upon final inspection and project completion. Required for depreciation holdback recovery.",
    icon: Award, iconColor: "#94a3b8",
  },
  {
    id: 9, name: "Material Warranty", category: "Contracts",
    date: "Mar 20, 2026", status: "Approved",
    detail: "GAF Golden Pledge Limited Warranty. 50-year coverage on Timberline HDZ shingles. 25-year workmanship coverage by Smart Construction.",
    icon: ClipboardCheck, iconColor: "#10b981",
  },
];

const statusColors: Record<string, string> = {
  Submitted: "#3b82f6",
  Approved: "#10b981",
  Pending: "#f59e0b",
  Signed: "#8b5cf6",
};

const categories: DocCategory[] = ["All", "Insurance", "Estimates", "Contracts", "Permits", "Inspection Reports"];

export default function PortalDocumentsPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = usePortalAuth();
  const [filter, setFilter] = useState<DocCategory>("All");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  if (!isLoggedIn) {
    navigate("/portal", { replace: true });
    return null;
  }

  const filtered = filter === "All" ? documents : documents.filter((d) => d.category === filter);

  const handleDownload = (docId: number) => {
    setDownloading(docId);
    setTimeout(() => setDownloading(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Project Documents</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {documents.length} documents &bull; 1847 Maple Grove Dr, Plymouth, MN
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const count = cat === "All" ? documents.length : documents.filter((d) => d.category === cat).length;
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Document Cards */}
      <div className="space-y-3">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
            onClick={() => setSelectedDoc(doc)}
          >
            <div className="flex items-start gap-4">
              <div style={{ background: doc.iconColor + "15" }} className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">
                <doc.icon className="w-5 h-5" style={{ color: doc.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{doc.name}</span>
                  <Badge color={statusColors[doc.status]}>{doc.status}</Badge>
                  <Badge color="#6b7280" sm>{doc.category}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{doc.detail}</p>
                <p className="text-xs text-gray-400 mt-1">{doc.date || "Date pending"}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="View details"
                >
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(doc.id); }}
                  disabled={downloading === doc.id || doc.status === "Pending"}
                  className="p-2 hover:bg-blue-50 rounded-lg transition disabled:opacity-40"
                  title="Download"
                >
                  <Download className={`w-4 h-4 ${downloading === doc.id ? "text-blue-500 animate-bounce" : "text-gray-400"}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No documents in this category.
        </div>
      )}

      {/* Document Detail Modal */}
      <Modal
        open={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.name || "Document"}
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div style={{ background: selectedDoc.iconColor + "15" }} className="w-12 h-12 rounded-xl flex items-center justify-center">
                <selectedDoc.icon className="w-6 h-6" style={{ color: selectedDoc.iconColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge color={statusColors[selectedDoc.status]}>{selectedDoc.status}</Badge>
                  <Badge color="#6b7280">{selectedDoc.category}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">{selectedDoc.date || "Date pending"}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedDoc.detail}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="outline" color="#6b7280" onClick={() => setSelectedDoc(null)}>Close</Btn>
              <Btn
                color="#3b82f6"
                onClick={() => handleDownload(selectedDoc.id)}
                disabled={selectedDoc.status === "Pending" || downloading === selectedDoc.id}
              >
                <Download className="w-4 h-4 inline mr-1.5" />
                {downloading === selectedDoc.id ? "Downloading..." : "Download PDF"}
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
