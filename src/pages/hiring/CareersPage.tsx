import { useState, useEffect } from "react";
import {
  Building2, Users, Star, DollarSign, Heart, MapPin, Clock, Briefcase,
  CheckCircle2, ArrowLeft, Send,
} from "lucide-react";
import { Badge, Btn, SmartSelect, FileUploadSim } from "../../components/ui";

/* ── types ── */
interface OpenPosition {
  id: string;
  title: string;
  department: string;
  type: string;
  payRange: string;
  location: string;
}

/* ── mock open positions ── */
const openPositions: OpenPosition[] = [
  { id: "pos-1", title: "Roofing Crew Lead", department: "Construction", type: "Full-time", payRange: "$28-$38/hr", location: "Minneapolis, MN" },
  { id: "pos-2", title: "Sales Representative", department: "Sales", type: "Full-time", payRange: "$50K-$75K + Commission", location: "Minneapolis, MN" },
  { id: "pos-3", title: "Drone Operator / Inspector", department: "Inspections", type: "Full-time", payRange: "$25-$35/hr", location: "Minneapolis, MN" },
];

const CERTIFICATIONS = [
  "OSHA 10-Hour",
  "OSHA 30-Hour",
  "CDL",
  "MN Contractor License",
  "FAA Part 107",
  "CPR/First Aid",
];

/* ── component ── */
export default function CareersPage() {
  const [selectedPos, setSelectedPos] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState("");

  /* form state */
  const [form, setForm] = useState({
    position: "",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    state: "MN",
    zip: "",
    workHistory: "",
    yearsExperience: "",
    certifications: [] as string[],
    whyApply: "",
    resumeFile: "",
    heardFrom: "",
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function handleApply(posId: string) {
    const pos = openPositions.find((p) => p.id === posId);
    if (pos) {
      setForm((prev) => ({ ...prev, position: pos.title }));
      setSelectedPos(posId);
    }
  }

  function toggleCert(cert: string) {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  }

  function handleSubmit() {
    if (!form.fullName || !form.email || !form.phone || !form.position) {
      setToast("Please fill in all required fields");
      return;
    }
    setSubmitted(true);
  }

  /* ── Submitted confirmation ── */
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Application Received!</h1>
        <p className="text-gray-600 text-lg mb-2">
          Thank you, <span className="font-semibold">{form.fullName}</span>. Your application for{" "}
          <span className="font-semibold">{form.position}</span> has been submitted.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6 text-left max-w-lg mx-auto space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">Our AI screening system will review your application within 24 hours</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">If you are a strong match, we will contact you to schedule an interview</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">You will receive a confirmation email at <span className="font-medium">{form.email}</span></p>
          </div>
        </div>
        <div className="mt-8">
          <Btn color="#3b82f6" onClick={() => { setSubmitted(false); setSelectedPos(null); setForm({ position: "", fullName: "", email: "", phone: "", city: "", state: "MN", zip: "", workHistory: "", yearsExperience: "", certifications: [], whyApply: "", resumeFile: "", heardFrom: "" }); }}>
            View Other Positions
          </Btn>
        </div>
      </div>
    );
  }

  /* ── Application form ── */
  if (selectedPos) {
    const pos = openPositions.find((p) => p.id === selectedPos)!;
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedPos(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Positions
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <h1 className="text-2xl font-bold mb-1">Apply: {pos.title}</h1>
            <div className="flex items-center gap-3 text-blue-100 text-sm">
              <span>{pos.department}</span>
              <span>{pos.type}</span>
              <span>{pos.payRange}</span>
              <span>{pos.location}</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                value={form.position}
                readOnly
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-700"
              />
            </div>

            {/* Name, Email, Phone */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@email.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(612) 555-0123"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Minneapolis"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="MN"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  placeholder="55401"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Work History */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work History</label>
              <textarea
                value={form.workHistory}
                onChange={(e) => setForm({ ...form, workHistory: e.target.value })}
                rows={4}
                placeholder="List your relevant work experience, including company names, roles, and dates..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none resize-y"
              />
            </div>

            {/* Years Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                placeholder="e.g. 5"
                className="w-32 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
              />
            </div>

            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
              <div className="grid grid-cols-2 gap-2">
                {CERTIFICATIONS.map((cert) => (
                  <label
                    key={cert}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                      form.certifications.includes(cert)
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.certifications.includes(cert)}
                      onChange={() => toggleCert(cert)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-800">{cert}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Why apply */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Why do you want to work at Smart Construction?
              </label>
              <textarea
                value={form.whyApply}
                onChange={(e) => setForm({ ...form, whyApply: e.target.value })}
                rows={3}
                placeholder="Tell us what attracted you to Smart Construction..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none resize-y"
              />
            </div>

            {/* Resume upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume</label>
              <FileUploadSim
                fileName={form.resumeFile}
                onUpload={(f) => setForm({ ...form, resumeFile: f })}
                onClear={() => setForm({ ...form, resumeFile: "" })}
                label="Resume"
              />
            </div>

            {/* How heard */}
            <SmartSelect
              label="How did you hear about us?"
              value={form.heardFrom}
              onChange={(v) => setForm({ ...form, heardFrom: v })}
              options={["Indeed", "Facebook", "Friend/Referral", "LinkedIn", "Google", "Other"]}
              placeholder="Select..."
            />

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100">
              <Btn color="#3b82f6" size="lg" className="w-full" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2 inline" /> Submit Application
              </Btn>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-yellow-400" /> {toast}
          </div>
        )}
      </div>
    );
  }

  /* ── Main careers page ── */
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white rounded-2xl p-10 mb-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3">Build Your Career with Smart Construction</h1>
        <p className="text-blue-100 text-lg max-w-xl mx-auto">
          Minnesota's fastest-growing construction company. Competitive pay, great benefits, career growth.
        </p>
      </div>

      {/* Company highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-500">Employees</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">4.9</div>
          <div className="text-sm text-gray-500">Rating</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">$900K+</div>
          <div className="text-sm text-gray-500">Annual Revenue</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:shadow-md transition">
          <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">Full</div>
          <div className="text-sm text-gray-500">Benefits Package</div>
        </div>
      </div>

      {/* Open Positions */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Open Positions</h2>
      {openPositions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No Positions Available</h3>
          <p className="text-sm text-gray-500 mt-1">
            Check back soon! We are always growing and new positions open regularly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {openPositions.map((pos) => (
            <div
              key={pos.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{pos.title}</h3>
                    <Badge color={pos.department === "Construction" ? "#7c3aed" : pos.department === "Sales" ? "#3b82f6" : "#10b981"}>
                      {pos.department}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {pos.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> {pos.payRange}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {pos.location}
                    </span>
                  </div>
                </div>
                <Btn color="#3b82f6" onClick={() => handleApply(pos.id)}>
                  Apply Now
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Benefits section */}
      <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Work With Us?</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: DollarSign, title: "Competitive Pay", desc: "Above-market wages with regular raises and performance bonuses" },
            { icon: Heart, title: "Full Benefits", desc: "Health, dental, vision, 401(k) with match, and paid time off" },
            { icon: Users, title: "Great Team", desc: "Work alongside experienced professionals in a supportive environment" },
            { icon: Star, title: "Career Growth", desc: "Training programs and clear paths for advancement" },
            { icon: Building2, title: "Stability", desc: "Year-round work with a rapidly growing company" },
            { icon: Clock, title: "Work-Life Balance", desc: "Reasonable hours with overtime available when you want it" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
