import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, StatCard, Modal, SmartSelect, FileUploadSim } from "../../components/ui";
import { useAppStore } from "../../stores/useAppStore";
import {
  Camera,
  Plane,
  Eye,
  CheckCircle2,
  CloudSun,
  Wind,
  MapPin,
  Clock,
  Plus,
  Search,
  Image,
  FileText,
  Calendar,
  Play,
  XCircle,
  Trash2,
  Zap,
  BarChart3,
  Target,
  Navigation,
  Home,
  Square,
  Fence,
  Mail,
  Warehouse,
  Building,
  Droplets,
  PanelTop,
  Grid3X3,
  Shield,
  Ruler,
  ChevronDown,
  ChevronUp,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

type InspectionTypeName =
  | "Roof"
  | "Steel/Metal Siding"
  | "Vinyl Siding"
  | "Wood Siding"
  | "Windows"
  | "Gutters"
  | "Fascia"
  | "Deck"
  | "Fences"
  | "Mailbox"
  | "Metal Barns"
  | "Other Structures";

type InspectionStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";

type WeatherCondition = "Clear" | "Partly Cloudy" | "Overcast" | "Windy";

type Equipment = "DJI Mavic 3" | "Thermal Camera" | "Extra Batteries" | "Landing Pad" | "Safety Cones" | "Scale Reference Tool" | "GPS Marker Kit";

type FlightMode = "Manual" | "Auto Grid" | "Auto Orbit" | "Full Property Sequence";

interface InspectionPhoto {
  id: string;
  name: string;
  timestamp: string;
}

interface AiDamageItem {
  id: string;
  area: string;
  damageType: string;
  severity: "Minor" | "Moderate" | "Severe" | "Critical";
  confidence: number;
  description: string;
  gpsLat: string;
  gpsLng: string;
  measurementInches: string;
  photoRef: string;
}

interface AiReport {
  totalDamage: number;
  lineItems: number;
  recommendation: string;
  xactimateCode: string;
  sqFootage: number;
}

interface InspectionTypeInfo {
  name: InspectionTypeName;
  color: string;
  icon: LucideIcon;
  subtitle: string;
  damageTypes: string[];
  flightNotes: string;
  criticalNotes: string;
}

interface Inspection {
  id: string;
  type: InspectionTypeName; // primary type for display
  types: string[]; // ALL selected inspection types for this property
  customerName: string;
  address: string;
  projectNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  operator: string;
  weather: WeatherCondition;
  status: InspectionStatus;
  photos: InspectionPhoto[];
  findings: string;
  notes: string;
  measurements: { roofSquares: number; linearFeet: number; affectedAreas: string };
  equipment: Equipment[];
  aiSensitivity: number;
  aiRunning: boolean;
  aiDetectedDamage: AiDamageItem[];
  conservativeReport: AiReport | null;
  aggressiveReport: AiReport | null;
  flightMode: FlightMode;
  flightAltitude: number;
  overlapPercent: number;
  sunCompensation: boolean;
  obstacleAvoidance: boolean;
  autoReturnLowBattery: boolean;
}

/* ── 12 Inspection Type Definitions ───────────────── */

const INSPECTION_TYPE_DEFS: InspectionTypeInfo[] = [
  {
    name: "Roof",
    color: "#ef4444",
    icon: Home,
    subtitle: "Shingles, tiles, flat roofing, ridge caps",
    damageTypes: ["Hail damage", "Wind damage", "Wear", "Missing shingles", "Lifted edges", "Granule loss"],
    flightNotes: "Overhead grid pattern at 100ft, then edge orbit at 15ft. Capture each slope individually. Include ridge, valleys, and all penetrations.",
    criticalNotes: "Document hail impact patterns for insurance. Count affected shingles per 10x10ft test square. Mark granule displacement with GPS.",
  },
  {
    name: "Steel/Metal Siding",
    color: "#3b82f6",
    icon: Square,
    subtitle: "Steel panels, aluminum panels, metal cladding",
    damageTypes: ["Dents at 30-45 degree angle", "Light reflection dents", "Discontinued pattern", "Corrosion", "Fastener failure", "Panel separation"],
    flightNotes: "SLOW passes at 30-45 degree angle for dent detection using light reflection. Each wall individually. Multiple passes at varying angles to catch all dents.",
    criticalNotes: "CRITICAL: Discontinued pattern = FULL REPLACEMENT ($20-30K!). Document pattern name/manufacturer. Angle shots are essential for dent evidence.",
  },
  {
    name: "Vinyl Siding",
    color: "#8b5cf6",
    icon: PanelTop,
    subtitle: "Vinyl panels, vinyl shake, vinyl board-and-batten",
    damageTypes: ["Cracks", "Holes", "Warping", "Loose panels", "Color fading", "Buckling"],
    flightNotes: "Straight-on passes for each wall. Close-up passes at 10-15ft for crack detection. Document J-channel condition at corners.",
    criticalNotes: "Vinyl does not dent - look for cracks, holes, and warping only. Check for impact holes from hail/debris. Warping may indicate heat damage.",
  },
  {
    name: "Wood Siding",
    color: "#a16207",
    icon: Fence,
    subtitle: "Cedar, pine, composite wood siding",
    damageTypes: ["Hail dents", "Paint chips", "Exposed bare wood", "Rot", "Splitting", "Insect damage"],
    flightNotes: "Close passes to catch paint chip detail. Multiple angles per wall section. Document bare wood exposure thoroughly.",
    criticalNotes: "KEY INSURANCE EVIDENCE: Hail dents AND paint chips together. Exposed bare wood = moisture intrusion risk. Document paint chip patterns with measurements.",
  },
  {
    name: "Windows",
    color: "#0ea5e9",
    icon: Grid3X3,
    subtitle: "Glass, metal frames, vinyl frames, seals",
    damageTypes: ["Cracked glass", "Metal frame dents (all 4 sides)", "Vinyl frame cracked joints", "Seal failure", "Condensation between panes", "Frame rot"],
    flightNotes: "Each window from 4 angles (front, left, right, top-down). Metal frames need angled shots for dent detection. Document frame material type.",
    criticalNotes: "Metal frames: check all 4 sides for dents. Vinyl frames: check for cracked joints at corners. Each window needs 4 angle captures minimum.",
  },
  {
    name: "Gutters",
    color: "#f59e0b",
    icon: Droplets,
    subtitle: "Aluminum gutters, copper gutters, guards, downspouts",
    damageTypes: ["Hail dents", "Clogs", "Detached brackets", "Sagging", "Overflow staining", "Seam separation"],
    flightNotes: "Follow gutter line at 8-12ft distance. Angle camera to see inside gutter channel. Document each downspout connection.",
    criticalNotes: "Dent count per linear section is critical for insurance. Document bracket spacing and any sagging measurements.",
  },
  {
    name: "Fascia",
    color: "#10b981",
    icon: Ruler,
    subtitle: "Wood fascia, aluminum fascia wrap, soffit",
    damageTypes: ["Rot", "Cracks", "Water damage", "Hail dents on aluminum", "Paint failure", "Animal damage"],
    flightNotes: "Wood fascia: straight-on for rot/crack detail. Aluminum fascia: angle shots for hail dent detection. Document soffit-fascia junctions.",
    criticalNotes: "Two materials need different approaches - wood (rot/cracks/water) and aluminum (angle for hail dents). Check behind downspouts.",
  },
  {
    name: "Deck",
    color: "#d946ef",
    icon: PanelTop,
    subtitle: "Wood deck, composite deck, railings, stairs",
    damageTypes: ["Surface damage", "Railing damage", "Paint chips", "Board dents", "Splitting", "Fastener pops"],
    flightNotes: "Overhead scan of deck surface, then orbit for railings. Document stair treads individually. Capture railing caps from above.",
    criticalNotes: "Document both surface and railings. Paint chips on boards = hail evidence. Check railing post bases for structural concerns.",
  },
  {
    name: "Fences",
    color: "#f97316",
    icon: Fence,
    subtitle: "Wood fences, vinyl fences, chain link, iron",
    damageTypes: ["Wood dents", "Paint chips", "Cracks", "Vinyl cracks/holes", "Leaning posts", "Missing pickets"],
    flightNotes: "BOTH SIDES of fence required. Low altitude (15-20ft) passes along fence line. Document gate hardware separately.",
    criticalNotes: "Must photograph BOTH sides of fence. Wood: dents + paint chips. Vinyl: cracks + holes. Document post spacing and lean angle.",
  },
  {
    name: "Mailbox",
    color: "#64748b",
    icon: Mail,
    subtitle: "Metal mailbox, painted mailbox, post, surround",
    damageTypes: ["Metal dents", "Paint chips", "Post damage", "Door malfunction", "Number plate damage", "Concrete base cracks"],
    flightNotes: "Orbit mailbox at 6-8ft. Angle shots for metal dent detection. Document post/surround from all 4 sides.",
    criticalNotes: "Metal mailbox: angle for dent detection. Painted: document paint chips with close-ups. Include post condition and base.",
  },
  {
    name: "Metal Barns",
    color: "#dc2626",
    icon: Warehouse,
    subtitle: "Steel barns, metal buildings, pole barns, quonsets",
    damageTypes: ["Dents per panel", "Multiple angle dents", "Door damage", "Trim/edge damage", "Corner damage", "Fastener failure"],
    flightNotes: "ULTRA-DETAILED: Every panel individually at multiple angles. All doors documented. Grid pattern for dent density mapping. Include scale reference in every shot.",
    criticalNotes: "DENT DENSITY COUNT per 10x10ft area required. AI DENT DENSITY MAP overlay needed. Photograph corners, edges, trim, and every door. Scale reference mandatory.",
  },
  {
    name: "Other Structures",
    color: "#6366f1",
    icon: Building,
    subtitle: "Quonset huts, sheds, garages, carports, pergolas, garage doors, AC units, pool cages",
    damageTypes: ["Structural damage", "Surface dents", "Paint damage", "Panel damage", "Screen tears", "Mechanical damage"],
    flightNotes: "Full orbit of structure. Document each face/panel. AC units need top-down and side views. Pool cages need mesh detail.",
    criticalNotes: "Identify structure type and material. Apply appropriate inspection method based on material (metal = angle shots, wood = straight-on, screen = close-up).",
  },
];

const INSPECTION_TYPE_NAMES: InspectionTypeName[] = INSPECTION_TYPE_DEFS.map((d) => d.name);

function getTypeInfo(name: InspectionTypeName): InspectionTypeInfo {
  return INSPECTION_TYPE_DEFS.find((d) => d.name === name) ?? INSPECTION_TYPE_DEFS[0];
}

/* ── Constants ──────────────────────────────────────── */

const STATUS_COLORS: Record<InspectionStatus, string> = {
  Scheduled: "#3b82f6",
  "In Progress": "#f59e0b",
  Completed: "#22c55e",
  Cancelled: "#6b7280",
};

const ALL_STATUSES: InspectionStatus[] = ["Scheduled", "In Progress", "Completed", "Cancelled"];

const WEATHER_OPTIONS: WeatherCondition[] = ["Clear", "Partly Cloudy", "Overcast", "Windy"];

const EQUIPMENT_LIST: Equipment[] = [
  "DJI Mavic 3", "Thermal Camera", "Extra Batteries", "Landing Pad",
  "Safety Cones", "Scale Reference Tool", "GPS Marker Kit",
];

const FLIGHT_MODES: FlightMode[] = ["Manual", "Auto Grid", "Auto Orbit", "Full Property Sequence"];

const DEFAULT_OPERATORS = ["Mike Rodriguez", "Carlos Mendez", "Sam Chen"];

const EMPTY_AI_REPORT: AiReport = { totalDamage: 0, lineItems: 0, recommendation: "", xactimateCode: "", sqFootage: 0 };

const FLIGHT_STEPS = [
  "Overhead roof grid pattern",
  "Roof edge orbit at 15ft",
  "Walls at 30-45\u00B0 angle (each wall)",
  "Each window from 4 angles",
  "Gutters/fascia pass",
  "Deck survey",
  "Fence both sides",
  "Mailbox orbit",
  "Barn detailed grid (if applicable)",
  "Return to home & land",
];

/* ── Mock Data (10 inspections) ────────────────────── */

const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: "insp-1",
    type: "Roof",
    types: ["Roof", "Gutters", "Fascia", "Windows"],
    customerName: "James Wilson",
    address: "4821 Maple Dr, Plymouth, MN 55441",
    projectNumber: "MN-0247",
    scheduledDate: "2026-03-15",
    scheduledTime: "09:00",
    operator: "Mike Rodriguez",
    weather: "Clear",
    status: "Completed",
    photos: [
      { id: "ph1", name: "roof-overview-north.jpg", timestamp: "2026-03-15 09:12" },
      { id: "ph2", name: "roof-overview-south.jpg", timestamp: "2026-03-15 09:15" },
      { id: "ph3", name: "damage-detail-west.jpg", timestamp: "2026-03-15 09:22" },
      { id: "ph4", name: "gutter-closeup.jpg", timestamp: "2026-03-15 09:28" },
      { id: "ph5", name: "shingle-detail-01.jpg", timestamp: "2026-03-15 09:31" },
    ],
    findings: "Significant hail damage on south and west facing slopes. Multiple shingles cracked or missing granules. Gutter dents observed on west side. Recommend full roof replacement.",
    notes: "Homeowner present during inspection. Dog in backyard - launch from front driveway.",
    measurements: { roofSquares: 24.5, linearFeet: 186, affectedAreas: "South slope, west slope, ridgeline" },
    equipment: ["DJI Mavic 3", "Extra Batteries", "Landing Pad"],
    aiSensitivity: 50,
    aiRunning: false,
    aiDetectedDamage: [
      { id: "d1a", area: "South slope - Section 3", damageType: "Hail dent", severity: "Severe", confidence: 92, description: "Multiple cracked shingles with granule loss over 15 sq ft area", gpsLat: "44.9978", gpsLng: "-93.4567", measurementInches: "3.2 x 2.1", photoRef: "roof-overview-south.jpg" },
      { id: "d1b", area: "West slope - Section 1", damageType: "Granule loss", severity: "Moderate", confidence: 87, description: "Hail impact marks on 8 shingles, partial granule displacement", gpsLat: "44.9979", gpsLng: "-93.4569", measurementInches: "2.5 x 1.8", photoRef: "damage-detail-west.jpg" },
      { id: "d1c", area: "Ridgeline - Center", damageType: "Lifted edges", severity: "Minor", confidence: 78, description: "Ridge cap showing early wear, minor lifting at seams", gpsLat: "44.9980", gpsLng: "-93.4568", measurementInches: "6.0 x 0.5", photoRef: "shingle-detail-01.jpg" },
      { id: "d1d", area: "West gutter run", damageType: "Hail dent", severity: "Moderate", confidence: 85, description: "Dented gutter sections, 3 impact points causing water pooling", gpsLat: "44.9977", gpsLng: "-93.4570", measurementInches: "1.5 x 1.2", photoRef: "gutter-closeup.jpg" },
    ],
    conservativeReport: { totalDamage: 8200, lineItems: 6, recommendation: "Targeted repair of south and west slope damaged shingles with gutter section replacement", xactimateCode: "RFG 250", sqFootage: 1200 },
    aggressiveReport: { totalDamage: 18500, lineItems: 14, recommendation: "Full roof replacement recommended due to widespread hail damage pattern across all slopes", xactimateCode: "RFG 260", sqFootage: 2450 },
    flightMode: "Auto Grid",
    flightAltitude: 100,
    overlapPercent: 80,
    sunCompensation: true,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-2",
    type: "Steel/Metal Siding",
    types: ["Steel/Metal Siding", "Windows", "Gutters", "Fascia", "Mailbox"],
    customerName: "Mary Johnson",
    address: "612 Oak Ave, Maple Grove, MN 55369",
    projectNumber: "MN-0089",
    scheduledDate: "2026-03-18",
    scheduledTime: "10:30",
    operator: "Carlos Mendez",
    weather: "Partly Cloudy",
    status: "Completed",
    photos: [
      { id: "ph6", name: "siding-damage-front.jpg", timestamp: "2026-03-18 10:42" },
      { id: "ph7", name: "siding-impact-east.jpg", timestamp: "2026-03-18 10:48" },
      { id: "ph8", name: "siding-angle-reflection.jpg", timestamp: "2026-03-18 10:55" },
      { id: "ph9", name: "gps-marked-areas.jpg", timestamp: "2026-03-18 11:02" },
    ],
    findings: "Wind damage to steel siding on east and north elevations. Discontinued pattern confirmed - full replacement required ($20-30K). GPS coordinates logged for all damage points.",
    notes: "Post-storm assessment. Insurance adjuster requested detailed GPS documentation. Discontinued siding pattern means partial repair not possible.",
    measurements: { roofSquares: 0, linearFeet: 94, affectedAreas: "East elevation siding, north elevation siding" },
    equipment: ["DJI Mavic 3", "Extra Batteries", "Landing Pad", "Safety Cones"],
    aiSensitivity: 75,
    aiRunning: false,
    aiDetectedDamage: [
      { id: "d2a", area: "East elevation - Panel row 3-5", damageType: "Dents at 30-45 degree angle", severity: "Severe", confidence: 94, description: "Steel panels show 14 hail dents visible at 35-degree light reflection angle. Discontinued pattern.", gpsLat: "45.0723", gpsLng: "-93.4551", measurementInches: "1.8 x 1.5", photoRef: "siding-angle-reflection.jpg" },
      { id: "d2b", area: "North elevation - Lower section", damageType: "Panel separation", severity: "Moderate", confidence: 88, description: "Impact damage on 6 steel panels, fastener failure at seams", gpsLat: "45.0724", gpsLng: "-93.4550", measurementInches: "2.0 x 1.0", photoRef: "siding-damage-front.jpg" },
      { id: "d2c", area: "East window frame - 2nd floor", damageType: "Dents at 30-45 degree angle", severity: "Severe", confidence: 91, description: "Metal frame dented from debris impact on all 4 sides", gpsLat: "45.0723", gpsLng: "-93.4552", measurementInches: "0.8 x 0.6", photoRef: "siding-impact-east.jpg" },
      { id: "d2d", area: "North corner trim", damageType: "Corrosion", severity: "Minor", confidence: 72, description: "Corner trim corrosion starting at fastener points", gpsLat: "45.0725", gpsLng: "-93.4549", measurementInches: "4.0 x 0.3", photoRef: "gps-marked-areas.jpg" },
      { id: "d2e", area: "East elevation - Panel row 7", damageType: "Dents at 30-45 degree angle", severity: "Moderate", confidence: 81, description: "Hairline dents in 4 panels visible only at angle, moisture intrusion risk", gpsLat: "45.0723", gpsLng: "-93.4553", measurementInches: "1.2 x 0.9", photoRef: "siding-angle-reflection.jpg" },
    ],
    conservativeReport: { totalDamage: 12400, lineItems: 8, recommendation: "Replace damaged steel panels on east elevation, repair north elevation and corner trim. Note: discontinued pattern limits repair options.", xactimateCode: "SDG 100", sqFootage: 940 },
    aggressiveReport: { totalDamage: 28500, lineItems: 18, recommendation: "Full siding replacement required - discontinued pattern ($20-30K range). All corner trim and flashings included.", xactimateCode: "SDG 110", sqFootage: 2200 },
    flightMode: "Auto Orbit",
    flightAltitude: 80,
    overlapPercent: 85,
    sunCompensation: true,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-3",
    type: "Windows",
    types: ["Windows", "Vinyl Siding", "Gutters"],
    customerName: "Robert Chen",
    address: "7234 Cedar Ln, Maple Grove, MN 55369",
    projectNumber: "MN-0156",
    scheduledDate: "2026-03-22",
    scheduledTime: "06:00",
    operator: "Sam Chen",
    weather: "Clear",
    status: "Completed",
    photos: [
      { id: "ph10", name: "window-front-bay.jpg", timestamp: "2026-03-22 06:15" },
      { id: "ph11", name: "window-frame-dent-ne.jpg", timestamp: "2026-03-22 06:22" },
      { id: "ph12", name: "window-seal-failure.jpg", timestamp: "2026-03-22 06:30" },
    ],
    findings: "4 windows with seal failure. Metal frames show dents on all 4 sides per window. Vinyl frame windows at NE corner have cracked joints. Basement egress has IGU failure.",
    notes: "Best results at 6 AM before sun heats surfaces. Each window captured from 4 angles. Recommend follow-up after repair.",
    measurements: { roofSquares: 0, linearFeet: 0, affectedAreas: "NE corner windows, 2nd floor east windows, basement egress" },
    equipment: ["DJI Mavic 3", "Thermal Camera", "Extra Batteries", "Landing Pad"],
    aiSensitivity: 40,
    aiRunning: false,
    aiDetectedDamage: [
      { id: "d3a", area: "NE corner - 2nd floor window", damageType: "Metal frame dents (all 4 sides)", severity: "Severe", confidence: 95, description: "Metal frame dented on all 4 sides, complete seal failure, condensation between panes", gpsLat: "45.0812", gpsLng: "-93.4601", measurementInches: "0.5 x 0.4", photoRef: "window-frame-dent-ne.jpg" },
      { id: "d3b", area: "East elevation - Kitchen window", damageType: "Seal failure", severity: "Moderate", confidence: 83, description: "Thermal bridging detected, seal degradation beginning at top rail", gpsLat: "45.0811", gpsLng: "-93.4602", measurementInches: "36.0 x 0.2", photoRef: "window-seal-failure.jpg" },
      { id: "d3c", area: "Basement egress window", damageType: "Cracked glass", severity: "Critical", confidence: 97, description: "Window well drainage failure, IGU broken, moisture intrusion at frame base, code compliance concern", gpsLat: "45.0810", gpsLng: "-93.4600", measurementInches: "4.5 x 3.2", photoRef: "window-front-bay.jpg" },
    ],
    conservativeReport: { totalDamage: 4800, lineItems: 4, recommendation: "Replace NE corner window IGU and reseal east kitchen window. Address basement egress drainage.", xactimateCode: "WDW 150", sqFootage: 85 },
    aggressiveReport: { totalDamage: 14200, lineItems: 10, recommendation: "Replace all 4 failed windows with high-efficiency units. Full window well reconstruction for basement egress. Reflash all NE corner openings.", xactimateCode: "WDW 160", sqFootage: 210 },
    flightMode: "Manual",
    flightAltitude: 60,
    overlapPercent: 75,
    sunCompensation: false,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-4",
    type: "Metal Barns",
    types: [...INSPECTION_TYPE_NAMES],
    customerName: "Lisa Andersen",
    address: "1590 Birch St, Edina, MN 55424",
    projectNumber: "MN-0312",
    scheduledDate: "2026-03-28",
    scheduledTime: "14:00",
    operator: "Mike Rodriguez",
    weather: "Partly Cloudy",
    status: "Completed",
    photos: [
      { id: "ph13", name: "barn-north-wall-grid.jpg", timestamp: "2026-03-28 14:10" },
      { id: "ph14", name: "barn-door-east.jpg", timestamp: "2026-03-28 14:25" },
      { id: "ph15", name: "barn-dent-density-map.jpg", timestamp: "2026-03-28 14:40" },
      { id: "ph16", name: "barn-corner-detail.jpg", timestamp: "2026-03-28 14:55" },
    ],
    findings: "Metal barn 60x80ft shows extensive hail damage. North and west walls have highest dent density (8-12 per 10x10ft). All 3 doors damaged. Corner trim needs full replacement.",
    notes: "Ultra-detailed panel-by-panel documentation completed. Scale reference in every shot. AI dent density map generated.",
    measurements: { roofSquares: 48, linearFeet: 280, affectedAreas: "All 4 walls, roof panels, 3 doors, trim/corners" },
    equipment: ["DJI Mavic 3", "Extra Batteries", "Landing Pad", "Scale Reference Tool", "GPS Marker Kit"],
    aiSensitivity: 85,
    aiRunning: false,
    aiDetectedDamage: [
      { id: "d4a", area: "North wall - Panels 1-8", damageType: "Dents per panel", severity: "Severe", confidence: 96, description: "Average 10 dents per 10x10ft section. Deep impacts visible at 35-degree angle.", gpsLat: "44.9212", gpsLng: "-93.3601", measurementInches: "1.5 x 1.2", photoRef: "barn-north-wall-grid.jpg" },
      { id: "d4b", area: "West wall - Panels 1-10", damageType: "Dents per panel", severity: "Severe", confidence: 93, description: "12 dents per 10x10ft section. Worst density on property.", gpsLat: "44.9213", gpsLng: "-93.3603", measurementInches: "1.8 x 1.4", photoRef: "barn-dent-density-map.jpg" },
      { id: "d4c", area: "East door - Overhead roll-up", damageType: "Door damage", severity: "Critical", confidence: 98, description: "Roll-up door jammed from panel warping. 22 dents on door face.", gpsLat: "44.9211", gpsLng: "-93.3600", measurementInches: "2.0 x 1.8", photoRef: "barn-door-east.jpg" },
      { id: "d4d", area: "South wall - Corner trim", damageType: "Corner damage", severity: "Moderate", confidence: 88, description: "Corner trim bent and separated from wall panels at 3 locations", gpsLat: "44.9210", gpsLng: "-93.3602", measurementInches: "8.0 x 2.0", photoRef: "barn-corner-detail.jpg" },
      { id: "d4e", area: "Roof panels - Center section", damageType: "Multiple angle dents", severity: "Severe", confidence: 91, description: "Roof panels show dent pattern from direct hail exposure. 8 dents per 10x10ft.", gpsLat: "44.9212", gpsLng: "-93.3602", measurementInches: "1.2 x 1.0", photoRef: "barn-north-wall-grid.jpg" },
    ],
    conservativeReport: { totalDamage: 22000, lineItems: 12, recommendation: "Replace worst-affected panels on north and west walls. Repair east door mechanism. Replace corner trim at 3 locations.", xactimateCode: "MTL 300", sqFootage: 4800 },
    aggressiveReport: { totalDamage: 48000, lineItems: 28, recommendation: "Full barn re-skinning recommended. All wall panels, roof panels, 3 doors, and all trim/corners. Dent density exceeds threshold on all faces.", xactimateCode: "MTL 310", sqFootage: 9600 },
    flightMode: "Auto Grid",
    flightAltitude: 60,
    overlapPercent: 90,
    sunCompensation: true,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-5",
    type: "Gutters",
    types: ["Gutters", "Fascia", "Roof"],
    customerName: "Tom Erickson",
    address: "830 Summit Ave, St. Paul, MN 55105",
    projectNumber: "MN-0419",
    scheduledDate: "2026-03-29",
    scheduledTime: "11:00",
    operator: "Carlos Mendez",
    weather: "Clear",
    status: "In Progress",
    photos: [
      { id: "ph17", name: "gutter-south-run.jpg", timestamp: "2026-03-29 11:15" },
    ],
    findings: "",
    notes: "Gutter inspection in progress. Documenting hail dents and bracket condition along all runs.",
    measurements: { roofSquares: 0, linearFeet: 0, affectedAreas: "" },
    equipment: ["DJI Mavic 3", "Extra Batteries", "Landing Pad"],
    aiSensitivity: 50,
    aiRunning: false,
    aiDetectedDamage: [],
    conservativeReport: null,
    aggressiveReport: null,
    flightMode: "Auto Orbit",
    flightAltitude: 50,
    overlapPercent: 80,
    sunCompensation: false,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-6",
    type: "Wood Siding",
    types: ["Wood Siding", "Deck", "Fences", "Windows"],
    customerName: "Amanda Swenson",
    address: "340 River Rd, Eagan, MN 55121",
    projectNumber: "MN-0470",
    scheduledDate: "2026-04-02",
    scheduledTime: "09:30",
    operator: "Sam Chen",
    weather: "Clear",
    status: "Scheduled",
    photos: [],
    findings: "",
    notes: "New lead - homeowner reports paint chips and exposed bare wood after last storm.",
    measurements: { roofSquares: 0, linearFeet: 0, affectedAreas: "" },
    equipment: ["DJI Mavic 3", "Extra Batteries", "Landing Pad"],
    aiSensitivity: 50,
    aiRunning: false,
    aiDetectedDamage: [],
    conservativeReport: null,
    aggressiveReport: null,
    flightMode: "Manual",
    flightAltitude: 80,
    overlapPercent: 75,
    sunCompensation: false,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-7",
    type: "Fences",
    types: ["Fences", "Mailbox", "Deck"],
    customerName: "Jennifer Park",
    address: "1122 Ridgeway Dr, Woodbury, MN 55125",
    projectNumber: "MN-0435",
    scheduledDate: "2026-04-05",
    scheduledTime: "08:00",
    operator: "Mike Rodriguez",
    weather: "Partly Cloudy",
    status: "Scheduled",
    photos: [],
    findings: "",
    notes: "200ft wood fence + 80ft vinyl fence. Insurance requires both sides documented.",
    measurements: { roofSquares: 0, linearFeet: 0, affectedAreas: "" },
    equipment: ["DJI Mavic 3", "Extra Batteries", "Safety Cones"],
    aiSensitivity: 50,
    aiRunning: false,
    aiDetectedDamage: [],
    conservativeReport: null,
    aggressiveReport: null,
    flightMode: "Manual",
    flightAltitude: 50,
    overlapPercent: 70,
    sunCompensation: false,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-8",
    type: "Deck",
    types: ["Deck", "Fences", "Other Structures"],
    customerName: "Brian Murphy",
    address: "5600 France Ave S, Edina, MN 55410",
    projectNumber: "MN-0452",
    scheduledDate: "2026-03-25",
    scheduledTime: "13:00",
    operator: "Carlos Mendez",
    weather: "Overcast",
    status: "In Progress",
    photos: [
      { id: "ph18", name: "deck-surface-overview.jpg", timestamp: "2026-03-25 13:10" },
      { id: "ph19", name: "deck-railing-damage.jpg", timestamp: "2026-03-25 13:22" },
    ],
    findings: "",
    notes: "Composite deck with aluminum railings. Documenting surface dents and railing paint chips.",
    measurements: { roofSquares: 0, linearFeet: 0, affectedAreas: "" },
    equipment: ["DJI Mavic 3", "Extra Batteries"],
    aiSensitivity: 60,
    aiRunning: false,
    aiDetectedDamage: [],
    conservativeReport: null,
    aggressiveReport: null,
    flightMode: "Auto Grid",
    flightAltitude: 40,
    overlapPercent: 80,
    sunCompensation: false,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-9",
    type: "Other Structures",
    types: [...INSPECTION_TYPE_NAMES],
    customerName: "Kevin Nguyen",
    address: "2340 White Bear Ave, Maplewood, MN 55109",
    projectNumber: "MN-0488",
    scheduledDate: "2026-03-30",
    scheduledTime: "10:00",
    operator: "Sam Chen",
    weather: "Clear",
    status: "In Progress",
    photos: [
      { id: "ph20", name: "shed-north-wall.jpg", timestamp: "2026-03-30 10:12" },
    ],
    findings: "",
    notes: "Property has: detached garage, storage shed, carport, and 2 AC units. Full documentation needed.",
    measurements: { roofSquares: 0, linearFeet: 0, affectedAreas: "" },
    equipment: ["DJI Mavic 3", "Extra Batteries", "Landing Pad", "Scale Reference Tool"],
    aiSensitivity: 55,
    aiRunning: false,
    aiDetectedDamage: [],
    conservativeReport: null,
    aggressiveReport: null,
    flightMode: "Full Property Sequence",
    flightAltitude: 70,
    overlapPercent: 80,
    sunCompensation: true,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
  {
    id: "insp-10",
    type: "Fascia",
    types: ["Fascia", "Gutters", "Roof"],
    customerName: "Patricia Hall",
    address: "4100 Excelsior Blvd, St. Louis Park, MN 55416",
    projectNumber: "MN-0501",
    scheduledDate: "2026-03-20",
    scheduledTime: "15:00",
    operator: "Carlos Mendez",
    weather: "Windy",
    status: "Cancelled",
    photos: [],
    findings: "",
    notes: "Cancelled - wind speeds exceeded safe drone flight limits. Rescheduling.",
    measurements: { roofSquares: 0, linearFeet: 0, affectedAreas: "" },
    equipment: ["DJI Mavic 3", "Extra Batteries", "Landing Pad"],
    aiSensitivity: 50,
    aiRunning: false,
    aiDetectedDamage: [],
    conservativeReport: null,
    aggressiveReport: null,
    flightMode: "Manual",
    flightAltitude: 60,
    overlapPercent: 75,
    sunCompensation: false,
    obstacleAvoidance: true,
    autoReturnLowBattery: true,
  },
];

