import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useRegistrationStore } from "../../stores/useRegistrationStore";
import { Badge, Btn, FileUploadSim } from "../../components/ui";
import type { Registrant, RegistrantDoc } from "../../types/registration";

const STEPS = ["Position", "Info", "Documents"] as const;

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { positions, addRegistrant } = useRegistrationStore();

  const [step, setStep] = useState(0);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [docs, setDocs] = useState<Record<string, { fileName: string; expiration: string }>>({});
  const [extraForms, setExtraForms] = useState<string[]>([]);
  const [extraDocName, setExtraDocName] = useState("");

  const selectedPosition = positions.find((p) => p.id === selectedPositionId);

  /* ── helpers ── */
  const isFormValid = form.firstName && form.lastName && form.email && form.phone && form.company;

  const allForms = selectedPosition ? [...selectedPosition.requiredForms, ...extraForms] : [];
  const uploadedCount = allForms.filter((f) => docs[f]?.fileName).length;

  const handleNext = () => {
    if (step === 0 && !selectedPositionId) return;
    if (step === 1) {
      setTouched({ firstName: true, lastName: true, email: true, phone: true, company: true });
      if (!isFormValid) return;
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    if (!selectedPosition) return;

    const documents: RegistrantDoc[] = [...selectedPosition.requiredForms, ...extraForms].map((formName) => {
      const d = docs[formName];
      return {
        id: crypto.randomUUID(),
        formName,
        status: d?.fileName ? "uploaded" : "pending",
        fileName: d?.fileName || "",
        uploadedAt: d?.fileName ? new Date().toISOString() : null,
        expirationDate: d?.expiration || null,
        verificationResult: null,
        rejectionReason: null,
      };
    });

    const registrant: Registrant = {
      id: crypto.randomUUID(),
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      company: form.company,
      positionId: selectedPosition.id,
      status: "pending_review",
      blockedReason: null,
      documents,
      registeredAt: new Date().toISOString(),
      lastVerifiedAt: null,
      notes: "",
    };

    addRegistrant(registrant);
    navigate("/register/success");
  };

  /* ── field helper ── */
  const fieldErr = (key: string) => touched[key] && !form[key as keyof typeof form];

  const inputCls = (key: string) =>
    `w-full px-3 py-2 text-sm rounded-lg border ${fieldErr(key) ? "border-red-400 bg-red-50" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`;

  /* ── render ── */
  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step
                    ? "bg-blue-600 text-white"
                    : i === step
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${i <= step ? "text-blue-700" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 mb-5 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Select Position */}
      {step === 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select Your Position</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Choose the role you'll be filling at Smart Construction
          </p>

          <div className="grid gap-3">
            {positions.map((pos) => (
              <button
                key={pos.id}
                onClick={() => setSelectedPositionId(pos.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedPositionId === pos.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge color={pos.color}>{pos.name}</Badge>
                  <span className="text-xs text-gray-400">{pos.requiredForms.length} docs required</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pos.requiredForms.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                    >
                      <FileText className="w-3 h-3" />
                      {f}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Btn onClick={handleNext} disabled={!selectedPositionId}>
              Next <ChevronRight className="w-4 h-4 inline ml-1" />
            </Btn>
          </div>
        </div>
      )}

      {/* Step 2 — Contact Information */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Information</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">Please fill in your contact details</p>

          <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls("firstName")}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  onBlur={() => setTouched({ ...touched, firstName: true })}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls("lastName")}
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  onBlur={() => setTouched({ ...touched, lastName: true })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={inputCls("email")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={inputCls("phone")}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                onBlur={() => setTouched({ ...touched, phone: true })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls("company")}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                onBlur={() => setTouched({ ...touched, company: true })}
                placeholder="Your Company LLC"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Btn variant="outline" onClick={handleBack}>
              Back
            </Btn>
            <Btn onClick={handleNext} disabled={!isFormValid}>
              Next <ChevronRight className="w-4 h-4 inline ml-1" />
            </Btn>
          </div>
        </div>
      )}

      {/* Step 3 — Upload Documents */}
      {step === 2 && selectedPosition && (
        <div>
          <h2 className="text-xl font-bold text-gray-900">Required Documents</h2>
          <p className="text-sm text-gray-500 mt-1 mb-2">
            Upload the documents required for <span className="font-semibold">{selectedPosition.name}</span>
          </p>
          <p className="text-xs text-blue-600 font-medium mb-6">
            {uploadedCount} of {allForms.length} documents uploaded
          </p>

          <div className="space-y-3">
            {allForms.map((formName) => {
              const isExtra = extraForms.includes(formName);
              const d = docs[formName] || { fileName: "", expiration: "" };
              return (
                <div key={formName} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-800 flex-1">{formName}</span>
                    {isExtra && (
                      <button onClick={() => {
                        setExtraForms((prev) => prev.filter((f) => f !== formName));
                        setDocs((prev) => { const n = { ...prev }; delete n[formName]; return n; });
                      }} className="text-gray-400 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {!isExtra && <Badge color="#3b82f6" sm>Required</Badge>}
                    {isExtra && <Badge color="#8b5cf6" sm>Additional</Badge>}
                  </div>

                  <FileUploadSim
                    fileName={d.fileName}
                    label={formName}
                    onUpload={(name) =>
                      setDocs((prev) => ({ ...prev, [formName]: { ...prev[formName], fileName: name, expiration: prev[formName]?.expiration || "" } }))
                    }
                    onClear={() =>
                      setDocs((prev) => ({ ...prev, [formName]: { fileName: "", expiration: prev[formName]?.expiration || "" } }))
                    }
                  />

                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Expiration date (optional)</label>
                    <input
                      type="date"
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={d.expiration}
                      onChange={(e) =>
                        setDocs((prev) => ({ ...prev, [formName]: { ...prev[formName], fileName: prev[formName]?.fileName || "", expiration: e.target.value } }))
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add additional document */}
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 mt-3">
            <p className="text-xs text-gray-500 mb-2">Have additional documents to submit? Add them here:</p>
            <div className="flex gap-2">
              <input
                value={extraDocName}
                onChange={(e) => setExtraDocName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && extraDocName.trim()) {
                    const name = extraDocName.trim();
                    if (allForms.includes(name)) return;
                    setExtraForms((prev) => [...prev, name]);
                    setExtraDocName("");
                  }
                }}
                placeholder="e.g. EPA Lead Certification, Business License..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Btn color="#8b5cf6" size="sm" onClick={() => {
                const name = extraDocName.trim();
                if (!name || allForms.includes(name)) return;
                setExtraForms((prev) => [...prev, name]);
                setExtraDocName("");
              }}>
                <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Doc</span>
              </Btn>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Btn variant="outline" onClick={handleBack}>
              Back
            </Btn>
            <Btn color="#10b981" onClick={handleSubmit}>
              Submit Registration
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
