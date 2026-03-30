import { useAppStore } from "../../stores/useAppStore";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white min-w-[280px] animate-in ${
          t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-blue-600"
        }`}>
          {t.type === "success" && <CheckCircle2 className="w-4 h-4" />}
          {t.type === "error" && <XCircle className="w-4 h-4" />}
          {t.type === "info" && <Info className="w-4 h-4" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="p-0.5 hover:bg-white/20 rounded"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}
