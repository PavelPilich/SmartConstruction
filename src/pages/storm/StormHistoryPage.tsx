import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, Modal } from "../../components/ui";
import {
  Database, CloudLightning, Zap, DollarSign, BarChart3,
  Search, Filter, Plus, ArrowUpDown, ChevronRight, X,
  TrendingUp, Calendar,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & Mock Data                                                  */
/* ------------------------------------------------------------------ */

interface HistoricalStorm {
  id: string;
  date: string;
  sortDate: string;
  type: "Hail" | "Wind" | "Tornado" | "Ice";
  maxSeverity: "Extreme" | "Severe" | "Moderate" | "Minor";
  cities: string;
  addresses: number;
  leads: number;
  revenue: number;
}

const storms: HistoricalStorm[] = [
  { id: "storm-1", date: "Mar 16, 2026", sortDate: "2026-03-16", type: "Hail", maxSeverity: "Severe", cities: "Plymouth, Maple Grove", addresses: 82, leads: 47, revenue: 142000 },
  { id: "storm-2", date: "Feb 28, 2026", sortDate: "2026-02-28", type: "Ice", maxSeverity: "Moderate", cities: "Edina, St. Paul", addresses: 45, leads: 22, revenue: 68000 },
  { id: "storm-3", date: "Jan 15, 2026", sortDate: "2026-01-15", type: "Wind", maxSeverity: "Severe", cities: "Woodbury, Eagan", addresses: 61, leads: 31, revenue: 94000 },
  { id: "storm-4", date: "Dec 2, 2025", sortDate: "2025-12-02", type: "Hail", maxSeverity: "Moderate", cities: "Bloomington", addresses: 38, leads: 19, revenue: 57000 },
  { id: "storm-5", date: "Nov 10, 2025", sortDate: "2025-11-10", type: "Wind", maxSeverity: "Minor", cities: "Eden Prairie", addresses: 52, leads: 28, revenue: 84000 },
  { id: "storm-6", date: "Oct 5, 2025", sortDate: "2025-10-05", type: "Hail", maxSeverity: "Severe", cities: "Plymouth", addresses: 95, leads: 53, revenue: 189000 },
  { id: "storm-7", date: "Sep 12, 2025", sortDate: "2025-09-12", type: "Tornado", maxSeverity: "Extreme", cities: "Maple Grove", addresses: 120, leads: 67, revenue: 312000 },
  { id: "storm-8", date: "Aug 20, 2025", sortDate: "2025-08-20", type: "Hail", maxSeverity: "Severe", cities: "Minneapolis", addresses: 74, leads: 41, revenue: 126000 },
  { id: "storm-9", date: "Jul 8, 2025", sortDate: "2025-07-08", type: "Hail", maxSeverity: "Moderate", cities: "St. Paul, Woodbury", addresses: 63, leads: 35, revenue: 105000 },
  { id: "storm-10", date: "Jun 15, 2025", sortDate: "2025-06-15", type: "Wind", maxSeverity: "Minor", cities: "Eagan, Bloomington", addresses: 48, leads: 24, revenue: 72000 },
  { id: "storm-11", date: "May 22, 2025", sortDate: "2025-05-22", type: "Hail", maxSeverity: "Moderate", cities: "Eden Prairie, Edina", addresses: 70, leads: 38, revenue: 114000 },
  { id: "storm-12", date: "Apr 3, 2025", sortDate: "2025-04-03", type: "Ice", maxSeverity: "Minor", cities: "Hennepin County", addresses: 30, leads: 15, revenue: 45000 },
];

const TYPE_COLORS: Record<string, string> = {
  Hail: "#f97316",
  Wind: "#3b82f6",
  Tornado: "#ef4444",
  Ice: "#8b5cf6",
};

const SEVERITY_COLORS: Record<string, string> = {
  Extreme: "#ef4444",
  Severe: "#f97316",
  Moderate: "#eab308",
  Minor: "#3b82f6",
};

type SortField = "date" | "type" | "maxSeverity" | "addresses" | "leads" | "revenue";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StormHistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [addStormOpen, setAddStormOpen] = useState(false);

  /* Add storm form state */
  const [newStorm, setNewStorm] = useState({
    date: "",
    type: "Hail" as HistoricalStorm["type"],
    severity: "Moderate" as HistoricalStorm["maxSeverity"],
    cities: "",
    notes: "",
  });

  const [stormList, setStormList] = useState<HistoricalStorm[]>(storms);

  /* Derived stats */
  const totalLeads = stormList.reduce((a, s) => a + s.leads, 0);
  const totalRevenue = stormList.reduce((a, s) => a + s.revenue, 0);
  const avgRevenue = Math.round(totalRevenue / stormList.length);

  /* Revenue by type */
  const revenueByType: Record<string, number> = {};
  stormList.forEach((s) => {
    revenueByType[s.type] = (revenueByType[s.type] || 0) + s.revenue;
  });
  const maxTypeRevenue = Math.max(...Object.values(revenueByType));

  /* Leads by month */
  const leadsByMonth: Record<string, number> = {};
  stormList.forEach((s) => {
    const month = s.sortDate.slice(0, 7);
    leadsByMonth[month] = (leadsByMonth[month] || 0) + s.leads;
  });
  const sortedMonths = Object.keys(leadsByMonth).sort();
  const maxMonthLeads = Math.max(...Object.values(leadsByMonth));

  /* Filtering & Sorting */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = stormList
    .filter((s) => {
      if (typeFilter !== "All" && s.type !== typeFilter) return false;
      if (yearFilter !== "All" && !s.sortDate.startsWith(yearFilter)) return false;
      if (searchTerm && !s.cities.toLowerCase().includes(searchTerm.toLowerCase()) && !s.type.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      switch (sortField) {
        case "date": return dir * a.sortDate.localeCompare(b.sortDate);
        case "type": return dir * a.type.localeCompare(b.type);
        case "maxSeverity": {
          const order = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1 };
          return dir * (order[a.maxSeverity] - order[b.maxSeverity]);
        }
        case "addresses": return dir * (a.addresses - b.addresses);
        case "leads": return dir * (a.leads - b.leads);
        case "revenue": return dir * (a.revenue - b.revenue);
        default: return 0;
      }
    });

  const handleAddStorm = () => {
    if (!newStorm.date || !newStorm.cities) return;
    const id = `storm-${Date.now()}`;
    const dateObj = new Date(newStorm.date);
    const formatted = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const s: HistoricalStorm = {
      id,
      date: formatted,
      sortDate: newStorm.date,
      type: newStorm.type,
      maxSeverity: newStorm.severity,
      cities: newStorm.cities,
      addresses: 0,
      leads: 0,
      revenue: 0,
    };
    setStormList((prev) => [s, ...prev]);
    setNewStorm({ date: "", type: "Hail", severity: "Moderate", cities: "", notes: "" });
    setAddStormOpen(false);
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left px-3 py-2 font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900 transition"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? "text-blue-600" : "text-gray-400"}`} />
      </span>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Storm History Database</h2>
            <p className="text-sm text-gray-500">{stormList.length} storms tracked | Minneapolis Metro Area</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Btn size="sm" variant="outline" color="#3b82f6" onClick={() => navigate("/storm")}>
            <CloudLightning className="w-4 h-4 inline mr-1" />Storm Center
          </Btn>
          <Btn size="sm" color="#3b82f6" onClick={() => setAddStormOpen(true)}>
            <Plus className="w-4 h-4 inline mr-1" />Add Storm Event
          </Btn>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-medium">Total Storms</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stormList.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-blue-500" />Total Leads</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{totalLeads}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-green-500" />Total Revenue</div>
          <div className="text-2xl font-bold text-green-600 mt-1">${(totalRevenue / 1000).toFixed(0)}K</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-purple-500" />Avg Revenue/Storm</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">${(avgRevenue / 1000).toFixed(0)}K</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Revenue by Storm Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />Revenue by Storm Type
          </h3>
          <div className="space-y-3">
            {Object.entries(revenueByType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, rev]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                    <span className="text-sm font-bold text-gray-900">${(rev / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(rev / maxTypeRevenue) * 100}%`,
                        backgroundColor: TYPE_COLORS[type] || "#94a3b8",
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Leads by Month */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />Leads by Month
          </h3>
          <div className="flex items-end gap-2 h-44">
            {sortedMonths.map((month) => {
              const height = maxMonthLeads > 0 ? (leadsByMonth[month] / maxMonthLeads) * 100 : 0;
              const label = new Date(month + "-01").toLocaleDateString("en-US", { month: "short" });
              return (
                <div key={month} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <span className="text-xs font-bold text-gray-700">{leadsByMonth[month]}</span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max(height, 4)}%`,
                      backgroundColor: "#3b82f6",
                      opacity: 0.6 + (height / 100) * 0.4,
                    }}
                  />
                  <span className="text-[10px] text-gray-500">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Storm Database Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Storm Database</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cities or type..."
                className="bg-transparent text-sm border-none outline-none w-48"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="All">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="All">All Types</option>
                <option value="Hail">Hail</option>
                <option value="Wind">Wind</option>
                <option value="Tornado">Tornado</option>
                <option value="Ice">Ice</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <SortHeader field="date">Date</SortHeader>
                <SortHeader field="type">Type</SortHeader>
                <SortHeader field="maxSeverity">Severity</SortHeader>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Cities</th>
                <SortHeader field="addresses">Addresses</SortHeader>
                <SortHeader field="leads">Leads</SortHeader>
                <SortHeader field="revenue">Revenue</SortHeader>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((storm) => (
                <tr
                  key={storm.id}
                  onClick={() => navigate(`/storm/${storm.id}`)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="px-3 py-3 font-medium text-gray-900">{storm.date}</td>
                  <td className="px-3 py-3">
                    <Badge color={TYPE_COLORS[storm.type]}>{storm.type}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge color={SEVERITY_COLORS[storm.maxSeverity]}>{storm.maxSeverity}</Badge>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{storm.cities}</td>
                  <td className="px-3 py-3 text-gray-900 font-medium">{storm.addresses}</td>
                  <td className="px-3 py-3 text-blue-600 font-bold">{storm.leads}</td>
                  <td className="px-3 py-3 text-green-600 font-bold">${(storm.revenue / 1000).toFixed(0)}K</td>
                  <td className="px-3 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Storm Event Modal */}
      <Modal open={addStormOpen} onClose={() => setAddStormOpen(false)} title="Add Storm Event">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={newStorm.date}
              onChange={(e) => setNewStorm((p) => ({ ...p, date: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storm Type *</label>
              <select
                value={newStorm.type}
                onChange={(e) => setNewStorm((p) => ({ ...p, type: e.target.value as HistoricalStorm["type"] }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Hail">Hail</option>
                <option value="Wind">Wind</option>
                <option value="Tornado">Tornado</option>
                <option value="Ice">Ice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Severity</label>
              <select
                value={newStorm.severity}
                onChange={(e) => setNewStorm((p) => ({ ...p, severity: e.target.value as HistoricalStorm["maxSeverity"] }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Minor">Minor</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affected Cities *</label>
            <input
              type="text"
              value={newStorm.cities}
              onChange={(e) => setNewStorm((p) => ({ ...p, cities: e.target.value }))}
              placeholder="Plymouth, Maple Grove"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={newStorm.notes}
              onChange={(e) => setNewStorm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Additional details about the storm event..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" color="#6b7280" onClick={() => setAddStormOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleAddStorm}>Add Storm</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
