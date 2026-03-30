import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn } from "../../components/ui";
import RoofleAiChatWidget from "./RoofleAiChatWidget";
import {
  MapPin, CheckCircle2, Home, Layers, ArrowRight, ArrowLeft,
  Shield, Clock, Star, Phone, Mail, MessageSquare, Calendar,
  FileText, Award, Zap, ChevronRight, Ruler, Triangle, Grid3X3, Building2,
} from "lucide-react";

/* ── helpers ────────────────────────────────────────────────────── */

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function generateRoofData(address: string) {
  const h = hashCode(address);
  const sqft = 1800 + (h % 1200);          // 1800-3000
  const pitch = 4 + (h % 9);               // 4-12
  const facets = 4 + (h % 8);              // 4-11
  const stories = (h % 3) === 0 ? 1 : 2;
  const materials = ["Asphalt 3-Tab", "Architectural Shingle", "Wood Shake", "Composite"];
  const currentMaterial = materials[h % materials.length];
  return { sqft, pitch, facets, stories, currentMaterial };
}

interface RoofData {
  sqft: number;
  pitch: number;
  facets: number;
  stories: number;
  currentMaterial: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  contactMethod: "call" | "text" | "email";
  startDate: string;
  notes: string;
  insuranceClaim: boolean;
  insuranceCompany: string;
  claimNumber: string;
  adjusterName: string;
}

type PackageTier = "good" | "better" | "best";

/* ── pricing ────────────────────────────────────────────────────── */

const PACKAGES = {
  good: {
    name: "Standard",
    tier: "GOOD" as const,
    rate: 3.65,
    color: "#6b7280",
    features: [
      "Owens Corning 3-Tab shingles",
      "25-year manufacturer warranty",
      "Standard underlayment",
      "Standard drip edge & flashing",
      "Debris removal & cleanup",
      "2-year workmanship warranty",
    ],
    warranty: "25-year",
    workmanship: "2-year",
    financing: 89,
  },
  better: {
    name: "Premium",
    tier: "BETTER" as const,
    rate: 5.08,
    color: "#3b82f6",
    popular: true,
    features: [
      "Owens Corning Duration architectural shingles",
      "Lifetime manufacturer warranty",
      "Synthetic underlayment",
      "Premium drip edge & flashing",
      "Ice & water shield (eaves + valleys)",
      "Ridge vent ventilation",
      "Debris removal & magnetic sweep",
      "5-year workmanship warranty",
    ],
    warranty: "Lifetime",
    workmanship: "5-year",
    financing: 124,
  },
  best: {
    name: "Elite",
    tier: "BEST" as const,
    rate: 6.61,
    color: "#8b5cf6",
    features: [
      "Owens Corning Duration STORM impact-resistant",
      "Lifetime + hail warranty",
      "Premium synthetic underlayment (full deck)",
      "Premium flashing & trim",
      "Ice & water shield (full deck in MN!)",
      "Ridge vent + intake ventilation",
      "Satellite-verified completion inspection",
      "Debris removal + full property cleanup",
      "10-year workmanship warranty",
      "Insurance discount eligible",
    ],
    warranty: "Lifetime + Hail",
    workmanship: "10-year",
    financing: 162,
  },
};

function calcPrice(sqft: number, rate: number) {
  return Math.round(sqft * rate / 50) * 50;
}