/* ── Empty form ─────────────────────────────────────── */

const EMPTY_FORM = {
  type: "Roof" as InspectionTypeName,
  types: [...INSPECTION_TYPE_NAMES] as string[], // ALL 12 types enabled by default
  customerName: "",
  address: "",
  projectNumber: "",
  scheduledDate: "",
  scheduledTime: "",
  operator: DEFAULT_OPERATORS[0],
  weather: "Clear" as WeatherCondition,
  notes: "",
  equipment: ["DJI Mavic 3", "Extra Batteries"] as Equipment[],
  flightMode: "Full Property Sequence" as FlightMode,
  flightAltitude: 200,
  overlapPercent: 75,
  sunCompensation: true,
  obstacleAvoidance: true,
  autoReturnLowBattery: true,
};

/* ── Helpers ────────────────────────────────────────── */

function formatDate(d: string) {
  if (!d) return "\u2014";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function weatherIcon(w: WeatherCondition) {
  switch (w) {
    case "Clear": return CloudSun;
    case "Partly Cloudy": return CloudSun;
    case "Overcast": return CloudSun;
    case "Windy": return Wind;
  }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function sensitivityLabel(v: number): { text: string; color: string } {
  if (v <= 30) return { text: "Conservative", color: "#22c55e" };
  if (v <= 70) return { text: "Balanced", color: "#3b82f6" };
  return { text: "Aggressive", color: "#ef4444" };
}

function severityColor(s: string): string {
  switch (s) {
    case "Minor": return "#22c55e";
    case "Moderate": return "#f59e0b";
    case "Severe": return "#ef4444";
    case "Critical": return "#991b1b";
    default: return "#6b7280";
  }
}

/* ── AI data generators ────────────────────────────── */

function generateAiDamage(sensitivity: number, inspType: InspectionTypeName): AiDamageItem[] {
  const info = getTypeInfo(inspType);
  const baseCount = Math.max(3, Math.round((sensitivity / 100) * 10) + Math.floor(Math.random() * 3));
  const areas: Record<string, string[]> = {
    "Roof": ["South slope - Section 1", "South slope - Section 3", "North slope - Section 2", "West slope - Section 3", "East slope - Ridge", "Valley - Center", "Hip joint - SW corner", "Chimney flashing"],
    "Steel/Metal Siding": ["East elevation - Row 3", "North elevation - Lower", "South elevation - Mid", "West corner trim", "Gable end - Front", "Soffit junction - NE", "Panel seam - Row 7", "Foundation line - East"],
    "Vinyl Siding": ["East elevation - Panel row 2", "North elevation - Lower section", "South J-channel corner", "West wall mid-height", "Gable end front", "Foundation splash zone", "Window surround - East", "Door frame - Front"],
    "Wood Siding": ["East wall - Board row 3", "South wall - Lower boards", "West wall - Mid section", "North wall - Under eave", "Corner board - NE", "Trim - Front door", "Board - Garage side", "Gable siding - Rear"],
    "Windows": ["Front bay window", "2nd floor - Master bedroom", "Kitchen window - East", "Basement egress", "Bathroom - North", "Living room - South", "Garage side window", "Attic dormer"],
    "Gutters": ["Front gutter run", "Rear gutter - East", "Downspout - NW corner", "Gutter seam - Mid-south", "End cap - SE", "Splash block - Front", "Fascia mount - West", "Elbow joint - NE"],
    "Fascia": ["Front fascia - Center", "Rear fascia - East", "Gable fascia - North", "Soffit-fascia junction - SW", "Rake board - Front", "Fascia wrap - SE", "Drip edge - West", "Trim board - Garage"],
    "Deck": ["Deck surface - Center", "North railing - Top rail", "Stairs - Tread 3", "South railing - Post base", "Deck boards - East edge", "Railing cap - NW corner", "Landing - Base step", "Deck board - Seam row 5"],
    "Fences": ["Wood fence - East section", "Wood fence - West section", "Vinyl fence - Gate area", "Wood post - #3", "Picket row - South side", "Rail - Top east run", "Gate hardware", "Post base - Corner"],
    "Mailbox": ["Mailbox top - Lid area", "Mailbox side - East", "Post - Mid section", "Door mechanism", "Number plate", "Concrete base"],
    "Metal Barns": ["North wall - Panels 1-4", "North wall - Panels 5-8", "West wall - Panels 1-5", "East door - Roll-up", "South wall - Corner trim", "Roof panels - Center", "West door - Walk-through", "Ridge cap - Full length"],
    "Other Structures": ["Shed - North wall", "Garage door - Panel 2", "Carport - Roof panel", "AC unit - Top grill", "Pergola - Beam 1", "Garage - East wall", "Shed - Roof", "AC condenser fins"],
  };
  const typeAreas = areas[inspType] ?? areas["Roof"];
  const items: AiDamageItem[] = [];
  const usedAreas = new Set<number>();
  const count = Math.min(baseCount, typeAreas.length);
  for (let i = 0; i < count; i++) {
    let areaIdx: number;
    do { areaIdx = Math.floor(Math.random() * typeAreas.length); } while (usedAreas.has(areaIdx));
    usedAreas.add(areaIdx);
    const sevIdx = sensitivity > 70 ? Math.min(Math.floor(Math.random() * 4), 3) : sensitivity > 30 ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2);
    const severities: AiDamageItem["severity"][] = ["Minor", "Moderate", "Severe", "Critical"];
    const conf = Math.max(55, Math.min(99, Math.round(70 + Math.random() * 25 + (sensitivity - 50) * 0.2)));
    const dmgTypeIdx = Math.floor(Math.random() * info.damageTypes.length);
    const w = (1 + Math.random() * 5).toFixed(1);
    const h = (0.5 + Math.random() * 4).toFixed(1);
    items.push({
      id: `ai-${Date.now()}-${i}`,
      area: typeAreas[areaIdx],
      damageType: info.damageTypes[dmgTypeIdx],
      severity: severities[sevIdx],
      confidence: conf,
      description: `${info.damageTypes[dmgTypeIdx]} detected in ${typeAreas[areaIdx]}. ${severities[sevIdx]} level damage requiring ${sevIdx >= 2 ? "immediate attention" : "monitoring"}.`,
      gpsLat: (44.95 + Math.random() * 0.1).toFixed(4),
      gpsLng: (-93.5 + Math.random() * 0.1).toFixed(4),
      measurementInches: `${w} x ${h}`,
      photoRef: `capture-${typeAreas[areaIdx].toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`,
    });
  }
  return items;
}

function generateReports(damages: AiDamageItem[], inspType: InspectionTypeName): { conservative: AiReport; aggressive: AiReport } {
  const info = getTypeInfo(inspType);
  const baseCost = damages.reduce((sum, d) => {
    switch (d.severity) {
      case "Minor": return sum + 400 + Math.random() * 300;
      case "Moderate": return sum + 1200 + Math.random() * 800;
      case "Severe": return sum + 2500 + Math.random() * 1500;
      case "Critical": return sum + 4000 + Math.random() * 2000;
      default: return sum + 500;
    }
  }, 0);
  const xCodeMap: Record<string, string> = {
    "Roof": "RFG 250", "Steel/Metal Siding": "SDG 100", "Vinyl Siding": "SDG 120",
    "Wood Siding": "SDG 140", "Windows": "WDW 150", "Gutters": "GTR 200",
    "Fascia": "FSA 180", "Deck": "DCK 300", "Fences": "FNC 350",
    "Mailbox": "EXT 400", "Metal Barns": "MTL 300", "Other Structures": "EXT 450",
  };
  const sqBase = 500 + Math.floor(Math.random() * 2000);
  return {
    conservative: {
      totalDamage: Math.round(baseCost * 0.7),
      lineItems: Math.max(2, damages.length - Math.floor(damages.length * 0.3)),
      recommendation: `Targeted repair of highest-severity ${info.name.toLowerCase()} items. Monitor minor damage for progression. Cost-effective approach prioritizing structural integrity.`,
      xactimateCode: xCodeMap[inspType] ?? "EXT 400",
      sqFootage: Math.round(sqBase * 0.6),
    },
    aggressive: {
      totalDamage: Math.round(baseCost * 1.4),
      lineItems: damages.length + Math.floor(damages.length * 0.5),
      recommendation: `Full ${info.name.toLowerCase()} replacement recommended due to widespread damage pattern. Includes all affected areas plus preventive work on adjacent sections.`,
      xactimateCode: (xCodeMap[inspType] ?? "EXT 400").replace(/(\d+)/, (m) => String(Number(m) + 10)),
      sqFootage: sqBase,
    },
  };
}

/* ── Dent Density Map Component (for Metal Barns) ──── */

function DentDensityMap({ damages }: { damages: AiDamageItem[] }) {
  const grid: number[][] = [];
  for (let r = 0; r < 6; r++) {
    const row: number[] = [];
    for (let c = 0; c < 8; c++) {
      const idx = r * 8 + c;
      const hasDamage = damages.some((d) => {
        const hash = d.area.length + d.confidence + idx;
        return hash % 3 === 0;
      });
      if (hasDamage) {
        row.push(Math.floor(Math.random() * 3) + 1);
      } else {
        row.push(Math.floor(Math.random() * 2));
      }
    }
    grid.push(row);
  }
  const densityColor = (v: number) => {
    if (v === 0) return "#22c55e30";
    if (v === 1) return "#22c55e";
    if (v === 2) return "#f59e0b";
    return "#ef4444";
  };
  const densityLabel = (v: number) => {
    if (v === 0) return "0-2";
    if (v === 1) return "3-5";
    if (v === 2) return "6-8";
    return "9+";
  };
  return (
    <div className="mt-3 p-3 bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Grid3X3 className="w-3.5 h-3.5 text-blue-400" />
          Dent Density Map (per 10x10ft)
        </h5>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((v) => (
            <div key={v} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: densityColor(v) }} />
              <span className="text-[9px] text-gray-400">{densityLabel(v)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
        {grid.flat().map((v, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm flex items-center justify-center text-[8px] font-bold text-white/80"
            style={{ background: densityColor(v) }}
          >
            {v > 0 ? densityLabel(v) : ""}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-gray-500 mt-1.5">
        <span>West Wall</span>
        <span>North Wall</span>
        <span>East Wall</span>
      </div>
    </div>
  );
}

/* ── Autonomous Flight Sequence Component ────────── */

function AutonomousFlightSequence({ onComplete }: { onComplete: () => void }) {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStart = useCallback(() => {
    setRunning(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    let step = 0;
    const interval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, step]);
      step++;
      if (step < FLIGHT_STEPS.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setRunning(false);
        setCurrentStep(-1);
        onComplete();
      }
    }, 1500);
  }, [onComplete]);

  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <Rocket className="w-4 h-4 text-blue-500" />
          Autonomous Flight Sequence
        </h4>
        <Btn
          size="sm"
          color="#3b82f6"
          onClick={handleStart}
          disabled={running}
        >
          {running ? (
            <>
              <div className="w-3 h-3 mr-1.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              Flying...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 mr-1 inline" />
              Start Autonomous Flight
            </>
          )}
        </Btn>
      </div>
      <div className="space-y-1.5">
        {FLIGHT_STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(idx);
          const isCurrent = currentStep === idx;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                isCompleted
                  ? "bg-green-100 text-green-800"
                  : isCurrent
                  ? "bg-blue-100 text-blue-800 font-medium"
                  : "bg-white text-gray-500"
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0" style={{
                background: isCompleted ? "#22c55e" : isCurrent ? "#3b82f6" : "#e5e7eb",
                color: isCompleted || isCurrent ? "white" : "#9ca3af",
              }}>
                {isCompleted ? "\u2713" : idx + 1}
              </span>
              <span>{step}</span>
              {isCurrent && (
                <div className="ml-auto w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Damage Bar Chart Component ──────────────────── */

function DamageBarChart({ damages }: { damages: AiDamageItem[] }) {
  const counts: Record<string, number> = {};
  damages.forEach((d) => {
    counts[d.damageType] = (counts[d.damageType] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((e) => e[1]), 1);

  return (
    <div className="space-y-1.5">
      <h5 className="text-xs font-semibold text-gray-700">Damage Count by Type</h5>
      {entries.map(([type, count]) => (
        <div key={type} className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600 w-32 truncate text-right">{type}</span>
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(count / max) * 100}%`,
                background: count >= 3 ? "#ef4444" : count >= 2 ? "#f59e0b" : "#3b82f6",
              }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-700 w-5 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Component ──────────────────────────────────────── */

export default function InspectionsPage() {
  const navigate = useNavigate();
  const addToast = useAppStore((s) => s.addToast);

  const [inspections, setInspections] = useState<Inspection[]>([...INITIAL_INSPECTIONS]);
  const [activeStatus, setActiveStatus] = useState<"All" | InspectionStatus>("All");
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [operators, setOperators] = useState<string[]>([...DEFAULT_OPERATORS]);
  const [expandedType, setExpandedType] = useState(false);
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [newCustomType, setNewCustomType] = useState("");

  /* -- Filtering -- */

  const filtered = useMemo(() => {
    let list = inspections;
    if (activeStatus !== "All") list = list.filter((i) => i.status === activeStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.projectNumber.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeStatus, search, inspections]);

  /* -- Stats -- */

  const totalCount = inspections.length;
  const scheduledCount = inspections.filter((i) => i.status === "Scheduled").length;
  const inProgressCount = inspections.filter((i) => i.status === "In Progress").length;
  const completedCount = inspections.filter((i) => i.status === "Completed").length;
  const photoCount = inspections.reduce((acc, i) => acc + i.photos.length, 0);

  /* -- Form handling -- */

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.customerName.trim()) errors.customerName = "Customer name is required";
    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.scheduledDate) errors.scheduledDate = "Date is required";
    if (!form.scheduledTime) errors.scheduledTime = "Time is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = () => {
    if (!validateForm()) return;
    const newInspection: Inspection = {
      id: `insp-${Date.now()}`,
      type: form.types[0] as InspectionTypeName || form.type,
      types: [...form.types],
      customerName: form.customerName.trim(),
      address: form.address.trim(),
      projectNumber: form.projectNumber.trim() || `PRJ-${String(Math.floor(Math.random() * 900) + 100)}`,
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      operator: form.operator,
      weather: form.weather,
      status: "Scheduled",
      photos: [],
      findings: "",
      notes: form.notes.trim(),
      measurements: { roofSquares: 0, linearFeet: 0, affectedAreas: "" },
      equipment: form.equipment,
      aiSensitivity: 50,
      aiRunning: false,
      aiDetectedDamage: [],
      conservativeReport: null,
      aggressiveReport: null,
      flightMode: form.flightMode,
      flightAltitude: form.flightAltitude,
      overlapPercent: form.overlapPercent,
      sunCompensation: form.sunCompensation,
      obstacleAvoidance: form.obstacleAvoidance,
      autoReturnLowBattery: form.autoReturnLowBattery,
    };
    setInspections((prev) => [newInspection, ...prev]);
    setShowNewModal(false);
    setForm({ ...EMPTY_FORM });
    setFormErrors({});
    addToast(`Inspection scheduled for ${form.customerName}`, "success");
  };

  /* -- Detail modal helpers -- */

  const updateInspection = (id: string, updates: Partial<Inspection>) => {
    setInspections((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const handleUploadPhoto = (id: string) => {
    const insp = inspections.find((i) => i.id === id);
    if (!insp) return;
    const newPhoto: InspectionPhoto = {
      id: `ph-${Date.now()}`,
      name: `drone-capture-${Date.now().toString(36)}.jpg`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    updateInspection(id, { photos: [...insp.photos, newPhoto] });
    addToast("Photo uploaded successfully", "success");
  };

  const handleRemovePhoto = (inspId: string, photoId: string) => {
    const insp = inspections.find((i) => i.id === inspId);
    if (!insp) return;
    updateInspection(inspId, { photos: insp.photos.filter((p) => p.id !== photoId) });
  };

  const handleStartInspection = (id: string) => {
    const insp = inspections.find((i) => i.id === id);
    if (!insp) return;
    updateInspection(id, { status: "In Progress" });
    addToast(`Inspection started for ${insp.customerName}`, "info");
  };

  const handleMarkComplete = (id: string) => {
    const insp = inspections.find((i) => i.id === id);
    if (!insp) return;
    updateInspection(id, { status: "Completed" });
    addToast(`Inspection completed for ${insp.customerName}`, "success");
  };

  const handleCancelInspection = (id: string) => {
    const insp = inspections.find((i) => i.id === id);
    if (!insp) return;
    updateInspection(id, { status: "Cancelled" });
    addToast(`Inspection cancelled for ${insp.customerName}`, "info");
    setShowDetailModal(null);
  };

  const handleDeleteInspection = (id: string) => {
    setInspections((prev) => prev.filter((i) => i.id !== id));
    setShowDetailModal(null);
    addToast("Inspection deleted", "info");
  };

  const handleRunAiAnalysis = (id: string) => {
    const insp = inspections.find((i) => i.id === id);
    if (!insp) return;
    updateInspection(id, { aiRunning: true });
    setTimeout(() => {
      const damages = generateAiDamage(insp.aiSensitivity, insp.type);
      const reports = generateReports(damages, insp.type);
      updateInspection(id, {
        aiRunning: false,
        aiDetectedDamage: damages,
        conservativeReport: reports.conservative,
        aggressiveReport: reports.aggressive,
      });
      addToast(`AI analysis complete - ${damages.length} damage areas detected`, "success");
    }, 2000);
  };

  const toggleEquipment = (eq: Equipment) => {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq) ? prev.equipment.filter((e) => e !== eq) : [...prev.equipment, eq],
    }));
  };

  /* -- Render -- */

  const currentDetail = inspections.find((i) => i.id === showDetailModal) ?? null;
  const currentTypeInfo = currentDetail ? getTypeInfo(currentDetail.type) : null;
  const selectedFormTypeInfo = getTypeInfo(form.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drone Inspections</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule and manage drone flyovers for 12 inspection types across full property</p>
        </div>
        <Btn color="#3b82f6" onClick={() => { setShowNewModal(true); setFormErrors({}); setExpandedType(false); }}>
          <Plus className="w-4 h-4 mr-1.5 inline" />
          Schedule Inspection
        </Btn>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Plane} label="Total Inspections" value={totalCount} color="#6366f1" />
        <StatCard icon={Calendar} label="Scheduled" value={scheduledCount} color="#3b82f6" />
        <StatCard icon={Clock} label="In Progress" value={inProgressCount} color="#f59e0b" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedCount} color="#22c55e" />
        <StatCard icon={Camera} label="Photos Captured" value={photoCount} color="#8b5cf6" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveStatus("All")}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
              activeStatus === "All" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({totalCount})
          </button>
          {ALL_STATUSES.map((s) => {
            const count = inspections.filter((i) => i.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition ${
                  activeStatus === s ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={activeStatus === s ? { background: STATUS_COLORS[s] } : undefined}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, address, project, type..."
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-full sm:w-72"
          />
        </div>
      </div>

      {/* Inspection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">No inspections found.</div>
        )}
        {filtered.map((insp) => {
          const typeInfo = getTypeInfo(insp.type);
          const TypeIcon = typeInfo.icon;
          const WeatherIcon = weatherIcon(insp.weather);
          return (
            <div
              key={insp.id}
              onClick={() => setShowDetailModal(insp.id)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
            >
              <div className="space-y-3">
                {/* Top row: type badges + status badge */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-wrap gap-1">
                    {(insp.types || [insp.type]).slice(0, 4).map((t) => {
                      const ti = getTypeInfo(t as InspectionTypeName);
                      return <Badge key={t} color={ti.color} sm>{t}</Badge>;
                    })}
                    {(insp.types || []).length > 4 && (
                      <Badge color="#6b7280" sm>+{insp.types.length - 4} more</Badge>
                    )}
                  </div>
                  <Badge color={STATUS_COLORS[insp.status]}>{insp.status}</Badge>
                </div>

                {/* Customer & address */}
                <div>
                  <div className="font-semibold text-gray-900">{insp.customerName}</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {insp.address}
                  </div>
                </div>

                {/* Subtitle */}
                <div className="text-[10px] text-gray-400 italic">{typeInfo.subtitle}</div>

                {/* Project link */}
                <div className="flex items-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const projId = insp.projectNumber.replace("MN-", "p");
                      navigate(`/crm/projects/${projId}`);
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {insp.projectNumber}
                  </button>
                </div>

                {/* Info row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(insp.scheduledDate)} {formatTime(insp.scheduledTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5" />
                    {insp.operator}
                  </span>
                  <span className="flex items-center gap-1">
                    <WeatherIcon className="w-3.5 h-3.5" />
                    {insp.weather}
                  </span>
                  {insp.photos.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Image className="w-3.5 h-3.5" />
                      {insp.photos.length} photos
                    </span>
                  )}
                  {insp.aiDetectedDamage.length > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <Target className="w-3.5 h-3.5" />
                      {insp.aiDetectedDamage.length} damage areas
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Schedule Inspection Modal ── */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Schedule Inspection" wide>
        <div className="space-y-4">
          {/* Full Property Inspection Types Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Inspection Types — Full Property</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm({ ...form, types: [...INSPECTION_TYPE_NAMES, ...customTypes] })} className="text-xs text-blue-600 hover:underline font-medium">Select All</button>
                <button type="button" onClick={() => setForm({ ...form, types: [] })} className="text-xs text-gray-500 hover:underline font-medium">Clear All</button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">All 12 types are selected by default for full property inspection. Toggle off types you don't need.</p>
            <div className="border border-gray-200 rounded-lg p-2 max-h-72 overflow-y-auto space-y-1">
              {INSPECTION_TYPE_DEFS.map((typeDef) => {
                const Icon = typeDef.icon;
                const isOn = form.types.includes(typeDef.name);
                return (
                  <button
                    key={typeDef.name}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        types: isOn ? prev.types.filter((t) => t !== typeDef.name) : [...prev.types, typeDef.name],
                      }));
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                      isOn ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-100 opacity-60"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isOn ? "bg-blue-600" : "bg-gray-300"}`}>
                      {isOn && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: typeDef.color + "20" }}>
                      <Icon className="w-4 h-4" style={{ color: typeDef.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{typeDef.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{typeDef.subtitle}</div>
                    </div>
                    {typeDef.criticalNotes.includes("CRITICAL") && <Badge color="#ef4444" sm>Critical</Badge>}
                    {typeDef.criticalNotes.includes("$20-30K") && <Badge color="#f59e0b" sm>$$$</Badge>}
                  </button>
                );
              })}

              {/* Custom types */}
              {customTypes.map((ct) => {
                const isOn = form.types.includes(ct);
                return (
                  <div key={ct} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isOn ? "bg-purple-50 border border-purple-200" : "bg-gray-50 border border-gray-100 opacity-60"}`}>
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, types: isOn ? prev.types.filter((t) => t !== ct) : [...prev.types, ct] }))}
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isOn ? "bg-purple-600" : "bg-gray-300"}`}>
                      {isOn && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-100">
                      <Plus className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">{ct}</span>
                    <Badge color="#8b5cf6" sm>Custom</Badge>
                    <button type="button" onClick={() => { setCustomTypes((prev) => prev.filter((c) => c !== ct)); setForm((prev) => ({ ...prev, types: prev.types.filter((t) => t !== ct) })); }}
                      className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                );
              })}
            </div>

            {/* Add custom inspection type */}
            <div className="flex gap-2 mt-2">
              <input
                value={newCustomType}
                onChange={(e) => setNewCustomType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCustomType.trim()) {
                    const name = newCustomType.trim();
                    if ([...INSPECTION_TYPE_NAMES, ...customTypes].includes(name)) return;
                    setCustomTypes((prev) => [...prev, name]);
                    setForm((prev) => ({ ...prev, types: [...prev.types, name] }));
                    setNewCustomType("");
                  }
                }}
                placeholder="Add custom inspection type (e.g., Solar Panels, Chimney...)"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <Btn color="#8b5cf6" size="sm" onClick={() => {
                const name = newCustomType.trim();
                if (!name || [...INSPECTION_TYPE_NAMES, ...customTypes].includes(name)) return;
                setCustomTypes((prev) => [...prev, name]);
                setForm((prev) => ({ ...prev, types: [...prev.types, name] }));
                setNewCustomType("");
              }}>
                <Plus className="w-3.5 h-3.5 mr-1 inline" /> Add
              </Btn>
            </div>

            <div className="text-xs text-blue-600 font-medium mt-2">{form.types.length} of {INSPECTION_TYPE_NAMES.length + customTypes.length} types selected</div>
          </div>

          {/* Expanded details for selected types */}
          {form.types.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <button type="button" className="w-full flex items-center justify-between text-sm" onClick={() => setExpandedType(!expandedType)}>
                <span className="font-semibold text-gray-900">Selected Types Details ({form.types.length})</span>
                {expandedType ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {expandedType && (
                <div className="mt-2 space-y-3 max-h-48 overflow-y-auto">
                  {form.types.map((t) => {
                    const info = INSPECTION_TYPE_DEFS.find((d) => d.name === t);
                    if (!info) return <div key={t} className="text-xs text-purple-700 bg-purple-50 p-2 rounded"><strong>{t}</strong> — Custom inspection type</div>;
                    return (
                      <div key={t} className="text-xs border-b border-gray-200 pb-2 last:border-0">
                        <div className="font-semibold text-gray-900" style={{ color: info.color }}>{info.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1">{info.damageTypes.map((dt) => <Badge key={dt} color={info.color} sm>{dt}</Badge>)}</div>
                        <div className="text-gray-600 mt-1">{info.flightNotes}</div>
                        {info.criticalNotes && <div className="text-red-700 font-medium mt-0.5">{info.criticalNotes}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input
              value={form.customerName}
              onChange={(e) => { setForm({ ...form, customerName: e.target.value }); if (formErrors.customerName) setFormErrors((prev) => { const n = { ...prev }; delete n.customerName; return n; }); }}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${formErrors.customerName ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              placeholder="Full name"
            />
            {formErrors.customerName && <p className="text-xs text-red-500 mt-1">{formErrors.customerName}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              value={form.address}
              onChange={(e) => { setForm({ ...form, address: e.target.value }); if (formErrors.address) setFormErrors((prev) => { const n = { ...prev }; delete n.address; return n; }); }}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${formErrors.address ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              placeholder="Street address, city, state, zip"
            />
            {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
          </div>

          {/* Project Ref */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Reference</label>
            <input
              value={form.projectNumber}
              onChange={(e) => setForm({ ...form, projectNumber: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="e.g. PRJ-001 (auto-generated if blank)"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => { setForm({ ...form, scheduledDate: e.target.value }); if (formErrors.scheduledDate) setFormErrors((prev) => { const n = { ...prev }; delete n.scheduledDate; return n; }); }}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${formErrors.scheduledDate ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              />
              {formErrors.scheduledDate && <p className="text-xs text-red-500 mt-1">{formErrors.scheduledDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => { setForm({ ...form, scheduledTime: e.target.value }); if (formErrors.scheduledTime) setFormErrors((prev) => { const n = { ...prev }; delete n.scheduledTime; return n; }); }}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${formErrors.scheduledTime ? "border-red-400 ring-2 ring-red-400/30" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
              />
              {formErrors.scheduledTime && <p className="text-xs text-red-500 mt-1">{formErrors.scheduledTime}</p>}
            </div>
          </div>

          {/* Drone Operator */}
          <SmartSelect
            label="Drone Operator"
            value={form.operator}
            onChange={(v) => setForm({ ...form, operator: v })}
            options={operators}
            onAddNew={(v) => setOperators((prev) => [...prev, v])}
            placeholder="Select operator..."
          />

          {/* Weather Forecast */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weather Conditions</label>
            <select
              value={form.weather}
              onChange={(e) => setForm({ ...form, weather: e.target.value as WeatherCondition })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              {WEATHER_OPTIONS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Note: Drone flights cannot be conducted in rain conditions.</p>
          </div>

          {/* DJI Mavic Flight Settings */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-500" />
              DJI Mavic Flight Settings
            </h3>
            <div className="space-y-3">
              {/* Flight Mode */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Flight Mode</label>
                <div className="flex flex-col gap-2">
                  {FLIGHT_MODES.map((mode) => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="flightMode"
                        checked={form.flightMode === mode}
                        onChange={() => setForm({ ...form, flightMode: mode })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Altitude Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500">Altitude</label>
                  <span className="text-xs font-medium text-gray-700">{form.flightAltitude} ft</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={400}
                  step={10}
                  value={form.flightAltitude}
                  onChange={(e) => setForm({ ...form, flightAltitude: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-blue-200"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>50ft</span>
                  <span>400ft</span>
                </div>
              </div>

              {/* Overlap Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500">Overlap</label>
                  <span className="text-xs font-medium text-gray-700">{form.overlapPercent}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={90}
                  step={5}
                  value={form.overlapPercent}
                  onChange={(e) => setForm({ ...form, overlapPercent: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-blue-200"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>50%</span>
                  <span>90%</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-700">Sun Position Compensation</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, sunCompensation: !form.sunCompensation })}
                    className={`w-9 h-5 rounded-full transition-colors relative ${form.sunCompensation ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${form.sunCompensation ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-700">Obstacle Avoidance</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, obstacleAvoidance: !form.obstacleAvoidance })}
                    className={`w-9 h-5 rounded-full transition-colors relative ${form.obstacleAvoidance ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${form.obstacleAvoidance ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-700">Auto-Return Low Battery</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, autoReturnLowBattery: !form.autoReturnLowBattery })}
                    className={`w-9 h-5 rounded-full transition-colors relative ${form.autoReturnLowBattery ? "bg-blue-500" : "bg-gray-300"}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${form.autoReturnLowBattery ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>
              </div>
            </div>
          </div>

          {/* Equipment Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Checklist</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_LIST.map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEquipment(eq)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition ${
                    form.equipment.includes(eq)
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {form.equipment.includes(eq) ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : null}
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              placeholder="Access notes, special instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Btn color="#6b7280" variant="outline" onClick={() => { setShowNewModal(false); setFormErrors({}); }}>Cancel</Btn>
            <Btn color="#3b82f6" onClick={handleCreate}>
              <Calendar className="w-4 h-4 mr-1.5 inline" />
              Schedule Inspection
            </Btn>
          </div>
        </div>
      </Modal>

      {/* ── Inspection Detail Modal ── */}
      <Modal open={showDetailModal !== null} onClose={() => setShowDetailModal(null)} title={currentDetail ? `${currentDetail.type} Inspection` : "Inspection Details"} wide>
        {currentDetail && currentTypeInfo && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-wrap gap-1">
                {(currentDetail.types || [currentDetail.type]).map((t) => {
                  const ti = getTypeInfo(t as InspectionTypeName);
                  return <Badge key={t} color={ti.color} sm>{t}</Badge>;
                })}
              </div>
              <Badge color={STATUS_COLORS[currentDetail.status]}>{currentDetail.status}</Badge>
            </div>

            {/* Inspection scope summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-700 mb-2">Property Inspection Scope — {(currentDetail.types || []).length} Types</div>
              <div className="grid grid-cols-2 gap-1.5">
                {(currentDetail.types || [currentDetail.type]).map((t) => {
                  const info = INSPECTION_TYPE_DEFS.find((d) => d.name === t);
                  return (
                    <div key={t} className="flex items-center gap-1.5 text-[10px]">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: info?.color || "#6b7280" }} />
                      <span className="text-gray-700 font-medium">{t}</span>
                    </div>
                  );
                })}
              </div>
              {currentTypeInfo.criticalNotes && (
                <div className="text-[10px] text-red-600 mt-2 border-t border-gray-200 pt-2">
                  <span className="font-semibold">Critical: </span>{currentTypeInfo.criticalNotes}
                </div>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Customer</span>
                <div className="font-medium text-gray-900">{currentDetail.customerName}</div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Project</span>
                <div>
                  <button
                    onClick={() => {
                      const projId = currentDetail.projectNumber.replace("MN-", "p");
                      navigate(`/crm/projects/${projId}`);
                    }}
                    className="text-blue-600 hover:underline font-medium text-sm"
                  >
                    {currentDetail.projectNumber}
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 text-xs">Address</span>
                <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {currentDetail.address}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Date &amp; Time</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(currentDetail.scheduledDate)} {formatTime(currentDetail.scheduledTime)}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Operator</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Plane className="w-3.5 h-3.5 text-gray-400" />
                  {currentDetail.operator}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Weather</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  {(() => { const WI = weatherIcon(currentDetail.weather); return <WI className="w-3.5 h-3.5 text-gray-400" />; })()}
                  {currentDetail.weather}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Flight Mode</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  <Navigation className="w-3.5 h-3.5 text-gray-400" />
                  {currentDetail.flightMode} | {currentDetail.flightAltitude}ft | {currentDetail.overlapPercent}%
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 text-xs">Equipment</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {currentDetail.equipment.map((eq) => (
                    <Badge key={eq} color="#6366f1" sm>{eq}</Badge>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex gap-3 text-[10px]">
                <span className={`px-2 py-0.5 rounded-full ${currentDetail.sunCompensation ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  Sun Compensation: {currentDetail.sunCompensation ? "ON" : "OFF"}
                </span>
                <span className={`px-2 py-0.5 rounded-full ${currentDetail.obstacleAvoidance ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  Obstacle Avoidance: {currentDetail.obstacleAvoidance ? "ON" : "OFF"}
                </span>
                <span className={`px-2 py-0.5 rounded-full ${currentDetail.autoReturnLowBattery ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                  Auto-Return: {currentDetail.autoReturnLowBattery ? "ON" : "OFF"}
                </span>
              </div>
            </div>

            {/* Autonomous Flight Sequence */}
            <AutonomousFlightSequence
              onComplete={() => {
                addToast("Autonomous flight sequence completed! All areas captured.", "success");
                if (currentDetail.status === "Scheduled") {
                  updateInspection(currentDetail.id, { status: "In Progress" });
                }
              }}
            />

            {/* Photo Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-gray-400" />
                  Photos ({currentDetail.photos.length})
                </h3>
                <Btn size="sm" color="#8b5cf6" onClick={() => handleUploadPhoto(currentDetail.id)}>
                  <Camera className="w-3 h-3 mr-1 inline" />
                  Upload Photo
                </Btn>
              </div>
              {currentDetail.photos.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs border border-dashed border-gray-200 rounded-lg">
                  No photos yet. Upload drone captures or start autonomous flight.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {currentDetail.photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center border border-gray-200">
                        <Image className="w-8 h-8 text-gray-300" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-1.5 py-1 rounded-b-lg truncate">
                        {photo.name}
                      </div>
                      <button
                        onClick={() => handleRemovePhoto(currentDetail.id, photo.id)}
                        className="absolute top-1 right-1 p-0.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-100"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── AI Damage Detection Panel ── */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-blue-50/30">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-500" />
                AI Damage Detection
              </h3>

              {/* Sensitivity Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Detection Sensitivity</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${sensitivityLabel(currentDetail.aiSensitivity).color}20`,
                      color: sensitivityLabel(currentDetail.aiSensitivity).color,
                    }}
                  >
                    {currentDetail.aiSensitivity}% &mdash; {sensitivityLabel(currentDetail.aiSensitivity).text}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={currentDetail.aiSensitivity}
                  onChange={(e) => updateInspection(currentDetail.id, { aiSensitivity: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #3b82f6 50%, #ef4444 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Run AI Analysis Button */}
              <Btn
                color="#3b82f6"
                onClick={() => handleRunAiAnalysis(currentDetail.id)}
                className="w-full"
                disabled={currentDetail.aiRunning}
              >
                {currentDetail.aiRunning ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    Analyzing Drone Imagery...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1.5 inline" />
                    Run AI Analysis
                  </>
                )}
              </Btn>

              {/* AI Detected Damage Results */}
              {currentDetail.aiDetectedDamage.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-red-500" />
                      Detected Damage ({currentDetail.aiDetectedDamage.length} areas)
                    </h4>
                    {currentDetail.conservativeReport && currentDetail.aggressiveReport && (
                      <span className="text-xs text-gray-500">
                        Est. Value: {formatCurrency(currentDetail.conservativeReport.totalDamage)} - {formatCurrency(currentDetail.aggressiveReport.totalDamage)}
                      </span>
                    )}
                  </div>

                  {/* Damage bar chart */}
                  <DamageBarChart damages={currentDetail.aiDetectedDamage} />

                  {/* Dent density map for Metal Barns */}
                  {currentDetail.type === "Metal Barns" && (
                    <DentDensityMap damages={currentDetail.aiDetectedDamage} />
                  )}

                  {/* Damage item cards */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentDetail.aiDetectedDamage.map((dmg) => (
                      <div key={dmg.id} className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900">{dmg.area}</span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ background: severityColor(dmg.severity) }}
                          >
                            {dmg.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge color={currentTypeInfo.color} sm>{dmg.damageType}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{dmg.description}</p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex-1 mr-3 min-w-[120px]">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] text-gray-400">Confidence</span>
                              <span className="text-[10px] font-medium text-gray-600">{dmg.confidence}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${dmg.confidence}%`,
                                  background: dmg.confidence >= 85 ? "#22c55e" : dmg.confidence >= 70 ? "#f59e0b" : "#ef4444",
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-400">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {dmg.gpsLat}, {dmg.gpsLng}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Ruler className="w-2.5 h-2.5" />
                              {dmg.measurementInches}&quot;
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Two Reports Section - Side by Side */}
                  {currentDetail.conservativeReport && currentDetail.aggressiveReport && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {/* Conservative Report */}
                      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                        <h5 className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Conservative Report
                        </h5>
                        <div className="space-y-1.5">
                          <div>
                            <span className="text-[10px] text-green-600">Total Damage</span>
                            <div className="text-lg font-bold text-green-800">{formatCurrency(currentDetail.conservativeReport.totalDamage)}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <span className="text-[10px] text-green-600">Line Items</span>
                              <div className="text-sm font-medium text-green-800">{currentDetail.conservativeReport.lineItems}</div>
                            </div>
                            <div>
                              <span className="text-[10px] text-green-600">Sq. Footage</span>
                              <div className="text-sm font-medium text-green-800">{currentDetail.conservativeReport.sqFootage}</div>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-green-600">Xactimate Code</span>
                            <div className="text-xs font-mono font-medium text-green-800">{currentDetail.conservativeReport.xactimateCode}</div>
                          </div>
                          <p className="text-[10px] text-green-700 leading-relaxed">{currentDetail.conservativeReport.recommendation}</p>
                          <div className="flex flex-col gap-1.5 pt-1">
                            <Btn size="sm" color="#22c55e" onClick={() => addToast("Conservative Insurance PDF generated", "success")}>
                              <FileText className="w-3 h-3 mr-1 inline" />
                              Generate Insurance PDF
                            </Btn>
                            <Btn size="sm" color="#16a34a" variant="outline" onClick={() => {
                              addToast(`Exported to Xactimate: ${currentDetail.conservativeReport!.xactimateCode}`, "success");
                              navigate("/estimates");
                            }}>
                              Export to Xactimate
                            </Btn>
                          </div>
                        </div>
                      </div>

                      {/* Aggressive Report */}
                      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                        <h5 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Aggressive Report
                        </h5>
                        <div className="space-y-1.5">
                          <div>
                            <span className="text-[10px] text-red-600">Total Damage</span>
                            <div className="text-lg font-bold text-red-800">{formatCurrency(currentDetail.aggressiveReport.totalDamage)}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <span className="text-[10px] text-red-600">Line Items</span>
                              <div className="text-sm font-medium text-red-800">{currentDetail.aggressiveReport.lineItems}</div>
                            </div>
                            <div>
                              <span className="text-[10px] text-red-600">Sq. Footage</span>
                              <div className="text-sm font-medium text-red-800">{currentDetail.aggressiveReport.sqFootage}</div>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-red-600">Xactimate Code</span>
                            <div className="text-xs font-mono font-medium text-red-800">{currentDetail.aggressiveReport.xactimateCode}</div>
                          </div>
                          <p className="text-[10px] text-red-700 leading-relaxed">{currentDetail.aggressiveReport.recommendation}</p>
                          <div className="flex flex-col gap-1.5 pt-1">
                            <Btn size="sm" color="#ef4444" onClick={() => addToast("Aggressive Insurance PDF generated", "success")}>
                              <FileText className="w-3 h-3 mr-1 inline" />
                              Generate Insurance PDF
                            </Btn>
                            <Btn size="sm" color="#dc2626" variant="outline" onClick={() => {
                              addToast(`Exported to Xactimate: ${currentDetail.aggressiveReport!.xactimateCode}`, "success");
                              navigate("/estimates");
                            }}>
                              Export to Xactimate
                            </Btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Findings / Notes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-400" />
                Findings &amp; Notes
              </h3>
              <textarea
                value={currentDetail.findings}
                onChange={(e) => updateInspection(currentDetail.id, { findings: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none mb-2"
                placeholder="Document inspection findings here..."
              />
              <textarea
                value={currentDetail.notes}
                onChange={(e) => updateInspection(currentDetail.id, { notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                placeholder="Additional notes..."
              />
            </div>

            {/* Measurements */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-gray-400" />
                Measurements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Roof Squares</label>
                  <input
                    type="number"
                    value={currentDetail.measurements.roofSquares || ""}
                    onChange={(e) =>
                      updateInspection(currentDetail.id, {
                        measurements: { ...currentDetail.measurements, roofSquares: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Linear Feet</label>
                  <input
                    type="number"
                    value={currentDetail.measurements.linearFeet || ""}
                    onChange={(e) =>
                      updateInspection(currentDetail.id, {
                        measurements: { ...currentDetail.measurements, linearFeet: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Affected Areas</label>
                  <input
                    value={currentDetail.measurements.affectedAreas}
                    onChange={(e) =>
                      updateInspection(currentDetail.id, {
                        measurements: { ...currentDetail.measurements, affectedAreas: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Describe areas"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <Btn size="sm" color="#8b5cf6" onClick={() => handleUploadPhoto(currentDetail.id)}>
                <Camera className="w-3.5 h-3.5 mr-1 inline" />
                Upload Photos
              </Btn>
              <Btn size="sm" color="#6366f1" onClick={() => addToast("Findings saved", "success")}>
                <FileText className="w-3.5 h-3.5 mr-1 inline" />
                Save Findings
              </Btn>
              {currentDetail.status === "Scheduled" && (
                <Btn size="sm" color="#f59e0b" onClick={() => handleStartInspection(currentDetail.id)}>
                  <Play className="w-3.5 h-3.5 mr-1 inline" />
                  Start Inspection
                </Btn>
              )}
              {(currentDetail.status === "Scheduled" || currentDetail.status === "In Progress") && (
                <Btn size="sm" color="#22c55e" onClick={() => handleMarkComplete(currentDetail.id)}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                  Mark Complete
                </Btn>
              )}
              <Btn size="sm" color="#0ea5e9" onClick={() => addToast(`Full report generated for ${currentDetail.projectNumber}`, "success")}>
                <FileText className="w-3.5 h-3.5 mr-1 inline" />
                Generate Report
              </Btn>
              {currentDetail.status !== "Cancelled" && currentDetail.status !== "Completed" && (
                <Btn size="sm" color="#ef4444" variant="outline" onClick={() => handleCancelInspection(currentDetail.id)}>
                  <XCircle className="w-3.5 h-3.5 mr-1 inline" />
                  Cancel
                </Btn>
              )}
              <Btn size="sm" color="#991b1b" variant="outline" onClick={() => handleDeleteInspection(currentDetail.id)}>
                <Trash2 className="w-3.5 h-3.5 mr-1 inline" />
                Delete
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
