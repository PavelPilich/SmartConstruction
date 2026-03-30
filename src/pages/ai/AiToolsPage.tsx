import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Btn, StatCard, Modal, SmartSelect, FileUploadSim } from "../../components/ui";
import {
  Camera, Shield, Calculator, Mic, TrendingUp, Brain, Sparkles,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Download,
  Send, FileText, MapPin, Hash, Clock, Play, Square, Plus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  AI Photo Estimator                                                 */
/* ------------------------------------------------------------------ */

function PhotoEstimator() {
  const nav = useNavigate();
  const [file, setFile] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);

  useEffect(() => {
    if (!file || result) return;
    setAnalyzing(true);
    const t = setTimeout(() => { setAnalyzing(false); setResult(true); }, 2000);
    return () => clearTimeout(t);
  }, [file, result]);

  const reset = () => { setFile(""); setResult(false); setAnalyzing(false); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ background: "#3b82f615" }}>
          <Camera className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI Photo Estimator</h3>
          <p className="text-xs text-gray-500">Upload a photo &rarr; get instant roof analysis</p>
        </div>
      </div>

      {!result && !analyzing && (
        <FileUploadSim fileName={file} onUpload={setFile} onClear={reset} label="roof-photo" />
      )}

      {analyzing && (
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium">AI analyzing roof image...</p>
          <p className="text-xs text-gray-400">Detecting materials, condition &amp; measurements</p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <Badge color="#22c55e">Analysis Complete</Badge>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {([
              ["Roof Type", "Asphalt Architectural Shingles"],
              ["Material", "Owens Corning Duration"],
              ["Estimated Sq Ft", "2,200"],
              ["Condition", "Fair \u2014 showing wear patterns"],
              ["Estimated Age", "12-15 years"],
            ] as const).map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-gray-500">{k}</div>
                <div className="font-medium text-gray-900">{v}</div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-xs text-blue-600 font-semibold">Instant Estimate</div>
            <div className="text-xl font-black text-blue-700">$11,400 &ndash; $15,800</div>
          </div>
          <div className="flex gap-2">
            <Btn color="#3b82f6" size="sm" onClick={() => nav("/estimates")} className="flex-1">Create Full Estimate</Btn>
            <Btn color="#3b82f6" variant="outline" size="sm" onClick={() => nav("/inspections")} className="flex-1">Schedule Drone Inspection</Btn>
          </div>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 w-full text-center">Reset &amp; try another photo</button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Insurance Claims Assistant                                      */
/* ------------------------------------------------------------------ */

function InsuranceClaims() {
  const [file, setFile] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);
  const [demandOpen, setDemandOpen] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!file || result) return;
    setAnalyzing(true);
    const t = setTimeout(() => { setAnalyzing(false); setResult(true); }, 3000);
    return () => clearTimeout(t);
  }, [file, result]);

  const reset = () => { setFile(""); setResult(false); setAnalyzing(false); setSent(false); setDemandOpen(false); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ background: "#22c55e15" }}>
          <Shield className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI Insurance Claims Assistant</h3>
          <p className="text-xs text-gray-500">Upload policy &rarr; AI prepares your claim</p>
        </div>
      </div>

      {!result && !analyzing && (
        <FileUploadSim fileName={file} onUpload={setFile} onClear={reset} label="insurance-policy" />
      )}

      {analyzing && (
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium">AI reading policy document...</p>
          <p className="text-xs text-gray-400">Extracting coverage, deductibles &amp; exclusions</p>
        </div>
      )}

      {result && (
        <div className="space-y-3 text-sm">
          <Badge color="#22c55e">Policy Analyzed</Badge>

          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="font-semibold text-gray-900 text-xs mb-1">Policy Analysis</div>
            {([
              ["Carrier", "State Farm"],
              ["Policy #", "HO-4821-MN"],
              ["Coverage", "Dwelling $320,000 \u2022 Wind/Hail: Included"],
              ["Deductible", "$1,000"],
              ["Special Exclusions", "None found"],
            ] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-gray-500">{k}</span>
                <span className="text-gray-900 font-medium">{v}</span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-xs text-gray-900">AI-Prepared Documents</div>
            {["Claim filing form (pre-filled)", "Damage documentation checklist", "Scope of loss letter", "Demand letter (if underpaid)"].map((d) => (
              <div key={d} className="flex items-center gap-1.5 text-xs text-green-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> {d}
              </div>
            ))}
          </div>

          <button
            onClick={() => setDemandOpen(!demandOpen)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            {demandOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Demand Letter Preview
          </button>

          {demandOpen && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-gray-700 leading-relaxed">
              <p className="font-semibold mb-1">RE: Insurance Claim &mdash; Policy HO-4821-MN</p>
              <p>Dear Claims Adjuster,</p>
              <p className="mt-1">
                This letter serves as a formal demand regarding the above-referenced claim under policy HO-4821-MN
                with dwelling coverage of $320,000. Our documented inspection reveals damage consistent with
                the covered peril, and we request full coverage per the policy terms less the $1,000 deductible.
              </p>
              <p className="mt-1">
                Enclosed you will find the complete scope of loss, photographic evidence, and material specifications.
                We respectfully request a response within 15 business days.
              </p>
              <p className="mt-1 font-medium">Smart Construction Remodeling Inc.</p>
            </div>
          )}

          <div className="flex gap-2">
            <Btn color="#22c55e" size="sm" className="flex-1" onClick={() => {}}>
              <Download className="w-3.5 h-3.5 mr-1 inline" />Download All
            </Btn>
            <Btn color="#22c55e" variant="outline" size="sm" className="flex-1" onClick={() => setSent(true)}>
              <Send className="w-3.5 h-3.5 mr-1 inline" />{sent ? "Sent!" : "Send to Adjuster"}
            </Btn>
          </div>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 w-full text-center">Reset</button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Material Calculator                                             */
/* ------------------------------------------------------------------ */

function MaterialCalculator() {
  const nav = useNavigate();
  const [projectType, setProjectType] = useState("");
  const [sqft, setSqft] = useState("");
  const [grade, setGrade] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(false);

  const calculate = () => {
    setCalculating(true);
    setTimeout(() => { setCalculating(false); setResult(true); }, 1500);
  };

  const materials = [
    ["OC Duration Shingles", "26 squares", "$4,680"],
    ["Synthetic Underlayment", "26 sq", "$780"],
    ["Ice & Water Shield", "8 sq", "$520"],
    ["Drip Edge", "186 LF", "$223"],
    ["Ridge Vent", "42 LF", "$168"],
    ["Pipe Boots", "4", "$48"],
    ["Step Flashing", "24 pcs", "$72"],
    ["Nails", "6 boxes", "$96"],
  ];

  const reset = () => { setProjectType(""); setSqft(""); setGrade(""); setResult(false); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ background: "#a855f715" }}>
          <Calculator className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">AI Material Calculator</h3>
          <p className="text-xs text-gray-500">Enter project details &rarr; exact quantities + supplier order</p>
        </div>
      </div>

      {!result && !calculating && (
        <div className="space-y-3">
          <SmartSelect
            label="Project Type"
            value={projectType}
            onChange={setProjectType}
            options={["Roof", "Siding", "Windows", "Gutters", "Full Exterior"]}
            placeholder="Select project type..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
            <input
              type="number"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              placeholder="e.g. 2200"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>
          <SmartSelect
            label="Material Grade"
            value={grade}
            onChange={setGrade}
            options={["Good", "Better", "Best"]}
            placeholder="Select grade..."
          />
          <Btn color="#a855f7" onClick={calculate} disabled={!projectType || !sqft || !grade} className="w-full">
            Calculate Materials
          </Btn>
        </div>
      )}

      {calculating && (
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium">Calculating exact quantities...</p>
          <p className="text-xs text-gray-400">Cross-referencing supplier pricing</p>
        </div>
      )}

      {result && (
        <div className="space-y-3 text-sm">
          <Badge color="#a855f7">Materials Calculated</Badge>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="font-semibold text-xs text-gray-900 mb-1">Material List</div>
            {materials.map(([name, qty, cost]) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{name}</span>
                <div className="flex gap-3">
                  <span className="text-gray-500">{qty}</span>
                  <span className="text-gray-900 font-medium w-14 text-right">{cost}</span>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-sm">
              <span>Total Materials</span>
              <span className="text-purple-700">$6,587</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Btn color="#a855f7" size="sm" onClick={() => {}}>Order from ABC Supply</Btn>
            <Btn color="#a855f7" variant="outline" size="sm" onClick={() => {}}>Order from Menards</Btn>
            <Btn color="#6b7280" variant="outline" size="sm" onClick={() => {}}>Export CSV</Btn>
            <Btn color="#3b82f6" variant="outline" size="sm" onClick={() => nav("/estimates")}>Add to Estimate</Btn>
          </div>
          <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 w-full text-center">Reset</button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Voice Assistant for Crews                                          */
/* ------------------------------------------------------------------ */

function VoiceAssistant() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [attached, setAttached] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = () => {
    setRecording(true);
    setDone(false);
    setSeconds(0);
    setAttached(false);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => setDone(true), 500);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg" style={{ background: "#f59e0b15" }}>
          <Mic className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Voice Assistant for Crews</h3>
          <p className="text-xs text-gray-500">Hands-free job recording with GPS</p>
        </div>
      </div>

      {!recording && !done && (
        <div className="flex flex-col items-center py-6 gap-3">
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center transition shadow-lg hover:shadow-xl active:scale-95"
          >
            <Mic className="w-8 h-8 text-white" />
          </button>
          <p className="text-sm text-gray-600">Tap to start recording</p>
        </div>
      )}

      {recording && (
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="relative">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-400 animate-ping opacity-30" />
            <button
              onClick={stopRecording}
              className="relative w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition shadow-lg z-10"
            >
              <Square className="w-6 h-6 text-white fill-white" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-600">Recording... {fmt(seconds)}</span>
          </div>
          <p className="text-xs text-gray-500">Speak your update</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3" /> 44.9778&deg; N, 93.2650&deg; W
          </div>
        </div>
      )}

      {done && (
        <div className="space-y-3 text-sm">
          <Badge color="#f59e0b">Transcription Ready</Badge>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-gray-800 leading-relaxed">
            &ldquo;South slope tear-off complete. Found additional damage underneath &mdash; rotted decking on 3 sheets,
            approximately 24 square feet. Need to order 3 sheets of 7/16 OSB. Taking photos now.&rdquo;
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-3 h-3 text-blue-500" />
              Auto-detected: <span className="font-medium">Project MN-0247</span> (GPS match)
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Hash className="w-3 h-3 text-purple-500" />
              Tags: <Badge color="#a855f7" sm>#additional-damage</Badge>{" "}
              <Badge color="#f59e0b" sm>#materials-needed</Badge>{" "}
              <Badge color="#3b82f6" sm>#decking</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Btn color="#f59e0b" size="sm" onClick={() => setAttached(true)}>
              {attached ? "Attached!" : "Attach to Project"}
            </Btn>
            <Btn color="#f59e0b" variant="outline" size="sm" onClick={() => {}}>Create Change Order</Btn>
            <Btn color="#a855f7" variant="outline" size="sm" onClick={() => {}}>Order Materials</Btn>
            <Btn color="#6b7280" variant="outline" size="sm" onClick={() => {}}>Save Note</Btn>
          </div>
          <button onClick={() => { setDone(false); setRecording(false); }} className="text-xs text-gray-400 hover:text-gray-600 w-full text-center">
            Record new note
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Predictive Maintenance AI                                          */
/* ------------------------------------------------------------------ */

interface Customer {
  name: string;
  lastService: string;
  roofAge: string;
  nextService: string;
  prediction: string;
  urgent: boolean;
}

const customers: Customer[] = [
  { name: "Thompson", lastService: "Mar 2026", roofAge: "1 yr", nextService: "Mar 2031", prediction: "Gutter clean 2027", urgent: false },
  { name: "Garcia", lastService: "Mar 2026", roofAge: "1 yr", nextService: "Mar 2031", prediction: "Paint touch-up 2028", urgent: false },
  { name: "Chen", lastService: "Mar 2026", roofAge: "12 yr", nextService: "Jun 2026", prediction: "Roof inspection needed!", urgent: false },
  { name: "Park", lastService: "Feb 2026", roofAge: "8 yr", nextService: "Feb 2028", prediction: "Full inspection 2028", urgent: false },
  { name: "Johnson", lastService: "Jan 2025", roofAge: "15 yr", nextService: "NOW", prediction: "Roof replacement overdue!", urgent: true },
];

function PredictiveMaintenance() {
  const [sentOffers, setSentOffers] = useState<Set<string>>(new Set());
  const [autoSend, setAutoSend] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const sendOffer = (name: string) => {
    setSentOffers((prev) => new Set(prev).add(name));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ background: "#ef444415" }}>
          <TrendingUp className="w-5 h-5 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">Predictive Maintenance AI</h3>
          <p className="text-xs text-gray-500">AI predicts when customers need service</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              {["Customer", "Last Service", "Roof Age", "Next Service", "AI Prediction", "Action"].map((h) => (
                <th key={h} className="text-left py-2 px-2 text-gray-500 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.name} className={`border-b border-gray-100 ${c.urgent ? "bg-red-50" : ""}`}>
                <td className={`py-2 px-2 font-medium ${c.urgent ? "text-red-700" : "text-gray-900"}`}>
                  {c.name} {c.name === "Chen" && <span className="text-gray-400">(windows)</span>}
                </td>
                <td className="py-2 px-2 text-gray-600">{c.lastService}</td>
                <td className="py-2 px-2 text-gray-600">{c.roofAge}</td>
                <td className={`py-2 px-2 font-medium ${c.nextService === "NOW" ? "text-red-600" : "text-gray-600"}`}>
                  {c.nextService}
                </td>
                <td className="py-2 px-2">
                  {c.urgent ? (
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                      <AlertTriangle className="w-3 h-3" /> {c.prediction}
                    </span>
                  ) : (
                    <span className="text-gray-700">{c.prediction}</span>
                  )}
                </td>
                <td className="py-2 px-2">
                  {sentOffers.has(c.name) ? (
                    <Badge color="#22c55e">Sent</Badge>
                  ) : c.urgent ? (
                    <Btn color="#ef4444" size="sm" onClick={() => sendOffer(c.name)}>URGENT</Btn>
                  ) : (
                    <Btn color="#3b82f6" variant="outline" size="sm" onClick={() => sendOffer(c.name)}>Send Offer</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setAutoSend(!autoSend)}
            className={`w-9 h-5 rounded-full transition relative ${autoSend ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoSend ? "translate-x-4" : ""}`} />
          </div>
          <span className="text-xs text-gray-600">Auto-send maintenance offers</span>
        </label>
        <Btn
          color="#6b7280"
          variant="outline"
          size="sm"
          onClick={() => setReportGenerated(true)}
        >
          {reportGenerated ? "Report Generated!" : "Generate Annual Report"}
        </Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function AiToolsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-600" />
            AI Construction Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">5 AI-powered tools to accelerate your business</p>
        </div>
        <Badge color="#8b5cf6">
          <Sparkles className="w-3 h-3 mr-0.5" /> Powered by Smart Construction AI
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard icon={Camera} label="Photos Analyzed" value="1,247" sub="This month" color="#3b82f6" />
        <StatCard icon={Shield} label="Claims Prepared" value="89" sub="$2.1M recovered" color="#22c55e" />
        <StatCard icon={Calculator} label="Materials Calculated" value="342" sub="$890K ordered" color="#a855f7" />
        <StatCard icon={Mic} label="Voice Notes" value="2,150" sub="428 hrs saved" color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Maintenance Alerts" value="67" sub="$340K pipeline" color="#ef4444" />
      </div>

      {/* Tool Cards — 2 column grid */}
      <div className="grid grid-cols-2 gap-5">
        <PhotoEstimator />
        <InsuranceClaims />
        <MaterialCalculator />
        <VoiceAssistant />
        <PredictiveMaintenance />
      </div>
    </div>
  );
}
