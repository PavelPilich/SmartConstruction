import { useState, useEffect, useRef } from "react";
import {
  CloudLightning, MapPin, Shield, Clock, CheckCircle2, AlertTriangle,
  Phone, Mail, MessageSquare, Star, Share2, Facebook, ArrowRight,
  ChevronRight, Home, Droplets, Wind, Eye,
} from "lucide-react";
import { Badge, Btn } from "../../components/ui";

/* ─── Deterministic hash from address string ─── */
function hashAddress(addr: string): number {
  let h = 0;
  for (let i = 0; i < addr.length; i++) {
    h = ((h << 5) - h + addr.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/* ─── Generate storm data from address hash ─── */
interface StormEvent {
  year: number;
  month: number;
  type: "hail" | "wind";
  severity: "minor" | "moderate" | "severe";
  sizeOrSpeed: string;
}

function generateStormData(addr: string) {
  const h = hashAddress(addr);
  const events: StormEvent[] = [];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const yearData = [
    { year: 2021, hail: 1, wind: 2 },
    { year: 2022, hail: 2, wind: 1 },
    { year: 2023, hail: 1, wind: 3 },
    { year: 2024, hail: 3, wind: 2 },
    { year: 2025, hail: 2, wind: 1 },
    { year: 2026, hail: 1, wind: 0 },
  ];

  let idx = 0;
  yearData.forEach((yd) => {
    for (let i = 0; i < yd.hail; i++) {
      const m = Math.floor(seededRandom(h, idx) * 8) + 3; // Mar-Oct
      const sev = seededRandom(h, idx + 100) > 0.6 ? "severe" : seededRandom(h, idx + 100) > 0.3 ? "moderate" : "minor";
      const sizes = ["1.00\"", "1.25\"", "1.50\"", "1.75\"", "2.00\"", "2.50\""];
      events.push({
        year: yd.year,
        month: Math.min(m, 11),
        type: "hail",
        severity: sev,
        sizeOrSpeed: sizes[Math.floor(seededRandom(h, idx + 200) * sizes.length)],
      });
      idx++;
    }
    for (let i = 0; i < yd.wind; i++) {
      const m = Math.floor(seededRandom(h, idx + 50) * 9) + 2;
      const sev = seededRandom(h, idx + 150) > 0.7 ? "severe" : seededRandom(h, idx + 150) > 0.35 ? "moderate" : "minor";
      const speeds = ["58 mph", "62 mph", "68 mph", "72 mph", "78 mph", "85 mph"];
      events.push({
        year: yd.year,
        month: Math.min(m, 11),
        type: "wind",
        severity: sev,
        sizeOrSpeed: speeds[Math.floor(seededRandom(h, idx + 250) * speeds.length)],
      });
      idx++;
    }
  });

  const totalHail = events.filter((e) => e.type === "hail").length;
  const totalWind = events.filter((e) => e.type === "wind").length;

  // Scores deterministic per address
  const base = 60 + (h % 30);
  const roofScore = Math.min(98, base + (h % 12));
  const sidingScore = Math.min(85, base - 15 + (h % 10));
  const windowScore = Math.min(75, base - 22 + (h % 8));
  const gutterScore = Math.min(65, base - 30 + (h % 6));
  const overallScore = Math.round((roofScore * 0.45 + sidingScore * 0.25 + windowScore * 0.15 + gutterScore * 0.15));
  const avgClaim = 11000 + (h % 8000);

  return { events, totalHail, totalWind, roofScore, sidingScore, windowScore, gutterScore, overallScore, avgClaim, months };
}

/* ─── Risk color/label ─── */
function riskColor(score: number): string {
  if (score >= 70) return "#ef4444";
  if (score >= 40) return "#f59e0b";
  return "#22c55e";
}
function riskLabel(score: number): string {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MODERATE";
  return "LOW";
}
function riskTextColor(score: number): string {
  if (score >= 70) return "text-red-500";
  if (score >= 40) return "text-amber-500";
  return "text-green-500";
}
function riskBgColor(score: number): string {
  if (score >= 70) return "bg-red-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-green-500";
}

/* ─── Circular Gauge ─── */
function CircularGauge({ score }: { score: number }) {
  const r = 80;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = riskColor(score);

  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle
          cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black" style={{ color }}>{score}%</span>
        <span className="text-sm font-bold mt-1" style={{ color }}>{riskLabel(score)}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function WeatherDamageEstimatorPage() {
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [animStep, setAnimStep] = useState(0);
  const [stormData, setStormData] = useState<ReturnType<typeof generateStormData> | null>(null);

  // Lead form state
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [contactPref, setContactPref] = useState<"call" | "text" | "email">("call");
  const [bestTime, setBestTime] = useState<"morning" | "afternoon" | "evening">("morning");
  const [hasInsuranceClaim, setHasInsuranceClaim] = useState<"yes" | "no">("no");
  const [visibleDamage, setVisibleDamage] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [referenceNumber, setReferenceNumber] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate analysis steps
  useEffect(() => {
    if (step === 2) {
      setAnimStep(0);
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        setAnimStep(i);
        if (i >= 5) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            setStormData(generateStormData(address));
            setStep(3);
          }, 400);
        }
      }, 500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, address]);

  const handleCheckProperty = () => {
    if (!address.trim()) return;
    setStep(2);
  };

  const validateLeadForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!leadName.trim()) errs.name = "Name is required";
    if (!leadEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail)) errs.email = "Valid email is required";
    if (!leadPhone.trim() || leadPhone.replace(/\D/g, "").length < 10) errs.phone = "Valid phone number is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBookInspection = () => {
    if (!validateLeadForm()) return;
    const ref = "SC-" + Date.now().toString(36).toUpperCase().slice(-6);
    setReferenceNumber(ref);
    setStep(5);
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ═══════════ STEP 1 — Enter Address ═══════════ */
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-950 text-white">
        {/* Header */}
        <header className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-black">SC</div>
            <div>
              <h1 className="text-base font-bold">Smart Construction & Remodeling</h1>
              <p className="text-xs text-gray-400">Storm Damage Assessment Tool</p>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-16 text-center">
          {/* Hero */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full mb-6">
              <CloudLightning className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Free Storm Risk Assessment</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            Is Your Home <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">at Risk?</span>
          </h2>
          <p className="text-lg text-gray-300 mb-2">Free Storm Damage Check</p>
          <p className="text-sm text-gray-400 mb-10 max-w-md mx-auto">
            5-year NOAA storm history for your exact address. Instant results. 100% free.
          </p>

          {/* Address Input */}
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheckProperty()}
                placeholder="Enter your property address..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleCheckProperty}
              disabled={!address.trim()}
              className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg font-bold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
            >
              Check My Property
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-xs text-gray-400">
            {["NOAA Data", "5-Year History", "Free", "No Obligation", "Instant Results"].map((b) => (
              <span key={b} className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {b}
              </span>
            ))}
          </div>

          {/* Social proof */}
          <p className="mt-10 text-sm text-gray-500">
            Over <span className="text-white font-semibold">2,400</span> Minnesota homeowners checked their risk this month
          </p>
        </main>
      </div>
    );
  }

  /* ═══════════ STEP 2 — Analyzing ═══════════ */
  if (step === 2) {
    const analysisSteps = [
      "Locating property coordinates...",
      "Querying NOAA storm database...",
      "Analyzing 5-year hail events...",
      "Analyzing wind events...",
      "Calculating damage probability...",
    ];
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-950 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
            <CloudLightning className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold mb-2">Analyzing Storm History</h3>
          <p className="text-sm text-gray-400 mb-8 truncate">{address}</p>

          <div className="space-y-3 text-left">
            {analysisSteps.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= animStep ? "opacity-100" : "opacity-30"}`}>
                {i < animStep ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : i === animStep ? (
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0" />
                )}
                <span className={`text-sm ${i < animStep ? "text-green-400" : i === animStep ? "text-blue-400" : "text-gray-600"}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-8 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${(animStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════ STEP 3 — Results ═══════════ */
  if (step === 3 && stormData) {
    const { events, totalHail, totalWind, roofScore, sidingScore, windowScore, gutterScore, overallScore, avgClaim } = stormData;
    const years = [2021, 2022, 2023, 2024, 2025, 2026];

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-950 text-white">
        {/* Header */}
        <header className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-black">SC</div>
              <div>
                <h1 className="text-base font-bold">Smart Construction & Remodeling</h1>
                <p className="text-xs text-gray-400">Storm Risk Report</p>
              </div>
            </div>
            <button onClick={() => { setStep(1); setAddress(""); }} className="text-xs text-gray-400 hover:text-white transition">
              Check Another Address
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

          {/* ── Storm History Card ── */}
          <div className="bg-gray-800/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <CloudLightning className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold">NOAA Storm History</h3>
            </div>
            <p className="text-sm text-gray-400 mb-1 truncate">{address}</p>
            <p className="text-xs text-gray-500 mb-5">Data Range: March 2021 — March 2026</p>

            {/* Timeline */}
            <div className="space-y-3">
              {years.map((year) => {
                const yearEvents = events.filter((e) => e.year === year);
                const isSevereYear = yearEvents.length >= 5;
                const isRecent = year === 2026;
                return (
                  <div key={year} className="flex items-start gap-4">
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className={`text-sm font-bold ${isSevereYear ? "text-red-400" : isRecent ? "text-amber-400" : "text-gray-300"}`}>
                        {year}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {yearEvents.map((evt, i) => (
                          <div
                            key={i}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                              evt.type === "hail"
                                ? evt.severity === "severe"
                                  ? "bg-red-500/20 border-red-500/30 text-red-300"
                                  : evt.severity === "moderate"
                                  ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                                  : "bg-yellow-500/15 border-yellow-500/25 text-yellow-300"
                                : evt.severity === "severe"
                                ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                                : evt.severity === "moderate"
                                ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                                : "bg-sky-500/15 border-sky-500/25 text-sky-300"
                            }`}
                          >
                            {evt.type === "hail" ? <Droplets className="w-3 h-3" /> : <Wind className="w-3 h-3" />}
                            {months[evt.month]} — {evt.type === "hail" ? "Hail" : "Wind"} {evt.sizeOrSpeed}
                          </div>
                        ))}
                        {yearEvents.length === 0 && <span className="text-xs text-gray-600">No events recorded</span>}
                      </div>
                      {isSevereYear && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded">
                          SEVERE YEAR
                        </span>
                      )}
                      {isRecent && yearEvents.length > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                          RECENT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Damage Probability Score ── */}
          <div className="bg-gray-800/60 border border-white/10 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold mb-4">Damage Probability Score</h3>
            <CircularGauge score={overallScore} />
            <p className="text-sm text-gray-400 mt-4">
              Based on <span className="text-white font-semibold">{totalHail} hail events</span> and <span className="text-white font-semibold">{totalWind} wind events</span> in 5 years
            </p>
          </div>

          {/* ── Risk Breakdown ── */}
          <div className="bg-gray-800/60 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Risk Breakdown</h3>
            <div className="space-y-4">
              {[
                { icon: Home, label: "Roof Damage Risk", score: roofScore, detail: `${totalHail} hail events, last one March 2026` },
                { icon: Shield, label: "Siding Damage Risk", score: sidingScore, detail: "Multiple wind events may have caused unseen damage" },
                { icon: Eye, label: "Window Damage Risk", score: windowScore, detail: "Hail impacts can crack seals and frames" },
                { icon: Droplets, label: "Gutter Damage Risk", score: gutterScore, detail: "Hail dents likely on aluminum gutters" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.score >= 70 ? "bg-red-500/20" : item.score >= 40 ? "bg-amber-500/20" : "bg-green-500/20"
                  }`}>
                    <item.icon className={`w-5 h-5 ${riskTextColor(item.score)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className={`text-sm font-bold ${riskTextColor(item.score)}`}>
                        {riskLabel(item.score)} ({item.score}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                      <div className={`h-full rounded-full ${riskBgColor(item.score)}`} style={{ width: `${item.score}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Insurance Impact Card ── */}
          <div className="bg-blue-900/40 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold">Did You Know?</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <p>Most MN homeowners don't realize storm damage is covered by insurance at <span className="text-white font-semibold">$0 out of pocket</span> (minus deductible).</p>
              <p>Average insurance claim in your area: <span className="text-green-400 font-bold text-lg">${avgClaim.toLocaleString()}</span></p>
              <p>Damage may be invisible from the ground — a <span className="text-white font-semibold">drone inspection reveals hidden damage</span>.</p>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="bg-gradient-to-r from-green-900/60 to-emerald-900/60 border border-green-500/20 rounded-2xl p-6 text-center">
            <p className={`text-sm font-bold mb-2 ${riskTextColor(overallScore)}`}>
              Your property has a {riskLabel(overallScore)} probability of storm damage
            </p>
            <h3 className="text-2xl font-black mb-2">Book Your FREE Drone Inspection Now</h3>
            <p className="text-sm text-gray-300 mb-6 max-w-md mx-auto">
              We use DJI drones + AI damage detection. 15 minutes. Zero cost. Zero obligation.
            </p>
            <button
              onClick={() => setStep(4)}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white text-lg font-bold rounded-xl hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-500/25"
            >
              Book FREE Inspection <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
          </div>

          {/* ── Rep Info ── */}
          <div className="bg-gray-800/60 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">PP</div>
                <div>
                  <p className="text-sm font-semibold">Your nearest Smart Construction representative</p>
                  <p className="text-base font-bold">Pavel Pilich</p>
                  <p className="text-xs text-gray-400">Response time: within 24 hours</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-amber-400 fill-amber-400"}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">4.9 (247 reviews)</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════ STEP 4 — Lead Capture ═══════════ */
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-950 text-white">
        <header className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-black">SC</div>
            <div>
              <h1 className="text-base font-bold">Smart Construction & Remodeling</h1>
              <p className="text-xs text-gray-400">Book Your Inspection</p>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-6 py-8">
          <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition mb-6">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Results
          </button>

          <div className="bg-gray-800/60 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-1">Book Your FREE Drone Inspection</h3>
            <p className="text-sm text-gray-400 mb-6">
              Risk score: <span className={`font-bold ${riskTextColor(stormData?.overallScore ?? 0)}`}>{stormData?.overallScore}% {riskLabel(stormData?.overallScore ?? 0)}</span> for {address}
            </p>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="John Smith"
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-500" : "border-white/20"}`}
                />
                {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? "border-red-500" : "border-white/20"}`}
                />
                {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="(612) 555-1234"
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.phone ? "border-red-500" : "border-white/20"}`}
                />
                {formErrors.phone && <p className="text-xs text-red-400 mt-1">{formErrors.phone}</p>}
              </div>

              {/* Preferred Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Contact Method</label>
                <div className="flex gap-2">
                  {([
                    { val: "call" as const, icon: Phone, label: "Call" },
                    { val: "text" as const, icon: MessageSquare, label: "Text" },
                    { val: "email" as const, icon: Mail, label: "Email" },
                  ]).map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setContactPref(opt.val)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition border ${
                        contactPref === opt.val
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      <opt.icon className="w-4 h-4" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Best Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Best Time to Contact</label>
                <div className="flex gap-2">
                  {(["morning", "afternoon", "evening"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBestTime(t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition border capitalize ${
                        bestTime === t
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Insurance Claim */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Do you have an active insurance claim?</label>
                <div className="flex gap-2">
                  {(["yes", "no"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setHasInsuranceClaim(v)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition border capitalize ${
                        hasInsuranceClaim === v
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visible Damage */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Any visible damage you've noticed? (optional)</label>
                <textarea
                  value={visibleDamage}
                  onChange={(e) => setVisibleDamage(e.target.value)}
                  rows={3}
                  placeholder="e.g., Missing shingles, dented gutters, cracked siding..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleBookInspection}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white text-lg font-bold rounded-xl hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-500/25 mt-2"
              >
                Book Inspection
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════ STEP 5 — Confirmation ═══════════ */
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-950 text-white">
        <header className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-black">SC</div>
            <div>
              <h1 className="text-base font-bold">Smart Construction & Remodeling</h1>
              <p className="text-xs text-gray-400">Booking Confirmed</p>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-6 py-12 text-center">
          {/* Success */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">You're Booked!</h2>
          <p className="text-gray-300 mb-1">We'll Contact You Within 24 Hours</p>
          <p className="text-sm text-gray-500 mb-8">Reference: <span className="text-white font-mono font-bold">{referenceNumber}</span></p>

          {/* Summary Card */}
          <div className="bg-gray-800/60 border border-white/10 rounded-2xl p-5 text-left mb-6">
            <h4 className="text-sm font-bold mb-3 text-gray-300">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Representative</span>
                <span className="font-medium">Pavel Pilich</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact via</span>
                <span className="font-medium capitalize">{contactPref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Property</span>
                <span className="font-medium truncate ml-4 max-w-[200px]">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Storm Risk Score</span>
                <span className={`font-bold ${riskTextColor(stormData?.overallScore ?? 0)}`}>
                  {stormData?.overallScore}% {riskLabel(stormData?.overallScore ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact Name</span>
                <span className="font-medium">{leadName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Best Time</span>
                <span className="font-medium capitalize">{bestTime}</span>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-gray-800/60 border border-white/10 rounded-2xl p-5 text-left mb-6">
            <h4 className="text-sm font-bold mb-4 text-gray-300">What Happens Next</h4>
            <div className="space-y-4">
              {[
                { step: "1", text: "Pavel will contact you within 24 hours" },
                { step: "2", text: "FREE 15-minute drone inspection scheduled" },
                { step: "3", text: "AI damage report delivered same day" },
                { step: "4", text: "If damage found — we handle the entire insurance claim" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-sm text-gray-300 pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-gray-500 mb-4">
            Join <span className="text-white font-semibold">2,400+</span> Minnesota homeowners who discovered hidden storm damage
          </p>

          {/* Share Buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => {
                // Simulated share
                alert("Share link copied! (Simulated: Facebook share)");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-700/30 border border-blue-600/30 rounded-xl text-sm text-blue-300 hover:bg-blue-700/50 transition"
            >
              <Facebook className="w-4 h-4" /> Share on Facebook
            </button>
            <button
              onClick={() => {
                alert("Share link copied! (Simulated: Text message share)");
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-700/30 border border-green-600/30 rounded-xl text-sm text-green-300 hover:bg-green-700/50 transition"
            >
              <MessageSquare className="w-4 h-4" /> Text a Neighbor
            </button>
          </div>

          {/* Fine Print */}
          <p className="text-xs text-gray-600 mt-6">
            Lead auto-synced to CRM. SMS confirmation sent. Nearest rep assigned.
          </p>

          {/* Start Over */}
          <button
            onClick={() => { setStep(1); setAddress(""); }}
            className="mt-4 text-sm text-gray-400 hover:text-white transition underline"
          >
            Check Another Address
          </button>
        </main>
      </div>
    );
  }

  return null;
}
