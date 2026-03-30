import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, StatCard, Modal } from "../../components/ui";
import {
  CloudLightning, AlertTriangle, RefreshCw, Settings, MapPin,
  Activity, Cloud, Zap, Target, BarChart3, Megaphone, ChevronRight,
  Bell, X, CheckCircle2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & Mock Data                                                  */
/* ------------------------------------------------------------------ */

interface DamagedAddress {
  address: string;
  city: string;
  zip: string;
  damageType: string;
  status: "New" | "Contacted" | "Inspected" | "Signed";
  reportedBy: string;
}

interface WeatherAlert {
  id: string;
  severity: "red" | "orange" | "yellow";
  title: string;
  areas: string;
  expires: string;
  details: string;
  dismissed: boolean;
  damagedAddresses: DamagedAddress[];
  affectedZones: string[]; // zone names from radarZones
}

interface StormEvent {
  id: string;
  date: string;
  type: string;
  cities: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor";
  damageReports: number;
}

const initialAlerts: WeatherAlert[] = [
  {
    id: "wa-1",
    severity: "red",
    title: "SEVERE THUNDERSTORM WARNING",
    areas: "Scott County",
    expires: "8:45 PM",
    details: "The National Weather Service has issued a Severe Thunderstorm Warning for Scott County until 8:45 PM CDT. Quarter-size hail and 60 mph wind gusts expected. Seek shelter immediately. Damage to roofs, siding, and vehicles is likely.",
    dismissed: false,
    affectedZones: ["Eagan", "Burnsville"],
    damagedAddresses: [
      { address: "1250 Cedar Ave", city: "Eagan", zip: "55121", damageType: "Roof — hail impact", status: "New", reportedBy: "NOAA auto-detect" },
      { address: "7800 Portland Ave S", city: "Burnsville", zip: "55337", damageType: "Siding — wind damage", status: "New", reportedBy: "Homeowner call" },
      { address: "3420 Pilot Knob Rd", city: "Eagan", zip: "55121", damageType: "Windows — broken seal", status: "Contacted", reportedBy: "Neighbor referral" },
      { address: "14200 Ewing Ave S", city: "Burnsville", zip: "55337", damageType: "Gutters — detached", status: "New", reportedBy: "Canvasser" },
      { address: "950 Diffley Rd", city: "Eagan", zip: "55123", damageType: "Roof — missing shingles", status: "New", reportedBy: "NOAA auto-detect" },
    ],
  },
  {
    id: "wa-2",
    severity: "orange",
    title: "Hail Watch",
    areas: "Plymouth, Maple Grove, Brooklyn Park",
    expires: "Next 2 hours",
    details: "A Hail Watch is in effect for the northwestern suburbs. Radar indicates developing supercell activity with potential for golf-ball size hail. Monitor conditions closely and prepare for possible roof damage inspections.",
    dismissed: false,
    affectedZones: ["Plymouth", "Maple Grove", "Brooklyn Park"],
    damagedAddresses: [
      { address: "4821 Maple Dr", city: "Plymouth", zip: "55441", damageType: "Roof — hail damage confirmed", status: "Inspected", reportedBy: "Drone inspection" },
      { address: "18350 County Rd 24", city: "Plymouth", zip: "55447", damageType: "Metal siding — dent pattern", status: "New", reportedBy: "NOAA auto-detect" },
      { address: "9400 Fernbrook Ln", city: "Maple Grove", zip: "55369", damageType: "Roof + gutters", status: "Contacted", reportedBy: "Homeowner call" },
      { address: "7200 Hemlock Ln", city: "Maple Grove", zip: "55369", damageType: "Wood siding — paint chips", status: "New", reportedBy: "NOAA auto-detect" },
      { address: "6800 85th Ave N", city: "Brooklyn Park", zip: "55445", damageType: "Roof — granule loss", status: "New", reportedBy: "Canvasser" },
      { address: "3100 Vicksburg Ln", city: "Plymouth", zip: "55447", damageType: "Windows + fascia", status: "New", reportedBy: "NOAA auto-detect" },
      { address: "12400 Bass Lake Rd", city: "Maple Grove", zip: "55369", damageType: "Metal barn — multiple panels", status: "New", reportedBy: "Satellite detect" },
      { address: "5550 Dunkirk Ln", city: "Plymouth", zip: "55446", damageType: "Deck + fence damage", status: "Contacted", reportedBy: "Neighbor referral" },
    ],
  },
  {
    id: "wa-3",
    severity: "yellow",
    title: "Wind Advisory",
    areas: "Hennepin County",
    expires: "Tomorrow 6:00 AM",
    details: "Wind Advisory in effect through tomorrow morning. Sustained winds 25-35 mph with gusts to 55 mph. Possible tree damage and minor structural damage. Good opportunity for post-event canvassing.",
    dismissed: false,
    affectedZones: ["Eden Prairie", "Minneapolis", "Edina"],
    damagedAddresses: [
      { address: "8200 Flying Cloud Dr", city: "Eden Prairie", zip: "55344", damageType: "Roof — lifted shingles", status: "New", reportedBy: "Homeowner call" },
      { address: "4400 France Ave S", city: "Edina", zip: "55410", damageType: "Siding — loose panels", status: "New", reportedBy: "NOAA auto-detect" },
      { address: "3250 W 76th St", city: "Edina", zip: "55435", damageType: "Fence — leaning posts", status: "New", reportedBy: "Canvasser" },
    ],
  },
];

const recentStorms: StormEvent[] = [
  { id: "storm-1", date: "Mar 16, 2026", type: "Hail", cities: "Plymouth, Maple Grove", severity: "Severe", damageReports: 47 },
  { id: "storm-2", date: "Feb 28, 2026", type: "Ice Storm", cities: "Edina, St. Paul", severity: "Moderate", damageReports: 22 },
  { id: "storm-3", date: "Jan 15, 2026", type: "Wind", cities: "Woodbury, Eagan", severity: "Severe", damageReports: 31 },
  { id: "storm-4", date: "Dec 2, 2025", type: "Hail", cities: "Bloomington", severity: "Moderate", damageReports: 19 },
  { id: "storm-5", date: "Nov 10, 2025", type: "Wind", cities: "Eden Prairie", severity: "Minor", damageReports: 28 },
];

const SEVERITY_COLORS: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
};

