import type { LucideIcon } from "lucide-react";

export function StatCard({ icon: Icon, label, value, sub, color = "#3b82f6", onClick }: {
  icon: LucideIcon; label: string; value: string | number; sub?: string; color?: string; onClick?: () => void;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition ${onClick ? "cursor-pointer hover:border-blue-300 active:scale-[0.98]" : ""}`} onClick={onClick}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-500 text-xs font-medium">{label}</span>
        <div style={{ background: color + "15" }} className="p-1.5 rounded-lg">
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}
