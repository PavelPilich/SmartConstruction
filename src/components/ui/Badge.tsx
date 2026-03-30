export function Badge({ color, children, sm }: { color: string; children: React.ReactNode; sm?: boolean }) {
  return (
    <span
      style={{ background: color + "18", color, border: `1px solid ${color}33` }}
      className={`${sm ? "px-1.5 py-0" : "px-2.5 py-0.5"} text-xs rounded-full font-semibold inline-flex items-center gap-0.5`}
    >
      {children}
    </span>
  );
}