const STORM_SEVERITY_COLORS: Record<string, string> = {
  Extreme: "#ef4444",
  Severe: "#f97316",
  Moderate: "#eab308",
  Minor: "#3b82f6",
};

/* Minneapolis metro grid zones */
const radarZones = [
  { name: "Plymouth", color: "#f97316", row: 0, col: 0 },
  { name: "Maple Grove", color: "#ef4444", row: 0, col: 1 },
  { name: "Brooklyn Park", color: "#f97316", row: 0, col: 2 },
  { name: "Eden Prairie", color: "#eab308", row: 1, col: 0 },
  { name: "Minneapolis", color: "#22c55e", row: 1, col: 1 },
  { name: "St. Paul", color: "#22c55e", row: 1, col: 2 },
  { name: "Edina", color: "#eab308", row: 2, col: 0 },
  { name: "Bloomington", color: "#22c55e", row: 2, col: 1 },
  { name: "Woodbury", color: "#22c55e", row: 2, col: 2 },
  { name: "Eagan", color: "#22c55e", row: 3, col: 0 },
  { name: "Burnsville", color: "#22c55e", row: 3, col: 1 },
  { name: "Cottage Grove", color: "#22c55e", row: 3, col: 2 },
];

const legendItems = [
  { label: "Clear", color: "#22c55e" },
  { label: "Rain", color: "#eab308" },
  { label: "Severe", color: "#f97316" },
  { label: "Hail / Tornado", color: "#ef4444" },
];

/* ------------------------------------------------------------------ */
/*  Social Media Storm Intelligence                                    */
/* ------------------------------------------------------------------ */

