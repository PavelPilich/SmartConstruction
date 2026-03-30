import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileSearch, ShieldCheck, Mail } from "lucide-react";
import { Btn } from "../../components/ui";

const NEXT_STEPS = [
  { icon: FileSearch, text: "Our team will review your documents" },
  { icon: ShieldCheck, text: "Documents will be verified with state and federal databases" },
  { icon: Mail, text: "You'll receive an email once approved" },
] as const;

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const refNumber = useMemo(() => `REG-${Date.now().toString(36).toUpperCase()}`, []);

  return (
    <div className="flex flex-col items-center text-center py-8">
      {/* Checkmark */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Registration Submitted!</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-md">
        Thank you for registering. Your documents are now under review.
      </p>

      <p className="text-xs text-gray-400 mt-3">
        Reference number: <span className="font-mono font-semibold text-gray-600">{refNumber}</span>
      </p>

      {/* What happens next */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mt-8 w-full max-w-md text-left">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">What happens next?</h3>
        <ol className="space-y-4">
          {NEXT_STEPS.map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <span className="text-xs font-medium text-gray-400">Step {i + 1}</span>
                <p className="text-sm text-gray-700">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="mt-8">
        <Btn onClick={() => navigate("/register")}>Register Another Person</Btn>
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-4 text-xs text-gray-400 hover:text-blue-600 underline transition"
      >
        Back to main site
      </button>
    </div>
  );
}
