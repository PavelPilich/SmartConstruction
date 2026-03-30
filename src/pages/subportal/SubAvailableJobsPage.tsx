import { useState } from "react";
import {
  MapPin, Calendar, Clock, DollarSign, CheckCircle2, XCircle,
  Eye, Bookmark, Search, Filter,
} from "lucide-react";
import { Badge, Btn, Modal } from "../../components/ui";
import { useSubAuth } from "../../components/layout/SubPortalLayout";
import { useAppStore } from "../../stores/useAppStore";

interface AvailableJob {
  id: string;
  project: string;
  type: string;
  typeBadgeColor: string;
  city: string;
  fullAddress: string;
  scope: string;
  pay: number;
  duration: string;
  startDate: string;
  specialty: string;
  requiredDocs: { name: string; hasSub: boolean }[];
  booked: boolean;
}

const initialJobs: AvailableJob[] = [
  {
    id: "MN-0470",
    project: "MN-0470 Roof Replacement — Edina",
    type: "Roofing",
    typeBadgeColor: "#ea580c",
    city: "Edina, MN",
    fullAddress: "4521 France Ave S, Edina, MN 55424",
    scope: "Complete roof replacement, 24 squares, tear-off + install GAF Timberline HDZ",
    pay: 4800,
    duration: "3-4 days",
    startDate: "Apr 5, 2026",
    specialty: "Roofing",
    requiredDocs: [
      { name: "Roofing License", hasSub: true },
      { name: "General Liability Insurance", hasSub: true },
      { name: "Workers Comp", hasSub: true },
      { name: "W-9", hasSub: true },
    ],
    booked: false,
  },
  {
    id: "MN-0471",
    project: "MN-0471 Siding Install — Maple Grove",
    type: "Siding",
    typeBadgeColor: "#3b82f6",
    city: "Maple Grove, MN",
    fullAddress: "8901 Hemlock Lane, Maple Grove, MN 55369",
    scope: "LP SmartSide siding install, full house wrap, all four sides",
    pay: 3600,
    duration: "2-3 days",
    startDate: "Apr 8, 2026",
    specialty: "Siding",
    requiredDocs: [
      { name: "General Liability Insurance", hasSub: true },
      { name: "Workers Comp", hasSub: true },
      { name: "W-9", hasSub: true },
    ],
    booked: false,
  },
  {
    id: "MN-0472",
    project: "MN-0472 Window Replacement — Plymouth",
    type: "Windows",
    typeBadgeColor: "#8b5cf6",
    city: "Plymouth, MN",
    fullAddress: "3201 Vicksburg Lane, Plymouth, MN 55447",
    scope: "Replace 12 double-hung windows, Andersen 400 series, interior/exterior trim",
    pay: 2800,
    duration: "2 days",
    startDate: "Apr 10, 2026",
    specialty: "Windows",
    requiredDocs: [
      { name: "General Liability Insurance", hasSub: true },
      { name: "W-9", hasSub: true },
    ],
    booked: false,
  },
  {
    id: "MN-0473",
    project: "MN-0473 Gutter + Fascia — Eagan",
    type: "Gutters",
    typeBadgeColor: "#059669",
    city: "Eagan, MN",
    fullAddress: "1456 Diffley Rd, Eagan, MN 55123",
    scope: "Seamless aluminum gutters 6-inch, fascia repair and paint, 180 linear ft",
    pay: 1200,
    duration: "1 day",
    startDate: "Apr 12, 2026",
    specialty: "General",
    requiredDocs: [
      { name: "General Liability Insurance", hasSub: true },
      { name: "W-9", hasSub: true },
    ],
    booked: false,
  },
  {
    id: "MN-0474",
    project: "MN-0474 Metal Barn Repair — Woodbury",
    type: "General",
    typeBadgeColor: "#6b7280",
    city: "Woodbury, MN",
    fullAddress: "9800 Bailey Rd, Woodbury, MN 55129",
    scope: "Repair metal barn roof panels, replace 8 damaged sheets, reseal all fasteners",
    pay: 6400,
    duration: "5 days",
    startDate: "Apr 14, 2026",
    specialty: "General",
    requiredDocs: [
      { name: "General Liability Insurance", hasSub: true },
      { name: "Workers Comp", hasSub: true },
      { name: "W-9", hasSub: false },
    ],
    booked: false,
  },
  {
    id: "MN-0475",
    project: "MN-0475 Full Exterior — St. Paul",
    type: "General",
    typeBadgeColor: "#6b7280",
    city: "St. Paul, MN",
    fullAddress: "742 Summit Ave, St. Paul, MN 55105",
    scope: "Full exterior: roof, siding, gutters, fascia, soffit, paint — historic home restoration",
    pay: 8200,
    duration: "7-10 days",
    startDate: "Apr 18, 2026",
    specialty: "General",
    requiredDocs: [
      { name: "General Liability Insurance", hasSub: true },
      { name: "Workers Comp", hasSub: true },
      { name: "W-9", hasSub: true },
      { name: "Lead Paint Certification", hasSub: false },
    ],
    booked: false,
  },
];