interface SocialPost {
  id: string;
  platform: "facebook" | "youtube" | "tiktok" | "instagram" | "x" | "nextdoor";
  author: string;
  content: string;
  location: string;
  city: string;
  zip: string;
  timestamp: string;
  engagement: { likes: number; comments: number; shares: number };
  mediaType: "photo" | "video" | "text";
  damageKeywords: string[];
  sentiment: "damage_report" | "warning" | "complaint" | "question";
  actionTaken: "none" | "flagged" | "contacted" | "lead_created";
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  youtube: "#FF0000",
  tiktok: "#000000",
  instagram: "#E4405F",
  x: "#1DA1F2",
  nextdoor: "#8BC34A",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X (Twitter)",
  nextdoor: "Nextdoor",
};

const SENTIMENT_COLORS: Record<string, string> = {
  damage_report: "#ef4444",
  warning: "#f59e0b",
  complaint: "#f97316",
  question: "#3b82f6",
};

const SENTIMENT_LABELS: Record<string, string> = {
  damage_report: "Damage Report",
  warning: "Storm Warning",
  complaint: "Complaint",
  question: "Question",
};

const MOCK_SOCIAL_POSTS: SocialPost[] = [
  {
    id: "sp-1", platform: "facebook", author: "Sarah Miller", content: "Just got home from work and my entire south-facing roof is destroyed. Shingles everywhere in the yard. Anyone know a good roofer in Plymouth? #stormhelp", location: "Plymouth, MN", city: "Plymouth", zip: "55441", timestamp: "32 min ago", engagement: { likes: 47, comments: 23, shares: 12 }, mediaType: "photo", damageKeywords: ["roof", "shingles", "destroyed"], sentiment: "damage_report", actionTaken: "flagged",
  },
  {
    id: "sp-2", platform: "nextdoor", author: "Tom Hendricks", content: "PSA: Multiple cars and homes on Fernbrook Lane have significant hail damage. Quarter to golf ball size hail hit us around 5:45 PM. Check your roofs ASAP!", location: "Maple Grove, MN", city: "Maple Grove", zip: "55369", timestamp: "1 hr ago", engagement: { likes: 89, comments: 45, shares: 34 }, mediaType: "text", damageKeywords: ["hail damage", "roofs", "golf ball size"], sentiment: "warning", actionTaken: "lead_created",
  },
  {
    id: "sp-3", platform: "tiktok", author: "@mnstormchaser", content: "🔴 LIVE: Massive hail hitting Plymouth MN right now! Tennis ball sized!! Look at the damage on these cars and houses! #mnstorm #hail #plymouth", location: "Plymouth, MN", city: "Plymouth", zip: "55447", timestamp: "45 min ago", engagement: { likes: 2300, comments: 412, shares: 890 }, mediaType: "video", damageKeywords: ["hail", "damage", "tennis ball sized"], sentiment: "damage_report", actionTaken: "flagged",
  },
  {
    id: "sp-4", platform: "youtube", author: "Minnesota Weather Watch", content: "FULL VIDEO: March 30 Severe Storm Plymouth/Maple Grove - Hail Damage Aftermath. Showing drone footage of affected neighborhoods. Multiple roofs visibly damaged from aerial view.", location: "Plymouth/Maple Grove", city: "Plymouth", zip: "55441", timestamp: "2 hrs ago", engagement: { likes: 1200, comments: 156, shares: 340 }, mediaType: "video", damageKeywords: ["hail damage", "roofs", "drone footage", "neighborhoods"], sentiment: "damage_report", actionTaken: "none",
  },
  {
    id: "sp-5", platform: "instagram", author: "@plymouthresidents", content: "Storm damage on County Rd 24. Multiple homes with siding ripped off. Metal barn on Johnson farm completely dented. Anyone else seeing this? 📸🌧️", location: "Plymouth, MN", city: "Plymouth", zip: "55447", timestamp: "1.5 hrs ago", engagement: { likes: 324, comments: 67, shares: 45 }, mediaType: "photo", damageKeywords: ["siding", "metal barn", "dented", "storm damage"], sentiment: "damage_report", actionTaken: "contacted",
  },
  {
    id: "sp-6", platform: "facebook", author: "Maple Grove Community Group", content: "Does anyone have recommendations for a contractor to inspect storm damage? Our windows look cracked and gutters are hanging off. Insurance said we need a contractor assessment first.", location: "Maple Grove, MN", city: "Maple Grove", zip: "55369", timestamp: "3 hrs ago", engagement: { likes: 156, comments: 89, shares: 23 }, mediaType: "text", damageKeywords: ["windows", "gutters", "contractor", "storm damage", "insurance"], sentiment: "question", actionTaken: "lead_created",
  },
  {
    id: "sp-7", platform: "x", author: "@EaganMNNews", content: "BREAKING: Severe damage reported across Eagan after tonight's storms. Power outages, downed trees, and significant roof damage in the Cedar Ave corridor. #EaganMN #MNwx", location: "Eagan, MN", city: "Eagan", zip: "55121", timestamp: "20 min ago", engagement: { likes: 567, comments: 123, shares: 234 }, mediaType: "photo", damageKeywords: ["severe damage", "roof damage", "storms"], sentiment: "damage_report", actionTaken: "none",
  },
  {
    id: "sp-8", platform: "nextdoor", author: "Lisa Chen", content: "Warning to all neighbors on Vicksburg Lane: Our fence and deck got hammered by the hail. Paint chips everywhere, boards cracked. The mailbox is dented beyond repair. Get your properties documented!", location: "Plymouth, MN", city: "Plymouth", zip: "55446", timestamp: "55 min ago", engagement: { likes: 78, comments: 34, shares: 19 }, mediaType: "photo", damageKeywords: ["fence", "deck", "hail", "mailbox", "dented", "paint chips"], sentiment: "damage_report", actionTaken: "flagged",
  },
];

