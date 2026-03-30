import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { Btn } from "../../components/ui";
import { usePortalAuth } from "../../components/layout/PortalLayout";

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn } = usePortalAuth();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect
  if (isLoggedIn) {
    navigate("/portal/overview", { replace: true });
    return null;
  }

  const handleSendCode = () => {
    if (phone.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStep("verify");
      setCode("123456");
    }, 1000);
  };

  const handleVerify = () => {
    if (code !== "123456") {
      setError("Invalid verification code. For demo, use 123456");
      return;
    }
    setError("");
    setVerifying(true);
    setTimeout(() => {
      login("Robert Johnson", phone);
      setVerifying(false);
      navigate("/portal/overview", { replace: true });
    }, 800);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Welcome to Your Project Portal</h2>
            <p className="text-blue-200 text-sm mt-1">Track your project progress in real time</p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-5">
            {step === "phone" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(formatPhone(e.target.value));
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    placeholder="(612) 555-0199"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Btn
                  color="#3b82f6"
                  size="lg"
                  className="w-full"
                  onClick={handleSendCode}
                  disabled={sending}
                >
                  {sending ? (
                    "Sending Code..."
                  ) : (
                    <>Send Verification Code <ArrowRight className="w-4 h-4 inline ml-1.5" /></>
                  )}
                </Btn>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <ShieldCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-green-700">Verification code sent to <strong>{phone}</strong></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Btn
                  color="#3b82f6"
                  size="lg"
                  className="w-full"
                  onClick={handleVerify}
                  disabled={verifying || code.length !== 6}
                >
                  {verifying ? "Verifying..." : "Verify & Enter Portal"}
                </Btn>
                <button
                  onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                  className="w-full text-sm text-gray-500 hover:text-blue-600 transition"
                >
                  Use a different number
                </button>
              </>
            )}
          </div>

          {/* Demo note */}
          <div className="bg-amber-50 border-t border-amber-200 px-8 py-3 text-center">
            <p className="text-xs text-amber-700">
              <strong>Demo:</strong> Use any phone number and code <span className="font-mono font-bold">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
