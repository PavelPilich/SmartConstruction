import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HardHat, Phone, Mail, KeyRound, ArrowRight } from "lucide-react";
import { useSubAuth } from "../../components/layout/SubPortalLayout";
import { Btn } from "../../components/ui";

export default function SubLoginPage() {
  const navigate = useNavigate();
  const { login } = useSubAuth();
  const [step, setStep] = useState<"contact" | "verify">("contact");
  const [contactMethod, setContactMethod] = useState<"phone" | "email">("phone");
  const [contactValue, setContactValue] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = () => {
    if (!contactValue.trim()) {
      setError(contactMethod === "phone" ? "Please enter your phone number" : "Please enter your email address");
      return;
    }
    setError("");
    setStep("verify");
  };

  const handleVerify = () => {
    if (code !== "123456") {
      setError("Invalid code. Demo code is 123456");
      return;
    }
    setError("");
    login("Mike Rodriguez", "Rodriguez Roofing LLC");
    navigate("/sub/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <HardHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Subcontractor Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Smart Construction & Remodeling Inc.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {step === "contact" && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sign In</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your registered phone number or email to receive a verification code.
              </p>

              {/* Toggle phone/email */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  onClick={() => { setContactMethod("phone"); setContactValue(""); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition ${
                    contactMethod === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  <Phone className="w-4 h-4" /> Phone
                </button>
                <button
                  onClick={() => { setContactMethod("email"); setContactValue(""); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition ${
                    contactMethod === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>

              <input
                type={contactMethod === "phone" ? "tel" : "email"}
                value={contactValue}
                onChange={(e) => { setContactValue(e.target.value); setError(""); }}
                placeholder={contactMethod === "phone" ? "(612) 555-0199" : "mike@rodriguezroofing.com"}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 mb-4"
                onKeyDown={(e) => { if (e.key === "Enter") handleSendCode(); }}
              />

              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

              <Btn color="#ea580c" onClick={handleSendCode} className="w-full flex items-center justify-center gap-2">
                Send Verification Code <ArrowRight className="w-4 h-4" />
              </Btn>
            </>
          )}

          {step === "verify" && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Enter Verification Code</h2>
              <p className="text-sm text-gray-500 mb-6">
                We sent a 6-digit code to <span className="font-medium text-gray-700">{contactValue}</span>
              </p>

              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  placeholder="123456"
                  maxLength={6}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm text-center tracking-[0.5em] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                  onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                  autoFocus
                />
              </div>

              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

              <Btn color="#ea580c" onClick={handleVerify} className="w-full flex items-center justify-center gap-2">
                Verify & Sign In <ArrowRight className="w-4 h-4" />
              </Btn>

              <button
                onClick={() => { setStep("contact"); setCode(""); setError(""); }}
                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Back to contact info
              </button>
            </>
          )}
        </div>

        {/* Demo hint */}
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <p className="text-xs text-orange-700">
            <span className="font-bold">Demo:</span> Enter any phone/email, then use code <span className="font-mono font-bold">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