function SocialMediaIntelPanel() {
  const [posts, setPosts] = useState<SocialPost[]>(MOCK_SOCIAL_POSTS);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = platformFilter === "all" ? posts : posts.filter((p) => p.platform === platformFilter);
  const displayed = showAll ? filtered : filtered.slice(0, 5);

  const platformCounts: Record<string, number> = {};
  posts.forEach((p) => { platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1; });

  const totalEngagement = posts.reduce((a, p) => a + p.engagement.likes + p.engagement.comments + p.engagement.shares, 0);
  const damageReports = posts.filter((p) => p.sentiment === "damage_report").length;
  const leadsCreated = posts.filter((p) => p.actionTaken === "lead_created").length;

  const cityCounts: Record<string, number> = {};
  posts.forEach((p) => { cityCounts[p.city] = (cityCounts[p.city] || 0) + 1; });

  const handleAction = (postId: string, action: SocialPost["actionTaken"]) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, actionTaken: action } : p));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-pink-600" />
            Social Media Storm Intelligence
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">AI-tracked storm reports from Facebook, YouTube, TikTok, Instagram, X, Nextdoor</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="#ef4444" sm>{damageReports} damage reports</Badge>
          <Badge color="#10b981" sm>{leadsCreated} leads created</Badge>
          <Badge color="#6366f1" sm>{totalEngagement.toLocaleString()} engagements</Badge>
        </div>
      </div>

      {/* Platform filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => setPlatformFilter("all")} className={`px-3 py-1 text-xs rounded-full font-medium transition ${platformFilter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          All ({posts.length})
        </button>
        {Object.entries(platformCounts).map(([platform, count]) => (
          <button key={platform} onClick={() => setPlatformFilter(platform)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition ${platformFilter === platform ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            style={platformFilter === platform ? { background: PLATFORM_COLORS[platform] } : undefined}
          >
            {PLATFORM_LABELS[platform]} ({count})
          </button>
        ))}
      </div>

      {/* Hotspot cities bar */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="text-[10px] font-semibold text-gray-500 mb-2">HOTSPOT CITIES (by social media mentions)</div>
        <div className="flex gap-2">
          {Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
            <div key={city} className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-gray-200">
              <MapPin className="w-3 h-3 text-red-500" />
              <span className="text-xs font-semibold text-gray-900">{city}</span>
              <Badge color="#ef4444" sm>{count} posts</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {displayed.map((post) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition">
            <div className="flex items-start gap-3">
              {/* Platform icon */}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black" style={{ background: PLATFORM_COLORS[post.platform] }}>
                {post.platform === "facebook" ? "fb" : post.platform === "youtube" ? "YT" : post.platform === "tiktok" ? "TT" : post.platform === "instagram" ? "IG" : post.platform === "x" ? "X" : "ND"}
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{post.author}</span>
                  <Badge color={PLATFORM_COLORS[post.platform]} sm>{PLATFORM_LABELS[post.platform]}</Badge>
                  <Badge color={SENTIMENT_COLORS[post.sentiment]} sm>{SENTIMENT_LABELS[post.sentiment]}</Badge>
                  {post.mediaType !== "text" && <Badge color="#6366f1" sm>{post.mediaType === "video" ? "📹 Video" : "📷 Photo"}</Badge>}
                  <span className="text-[10px] text-gray-400 ml-auto">{post.timestamp}</span>
                </div>

                {/* Content */}
                <p className="text-sm text-gray-700 mt-1.5 line-clamp-2">{post.content}</p>

                {/* Location + keywords */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[10px] text-gray-500"><MapPin className="w-3 h-3" />{post.location} ({post.zip})</span>
                  <div className="flex gap-1">
                    {post.damageKeywords.slice(0, 4).map((kw) => (
                      <span key={kw} className="text-[9px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-medium">{kw}</span>
                    ))}
                  </div>
                </div>

                {/* Engagement + Actions */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="flex gap-3 text-[10px] text-gray-500">
                    <span>❤️ {post.engagement.likes.toLocaleString()}</span>
                    <span>💬 {post.engagement.comments.toLocaleString()}</span>
                    <span>🔄 {post.engagement.shares.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {post.actionTaken === "none" && (
                      <>
                        <button onClick={() => handleAction(post.id, "flagged")} className="text-[10px] px-2 py-1 bg-yellow-50 text-yellow-700 rounded font-medium hover:bg-yellow-100 transition">⚑ Flag</button>
                        <button onClick={() => handleAction(post.id, "contacted")} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium hover:bg-blue-100 transition">✉ Contact</button>
                        <button onClick={() => handleAction(post.id, "lead_created")} className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded font-medium hover:bg-green-100 transition">+ Create Lead</button>
                      </>
                    )}
                    {post.actionTaken === "flagged" && <Badge color="#f59e0b" sm>⚑ Flagged</Badge>}
                    {post.actionTaken === "contacted" && <Badge color="#3b82f6" sm>✉ Contacted</Badge>}
                    {post.actionTaken === "lead_created" && <Badge color="#10b981" sm>✓ Lead Created</Badge>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 5 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition">
          {showAll ? "Show Less" : `View All ${filtered.length} Posts`}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StormDashboardPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<WeatherAlert[]>(initialAlerts);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState("2 min ago");

  /* Alert settings state */
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const [autoLaunchAds, setAutoLaunchAds] = useState(false);
  const [hailThreshold, setHailThreshold] = useState("0.75");
  const [windThreshold, setWindThreshold] = useState("55");
  const [monitorRadius, setMonitorRadius] = useState("30");

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
  };

  const handleRefresh = () => {
    setLastRefreshed("Just now");
    setTimeout(() => setLastRefreshed("1 min ago"), 60000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CloudLightning className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Storm Intelligence Center</h2>
              <p className="text-sm text-gray-500">24/7 NOAA + NWS Monitoring — Minneapolis Metro</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700 font-medium">Monitoring Active</span>
          </span>
          <Btn size="sm" variant="outline" color="#6b7280" onClick={() => setSettingsOpen(true)}>
            <Settings className="w-4 h-4 inline mr-1" />Configure Alerts
          </Btn>
        </div>
      </div>

      {/* Active Weather Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Active Weather Alerts ({activeAlerts.length})
          </h3>
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl border-l-4 border border-gray-200 p-4 hover:shadow-md transition"
              style={{ borderLeftColor: SEVERITY_COLORS[alert.severity] }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={SEVERITY_COLORS[alert.severity]}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-gray-900">{alert.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />{alert.areas}
                    </span>
                    <span>Expires: {alert.expires}</span>
                  </div>
                  {/* Address count badge */}
                  {alert.damagedAddresses.length > 0 && (
                    <div className="mt-1.5">
                      <Badge color={SEVERITY_COLORS[alert.severity]} sm>
                        <MapPin className="w-3 h-3 mr-0.5 inline" />
                        {alert.damagedAddresses.length} damaged addresses reported
                      </Badge>
                    </div>
                  )}

                  {expandedAlert === alert.id && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{alert.details}</p>

                      {/* Mini damage zone map */}
                      <div className="bg-gray-900 rounded-lg p-3">
                        <div className="text-xs text-gray-400 font-semibold mb-2">Affected Zones</div>
                        <div className="grid grid-cols-3 gap-1">
                          {radarZones.map((zone) => {
                            const isAffected = alert.affectedZones.includes(zone.name);
                            const addressCount = alert.damagedAddresses.filter((a) => a.city === zone.name).length;
                            return (
                              <div
                                key={zone.name}
                                className={`rounded px-2 py-1.5 text-center transition ${isAffected ? "ring-2 ring-white/50" : "opacity-40"}`}
                                style={{ background: isAffected ? SEVERITY_COLORS[alert.severity] + "40" : "#374151" }}
                              >
                                <div className={`text-[10px] font-bold ${isAffected ? "text-white" : "text-gray-500"}`}>{zone.name}</div>
                                {isAffected && addressCount > 0 && (
                                  <div className="text-[9px] text-white/80 font-medium mt-0.5">{addressCount} addresses</div>
                                )}
                                {isAffected && addressCount === 0 && (
                                  <div className="text-[9px] text-yellow-300/80 mt-0.5">⚠ At risk</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Damaged addresses table */}
                      {alert.damagedAddresses.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold text-gray-700">Damaged Addresses ({alert.damagedAddresses.length})</div>
                            <Btn size="sm" variant="outline" color="#3b82f6" onClick={() => navigate(`/storm/storm-1`)}>
                              Export to CRM
                            </Btn>
                          </div>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                  <th className="text-left px-3 py-2 font-medium">Address</th>
                                  <th className="text-left px-3 py-2 font-medium">City</th>
                                  <th className="text-left px-3 py-2 font-medium">Damage</th>
                                  <th className="text-left px-3 py-2 font-medium">Status</th>
                                  <th className="text-left px-3 py-2 font-medium">Source</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {alert.damagedAddresses.map((addr, i) => (
                                  <tr key={i} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => navigate(`/storm/storm-1`)}>
                                    <td className="px-3 py-2 font-medium text-gray-900">{addr.address}</td>
                                    <td className="px-3 py-2 text-gray-600">{addr.city}, {addr.zip}</td>
                                    <td className="px-3 py-2 text-gray-600">{addr.damageType}</td>
                                    <td className="px-3 py-2">
                                      <Badge color={addr.status === "New" ? "#3b82f6" : addr.status === "Contacted" ? "#f59e0b" : addr.status === "Inspected" ? "#8b5cf6" : "#10b981"} sm>
                                        {addr.status}
                                      </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-gray-500">{addr.reportedBy}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Btn size="sm" variant="outline" color="#6b7280" onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}>
                    {expandedAlert === alert.id ? "Collapse" : "Details"}
                  </Btn>
                  <Btn size="sm" variant="outline" color="#6b7280" onClick={() => handleDismiss(alert.id)}>
                    Dismiss
                  </Btn>
                  <Btn size="sm" color="#3b82f6" onClick={() => navigate(`/storm/storm-1`)}>
                    Launch Response
                  </Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storm Radar Map (simulated) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />Storm Radar — Minneapolis Metro
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Last updated: {lastRefreshed}</p>
          </div>
          <Btn size="sm" variant="outline" color="#3b82f6" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 inline mr-1" />Refresh
          </Btn>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-2">
            {radarZones.map((zone) => (
              <div
                key={zone.name}
                className="rounded-lg p-3 text-center cursor-pointer hover:opacity-80 transition relative"
                style={{ backgroundColor: zone.color + "30", border: `1px solid ${zone.color}50` }}
                onClick={() => navigate("/storm/storm-1")}
              >
                <div className="text-xs font-bold text-white">{zone.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: zone.color }}>
                  {zone.color === "#ef4444" ? "HAIL" : zone.color === "#f97316" ? "SEVERE" : zone.color === "#eab308" ? "RAIN" : "CLEAR"}
                </div>
              </div>
            ))}
          </div>
          {/* Simulated storm cell indicator */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Storm cell moving NW → SE at 35 mph</span>
            </div>
            <div className="flex items-center gap-3">
              {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-3">
        <StatCard icon={AlertTriangle} label="Active Alerts" value={activeAlerts.length} color="#ef4444" />
        <StatCard icon={CloudLightning} label="Storms This Month" value={7} color="#f97316" />
        <StatCard icon={Cloud} label="Hail Events" value={3} sub="This month" color="#eab308" />
        <StatCard icon={Target} label="Damage Zones" value={12} color="#8b5cf6" />
        <StatCard icon={Zap} label="Leads Generated" value={47} sub="From storms" color="#3b82f6" />
        <StatCard icon={Megaphone} label="Ad Campaigns" value={2} sub="Active" color="#10b981" />
      </div>

      {/* Recent Storm Events Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />Recent Storm Events
          </h3>
          <Btn size="sm" variant="outline" color="#3b82f6" onClick={() => navigate("/storm/history")}>
            View Full History <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
          </Btn>
        </div>
        <div className="space-y-2">
          {recentStorms.map((storm) => (
            <div
              key={storm.id}
              onClick={() => navigate(`/storm/${storm.id}`)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-gray-500 w-28">{storm.date}</div>
                <Badge color={STORM_SEVERITY_COLORS[storm.severity]}>{storm.severity}</Badge>
                <div>
                  <span className="font-semibold text-gray-900">{storm.type}</span>
                  <span className="text-gray-400 mx-2">—</span>
                  <span className="text-sm text-gray-600">{storm.cities}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{storm.damageReports} damage reports</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Social Media Storm Intelligence ── */}
      <SocialMediaIntelPanel />

      {/* Configure Alerts Modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Storm Alert Configuration" wide>
        <div className="space-y-5">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />Notification Channels
            </h4>
            <div className="space-y-2">
              {[
                { label: "Email Notifications", value: notifyEmail, setter: setNotifyEmail },
                { label: "SMS Notifications", value: notifySms, setter: setNotifySms },
                { label: "Push Notifications", value: notifyPush, setter: setNotifyPush },
                { label: "Auto-Launch Ads on Severe Events", value: autoLaunchAds, setter: setAutoLaunchAds },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${item.value ? "bg-blue-600" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${item.value ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Alert Thresholds</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hail Size (inches)</label>
                <input
                  type="text"
                  value={hailThreshold}
                  onChange={(e) => setHailThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wind Speed (mph)</label>
                <input
                  type="text"
                  value={windThreshold}
                  onChange={(e) => setWindThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monitor Radius (mi)</label>
                <input
                  type="text"
                  value={monitorRadius}
                  onChange={(e) => setMonitorRadius(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Monitored Zones</h4>
            <div className="flex flex-wrap gap-2">
              {["Plymouth", "Maple Grove", "Edina", "Bloomington", "St. Paul", "Woodbury", "Eagan", "Eden Prairie", "Brooklyn Park", "Minneapolis"].map((city) => (
                <span key={city} className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />{city}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Btn variant="outline" color="#6b7280" onClick={() => setSettingsOpen(false)}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={() => setSettingsOpen(false)}>Save Configuration</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