export default function SubAvailableJobsPage() {
  const { complianceStatus } = useSubAuth();
  const addToast = useAppStore((s) => s.addToast);
  const [jobs, setJobs] = useState<AvailableJob[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<AvailableJob | null>(null);
  const [detailJob, setDetailJob] = useState<AvailableJob | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const isBlocked = complianceStatus === "red";

  const filteredJobs = jobs.filter((j) => {
    if (j.booked) return false;
    if (search && !j.project.toLowerCase().includes(search.toLowerCase()) && !j.scope.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "All" && j.type !== typeFilter) return false;
    return true;
  });

  const jobTypes = ["All", ...Array.from(new Set(initialJobs.map((j) => j.type)))];

  const handleBook = () => {
    if (!selectedJob) return;
    const missingDocs = selectedJob.requiredDocs.filter((d) => !d.hasSub);
    if (missingDocs.length > 0) {
      addToast(`Cannot book — missing: ${missingDocs.map((d) => d.name).join(", ")}`, "error");
      setSelectedJob(null);
      return;
    }
    setJobs((prev) => prev.map((j) => (j.id === selectedJob.id ? { ...j, booked: true } : j)));
    addToast(`Booked ${selectedJob.id} — ${selectedJob.type} in ${selectedJob.city}`, "success");
    setSelectedJob(null);
  };

  const canBook = (job: AvailableJob) => {
    if (isBlocked) return false;
    return job.requiredDocs.every((d) => d.hasSub);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
        <p className="text-sm text-gray-500">Jobs posted by Smart Construction — book to add to your schedule</p>
      </div>

      {isBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
          You are currently BLOCKED. Renew expired documents before you can book new jobs.
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {jobTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                typeFilter === t
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
            No available jobs match your filters.
          </div>
        )}
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-900">{job.id}</p>
                  <Badge color={job.typeBadgeColor}>{job.type}</Badge>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">${job.pay.toLocaleString()}</p>
                <p className="text-[11px] text-gray-400">SC Pays</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-3">{job.scope}</p>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.duration}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Start: {job.startDate}</span>
              <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5" /> {job.specialty}</span>
            </div>

            {/* Required Docs */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-1.5">Required Documents:</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredDocs.map((doc) => (
                  <span
                    key={doc.name}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      doc.hasSub
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {doc.hasSub ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {doc.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Btn
                color="#ea580c"
                size="sm"
                disabled={!canBook(job)}
                onClick={() => setSelectedJob(job)}
                className="flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" /> Book This Job
              </Btn>
              <Btn color="#6b7280" variant="outline" size="sm" onClick={() => setDetailJob(job)} className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> View Full Details
              </Btn>
              {!canBook(job) && !isBlocked && (
                <span className="text-xs text-red-500 self-center ml-2">Missing required documents</span>
              )}
              {isBlocked && (
                <span className="text-xs text-red-500 self-center ml-2">Account blocked — renew documents</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Book Confirmation Modal */}
      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)} title="Confirm Job Booking">
        {selectedJob && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-900 mb-1">{selectedJob.project}</p>
              <Badge color={selectedJob.typeBadgeColor}>{selectedJob.type}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Full Address</span>
                <span className="font-medium text-gray-900">{selectedJob.fullAddress}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Scope</span>
                <span className="font-medium text-gray-900 text-right max-w-[280px]">{selectedJob.scope}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">SC Pays</span>
                <span className="font-bold text-green-600 text-lg">${selectedJob.pay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Start Date</span>
                <span className="font-medium text-gray-900">{selectedJob.startDate}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-900">{selectedJob.duration}</span>
              </div>
            </div>

            {/* Docs status */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Document Status:</p>
              <div className="space-y-1">
                {selectedJob.requiredDocs.map((doc) => (
                  <div key={doc.name} className="flex items-center gap-2 text-sm">
                    {doc.hasSub ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={doc.hasSub ? "text-gray-700" : "text-red-600 font-medium"}>{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Btn color="#ea580c" onClick={handleBook} className="flex-1">
                Confirm Booking
              </Btn>
              <Btn color="#6b7280" variant="outline" onClick={() => setSelectedJob(null)} className="flex-1">
                Cancel
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailJob} onClose={() => setDetailJob(null)} title="Job Details" wide>
        {detailJob && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{detailJob.project}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge color={detailJob.typeBadgeColor}>{detailJob.type}</Badge>
                  <Badge color="#6b7280">{detailJob.specialty}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">${detailJob.pay.toLocaleString()}</p>
                <p className="text-xs text-gray-400">SC Pays You</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Full Address</p>
                <p className="font-medium text-gray-900">{detailJob.fullAddress}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Start Date</p>
                <p className="font-medium text-gray-900">{detailJob.startDate}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Estimated Duration</p>
                <p className="font-medium text-gray-900">{detailJob.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Required Specialty</p>
                <p className="font-medium text-gray-900">{detailJob.specialty}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Scope of Work</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{detailJob.scope}</p>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">Required Documents</p>
              <div className="space-y-1.5">
                {detailJob.requiredDocs.map((doc) => (
                  <div key={doc.name} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${doc.hasSub ? "bg-green-50" : "bg-red-50"}`}>
                    {doc.hasSub ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    <span className={doc.hasSub ? "text-green-800" : "text-red-800 font-medium"}>{doc.name}</span>
                    <span className={`ml-auto text-xs ${doc.hasSub ? "text-green-600" : "text-red-600"}`}>
                      {doc.hasSub ? "On file" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Btn
                color="#ea580c"
                disabled={!canBook(detailJob)}
                onClick={() => { setDetailJob(null); setSelectedJob(detailJob); }}
                className="flex-1"
              >
                Book This Job
              </Btn>
              <Btn color="#6b7280" variant="outline" onClick={() => setDetailJob(null)} className="flex-1">
                Close
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
