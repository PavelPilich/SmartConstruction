import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Btn, Modal, SmartSelect } from "../../components/ui";
import {
  ArrowLeft, MapPin, Clock, Wind, CloudHail, AlertTriangle, Zap,
  Navigation, Copy, MessageSquare, Megaphone, Play, Pause,
  Eye, FileText, Plus, Download, Filter, Search, Users,
  DollarSign, Building2, ChevronDown, ChevronUp, Clipboard,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & Mock Data                                                  */
/* ------------------------------------------------------------------ */

type AddressStatus = "New" | "Contacted" | "Inspected" | "Signed";

interface DamageAddress {
  id: string;
  address: string;
  city: string;
  zip: string;
  damageType: string;
  reportedBy: string;
  date: string;
  status: AddressStatus;
}

interface DoorRoute {
  zip: string;
  area: string;
  addressCount: number;
  routeMiles: number;
  canvasser: string;
}

interface AdCampaign {
  id: string;
  platform: "Facebook" | "Google" | "Instagram" | "YouTube" | "TikTok";
  zips: string;
  budget: number;
  status: "Draft" | "Active" | "Paused";
  impressions: number;
  clicks: number;
  leads: number;
}

const STATUS_COLORS: Record<AddressStatus, string> = {
  New: "#3b82f6",
  Contacted: "#f59e0b",
  Inspected: "#8b5cf6",
  Signed: "#10b981",
};

const stormData: Record<string, { name: string; date: string; duration: string; maxHail: string; maxWind: string; severity: string }> = {
  "storm-1": { name: "March 16 Hail Event", date: "March 16, 2026", duration: "2h 45min", maxHail: '1.75"', maxWind: "62 mph", severity: "Severe" },
  "storm-2": { name: "February 28 Ice Storm", date: "February 28, 2026", duration: "8h 15min", maxHail: "N/A", maxWind: "45 mph", severity: "Moderate" },
  "storm-3": { name: "January 15 Wind Event", date: "January 15, 2026", duration: "5h 30min", maxHail: "N/A", maxWind: "72 mph", severity: "Severe" },
  "storm-4": { name: "December 2 Hail Event", date: "December 2, 2025", duration: "1h 20min", maxHail: '1.25"', maxWind: "48 mph", severity: "Moderate" },
  "storm-5": { name: "November 10 Wind Event", date: "November 10, 2025", duration: "4h 00min", maxHail: "N/A", maxWind: "58 mph", severity: "Minor" },
};

const initialAddresses: DamageAddress[] = [
  { id: "a1", address: "4521 Vicksburg Ln N", city: "Plymouth", zip: "55441", damageType: "Hail - Roof", reportedBy: "NOAA Report", date: "Mar 16", status: "New" },
  { id: "a2", address: "3810 Lancaster Ln", city: "Plymouth", zip: "55441", damageType: "Hail - Siding", reportedBy: "Neighbor Referral", date: "Mar 16", status: "Contacted" },
  { id: "a3", address: "5200 Dunkirk Ln N", city: "Plymouth", zip: "55441", damageType: "Wind - Shingles", reportedBy: "Door Knock", date: "Mar 17", status: "Inspected" },
  { id: "a4", address: "16205 County Rd 47", city: "Plymouth", zip: "55441", damageType: "Hail - Roof + Gutters", reportedBy: "Insurance Adj.", date: "Mar 16", status: "Signed" },
  { id: "a5", address: "8200 Wedgewood Ln N", city: "Maple Grove", zip: "55369", damageType: "Hail - Roof", reportedBy: "NOAA Report", date: "Mar 16", status: "New" },
  { id: "a6", address: "7455 Hemlock Ln N", city: "Maple Grove", zip: "55369", damageType: "Hail - Siding", reportedBy: "Storm Spotter", date: "Mar 16", status: "New" },
  { id: "a7", address: "9840 Fernbrook Ln N", city: "Maple Grove", zip: "55369", damageType: "Wind - Fascia", reportedBy: "Door Knock", date: "Mar 17", status: "Contacted" },
  { id: "a8", address: "12300 Elm Creek Blvd", city: "Maple Grove", zip: "55369", damageType: "Hail - Roof", reportedBy: "Ad Lead", date: "Mar 18", status: "Inspected" },
  { id: "a9", address: "6300 Baker Rd", city: "Maple Grove", zip: "55369", damageType: "Hail - Skylight", reportedBy: "Neighbor Referral", date: "Mar 16", status: "New" },
  { id: "a10", address: "7710 Maple Hill Rd", city: "Maple Grove", zip: "55369", damageType: "Hail - Roof + Siding", reportedBy: "NOAA Report", date: "Mar 16", status: "Contacted" },
  { id: "a11", address: "5301 Brookview Ave", city: "Edina", zip: "55424", damageType: "Wind - Shingles", reportedBy: "Door Knock", date: "Mar 17", status: "New" },
  { id: "a12", address: "4900 Valley View Rd", city: "Edina", zip: "55424", damageType: "Hail - Gutters", reportedBy: "Ad Lead", date: "Mar 18", status: "Contacted" },
  { id: "a13", address: "6200 France Ave S", city: "Edina", zip: "55424", damageType: "Hail - Roof", reportedBy: "Insurance Adj.", date: "Mar 16", status: "Signed" },
  { id: "a14", address: "3900 W 66th St", city: "Edina", zip: "55424", damageType: "Wind - Siding", reportedBy: "Storm Spotter", date: "Mar 16", status: "New" },
  { id: "a15", address: "7100 Cornelia Dr", city: "Edina", zip: "55424", damageType: "Hail - Roof", reportedBy: "NOAA Report", date: "Mar 16", status: "Inspected" },
  { id: "a16", address: "9500 Xylon Ave N", city: "Plymouth", zip: "55441", damageType: "Hail - Roof", reportedBy: "Ad Lead", date: "Mar 18", status: "New" },
  { id: "a17", address: "14500 34th Ave N", city: "Plymouth", zip: "55441", damageType: "Wind - Tree/Roof", reportedBy: "Neighbor Referral", date: "Mar 17", status: "Contacted" },
  { id: "a18", address: "6845 Sycamore Ln N", city: "Maple Grove", zip: "55369", damageType: "Hail - Roof", reportedBy: "Door Knock", date: "Mar 17", status: "Signed" },
  { id: "a19", address: "10200 96th Ave N", city: "Maple Grove", zip: "55369", damageType: "Hail - Shingles", reportedBy: "NOAA Report", date: "Mar 16", status: "New" },
  { id: "a20", address: "4100 W 70th St", city: "Edina", zip: "55424", damageType: "Hail - Roof + Gutters", reportedBy: "Insurance Adj.", date: "Mar 16", status: "New" },
];

const initialRoutes: DoorRoute[] = [
  { zip: "55441", area: "Plymouth", addressCount: 8, routeMiles: 3.2, canvasser: "" },
  { zip: "55369", area: "Maple Grove", addressCount: 12, routeMiles: 4.1, canvasser: "" },
  { zip: "55424", area: "Edina", addressCount: 5, routeMiles: 1.8, canvasser: "" },
];

const initialCampaigns: AdCampaign[] = [
  { id: "camp-1", platform: "Facebook", zips: "55441, 55442", budget: 150, status: "Active", impressions: 12400, clicks: 342, leads: 18 },
  { id: "camp-2", platform: "Google", zips: "55369, 55311", budget: 100, status: "Active", impressions: 8200, clicks: 215, leads: 12 },
  { id: "camp-3", platform: "Facebook", zips: "55424, 55410", budget: 75, status: "Draft", impressions: 0, clicks: 0, leads: 0 },
];

const damageZones = [
  { name: "55441 Plymouth NW", severity: 0.9, homes: 340, reports: 18 },
  { name: "55441 Plymouth NE", severity: 0.7, homes: 280, reports: 12 },
  { name: "55369 Maple Grove W", severity: 0.95, homes: 420, reports: 24 },
  { name: "55369 Maple Grove E", severity: 0.6, homes: 310, reports: 8 },
  { name: "55424 Edina N", severity: 0.5, homes: 250, reports: 6 },
  { name: "55424 Edina S", severity: 0.4, homes: 220, reports: 4 },
];

const CANVASSER_OPTIONS = ["Jake Morrison", "Sarah Chen", "Mike Johnson", "Alyssa Rodriguez", "Devon Park"];

const insuranceStats = {
  avgClaimValue: "$14,250",
  commonDamage: ["Roof Shingles", "Siding", "Gutters", "Skylights"],
  topInsurers: ["State Farm", "Allstate", "Travelers", "American Family", "Liberty Mutual"],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StormDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const storm = stormData[id || "storm-1"] || stormData["storm-1"];

  const [addresses, setAddresses] = useState<DamageAddress[]>(initialAddresses);
  const [routes, setRoutes] = useState<DoorRoute[]>(initialRoutes);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(initialCampaigns);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [canvasserOptions, setCanvasserOptions] = useState<string[]>(CANVASSER_OPTIONS);

  /* Filters */
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [zipFilter, setZipFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  /* Script state */
  const [scriptName, setScriptName] = useState("Jake Morrison");
  const [scriptCopied, setScriptCopied] = useState(false);
  const [scriptSent, setScriptSent] = useState(false);

  /* Add address form */
  const [newAddress, setNewAddress] = useState({ address: "", city: "", zip: "", damageType: "" });

  /* Expanded sections */
  const [showInsurance, setShowInsurance] = useState(false);

  const stormType = storm.name.includes("Hail") ? "hailstorm" : storm.name.includes("Wind") ? "wind event" : storm.name.includes("Ice") ? "ice storm" : "storm";
  const stormCities = [...new Set(addresses.map((a) => a.city))];

  const filteredAddresses = addresses.filter((a) => {
    if (statusFilter !== "All" && a.status !== statusFilter) return false;
    if (zipFilter !== "All" && a.zip !== zipFilter) return false;
    if (searchTerm && !a.address.toLowerCase().includes(searchTerm.toLowerCase()) && !a.city.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const uniqueZips = [...new Set(addresses.map((a) => a.zip))];

  const handleAddAddress = () => {
    if (!newAddress.address || !newAddress.city || !newAddress.zip) return;
    const addr: DamageAddress = {
      id: `a${Date.now()}`,
      address: newAddress.address,
      city: newAddress.city,
      zip: newAddress.zip,
      damageType: newAddress.damageType || "TBD",
      reportedBy: "Manual Entry",
      date: "Mar 30",
      status: "New",
    };
    setAddresses((prev) => [addr, ...prev]);
    setNewAddress({ address: "", city: "", zip: "", damageType: "" });
    setAddAddressOpen(false);
  };

  const handleCopyScript = () => {
    const script = `Hi, I'm ${scriptName} from Smart Construction & Remodeling. We're in the neighborhood because the recent ${stormType} on ${storm.date} caused significant damage in this area.\n\nSeveral of your neighbors have already had their roofs inspected and found hail/wind damage covered by insurance.\n\nWe offer a FREE drone inspection — takes about 15 minutes, no obligation. We work directly with State Farm, Allstate, Travelers and handle the entire claims process.\n\nWould you like us to take a quick look?`;
    navigator.clipboard.writeText(script).then(() => {
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 2000);
    });
  };

  const handleSendScript = () => {
    setScriptSent(true);
    setTimeout(() => setScriptSent(false), 3000);
  };

  const toggleCampaignStatus = (campId: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campId
          ? { ...c, status: c.status === "Active" ? "Paused" : c.status === "Paused" ? "Active" : "Active" }
          : c
      )
    );
  };

  const severityColor = storm.severity === "Severe" ? "#f97316" : storm.severity === "Moderate" ? "#eab308" : "#3b82f6";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/storm")} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{storm.name}</h2>
              <Badge color={severityColor}>{storm.severity}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{storm.date}</span>
              <span>Duration: {storm.duration}</span>
              <span className="flex items-center gap-1"><CloudHail className="w-3.5 h-3.5" />Max Hail: {storm.maxHail}</span>
              <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" />Max Wind: {storm.maxWind}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Damage Zone Map */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" />Damage Zone Map
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {damageZones.map((zone) => {
            const r = Math.round(239 + (239 - 239) * zone.severity);
            const g = Math.round(68 + (68 - 68) * (1 - zone.severity));
            const b = Math.round(68 + (68 - 68) * (1 - zone.severity));
            const bg = `rgba(${r}, ${g}, ${b}, ${0.1 + zone.severity * 0.2})`;
            const border = `rgba(${r}, ${g}, ${b}, ${0.3 + zone.severity * 0.3})`;
            return (
              <div key={zone.name} className="rounded-xl p-4 cursor-pointer hover:shadow-md transition" style={{ background: bg, border: `1px solid ${border}` }}>
                <div className="font-semibold text-gray-900 text-sm">{zone.name}</div>
                <div className="text-xs text-gray-600 mt-1">Est. Affected Homes: {zone.homes}</div>
                <div className="text-xs text-gray-600">Damage Reports: {zone.reports}</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${zone.severity * 100}%`, background: `rgb(${r}, ${g}, ${b})` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Affected Addresses Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />Affected Addresses ({filteredAddresses.length})
          </h3>
          <div className="flex items-center gap-2">
            <Btn size="sm" variant="outline" color="#10b981" onClick={() => {}}>
              <Download className="w-3.5 h-3.5 inline mr-1" />Export to CRM
            </Btn>
            <Btn size="sm" color="#3b82f6" onClick={() => setAddAddressOpen(true)}>
              <Plus className="w-3.5 h-3.5 inline mr-1" />Add Address
            </Btn>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search addresses..."
              className="bg-transparent text-sm border-none outline-none w-48"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Inspected">Inspected</option>
              <option value="Signed">Signed</option>
            </select>
            <select
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="All">All Zips</option>
              {uniqueZips.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Address</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">City</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Zip</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Damage Type</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Reported By</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAddresses.map((addr) => (
                <tr key={addr.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-3 py-2 font-medium text-gray-900">{addr.address}</td>
                  <td className="px-3 py-2 text-gray-600">{addr.city}</td>
                  <td className="px-3 py-2 text-gray-600">{addr.zip}</td>
                  <td className="px-3 py-2 text-gray-600">{addr.damageType}</td>
                  <td className="px-3 py-2 text-gray-600">{addr.reportedBy}</td>
                  <td className="px-3 py-2 text-gray-600">{addr.date}</td>
                  <td className="px-3 py-2">
                    <Badge color={STATUS_COLORS[addr.status]}>{addr.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Door-Knocking Routes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-green-600" />Door-Knocking Routes
          </h3>
          <Btn size="sm" variant="outline" color="#8b5cf6" onClick={() => setScriptOpen(true)}>
            <FileText className="w-3.5 h-3.5 inline mr-1" />View Script
          </Btn>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {routes.map((route, i) => (
            <div key={route.zip} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">{route.zip} {route.area}</div>
                  <div className="text-sm text-gray-500">{route.addressCount} addresses | {route.routeMiles} mi route</div>
                </div>
                <Badge color="#3b82f6">{route.addressCount} stops</Badge>
              </div>
              <SmartSelect
                value={routes[i].canvasser}
                onChange={(val) => setRoutes((prev) => prev.map((r, idx) => idx === i ? { ...r, canvasser: val } : r))}
                options={canvasserOptions}
                onAddNew={(val) => setCanvasserOptions((prev) => [...prev, val])}
                placeholder="Assign Canvasser"
                label="Canvasser"
              />
              <div className="flex gap-2 mt-3">
                <Btn size="sm" variant="outline" color="#6b7280" className="flex-1" onClick={() => {}}>
                  <Download className="w-3.5 h-3.5 inline mr-1" />Print Sheet
                </Btn>
                <Btn size="sm" variant="outline" color="#8b5cf6" className="flex-1" onClick={() => setScriptOpen(true)}>
                  <Eye className="w-3.5 h-3.5 inline mr-1" />Script
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ STORM RESPONSE AD BLITZ ══════ */}
      <div className="bg-white rounded-xl border-2 border-orange-300 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-600" />
              Storm Response Ad Blitz — Area Domination
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Flood ALL devices in affected ZIP codes with Smart Construction ads. Beat competitors to every door.</p>
          </div>
          <Btn color="#ef4444" onClick={() => {
            const platforms = ["Facebook", "Google", "Instagram", "YouTube", "TikTok"] as const;
            const newCamps: AdCampaign[] = platforms.map((p) => ({
              id: `camp-${Date.now()}-${p}`,
              platform: p as AdCampaign["platform"],
              zips: uniqueZips.join(", "),
              budget: p === "Google" ? 200 : p === "Facebook" ? 150 : 75,
              status: "Active" as const,
              impressions: 0,
              clicks: 0,
              leads: 0,
            }));
            setCampaigns((prev) => [...prev, ...newCamps]);
          }}>
            <Zap className="w-4 h-4 inline mr-1" />🚨 LAUNCH ALL PLATFORMS NOW
          </Btn>
        </div>

        {/* WARNING: No addresses in ads */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-800">
              <strong>SECURITY:</strong> Damaged addresses are NEVER included in advertisements. Ads target ZIP codes and neighborhoods only — no specific addresses are shown to the public. Addresses are internal for canvassing only.
            </div>
          </div>
        </div>

        {/* Area targeting strategy */}
        <div className="bg-gray-900 rounded-xl p-4 mb-4">
          <div className="text-xs font-bold text-gray-400 uppercase mb-3">BLITZ TARGETING — {uniqueZips.length} ZIP Codes</div>
          <div className="grid grid-cols-3 gap-3">
            {uniqueZips.map((zip) => {
              const count = addresses.filter((a) => a.zip === zip).length;
              const cityName = addresses.find((a) => a.zip === zip)?.city || zip;
              return (
                <div key={zip} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-sm">{zip}</div>
                      <div className="text-gray-400 text-[10px]">{cityName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 font-bold text-sm">{count} addresses</div>
                      <div className="text-gray-500 text-[10px]">~{count * 45} homes in area</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${Math.min(count * 12, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5-Platform Ad Previews */}
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">AD CREATIVES BY PLATFORM</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { platform: "Facebook", color: "#1877F2", icon: "fb", headline: `Storm Damage in ${stormCities[0] || "Your Area"}? FREE Drone Inspection!`, body: `The recent ${stormType} caused significant damage in your neighborhood. Smart Construction offers FREE 15-minute drone inspections with AI damage detection. We handle the entire insurance process — $0 out of pocket for most homeowners.`, cta: "Book Free Inspection" },
              { platform: "Google Search", color: "#4285F4", icon: "G", headline: `${stormCities[0] || "MN"} Storm Damage Roof Repair | Free Inspection`, body: `Licensed MN contractor. Drone inspections. Insurance claims handled A-to-Z. 24/7 emergency response. ★★★★★ 4.9 rating.`, cta: "Get Free Quote" },
              { platform: "Instagram/TikTok", color: "#E4405F", icon: "IG", headline: `🚨 ${stormType.toUpperCase()} just hit ${stormCities[0]}!`, body: `Your roof could be damaged and you don't even know it. We use DJI drones + AI to find EVERY dent, crack, and missing shingle. Free inspection — link in bio 👆`, cta: "Book Now" },
              { platform: "YouTube Pre-Roll", color: "#FF0000", icon: "YT", headline: `[${stormCities[0]} Residents] Your Roof May Be Damaged`, body: `After the ${storm.date} ${stormType.toLowerCase()}, Smart Construction is offering FREE drone inspections in your area. Our AI detects damage invisible to the naked eye. Skip this ad to miss your free inspection.`, cta: "Learn More" },
            ].map((ad) => (
              <div key={ad.platform} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-1.5 flex items-center gap-2" style={{ background: ad.color + "15" }}>
                  <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[9px] font-black" style={{ background: ad.color }}>{ad.icon}</div>
                  <span className="text-xs font-bold" style={{ color: ad.color }}>{ad.platform}</span>
                </div>
                <div className="p-3">
                  <div className="text-sm font-bold text-gray-900">{ad.headline}</div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ad.body}</p>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 text-white text-[10px] font-medium rounded" style={{ background: ad.color }}>{ad.cta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active campaigns */}
        <div className="text-xs font-bold text-gray-500 uppercase mb-2">ACTIVE CAMPAIGNS ({campaigns.filter((c) => c.status === "Active").length} running)</div>
        <div className="space-y-2">
          {campaigns.map((camp) => (
            <div key={camp.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${camp.platform === "Facebook" ? "bg-blue-100" : camp.platform === "Google" ? "bg-green-100" : camp.platform === "Instagram" ? "bg-pink-100" : camp.platform === "YouTube" ? "bg-red-100" : "bg-gray-100"}`}>
                  <span className="text-[10px] font-bold text-gray-700">{camp.platform === "Facebook" ? "FB" : camp.platform === "Google" ? "G" : camp.platform === "Instagram" ? "IG" : camp.platform === "YouTube" ? "YT" : "TT"}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{camp.platform} — ZIP: {camp.zips}</div>
                  <div className="text-[10px] text-gray-500">${camp.budget}/day</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center"><div className="text-xs font-bold">{camp.impressions.toLocaleString()}</div><div className="text-[9px] text-gray-400">Impressions</div></div>
                <div className="text-center"><div className="text-xs font-bold">{camp.clicks}</div><div className="text-[9px] text-gray-400">Clicks</div></div>
                <div className="text-center"><div className="text-xs font-bold text-blue-600">{camp.leads}</div><div className="text-[9px] text-gray-400">Leads</div></div>
                <Badge color={camp.status === "Active" ? "#10b981" : camp.status === "Paused" ? "#f59e0b" : "#94a3b8"} sm>{camp.status}</Badge>
                <button onClick={() => toggleCampaignStatus(camp.id)}
                  className={`p-1.5 rounded-lg transition ${camp.status === "Active" ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-600" : "bg-green-50 hover:bg-green-100 text-green-600"}`}>
                  {camp.status === "Active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insurance Claims Data */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <button
          onClick={() => setShowInsurance(!showInsurance)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />Insurance Claims Data
          </h3>
          {showInsurance ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {showInsurance && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-sm text-green-700 font-medium">Avg Claim Value</div>
                <div className="text-2xl font-bold text-green-900 mt-1">{insuranceStats.avgClaimValue}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-sm text-blue-700 font-medium">Common Damage Types</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {insuranceStats.commonDamage.map((d) => (
                    <Badge key={d} color="#3b82f6">{d}</Badge>
                  ))}
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-purple-700 font-medium">Top Insurance Companies</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {insuranceStats.topInsurers.map((ins) => (
                    <Badge key={ins} color="#8b5cf6">{ins}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <Btn variant="outline" color="#10b981" onClick={() => {}}>
              <FileText className="w-4 h-4 inline mr-1" />Generate Claims Report
            </Btn>
          </div>
        )}
      </div>

      {/* Door-Knocking Script Modal */}
      <Modal open={scriptOpen} onClose={() => setScriptOpen(false)} title="Door-Knocking Script" wide>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Canvasser Name</label>
            <input
              type="text"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed space-y-3 border border-gray-200">
            <p>
              <em>&ldquo;Hi, I&rsquo;m <strong>{scriptName}</strong> from Smart Construction &amp; Remodeling.
              We&rsquo;re in the neighborhood because the recent <strong>{stormType}</strong> on <strong>{storm.date}</strong> caused significant damage in this area.</em>
            </p>
            <p>
              <em>Several of your neighbors have already had their roofs inspected and found hail/wind damage covered by insurance.</em>
            </p>
            <p>
              <em>We offer a FREE drone inspection — takes about 15 minutes, no obligation. We work directly with State Farm, Allstate, Travelers and handle the entire claims process.</em>
            </p>
            <p>
              <em>Would you like us to take a quick look?&rdquo;</em>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Btn color="#3b82f6" onClick={handleCopyScript}>
              {scriptCopied ? (
                <><Clipboard className="w-4 h-4 inline mr-1" />Copied!</>
              ) : (
                <><Copy className="w-4 h-4 inline mr-1" />Copy to Clipboard</>
              )}
            </Btn>
            <Btn color="#10b981" onClick={handleSendScript}>
              {scriptSent ? (
                <><MessageSquare className="w-4 h-4 inline mr-1" />Sent!</>
              ) : (
                <><MessageSquare className="w-4 h-4 inline mr-1" />Send to Canvasser</>
              )}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Add Address Modal */}
      <Modal open={addAddressOpen} onClose={() => setAddAddressOpen(false)} title="Add Damage Address">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              value={newAddress.address}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={newAddress.city}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Plymouth"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
              <input
                type="text"
                value={newAddress.zip}
                onChange={(e) => setNewAddress((prev) => ({ ...prev, zip: e.target.value }))}
                placeholder="55441"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Damage Type</label>
            <input
              type="text"
              value={newAddress.damageType}
              onChange={(e) => setNewAddress((prev) => ({ ...prev, damageType: e.target.value }))}
              placeholder="Hail - Roof"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="outline" color="#6b7280" onClick={() => setAddAddressOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleAddAddress}>Add Address</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
