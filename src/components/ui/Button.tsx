export function Btn({
  children, color = "#3b82f6", variant = "solid", onClick, disabled, className = "", size = "md",
}: {
  children: React.ReactNode; color?: string; variant?: "solid" | "outline"; onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean; className?: string; size?: "sm" | "md" | "lg";
}) {
  const b = size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-3 text-sm" : "px-4 py-2 text-sm";
  if (variant === "solid")
    return (
      <button onClick={onClick} disabled={disabled} style={{ background: color }}
        className={`${b} text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-40 ${className}`}>
        {children}
      </button>
    );
  return (
    <button onClick={onClick} disabled={disabled} style={{ color, borderColor: color + "55" }}
      className={`${b} bg-transparent border rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-40 ${className}`}>
      {children}
    </button>
  );
}
