import { useState, useRef, useEffect } from "react";
import { Plus, Check } from "lucide-react";

interface SmartSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddNew?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function SmartSelect({
  value,
  onChange,
  options,
  onAddNew,
  placeholder = "Select...",
  label,
  required,
  className = "",
}: SmartSelectProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setNewValue("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const handleAddNew = () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    if (onAddNew) onAddNew(trimmed);
    onChange(trimmed);
    setNewValue("");
    setAdding(false);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white text-left flex items-center justify-between"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 flex items-center justify-between transition"
            >
              <span className="text-gray-900">{opt}</span>
              {value === opt && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}

          {/* Add New */}
          {onAddNew && !adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full px-3 py-2 text-sm text-left text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 border-t border-gray-100 font-medium transition"
            >
              <Plus className="w-4 h-4" /> Add New...
            </button>
          )}

          {onAddNew && adding && (
            <div className="p-2 border-t border-gray-100 flex gap-2">
              <input
                ref={inputRef}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddNew(); if (e.key === "Escape") { setAdding(false); setNewValue(""); } }}
                placeholder="Type new value..."
                className="flex-1 px-2 py-1.5 text-sm rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={handleAddNew}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