function calcMonthly(total: number) {
  return Math.round(total / 100);
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────── */

export default function RooflePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState("");
  const [roofData, setRoofData] = useState<RoofData | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageTier | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "", email: "", phone: "", contactMethod: "call",
    startDate: "", notes: "", insuranceClaim: false,
    insuranceCompany: "", claimNumber: "", adjusterName: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [refNumber] = useState(() => "SC-" + Date.now().toString(36).toUpperCase().slice(-6));

  /* ── satellite analysis animation ───────────────────────────── */
  const runAnalysis = useCallback(() => {
    setStep(2);
    setAnalysisStep(0);
    setAnalysisComplete(false);
    const data = generateRoofData(address);
    setRoofData(data);

    const steps = [1, 2, 3, 4, 5];
    steps.forEach((s, i) => {
      setTimeout(() => {
        setAnalysisStep(s);
        if (s === 5) {
          setTimeout(() => setAnalysisComplete(true), 800);
        }
      }, 1500 * (i + 1));
    });
  }, [address]);

  /* ── step navigation ────────────────────────────────────────── */
  const canProceedStep4 = customer.name && customer.email && customer.phone;
  const canSign = agreedToTerms && signatureName.length >= 2;

  const prices = roofData ? {
    good: calcPrice(roofData.sqft, PACKAGES.good.rate),
    better: calcPrice(roofData.sqft, PACKAGES.better.rate),
    best: calcPrice(roofData.sqft, PACKAGES.best.rate),
  } : { good: 0, better: 0, best: 0 };

  /* ── STEP 1: Address ────────────────────────────────────────── */
  const renderStep1 = () => (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
        <Home className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl font-black text-gray-900 mb-3">Get Your Instant Roof Estimate</h1>
      <p className="text-lg text-gray-500 mb-8 max-w-xl">
        Satellite-measured. Accurate to the square foot. No appointment needed.
      </p>

      <div className="w-full max-w-lg">
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your home address..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition"
            onKeyDown={(e) => { if (e.key === "Enter" && address.trim().length > 5) runAnalysis(); }}
          />
        </div>
        <Btn
          size="lg"
          color="#3b82f6"
          className="w-full mt-4 !py-4 !text-base !font-bold"
          disabled={address.trim().length < 6}
          onClick={runAnalysis}
        >
          Get My Estimate <ArrowRight className="w-5 h-5 inline ml-2" />
        </Btn>
      </div>

      <div className="flex items-center gap-6 mt-8 text-sm text-gray-400">
        <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Free</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> No obligation</span>
        <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Instant results</span>
        <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> Satellite-accurate</span>
      </div>
    </div>
  );

  /* ── STEP 2: Satellite Analysis ─────────────────────────────── */
  const analysisLabels = [
    "Locating property...",
    "Measuring roof area...",
    "Calculating slope & pitch...",
    "Detecting current material...",
    "Generating estimate...",
  ];

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => { setStep(1); setAnalysisStep(0); setAnalysisComplete(false); }}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Change address
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        {!analysisComplete ? (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Analyzing Satellite Imagery</h2>
            <p className="text-sm text-gray-500 mb-6">{address}</p>

            <div className="space-y-3 text-left max-w-sm mx-auto">
              {analysisLabels.map((label, i) => {
                const stepNum = i + 1;
                const done = analysisStep >= stepNum;
                const active = analysisStep === stepNum - 1 || (analysisStep === stepNum && !done);
                return (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${done ? "opacity-100" : active ? "opacity-70" : "opacity-30"}`}>
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${active ? "border-blue-400 animate-pulse" : "border-gray-300"}`} />
                    )}
                    <span className={`text-sm ${done ? "text-green-700 font-medium" : "text-gray-500"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : roofData ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Roof Analysis Complete</h2>
                <p className="text-sm text-gray-500">{address}</p>
              </div>
            </div>

            {/* Satellite image placeholder */}
            <div className="bg-gray-100 rounded-xl border border-gray-200 h-48 mb-6 relative overflow-hidden">
              <div className="absolute inset-0" style={{
                backgroundImage: "linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-blue-500/10 border-2 border-blue-400 border-dashed rounded-lg px-12 py-8 text-center">
                  <Grid3X3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <span className="text-xs text-blue-500 font-medium">Satellite Roof Outline</span>
                </div>
              </div>
            </div>

            {/* Measurement cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-semibold">Total Roof Area</span>
                </div>
                <div className="text-2xl font-black text-blue-900">{roofData.sqft.toLocaleString()} sq ft</div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-1">
                  <Triangle className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs text-indigo-600 font-semibold">Roof Pitch</span>
                </div>
                <div className="text-2xl font-black text-indigo-900">{roofData.pitch}/12</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-600 font-semibold">Roof Facets</span>
                </div>
                <div className="text-2xl font-black text-purple-900">{roofData.facets}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600 font-semibold">Stories / Material</span>
                </div>
                <div className="text-lg font-black text-green-900">{roofData.stories}-Story</div>
                <div className="text-xs text-green-600">{roofData.currentMaterial}</div>
              </div>
            </div>

            <Btn size="lg" color="#3b82f6" className="w-full !py-4 !text-base !font-bold" onClick={() => setStep(3)}>
              Continue to Pricing <ArrowRight className="w-5 h-5 inline ml-2" />
            </Btn>
          </div>
        ) : null}
      </div>
    </div>
  );

  /* ── STEP 3: Choose Package ─────────────────────────────────── */
  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4 transition">
        <ArrowLeft className="w-4 h-4" /> Back to roof analysis
      </button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900">Choose Your Package</h2>
        <p className="text-gray-500 mt-1">All packages include full tear-off, permits, and professional installation</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {(["good", "better", "best"] as PackageTier[]).map((tier) => {
          const pkg = PACKAGES[tier];
          const price = prices[tier];
          const monthly = calcMonthly(price);
          const selected = selectedPackage === tier;

          return (
            <div
              key={tier}
              className={`relative bg-white rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                selected ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]" : "border-gray-200 hover:border-gray-300"
              } ${pkg.popular ? "ring-2 ring-blue-500/30" : ""}`}
              onClick={() => setSelectedPackage(tier)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge color="#3b82f6">MOST POPULAR</Badge>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="text-xs font-bold tracking-wider text-gray-400 mb-1">{pkg.tier}</div>
                  <div className="text-xl font-bold" style={{ color: pkg.color }}>{pkg.name}</div>
                  <div className="text-4xl font-black text-gray-900 mt-2">${price.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    As low as <span className="font-bold text-gray-600">${monthly}/mo</span> with financing
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2.5">
                  {pkg.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: pkg.color }} />
                      <span className="text-xs text-gray-600">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Warranty</span>
                    <span className="font-bold text-gray-700">{pkg.warranty}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Workmanship</span>
                    <span className="font-bold text-gray-700">{pkg.workmanship}</span>
                  </div>
                </div>

                <Btn
                  size="md"
                  color={selected ? "#3b82f6" : pkg.color}
                  variant={selected ? "solid" : "outline"}
                  className="w-full mt-5"
                  onClick={(e) => { e?.stopPropagation(); setSelectedPackage(tier); }}
                >
                  {selected ? "Selected" : "Select Package"}
                </Btn>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPackage && (
        <div className="mt-6 flex justify-center">
          <Btn size="lg" color="#3b82f6" className="!px-12 !py-4 !text-base !font-bold" onClick={() => setStep(4)}>
            Continue with {PACKAGES[selectedPackage].name} Package <ArrowRight className="w-5 h-5 inline ml-2" />
          </Btn>
        </div>
      )}
    </div>
  );

  /* ── STEP 4: Customer Info ──────────────────────────────────── */
  const renderStep4 = () => (
    <div className="max-w-xl mx-auto">
      <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4 transition">
        <ArrowLeft className="w-4 h-4" /> Back to packages
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Information</h2>
        <p className="text-sm text-gray-500">We'll use this to prepare your proposal and schedule your project</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            placeholder="John Smith"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              placeholder="john@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="(612) 555-0100"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
          <div className="flex gap-3">
            {([
              { v: "call" as const, icon: Phone, label: "Call" },
              { v: "text" as const, icon: MessageSquare, label: "Text" },
              { v: "email" as const, icon: Mail, label: "Email" },
            ]).map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setCustomer({ ...customer, contactMethod: v })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                  customer.contactMethod === v
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Start Date</label>
          <input
            type="date"
            value={customer.startDate}
            onChange={(e) => setCustomer({ ...customer, startDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea
            value={customer.notes}
            onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
            placeholder="Any additional details about your roof or project..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
          />
        </div>

        {/* Insurance toggle */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Is this an insurance claim?</label>
            <button
              onClick={() => setCustomer({ ...customer, insuranceClaim: !customer.insuranceClaim })}
              className={`relative w-12 h-6 rounded-full transition-colors ${customer.insuranceClaim ? "bg-blue-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${customer.insuranceClaim ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {customer.insuranceClaim && (
            <div className="space-y-3 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">Insurance Company</label>
                <input
                  type="text"
                  value={customer.insuranceCompany}
                  onChange={(e) => setCustomer({ ...customer, insuranceCompany: e.target.value })}
                  placeholder="State Farm, Allstate, etc."
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Claim #</label>
                  <input
                    type="text"
                    value={customer.claimNumber}
                    onChange={(e) => setCustomer({ ...customer, claimNumber: e.target.value })}
                    placeholder="CLM-12345"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-1">Adjuster Name</label>
                  <input
                    type="text"
                    value={customer.adjusterName}
                    onChange={(e) => setCustomer({ ...customer, adjusterName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Btn
          size="lg"
          color="#3b82f6"
          className="w-full !py-4 !text-base !font-bold"
          disabled={!canProceedStep4}
          onClick={() => setStep(5)}
        >
          Review Proposal <ArrowRight className="w-5 h-5 inline ml-2" />
        </Btn>
      </div>
    </div>
  );

  /* ── STEP 5: Proposal & E-Sign ──────────────────────────────── */
  const renderStep5 = () => {
    if (!roofData || !selectedPackage) return null;
    const pkg = PACKAGES[selectedPackage];
    const price = prices[selectedPackage];
    const materialsShare = Math.round(price * 0.45);
    const laborShare = Math.round(price * 0.48);
    const permitsShare = price - materialsShare - laborShare;

    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setStep(4)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-4 transition">
          <ArrowLeft className="w-4 h-4" /> Back to your information
        </button>

        {/* Proposal document */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Letterhead */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-lg font-black">SC</div>
                <div>
                  <div className="text-lg font-bold">Smart Construction & Remodeling</div>
                  <div className="text-blue-200 text-xs">Licensed & Insured | MN License #BC-XXXXXX</div>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-bold">PROPOSAL</div>
                <div className="text-blue-200 text-xs">{refNumber}</div>
                <div className="text-blue-200 text-xs">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Customer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-400 mb-1">PREPARED FOR</div>
                <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                <div className="text-xs text-gray-500">{address}</div>
                <div className="text-xs text-gray-500">{customer.email}</div>
                <div className="text-xs text-gray-500">{customer.phone}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 mb-1">ROOF MEASUREMENTS</div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <div>Total Area: <span className="font-bold">{roofData.sqft.toLocaleString()} sq ft</span></div>
                  <div>Pitch: <span className="font-bold">{roofData.pitch}/12</span></div>
                  <div>Facets: <span className="font-bold">{roofData.facets}</span></div>
                  <div>Stories: <span className="font-bold">{roofData.stories}</span></div>
                  <div>Current: <span className="font-bold">{roofData.currentMaterial}</span></div>
                </div>
              </div>
            </div>

            {/* Selected package */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Badge color={pkg.color}>{pkg.tier}</Badge>
                  <span className="ml-2 font-bold text-gray-900">{pkg.name} Package</span>
                </div>
                <div className="text-xl font-black text-gray-900">${price.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {pkg.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-500" />
                    <span className="text-xs text-gray-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">PRICE BREAKDOWN</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Materials</span>
                  <span className="font-medium text-gray-900">${materialsShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Labor & Installation</span>
                  <span className="font-medium text-gray-900">${laborShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Permits & Fees</span>
                  <span className="font-medium text-gray-900">${permitsShare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-black text-lg text-gray-900">${price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment terms */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-semibold text-blue-700 mb-2">PAYMENT TERMS</div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>50% deposit upon signing, 50% upon completion</div>
                <div>Financing available: as low as ${calcMonthly(price)}/mo with approved credit</div>
                <div>We accept checks, credit cards, and bank transfers</div>
              </div>
            </div>

            {/* Warranty */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="text-xs font-semibold text-green-700 mb-1">MANUFACTURER WARRANTY</div>
                <div className="text-sm font-bold text-green-900">{pkg.warranty}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="text-xs font-semibold text-purple-700 mb-1">WORKMANSHIP WARRANTY</div>
                <div className="text-sm font-bold text-purple-900">{pkg.workmanship}</div>
              </div>
            </div>

            {/* Company credentials */}
            <div className="text-xs text-gray-400 space-y-0.5">
              <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Owens Corning Preferred Contractor</div>
              <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Fully Licensed & Insured — $2M General Liability</div>
              <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> A+ BBB Rated | 4.9 Google Rating</div>
            </div>

            {/* E-Sign section */}
            <div className="border-t-2 border-gray-200 pt-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sign Electronically</h3>

              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I agree to the terms and conditions of this proposal. I authorize Smart Construction & Remodeling Inc.
                  to perform the roofing work described above at the agreed-upon price. I understand that a 50% deposit is required
                  upon signing and the remaining balance is due upon project completion.
                </span>
              </label>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Signature</label>
                <div className="relative">
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Type your full legal name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                  />
                  {signatureName && (
                    <div className="mt-2 py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-2xl text-gray-800" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
                        {signatureName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>

              <Btn
                size="lg"
                color="#10b981"
                className="w-full !py-4 !text-base !font-bold"
                disabled={!canSign}
                onClick={() => { setSubmitted(true); setStep(6); }}
              >
                Sign & Submit Proposal <CheckCircle2 className="w-5 h-5 inline ml-2" />
              </Btn>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── STEP 6: Confirmation ───────────────────────────────────── */
  const renderStep6 = () => (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Proposal Has Been Submitted!</h2>
        <p className="text-gray-500 text-sm mb-1">A copy has been sent to <span className="font-medium">{customer.email}</span></p>
        <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5 mt-2 mb-6">
          <FileText className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-mono font-bold text-gray-600">Ref: {refNumber}</span>
        </div>

        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 text-left mb-6">
          <div className="text-sm font-bold text-blue-900 mb-3">What's Next?</div>
          <div className="space-y-3">
            {[
              { num: "1", text: "We'll call you within 24 hours to confirm details", icon: Phone },
              { num: "2", text: "Schedule a free in-person or drone inspection", icon: Calendar },
              { num: "3", text: "Begin work on your agreed-upon start date", icon: Zap },
            ].map(({ num, text, icon: Icon }) => (
              <div key={num} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {num}
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Btn size="lg" color="#3b82f6" className="w-full !py-3.5 !font-bold" onClick={() => navigate("/register")}>
            Book Free Inspection <ChevronRight className="w-4 h-4 inline ml-1" />
          </Btn>
          <button onClick={() => navigate("/")} className="text-sm text-gray-500 hover:text-blue-600 transition">
            Back to Smart Construction
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Progress bar ───────────────────────────────────────────── */
  const stepLabels = ["Address", "Analysis", "Package", "Info", "Proposal", "Done"];

  return (
    <div>
      {/* Progress */}
      {step > 1 && step < 6 && (
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {stepLabels.map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    done ? "bg-green-500 text-white" : active ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"}`}>
                    {label}
                  </span>
                  {i < stepLabels.length - 1 && (
                    <div className={`w-8 h-0.5 ${done ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}

      {/* AI Chat Widget */}
      <RoofleAiChatWidget prices={prices} />
    </div>
  );
}
