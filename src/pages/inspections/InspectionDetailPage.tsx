import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge, Btn, Modal, FileUploadSim, SmartSelect } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import {
  ArrowLeft, Play, Upload, Plus, FileText, CheckCircle2, XCircle,
  MapPin, Clock, Cloud, Ruler, Crosshair, Camera, AlertTriangle,
  Shield, Download, Trash2, Eye, Navigation, Zap, BarChart3,
  Target, Cpu, Sun, ShieldAlert, Plane,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────── */

type InspectionStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
type InspectionType =
  | "Roof" | "Steel/Metal Siding" | "Vinyl Siding" | "Wood Siding"
  | "Windows" | "Gutters" | "Fascia" | "Deck" | "Fences"
  | "Mailbox" | "Metal Barns" | "Other Structures";
type FindingType = "Damage" | "Measurement" | "Note" | "Recommendation";
type Severity = "Low" | "Medium" | "High" | "Critical";

interface Photo {
  id: string;
  name: string;
  timestamp: string;
  gpsTag: string;
  color: string;
}

interface Finding {
  id: string;
  type: FindingType;
  description: string;
  location: string;
  severity: Severity;
  photoRef: string;
  gps?: string;
}

interface DamageResult {
  id: string;
  type: string;
  severity: Severity;
  confidence: number;
  gps: string;
  widthIn: number;
  heightIn: number;
  description: string;
}

interface ReportLineItem {
  code: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Report {
  label: string;
  color: string;
  total: number;
  recommendation: string;
  items: ReportLineItem[];
}

interface DentCell {
  row: number;
  col: number;
  density: "none" | "low" | "medium" | "high" | "severe";
}

interface BarnMeasurements {
  panelCount: number;
  dentCountPerPanel: number;
  totalDentDensity: number;
}

interface Measurements {
  roofSquaresTotal: number;
  roofSquaresDamaged: number;
  ridgeLF: number;
  hipLF: number;
  valleyLF: number;
  rakeLF: number;
  eaveLF: number;
  dripEdgeLF: number;
  affectedAreaPct: number;
  barn?: BarnMeasurements;
}

interface Inspection {
  id: string;
  projectId: string;
  projectNumber: string;
  customerName: string;
  address: string;
  type: InspectionType;
  status: InspectionStatus;
  date: string;
  time: string;
  operator: string;
  weather: string;
  duration: string;
  equipment: string[];
  gpsLat: number;
  gpsLng: number;
  flightMode: string;
  flightAltitude: number;
  coverageArea: number;
  overlapPct: number;
  sunCompensation: boolean;
  obstacleAvoidance: boolean;
  photos: Photo[];
  findings: Finding[];
  measurements: Measurements;
  insuranceSummary: string;
  aiResults: DamageResult[];
  conservativeReport: Report | null;
  aggressiveReport: Report | null;
  dentGrid: DentCell[] | null;
}

/* ── Color Maps ─────────────────────────────────────── */

const STATUS_COLORS: Record<InspectionStatus, string> = {
  Scheduled: "#3b82f6",
  "In Progress": "#f59e0b",
  Completed: "#22c55e",
  Cancelled: "#ef4444",
};

const TYPE_COLORS: Record<InspectionType, string> = {
  Roof: "#8b5cf6",
  "Steel/Metal Siding": "#0ea5e9",
  "Vinyl Siding": "#06b6d4",
  "Wood Siding": "#a16207",
  Windows: "#3b82f6",
  Gutters: "#6b7280",
  Fascia: "#10b981",
  Deck: "#d97706",
  Fences: "#78716c",
  Mailbox: "#ec4899",
  "Metal Barns": "#ef4444",
  "Other Structures": "#64748b",
};

const FINDING_TYPE_COLORS: Record<FindingType, string> = {
  Damage: "#ef4444",
  Measurement: "#3b82f6",
  Note: "#6b7280",
  Recommendation: "#8b5cf6",
};

const SEVERITY_COLORS: Record<Severity, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

const DENT_DENSITY_COLORS: Record<string, string> = {
  none: "#22c55e",
  low: "#84cc16",
  medium: "#f59e0b",
  high: "#f97316",
  severe: "#ef4444",
};

const PHOTO_COLORS = ["#8b5cf6", "#3b82f6", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

/* ── Flight Steps ──────────────────────────────────── */

const FLIGHT_STEPS = [
  "Overhead roof grid",
  "Roof edge orbit",
  "Wall passes at 30-45\u00b0",
  "Window 4-angle captures",
  "Gutters / fascia close-up",
  "Deck scan",
  "Fence both sides",
  "Mailbox approach",
  "Barn grid (if applicable)",
  "Landing",
];

/* ── Mock Data ──────────────────────────────────────── */

const mkDentGrid = (): DentCell[] => {
  const densities: Array<DentCell["density"]> = ["none", "low", "medium", "high", "severe"];
  const grid: DentCell[] = [];
  // Predefined pattern for metal barn
  const pattern = [
    0, 1, 2, 1, 0, 1,
    1, 2, 3, 2, 1, 0,
    2, 3, 4, 3, 2, 1,
    1, 2, 3, 2, 1, 0,
  ];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      grid.push({ row: r, col: c, density: densities[pattern[r * 6 + c]] });
    }
  }
  return grid;
};

const MOCK_INSPECTIONS: Record<string, Inspection> = {
  "insp-1": {
    id: "insp-1",
    projectId: "PRJ-1001",
    projectNumber: "PRJ-1001",
    customerName: "Robert Johnson",
    address: "742 Evergreen Terrace, Springfield, IL 62704",
    type: "Roof",
    status: "Completed",
    date: "2026-03-15",
    time: "09:30",
    operator: "Mike Torres",
    weather: "Clear, 68\u00b0F, Wind 5mph NW",
    duration: "45 min",
    equipment: ["DJI Mavic 3 Enterprise", "Thermal Camera", "RTK Module", "20MP Sensor"],
    gpsLat: 39.7817,
    gpsLng: -89.6501,
    flightMode: "Autonomous Grid",
    flightAltitude: 120,
    coverageArea: 3200,
    overlapPct: 75,
    sunCompensation: true,
    obstacleAvoidance: true,
    photos: [
      { id: "p1", name: "North Elevation", timestamp: "2026-03-15 09:32", gpsTag: "39.7818,-89.6500", color: PHOTO_COLORS[0] },
      { id: "p2", name: "South Elevation", timestamp: "2026-03-15 09:34", gpsTag: "39.7816,-89.6502", color: PHOTO_COLORS[1] },
      { id: "p3", name: "East Elevation", timestamp: "2026-03-15 09:36", gpsTag: "39.7817,-89.6499", color: PHOTO_COLORS[2] },
      { id: "p4", name: "West Elevation", timestamp: "2026-03-15 09:38", gpsTag: "39.7817,-89.6503", color: PHOTO_COLORS[3] },
      { id: "p5", name: "Roof Overview", timestamp: "2026-03-15 09:40", gpsTag: "39.7817,-89.6501", color: PHOTO_COLORS[4] },
      { id: "p6", name: "Damage Detail 1", timestamp: "2026-03-15 09:42", gpsTag: "39.7818,-89.6501", color: PHOTO_COLORS[5] },
      { id: "p7", name: "Damage Detail 2", timestamp: "2026-03-15 09:44", gpsTag: "39.7817,-89.6500", color: PHOTO_COLORS[6] },
      { id: "p8", name: "Gutter Close-up", timestamp: "2026-03-15 09:46", gpsTag: "39.7816,-89.6501", color: PHOTO_COLORS[7] },
    ],
    findings: [
      { id: "f1", type: "Damage", description: "Missing shingles on NW slope, approx 3x4 ft area exposed underlayment", location: "Northwest Roof Slope", severity: "High", photoRef: "Damage Detail 1", gps: "39.7818,-89.6501" },
      { id: "f2", type: "Damage", description: "Hail impact marks on ridge cap, granule loss visible", location: "Ridge Line", severity: "Medium", photoRef: "Roof Overview", gps: "39.7817,-89.6501" },
      { id: "f3", type: "Measurement", description: "Roof pitch measured at 6/12 on main slopes", location: "Main Roof", severity: "Low", photoRef: "East Elevation", gps: "39.7817,-89.6499" },
      { id: "f4", type: "Recommendation", description: "Full roof replacement recommended due to age and storm damage", location: "Entire Roof", severity: "High", photoRef: "Roof Overview", gps: "39.7817,-89.6501" },
      { id: "f5", type: "Note", description: "Satellite dish on south slope, will need relocation during work", location: "South Slope", severity: "Low", photoRef: "South Elevation", gps: "39.7816,-89.6502" },
      { id: "f6", type: "Damage", description: "Cracked hip cap shingle at east hip line, lifting approx 1 inch", location: "East Hip Line", severity: "Medium", photoRef: "East Elevation", gps: "39.7817,-89.6499" },
    ],
    measurements: {
      roofSquaresTotal: 32,
      roofSquaresDamaged: 12,
      ridgeLF: 48,
      hipLF: 32,
      valleyLF: 24,
      rakeLF: 64,
      eaveLF: 96,
      dripEdgeLF: 160,
      affectedAreaPct: 37.5,
    },
    insuranceSummary: "Storm damage inspection conducted via drone on 2026-03-15. Significant hail and wind damage identified on NW slope. Missing shingles, granule loss, and underlayment exposure documented. Full replacement recommended. 12 of 32 squares affected (37.5%).",
    aiResults: [
      { id: "ai1", type: "Missing Shingles", severity: "High", confidence: 94, gps: "39.7818,-89.6501", widthIn: 36, heightIn: 48, description: "3x4 ft area of missing shingles exposing underlayment" },
      { id: "ai2", type: "Hail Impact", severity: "Medium", confidence: 87, gps: "39.7817,-89.6501", widthIn: 2, heightIn: 2, description: "Cluster of hail strikes with granule displacement" },
      { id: "ai3", type: "Lifted Shingle", severity: "Medium", confidence: 82, gps: "39.7817,-89.6499", widthIn: 12, heightIn: 6, description: "Shingle tab lifted ~1 inch along east hip" },
      { id: "ai4", type: "Cracked Flashing", severity: "High", confidence: 91, gps: "39.7816,-89.6502", widthIn: 8, heightIn: 3, description: "Cracked step flashing at chimney junction" },
    ],
    conservativeReport: {
      label: "Conservative",
      color: "#22c55e",
      total: 8750,
      recommendation: "Partial roof repair targeting directly damaged areas. Replace 12 affected squares, repair flashing, and replace damaged hip cap.",
      items: [
        { code: "RFG-250", description: "Remove & Replace Shingles", qty: 12, unit: "SQ", unitPrice: 450, total: 5400 },
        { code: "RFG-310", description: "Hip/Ridge Cap Replacement", qty: 32, unit: "LF", unitPrice: 12, total: 384 },
        { code: "RFG-420", description: "Step Flashing Repair", qty: 1, unit: "EA", unitPrice: 350, total: 350 },
        { code: "RFG-110", description: "Drip Edge", qty: 96, unit: "LF", unitPrice: 4.50, total: 432 },
        { code: "GEN-100", description: "Debris Removal", qty: 1, unit: "EA", unitPrice: 450, total: 450 },
        { code: "GEN-200", description: "Overhead & Profit (10%)", qty: 1, unit: "EA", unitPrice: 701.60, total: 701.60 },
      ],
    },
    aggressiveReport: {
      label: "Aggressive",
      color: "#ef4444",
      total: 18420,
      recommendation: "Full roof replacement with upgraded materials. All 32 squares, complete tear-off, new underlayment, ice & water shield, and full flashing replacement.",
      items: [
        { code: "RFG-250", description: "Remove & Replace Shingles (Full)", qty: 32, unit: "SQ", unitPrice: 350, total: 11200 },
        { code: "RFG-260", description: "Synthetic Underlayment", qty: 32, unit: "SQ", unitPrice: 45, total: 1440 },
        { code: "RFG-270", description: "Ice & Water Shield", qty: 8, unit: "SQ", unitPrice: 85, total: 680 },
        { code: "RFG-310", description: "Hip/Ridge Cap Replacement", qty: 80, unit: "LF", unitPrice: 12, total: 960 },
        { code: "RFG-420", description: "Complete Flashing Package", qty: 1, unit: "EA", unitPrice: 1200, total: 1200 },
        { code: "RFG-110", description: "Drip Edge (Full Perimeter)", qty: 160, unit: "LF", unitPrice: 4.50, total: 720 },
        { code: "GEN-100", description: "Debris Removal & Dumpster", qty: 1, unit: "EA", unitPrice: 650, total: 650 },
        { code: "GEN-200", description: "Overhead & Profit (10%)", qty: 1, unit: "EA", unitPrice: 1685, total: 1685 },
      ],
    },
    dentGrid: null,
  },
  "insp-2": {
    id: "insp-2",
    projectId: "PRJ-1002",
    projectNumber: "PRJ-1002",
    customerName: "Sarah Chen",
    address: "1580 Oak Valley Dr, Austin, TX 78745",
    type: "Metal Barns",
    status: "Completed",
    date: "2026-03-20",
    time: "10:00",
    operator: "James Rivera",
    weather: "Partly Cloudy, 72\u00b0F, Wind 8mph S",
    duration: "55 min",
    equipment: ["DJI Mavic 3 Enterprise", "Thermal Camera", "LiDAR Scanner", "RTK Module"],
    gpsLat: 30.2112,
    gpsLng: -97.7948,
    flightMode: "Barn Grid Pattern",
    flightAltitude: 80,
    coverageArea: 4800,
    overlapPct: 80,
    sunCompensation: true,
    obstacleAvoidance: true,
    photos: [
      { id: "p1", name: "Barn North Panel", timestamp: "2026-03-20 10:05", gpsTag: "30.2113,-97.7947", color: PHOTO_COLORS[0] },
      { id: "p2", name: "Barn South Panel", timestamp: "2026-03-20 10:08", gpsTag: "30.2111,-97.7949", color: PHOTO_COLORS[1] },
      { id: "p3", name: "Barn East Panel", timestamp: "2026-03-20 10:12", gpsTag: "30.2112,-97.7946", color: PHOTO_COLORS[2] },
      { id: "p4", name: "Barn West Panel", timestamp: "2026-03-20 10:15", gpsTag: "30.2112,-97.7950", color: PHOTO_COLORS[3] },
      { id: "p5", name: "Roof Overview", timestamp: "2026-03-20 10:18", gpsTag: "30.2112,-97.7948", color: PHOTO_COLORS[4] },
      { id: "p6", name: "Dent Detail 1", timestamp: "2026-03-20 10:22", gpsTag: "30.2113,-97.7948", color: PHOTO_COLORS[5] },
    ],
    findings: [
      { id: "f1", type: "Damage", description: "Severe hail denting on north-facing panels, 15+ dents per panel", location: "North Panels Row 3", severity: "Critical", photoRef: "Barn North Panel", gps: "30.2113,-97.7947" },
      { id: "f2", type: "Damage", description: "Moderate denting on east panels, 8-10 dents per panel", location: "East Panels", severity: "High", photoRef: "Barn East Panel", gps: "30.2112,-97.7946" },
      { id: "f3", type: "Measurement", description: "Panel dimensions: 3ft x 12ft standing seam", location: "All Panels", severity: "Low", photoRef: "Barn North Panel", gps: "30.2112,-97.7948" },
      { id: "f4", type: "Recommendation", description: "Replace north and east panels (rows 2-4). South and west panels repairable with PDR.", location: "Full Barn", severity: "High", photoRef: "Roof Overview", gps: "30.2112,-97.7948" },
    ],
    measurements: {
      roofSquaresTotal: 48,
      roofSquaresDamaged: 24,
      ridgeLF: 60,
      hipLF: 0,
      valleyLF: 0,
      rakeLF: 80,
      eaveLF: 120,
      dripEdgeLF: 200,
      affectedAreaPct: 50,
      barn: { panelCount: 96, dentCountPerPanel: 12, totalDentDensity: 8.5 },
    },
    insuranceSummary: "Metal barn hail damage inspection via drone on 2026-03-20. 24 panels require full replacement on N/E faces. Dent density mapping shows severe concentration on north-facing surfaces. Total 96 panels surveyed, 50% affected.",
    aiResults: [
      { id: "ai1", type: "Hail Dent - Severe", severity: "Critical", confidence: 96, gps: "30.2113,-97.7947", widthIn: 1.5, heightIn: 1.5, description: "Large hail impact dent, 1.5in diameter, panel deformation" },
      { id: "ai2", type: "Hail Dent - Moderate", severity: "High", confidence: 89, gps: "30.2112,-97.7946", widthIn: 0.75, heightIn: 0.75, description: "Medium hail dents clustered on east panel face" },
      { id: "ai3", type: "Panel Seam Separation", severity: "High", confidence: 85, gps: "30.2113,-97.7948", widthIn: 24, heightIn: 0.5, description: "Standing seam partially separated at north panel row 3" },
    ],
    conservativeReport: {
      label: "Conservative",
      color: "#22c55e",
      total: 12800,
      recommendation: "Replace 24 severely damaged panels on north and east faces. PDR repair for moderately dented south/west panels.",
      items: [
        { code: "MTL-100", description: "Remove & Replace Metal Panels", qty: 24, unit: "EA", unitPrice: 385, total: 9240 },
        { code: "MTL-200", description: "Panel Seam Re-seal", qty: 6, unit: "EA", unitPrice: 120, total: 720 },
        { code: "MTL-300", description: "PDR Dent Repair (per panel)", qty: 12, unit: "EA", unitPrice: 85, total: 1020 },
        { code: "GEN-100", description: "Debris Removal", qty: 1, unit: "EA", unitPrice: 550, total: 550 },
        { code: "GEN-200", description: "Overhead & Profit (10%)", qty: 1, unit: "EA", unitPrice: 1153, total: 1153 },
      ],
    },
    aggressiveReport: {
      label: "Aggressive",
      color: "#ef4444",
      total: 28500,
      recommendation: "Full panel replacement on all 4 faces. New ridge cap, complete re-sealing, and structural inspection of purlins.",
      items: [
        { code: "MTL-100", description: "Remove & Replace All Panels", qty: 96, unit: "EA", unitPrice: 220, total: 21120 },
        { code: "MTL-210", description: "New Ridge Cap", qty: 60, unit: "LF", unitPrice: 18, total: 1080 },
        { code: "MTL-220", description: "Complete Seam Sealing", qty: 96, unit: "EA", unitPrice: 15, total: 1440 },
        { code: "STR-100", description: "Purlin Structural Inspection", qty: 1, unit: "EA", unitPrice: 800, total: 800 },
        { code: "GEN-100", description: "Debris Removal & Dumpster", qty: 1, unit: "EA", unitPrice: 750, total: 750 },
        { code: "GEN-200", description: "Overhead & Profit (10%)", qty: 1, unit: "EA", unitPrice: 2519, total: 2519 },
      ],
    },
    dentGrid: mkDentGrid(),
  },
  "insp-3": {
    id: "insp-3",
    projectId: "PRJ-1003",
    projectNumber: "PRJ-1003",
    customerName: "Marcus Williams",
    address: "320 Maple Ave, Denver, CO 80202",
    type: "Windows",
    status: "Scheduled",
    date: "2026-04-05",
    time: "14:00",
    operator: "Mike Torres",
    weather: "Forecast: Partly Cloudy, 58\u00b0F",
    duration: "Est. 40 min",
    equipment: ["DJI Mavic 3 Enterprise", "20MP Sensor", "RTK Module"],
    gpsLat: 39.7392,
    gpsLng: -104.9903,
    flightMode: "Window Orbit",
    flightAltitude: 60,
    coverageArea: 1800,
    overlapPct: 85,
    sunCompensation: false,
    obstacleAvoidance: true,
    photos: [],
    findings: [],
    measurements: {
      roofSquaresTotal: 0,
      roofSquaresDamaged: 0,
      ridgeLF: 0,
      hipLF: 0,
      valleyLF: 0,
      rakeLF: 0,
      eaveLF: 0,
      dripEdgeLF: 0,
      affectedAreaPct: 0,
    },
    insuranceSummary: "",
    aiResults: [],
    conservativeReport: null,
    aggressiveReport: null,
    dentGrid: null,
  },
};

/* ── Helpers ─────────────────────────────────────────── */

function downloadCSV(inspection: Inspection) {
  const rows: string[][] = [
    ["Inspection Report"],
    ["ID", inspection.id],
    ["Customer", inspection.customerName],
    ["Address", inspection.address],
    ["Type", inspection.type],
    ["Status", inspection.status],
    ["Date", `${inspection.date} ${inspection.time}`],
    ["Operator", inspection.operator],
    ["Weather", inspection.weather],
    ["Duration", inspection.duration],
    ["GPS", `${inspection.gpsLat}, ${inspection.gpsLng}`],
    [],
    ["Equipment"],
    ...inspection.equipment.map((e) => [e]),
    [],
    ["Flight Data"],
    ["Mode", inspection.flightMode],
    ["Altitude (ft)", String(inspection.flightAltitude)],
    ["Coverage (sqft)", String(inspection.coverageArea)],
    ["Overlap %", String(inspection.overlapPct)],
    [],
    ["Measurements"],
    ["Roof Squares Total", String(inspection.measurements.roofSquaresTotal)],
    ["Roof Squares Damaged", String(inspection.measurements.roofSquaresDamaged)],
    ["Ridge LF", String(inspection.measurements.ridgeLF)],
    ["Hip LF", String(inspection.measurements.hipLF)],
    ["Valley LF", String(inspection.measurements.valleyLF)],
    ["Rake LF", String(inspection.measurements.rakeLF)],
    ["Eave LF", String(inspection.measurements.eaveLF)],
    ["Drip Edge LF", String(inspection.measurements.dripEdgeLF)],
    ["Affected Area %", String(inspection.measurements.affectedAreaPct)],
    [],
    ["Findings"],
    ["Type", "Severity", "Location", "Description", "Photo Ref"],
    ...inspection.findings.map((f) => [f.type, f.severity, f.location, f.description, f.photoRef]),
    [],
    ["AI Damage Detections"],
    ["Type", "Severity", "Confidence", "GPS", "Size (in)", "Description"],
    ...inspection.aiResults.map((a) => [a.type, a.severity, `${a.confidence}%`, a.gps, `${a.widthIn}x${a.heightIn}`, a.description]),
    [],
    ["Photos"],
    ["Name", "Timestamp", "GPS"],
    ...inspection.photos.map((p) => [p.name, p.timestamp, p.gpsTag]),
    [],
    ["Insurance Summary"],
    [inspection.insuranceSummary],
  ];
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${inspection.id}-report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Component ───────────────────────────────────────── */

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);

  const [inspections, setInspections] = useState<Record<string, Inspection>>(MOCK_INSPECTIONS);
  const inspection = id ? inspections[id] : undefined;

  /* ── Modal state ── */
  const [showAddFinding, setShowAddFinding] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  /* ── Flight simulation ── */
  const [flightRunning, setFlightRunning] = useState(false);
  const [flightStep, setFlightStep] = useState(-1);
  const flightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── AI analysis ── */
  const [aiSensitivity, setAiSensitivity] = useState(75);
  const [aiRunning, setAiRunning] = useState(false);

  /* ── Finding form ── */
  const [findingForm, setFindingForm] = useState<{
    type: FindingType;
    description: string;
    location: string;
    severity: Severity;
    photoRef: string;
  }>({ type: "Damage", description: "", location: "", severity: "Medium", photoRef: "" });
  const [findingErrors, setFindingErrors] = useState<Record<string, string>>({});

  /* ── Upload state ── */
  const [uploadFile, setUploadFile] = useState("");

  /* ── Editable measurements ── */
  const [editingMeasurements, setEditingMeasurements] = useState(false);
  const [measForm, setMeasForm] = useState<Measurements>({
    roofSquaresTotal: 0, roofSquaresDamaged: 0, ridgeLF: 0, hipLF: 0,
    valleyLF: 0, rakeLF: 0, eaveLF: 0, dripEdgeLF: 0, affectedAreaPct: 0,
  });

  const updateInspection = useCallback((updates: Partial<Inspection>) => {
    if (!id) return;
    setInspections((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  }, [id]);

  // Cleanup flight timer on unmount
  useEffect(() => {
    return () => {
      if (flightTimerRef.current) clearTimeout(flightTimerRef.current);
    };
  }, []);

  if (!inspection) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Inspection not found.</p>
        <Btn color="#3b82f6" className="mt-4" onClick={() => navigate("/inspections")}>
          Back to Inspections
        </Btn>
      </div>
    );
  }

  /* ── Action Handlers ── */

  const handleStartInspection = () => {
    updateInspection({ status: "In Progress" });
    addToast(`Inspection ${inspection.id} started`, "success");
  };

  const handleMarkComplete = () => {
    updateInspection({ status: "Completed" });
    addToast(`Inspection ${inspection.id} marked complete`, "success");
  };

  const handleCancelInspection = () => {
    updateInspection({ status: "Cancelled" });
    setShowCancelConfirm(false);
    addToast(`Inspection ${inspection.id} cancelled`, "info");
  };

  const handleStartFlight = () => {
    if (flightRunning) return;
    setFlightRunning(true);
    setFlightStep(0);
    let step = 0;
    const tick = () => {
      step += 1;
      if (step >= FLIGHT_STEPS.length) {
        setFlightRunning(false);
        setFlightStep(FLIGHT_STEPS.length);
        addToast("Autonomous flight completed!", "success");
        return;
      }
      setFlightStep(step);
      flightTimerRef.current = setTimeout(tick, 1500);
    };
    flightTimerRef.current = setTimeout(tick, 1500);
  };

  const handleRunAI = () => {
    if (aiRunning) return;
    setAiRunning(true);
    setTimeout(() => {
      setAiRunning(false);
      if (inspection.aiResults.length === 0) {
        // Generate some mock AI results
        const mockResults: DamageResult[] = [
          { id: `ai-${Date.now()}`, type: "Surface Damage", severity: "Medium", confidence: Math.round(aiSensitivity * 0.9), gps: `${inspection.gpsLat.toFixed(4)},${inspection.gpsLng.toFixed(4)}`, widthIn: 6, heightIn: 4, description: "AI-detected surface anomaly" },
        ];
        updateInspection({ aiResults: mockResults });
      }
      addToast(`AI analysis complete at ${aiSensitivity}% sensitivity`, "success");
    }, 2000);
  };

  const handleGenerateReports = () => {
    if (inspection.conservativeReport && inspection.aggressiveReport) {
      addToast("Reports already generated", "info");
      return;
    }
    const conservative: Report = {
      label: "Conservative",
      color: "#22c55e",
      total: 4500,
      recommendation: "Targeted repair of identified damage areas only.",
      items: [
        { code: "GEN-100", description: "Repair - Primary Damage", qty: 1, unit: "EA", unitPrice: 3500, total: 3500 },
        { code: "GEN-200", description: "Overhead & Profit (10%)", qty: 1, unit: "EA", unitPrice: 350, total: 350 },
        { code: "GEN-300", description: "Debris Removal", qty: 1, unit: "EA", unitPrice: 350, total: 350 },
      ],
    };
    const aggressive: Report = {
      label: "Aggressive",
      color: "#ef4444",
      total: 11200,
      recommendation: "Full replacement of all affected components with upgraded materials.",
      items: [
        { code: "GEN-100", description: "Full Replacement", qty: 1, unit: "EA", unitPrice: 8500, total: 8500 },
        { code: "GEN-200", description: "Material Upgrade", qty: 1, unit: "EA", unitPrice: 1200, total: 1200 },
        { code: "GEN-300", description: "Overhead & Profit (10%)", qty: 1, unit: "EA", unitPrice: 970, total: 970 },
        { code: "GEN-400", description: "Debris Removal & Dumpster", qty: 1, unit: "EA", unitPrice: 550, total: 550 },
      ],
    };
    updateInspection({ conservativeReport: conservative, aggressiveReport: aggressive });
    addToast("Reports generated", "success");
  };

  const handleUploadPhoto = () => {
    const typePhotos: Record<string, string[]> = {
      Roof: ["North Elevation", "South Elevation", "East Elevation", "West Elevation", "Ridge Detail", "Valley Detail", "Vent Close-up"],
      Windows: ["Window 1 - Front", "Window 1 - Left", "Window 1 - Right", "Window 1 - Top", "Window 2 - Front", "Window 2 - Left"],
      "Metal Barns": ["Panel Grid A1", "Panel Grid A2", "Panel Grid B1", "Panel Grid B2", "Ridge Seam", "Gable End"],
      default: ["North Elevation", "South Elevation", "East Elevation", "Detail Close-up", "Overview"],
    };
    const names = typePhotos[inspection.type] || typePhotos.default;
    const name = names[inspection.photos.length % names.length] + (inspection.photos.length >= names.length ? ` ${Math.floor(inspection.photos.length / names.length) + 1}` : "");
    const newPhoto: Photo = {
      id: `p${Date.now()}`,
      name,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      gpsTag: `${inspection.gpsLat.toFixed(4)},${inspection.gpsLng.toFixed(4)}`,
      color: PHOTO_COLORS[inspection.photos.length % PHOTO_COLORS.length],
    };
    updateInspection({ photos: [...inspection.photos, newPhoto] });
    setUploadFile("");
    addToast(`Photo "${name}" uploaded`, "success");
  };

  const handleAddFinding = () => {
    const errors: Record<string, string> = {};
    if (!findingForm.description.trim()) errors.description = "Required";
    if (!findingForm.location.trim()) errors.location = "Required";
    setFindingErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const newFinding: Finding = {
      id: `f${Date.now()}`,
      type: findingForm.type,
      description: findingForm.description.trim(),
      location: findingForm.location.trim(),
      severity: findingForm.severity,
      photoRef: findingForm.photoRef || "N/A",
      gps: `${inspection.gpsLat.toFixed(4)},${inspection.gpsLng.toFixed(4)}`,
    };
    updateInspection({ findings: [...inspection.findings, newFinding] });
    setShowAddFinding(false);
    setFindingForm({ type: "Damage", description: "", location: "", severity: "Medium", photoRef: "" });
    addToast("Finding added", "success");
  };

  const handleDeleteFinding = (findingId: string) => {
    updateInspection({ findings: inspection.findings.filter((f) => f.id !== findingId) });
    addToast("Finding removed", "info");
  };

  const openMeasEdit = () => {
    setMeasForm({ ...inspection.measurements });
    setEditingMeasurements(true);
  };

  const saveMeasurements = () => {
    updateInspection({ measurements: { ...measForm } });
    setEditingMeasurements(false);
    addToast("Measurements updated", "success");
  };

  const handleExportXactimate = () => {
    navigate("/estimates");
    addToast(`Export inspection ${inspection.id} data to Xactimate estimate`, "info");
  };

  const handleGenerateInsuranceReport = () => {
    downloadCSV(inspection);
    addToast("Insurance report generated (CSV)", "success");
  };

  const handleGeneratePDF = (reportLabel: string) => {
    addToast(`${reportLabel} PDF report downloading...`, "success");
  };

  const damageCounts = inspection.aiResults.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  const flightProgress = flightStep < 0 ? 0 : Math.min(((flightStep + 1) / FLIGHT_STEPS.length) * 100, 100);

  return (
    <div className="space-y-6">
      {/* ── 1. Header ────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/inspections")}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{inspection.id}</h1>
            <Badge color={TYPE_COLORS[inspection.type]}>{inspection.type}</Badge>
            <Badge color={STATUS_COLORS[inspection.status]}>{inspection.status}</Badge>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{inspection.customerName}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> {inspection.address}
          </p>
          <button
            onClick={() => navigate(`/crm/projects/${inspection.projectId}`)}
            className="text-xs text-blue-500 hover:underline mt-0.5"
          >
            {inspection.projectNumber}
          </button>
        </div>
      </div>

      {/* ── 2. Action Buttons ────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {inspection.status === "Scheduled" && (
          <Btn color="#10b981" size="sm" onClick={handleStartInspection}>
            <Play className="w-3.5 h-3.5 mr-1 inline" />
            Start Inspection
          </Btn>
        )}
        {inspection.status === "In Progress" && (
          <Btn color="#22c55e" size="sm" onClick={handleMarkComplete}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
            Mark Complete
          </Btn>
        )}
        <Btn color="#6366f1" size="sm" onClick={handleStartFlight} disabled={flightRunning}>
          <Plane className="w-3.5 h-3.5 mr-1 inline" />
          {flightRunning ? "Flight In Progress..." : "Start Autonomous Flight"}
        </Btn>
        <Btn color="#f59e0b" size="sm" onClick={handleRunAI} disabled={aiRunning}>
          <Cpu className="w-3.5 h-3.5 mr-1 inline" />
          {aiRunning ? "Analyzing..." : "Run AI Analysis"}
        </Btn>
        <Btn color="#3b82f6" size="sm" variant="outline" onClick={() => setShowUploadSection(!showUploadSection)}>
          <Upload className="w-3.5 h-3.5 mr-1 inline" />
          Upload Photos
        </Btn>
        <Btn color="#8b5cf6" size="sm" variant="outline" onClick={() => setShowAddFinding(true)}>
          <Plus className="w-3.5 h-3.5 mr-1 inline" />
          Add Finding
        </Btn>
        <Btn color="#0ea5e9" size="sm" variant="outline" onClick={handleGenerateReports}>
          <BarChart3 className="w-3.5 h-3.5 mr-1 inline" />
          Generate Reports
        </Btn>
        <Btn color="#8b5cf6" size="sm" variant="outline" onClick={handleExportXactimate}>
          <Download className="w-3.5 h-3.5 mr-1 inline" />
          Export to Xactimate
        </Btn>
        {inspection.status !== "Cancelled" && inspection.status !== "Completed" && (
          <Btn color="#ef4444" size="sm" variant="outline" onClick={() => setShowCancelConfirm(true)}>
            <XCircle className="w-3.5 h-3.5 mr-1 inline" />
            Cancel
          </Btn>
        )}
      </div>

      {/* ── 3. Flight Status Panel ───────────────────── */}
      {(flightRunning || flightStep >= 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Plane className="w-4 h-4 text-indigo-500" />
            Autonomous Flight Sequence
            {flightRunning && <Badge color="#f59e0b" sm>In Progress</Badge>}
            {!flightRunning && flightStep >= FLIGHT_STEPS.length && <Badge color="#22c55e" sm>Complete</Badge>}
          </h2>
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${flightProgress}%`, background: flightRunning ? "#f59e0b" : "#22c55e" }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FLIGHT_STEPS.map((step, i) => {
              const done = i < (flightStep >= FLIGHT_STEPS.length ? FLIGHT_STEPS.length : flightStep);
              const current = i === flightStep && flightRunning;
              const icon = done ? "\u2705" : current ? "\uD83D\uDD04" : "\u2B1C";
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                    current ? "bg-amber-50 border border-amber-200" : done ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  <span className={current ? "font-medium text-amber-700" : done ? "text-green-700" : "text-gray-500"}>
                    {i + 1}. {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Upload Section (toggled) ──────────────────── */}
      {showUploadSection && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-500" />
            Upload Photos
          </h2>
          <FileUploadSim
            fileName={uploadFile}
            onUpload={(name) => setUploadFile(name)}
            onClear={() => setUploadFile("")}
            label="drone-photo"
          />
          {uploadFile && (
            <div className="mt-3 flex justify-end">
              <Btn color="#3b82f6" size="sm" onClick={handleUploadPhoto}>
                Add to Gallery
              </Btn>
            </div>
          )}
        </div>
      )}

      {/* ── 4. Info Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Inspection Details
          </h2>
          <div className="space-y-2.5 text-sm">
            <InfoRow label="Date / Time" value={`${inspection.date} at ${inspection.time}`} />
            <InfoRow label="Drone Operator" value={inspection.operator} />
            <InfoRow label="Duration" value={inspection.duration} />
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Weather</span>
              <span className="text-gray-900 text-right flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {inspection.weather}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-purple-500" />
            Equipment &amp; GPS
          </h2>
          <div className="space-y-2.5 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Equipment</span>
              <div className="flex flex-wrap gap-1.5">
                {inspection.equipment.map((eq) => (
                  <Badge key={eq} color="#6b7280" sm>{eq}</Badge>
                ))}
              </div>
            </div>
            <InfoRow label="GPS Coordinates" value={`${inspection.gpsLat.toFixed(4)}, ${inspection.gpsLng.toFixed(4)}`} mono />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            Flight Settings
          </h2>
          <div className="space-y-2.5 text-sm">
            <InfoRow label="Flight Mode" value={inspection.flightMode} />
            <InfoRow label="Altitude" value={`${inspection.flightAltitude} ft`} />
            <InfoRow label="Overlap" value={`${inspection.overlapPct}%`} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            Compensation &amp; Safety
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sun Compensation</span>
              <Badge color={inspection.sunCompensation ? "#22c55e" : "#6b7280"} sm>
                {inspection.sunCompensation ? "Active" : "Off"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Obstacle Avoidance</span>
              <Badge color={inspection.obstacleAvoidance ? "#22c55e" : "#ef4444"} sm>
                {inspection.obstacleAvoidance ? "Active" : "Off"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Drone Flight Path Visualization ────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-indigo-500" />
          Drone Flight Path
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4" style={{ minHeight: 200 }}>
            <div className="absolute inset-6 border-2 border-dashed border-gray-300 rounded-lg" />
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              <line x1="15%" y1="25%" x2="85%" y2="25%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="85%" y1="25%" x2="85%" y2="40%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="85%" y1="40%" x2="15%" y2="40%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="15%" y1="40%" x2="15%" y2="55%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="15%" y1="55%" x2="85%" y2="55%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="85%" y1="55%" x2="85%" y2="70%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
              <line x1="85%" y1="70%" x2="15%" y2="70%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,3" />
              <circle cx="15%" cy="25%" r="5" fill="#22c55e" />
              <circle cx="15%" cy="70%" r="5" fill="#ef4444" />
            </svg>
            <div className="absolute top-1 left-2 text-[10px] font-medium text-gray-400">N</div>
            <div className="absolute bottom-1 left-2 text-[10px] font-medium text-gray-400">S</div>
            <div className="absolute top-1 right-2 text-[10px] font-medium text-gray-400">E</div>
            <div className="absolute bottom-1 right-2 text-[10px] font-medium text-gray-400">W</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Start</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> End</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <FlightStat label="Flight Altitude" value={`${inspection.flightAltitude} ft`} />
            <FlightStat label="Coverage Area" value={`${inspection.coverageArea.toLocaleString()} sq ft`} />
            <FlightStat label="Overlap Percentage" value={`${inspection.overlapPct}%`} />
            <FlightStat label="Flight Pattern" value={inspection.flightMode} />
          </div>
        </div>
      </div>

      {/* ── 6. Photo Gallery ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-500" />
            Photo Gallery
            <Badge color="#6b7280" sm>{inspection.photos.length}</Badge>
          </h2>
          <Btn color="#3b82f6" size="sm" variant="outline" onClick={() => setShowUploadSection(true)}>
            <Upload className="w-3 h-3 mr-1 inline" />
            Upload
          </Btn>
        </div>
        {inspection.photos.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {inspection.photos.map((photo) => (
              <div key={photo.id} className="group relative">
                <div
                  className="aspect-[4/3] rounded-lg flex items-center justify-center relative overflow-hidden"
                  style={{ background: photo.color + "20", border: `2px solid ${photo.color}40` }}
                >
                  <Eye className="w-6 h-6" style={{ color: photo.color }} />
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">
                    {photo.name}
                  </div>
                </div>
                <div className="mt-1">
                  <p className="text-[11px] font-medium text-gray-700 truncate">{photo.name}</p>
                  <p className="text-[10px] text-gray-400">{photo.timestamp}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{photo.gpsTag}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 7. AI Damage Detection ───────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          AI Damage Detection
        </h2>

        {/* Sensitivity slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-gray-600">Sensitivity</label>
            <span className="text-sm font-semibold text-gray-900">{aiSensitivity}%</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #22c55e, #f59e0b, #ef4444)" }}>
            <input
              type="range"
              min={0}
              max={100}
              value={aiSensitivity}
              onChange={(e) => setAiSensitivity(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full shadow pointer-events-none"
              style={{ left: `calc(${aiSensitivity}% - 8px)` }}
            />
          </div>
        </div>

        <Btn color="#f59e0b" size="sm" onClick={handleRunAI} disabled={aiRunning} className="mb-4">
          <Cpu className="w-3.5 h-3.5 mr-1 inline" />
          {aiRunning ? "Analyzing..." : "Run Analysis"}
        </Btn>

        {inspection.aiResults.length > 0 && (
          <>
            {/* Damage count summary */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(damageCounts).map(([type, count]) => (
                <Badge key={type} color="#ef4444" sm>{type}: {count}</Badge>
              ))}
              <Badge color="#6b7280" sm>Total: {inspection.aiResults.length}</Badge>
            </div>

            {/* Damage cards */}
            <div className="space-y-3">
              {inspection.aiResults.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge color={SEVERITY_COLORS[r.severity]}>{r.severity}</Badge>
                    <span className="text-sm font-medium text-gray-900">{r.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{r.description}</p>
                  {/* Confidence bar */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-500 w-20">Confidence</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.confidence}%`,
                          background: r.confidence > 90 ? "#22c55e" : r.confidence > 70 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-10 text-right">{r.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="font-mono">{r.gps}</span>
                    <span>{r.widthIn}&quot; x {r.heightIn}&quot;</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {inspection.aiResults.length === 0 && !aiRunning && (
          <p className="text-sm text-gray-400 italic">No AI results yet. Run analysis to detect damage.</p>
        )}
        {aiRunning && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            Running AI analysis at {aiSensitivity}% sensitivity...
          </div>
        )}

        {/* Dent Density Map for Metal Barns */}
        {inspection.type === "Metal Barns" && inspection.dentGrid && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Dent Density Map (6x4 Panel Grid)</h3>
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
              {inspection.dentGrid.map((cell, i) => (
                <div
                  key={i}
                  className="aspect-square rounded flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: DENT_DENSITY_COLORS[cell.density] }}
                  title={`Row ${cell.row + 1}, Col ${cell.col + 1}: ${cell.density}`}
                >
                  {cell.density === "none" ? "0" : cell.density === "low" ? "L" : cell.density === "medium" ? "M" : cell.density === "high" ? "H" : "S"}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
              {(["none", "low", "medium", "high", "severe"] as const).map((d) => (
                <span key={d} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded" style={{ background: DENT_DENSITY_COLORS[d] }} />
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 8. Two Reports (side by side) ────────────── */}
      {(inspection.conservativeReport || inspection.aggressiveReport) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[inspection.conservativeReport, inspection.aggressiveReport].filter(Boolean).map((report) => (
            <div
              key={report!.label}
              className="bg-white rounded-xl border-2 p-5"
              style={{ borderColor: report!.color + "40" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: report!.color }} />
                  {report!.label} Report
                </h2>
                <span className="text-lg font-bold" style={{ color: report!.color }}>
                  ${report!.total.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2.5">{report!.recommendation}</p>
              <div className="space-y-1.5 mb-4">
                {report!.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-gray-400 mr-1.5">{item.code}</span>
                      <span className="text-gray-700">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-2 shrink-0">
                      <span className="text-gray-500">{item.qty} {item.unit}</span>
                      <span className="font-semibold text-gray-900 w-16 text-right">${item.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Btn color={report!.color} size="sm" onClick={() => handleGeneratePDF(report!.label)}>
                  <FileText className="w-3 h-3 mr-1 inline" />
                  Generate PDF
                </Btn>
                <Btn color="#8b5cf6" size="sm" variant="outline" onClick={handleExportXactimate}>
                  <Download className="w-3 h-3 mr-1 inline" />
                  Xactimate
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 9. Findings ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Findings
            <Badge color="#6b7280" sm>{inspection.findings.length}</Badge>
          </h2>
          <Btn color="#8b5cf6" size="sm" variant="outline" onClick={() => setShowAddFinding(true)}>
            <Plus className="w-3 h-3 mr-1 inline" />
            Add
          </Btn>
        </div>
        {inspection.findings.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No findings recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {inspection.findings.map((f) => (
              <div key={f.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge color={FINDING_TYPE_COLORS[f.type]}>{f.type}</Badge>
                    <Badge color={SEVERITY_COLORS[f.severity]}>{f.severity}</Badge>
                  </div>
                  <button onClick={() => handleDeleteFinding(f.id)} className="text-gray-300 hover:text-red-500 transition p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 mt-2">{f.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{f.location}</span>
                  <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{f.photoRef}</span>
                  {f.gps && <span className="font-mono">{f.gps}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 10. Measurements ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-green-500" />
            Measurements
          </h2>
          {!editingMeasurements ? (
            <Btn color="#3b82f6" size="sm" variant="outline" onClick={openMeasEdit}>
              Edit
            </Btn>
          ) : (
            <div className="flex gap-2">
              <Btn color="#6b7280" size="sm" variant="outline" onClick={() => setEditingMeasurements(false)}>
                Cancel
              </Btn>
              <Btn color="#22c55e" size="sm" onClick={saveMeasurements}>
                Save
              </Btn>
            </div>
          )}
        </div>
        {!editingMeasurements ? (
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MeasRow label="Roof Squares (Total)" value={`${inspection.measurements.roofSquaresTotal} sq`} />
              <MeasRow label="Roof Squares (Damaged)" value={`${inspection.measurements.roofSquaresDamaged} sq`} highlight />
              <MeasRow label="Ridge" value={`${inspection.measurements.ridgeLF} LF`} />
              <MeasRow label="Hip" value={`${inspection.measurements.hipLF} LF`} />
              <MeasRow label="Valley" value={`${inspection.measurements.valleyLF} LF`} />
              <MeasRow label="Rake" value={`${inspection.measurements.rakeLF} LF`} />
              <MeasRow label="Eave" value={`${inspection.measurements.eaveLF} LF`} />
              <MeasRow label="Drip Edge" value={`${inspection.measurements.dripEdgeLF} LF`} />
              <div className="col-span-2 mt-1 pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-gray-500">Affected Area</span>
                <Badge color={inspection.measurements.affectedAreaPct > 30 ? "#ef4444" : "#f59e0b"}>
                  {inspection.measurements.affectedAreaPct}%
                </Badge>
              </div>
            </div>
            {/* Barn-specific measurements */}
            {inspection.measurements.barn && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Barn Panel Data</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <MeasRow label="Panel Count" value={`${inspection.measurements.barn.panelCount}`} />
                  <MeasRow label="Dents / Panel" value={`${inspection.measurements.barn.dentCountPerPanel}`} highlight />
                  <div className="col-span-2">
                    <MeasRow label="Total Dent Density" value={`${inspection.measurements.barn.totalDentDensity} / sq ft`} highlight />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MeasInput label="Roof Sq (Total)" value={measForm.roofSquaresTotal} onChange={(v) => setMeasForm({ ...measForm, roofSquaresTotal: v })} />
            <MeasInput label="Roof Sq (Damaged)" value={measForm.roofSquaresDamaged} onChange={(v) => setMeasForm({ ...measForm, roofSquaresDamaged: v })} />
            <MeasInput label="Ridge LF" value={measForm.ridgeLF} onChange={(v) => setMeasForm({ ...measForm, ridgeLF: v })} />
            <MeasInput label="Hip LF" value={measForm.hipLF} onChange={(v) => setMeasForm({ ...measForm, hipLF: v })} />
            <MeasInput label="Valley LF" value={measForm.valleyLF} onChange={(v) => setMeasForm({ ...measForm, valleyLF: v })} />
            <MeasInput label="Rake LF" value={measForm.rakeLF} onChange={(v) => setMeasForm({ ...measForm, rakeLF: v })} />
            <MeasInput label="Eave LF" value={measForm.eaveLF} onChange={(v) => setMeasForm({ ...measForm, eaveLF: v })} />
            <MeasInput label="Drip Edge LF" value={measForm.dripEdgeLF} onChange={(v) => setMeasForm({ ...measForm, dripEdgeLF: v })} />
            <MeasInput label="Affected Area %" value={measForm.affectedAreaPct} onChange={(v) => setMeasForm({ ...measForm, affectedAreaPct: v })} />
            {measForm.barn && (
              <>
                <MeasInput label="Panel Count" value={measForm.barn.panelCount} onChange={(v) => setMeasForm({ ...measForm, barn: { ...measForm.barn!, panelCount: v } })} />
                <MeasInput label="Dents / Panel" value={measForm.barn.dentCountPerPanel} onChange={(v) => setMeasForm({ ...measForm, barn: { ...measForm.barn!, dentCountPerPanel: v } })} />
                <MeasInput label="Dent Density" value={measForm.barn.totalDentDensity} onChange={(v) => setMeasForm({ ...measForm, barn: { ...measForm.barn!, totalDentDensity: v } })} />
              </>
            )}
          </div>
        )}
      </div>

      {/* ── 11. Insurance Documentation ───────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          Insurance Documentation
        </h2>
        {inspection.insuranceSummary ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Inspection Summary</label>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{inspection.insuranceSummary}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Damage Itemization</label>
              <div className="space-y-1.5">
                {inspection.findings
                  .filter((f) => f.type === "Damage")
                  .map((f) => (
                    <div key={f.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-2.5">
                      <span className="text-gray-700">{f.location}: {f.description.slice(0, 60)}{f.description.length > 60 ? "..." : ""}</span>
                      <Badge color={SEVERITY_COLORS[f.severity]} sm>{f.severity}</Badge>
                    </div>
                  ))}
                {inspection.findings.filter((f) => f.type === "Damage").length === 0 && (
                  <p className="text-sm text-gray-400 italic">No damage findings recorded.</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Btn color="#f59e0b" size="sm" onClick={handleGenerateInsuranceReport}>
                <FileText className="w-3.5 h-3.5 mr-1 inline" />
                Generate Insurance Report
              </Btn>
              <Btn color="#8b5cf6" size="sm" variant="outline" onClick={handleExportXactimate}>
                <Download className="w-3.5 h-3.5 mr-1 inline" />
                Export to Xactimate
              </Btn>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 italic mb-3">
              No insurance documentation available. Complete the inspection to generate documentation.
            </p>
            <Btn color="#f59e0b" size="sm" variant="outline" onClick={() => addToast("Complete inspection first", "info")}>
              <FileText className="w-3.5 h-3.5 mr-1 inline" />
              Generate Insurance Report
            </Btn>
          </div>
        )}
      </div>

      {/* ── Add Finding Modal ─────────────────────────── */}
      <Modal open={showAddFinding} onClose={() => setShowAddFinding(false)} title="Add Finding">
        <div className="space-y-4">
          <div>
            <SmartSelect
              label="Type"
              required
              value={findingForm.type}
              onChange={(v) => setFindingForm({ ...findingForm, type: v as FindingType })}
              options={["Damage", "Measurement", "Note", "Recommendation"]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={findingForm.description}
              onChange={(e) => {
                setFindingForm({ ...findingForm, description: e.target.value });
                if (findingErrors.description) setFindingErrors((prev) => { const n = { ...prev }; delete n.description; return n; });
              }}
              rows={3}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${findingErrors.description ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              placeholder="Describe the finding..."
            />
            {findingErrors.description && <p className="text-xs text-red-500 mt-1">{findingErrors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              value={findingForm.location}
              onChange={(e) => {
                setFindingForm({ ...findingForm, location: e.target.value });
                if (findingErrors.location) setFindingErrors((prev) => { const n = { ...prev }; delete n.location; return n; });
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${findingErrors.location ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              placeholder="e.g. North Slope, East Gutter..."
            />
            {findingErrors.location && <p className="text-xs text-red-500 mt-1">{findingErrors.location}</p>}
          </div>
          <div>
            <SmartSelect
              label="Severity"
              required
              value={findingForm.severity}
              onChange={(v) => setFindingForm({ ...findingForm, severity: v as Severity })}
              options={["Low", "Medium", "High", "Critical"]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo Reference</label>
            <SmartSelect
              value={findingForm.photoRef}
              onChange={(v) => setFindingForm({ ...findingForm, photoRef: v })}
              options={inspection.photos.map((p) => p.name)}
              placeholder="Select photo..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowAddFinding(false)}>Cancel</Btn>
            <Btn color="#8b5cf6" onClick={handleAddFinding}>Add Finding</Btn>
          </div>
        </div>
      </Modal>

      {/* ── Cancel Confirmation Modal ─────────────────── */}
      <Modal open={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Cancel Inspection">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel inspection{" "}
            <span className="font-semibold text-gray-900">{inspection.id}</span> for{" "}
            <span className="font-semibold text-gray-900">{inspection.customerName}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => setShowCancelConfirm(false)}>Keep</Btn>
            <Btn color="#ef4444" onClick={handleCancelInspection}>Cancel Inspection</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────── */

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium text-gray-900 ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function FlightStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between p-2.5 bg-gray-50 rounded-lg">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function MeasRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${highlight ? "text-red-600" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

function MeasInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}
