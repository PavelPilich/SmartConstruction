import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, ShieldAlert, AlertTriangle, Search, ClipboardCheck } from "lucide-react";
import { Badge, Btn, StatCard } from "../../components/ui";
import { useRegistrationStore } from "../../stores/useRegistrationStore";
import type { RegistrantStatus } from "../../types/registration";
import { REGISTRANT_STATUS_COLORS, REGISTRANT_STATUS_LABELS, DOC_STATUS_COLORS } from "../../types/registration";

type FilterTab = "all" | RegistrantStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending_review", label: "Pending Review" },
  { key: "active", label: "Active" },
  { key: "blocked", label: "Blocked" },
  { key: "rejected", label: "Rejected" },
];

export default function RegistrationsListPage() {
  const navigate = useNavigate();
  const { registrants, positions, checkExpiredDocs } = useRegistrationStore();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    checkExpiredDocs();
  }, [checkExpiredDocs]);

  const counts = useMemo(() => ({
    total: registrants.length,
    pending_review: registrants.filter((r) => r.status === "pending_review").length,
    active: registrants.filter((r) => r.status === "active").length,
    blocked: registrants.filter((r) => r.status === "blocked").length,
  }), [registrants]);

  const filtered = useMemo(() => {
    let list = registrants;
    if (filter !== "all") list = list.filter((r) => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [registrants, filter, search]);

  const getPosition = (posId: string) => positions.find((p) => p.id === posId);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Registrants" value={counts.total} color="#3b82f6" />
        <StatCard icon={ClipboardCheck} label="Pending Review" value={counts.pending_review} color="#f59e0b" />
        <StatCard icon={UserCheck} label="Active" value={counts.active} color="#10b981" />
        <StatCard icon={ShieldAlert} label="Blocked" value={counts.blocked} color="#ef4444" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
              filter === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1 text-xs opacity-70">
                ({registrants.filter((r) => r.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, or email..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {/* Registrant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((reg) => {
          const pos = getPosition(reg.positionId);
          const docCounts = {
            good: reg.documents.filter((d) => d.status === "verified" || d.status === "uploaded").length,
            warn: reg.documents.filter((d) => d.status === "pending").length,
            bad: reg.documents.filter((d) => d.status === "rejected" || d.status === "expired").length,
          };
          const totalDocs = reg.documents.length || 1;

          return (
            <div
              key={reg.id}
              onClick={() => navigate(`/admin/registrations/${reg.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition cursor-pointer relative overflow-hidden"
            >
              {/* Blocked Banner */}
              {reg.status === "blocked" && (
                <div className="absolute top-0 left-0 right-0 bg-red-600 text-white px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">BLOCKED: {reg.blockedReason}</span>
                </div>
              )}

              <div className={reg.status === "blocked" ? "mt-7" : ""}>
                {/* Name & Company */}
                <div className="mb-2">
                  <div className="text-sm font-semibold text-gray-900">{reg.firstName} {reg.lastName}</div>
                  <div className="text-xs text-gray-500">{reg.company}</div>
                  <div className="text-xs text-gray-400">{reg.email}</div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pos && <Badge color={pos.color}>{pos.name}</Badge>}
                  <Badge color={REGISTRANT_STATUS_COLORS[reg.status]}>
                    {REGISTRANT_STATUS_LABELS[reg.status]}
                  </Badge>
                </div>

                {/* Compliance mini-bar */}
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
                  {docCounts.good > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${(docCounts.good / totalDocs) * 100}%`, background: "#10b981" }}
                    />
                  )}
                  {docCounts.warn > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${(docCounts.warn / totalDocs) * 100}%`, background: "#f59e0b" }}
                    />
                  )}
                  {docCounts.bad > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${(docCounts.bad / totalDocs) * 100}%`, background: "#ef4444" }}
                    />
                  )}
                </div>
                <div className="flex gap-2 mt-1 text-[10px] text-gray-500">
                  <span>{docCounts.good} ok</span>
                  <span>{docCounts.warn} pending</span>
                  <span>{docCounts.bad} issue</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-12 text-sm">
          No registrants found matching your criteria.
        </div>
      )}
    </div>
  );
}
