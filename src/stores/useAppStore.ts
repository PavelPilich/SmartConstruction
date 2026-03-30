import { create } from "zustand";
import type { Estimate, LineItem, Supplement } from "../types";
import { estimates as mockEstimates, supplements as mockSupplements } from "../data/mockData";

interface AppState {
  // Estimates
  estimates: Estimate[];
  addEstimate: (est: Estimate) => void;
  updateEstimate: (id: string, updates: Partial<Estimate>) => void;
  duplicateEstimate: (id: string) => void;
  addLineToEstimate: (estimateId: string, line: LineItem) => void;
  removeLineFromEstimate: (estimateId: string, lineIndex: number) => void;

  // Supplements
  supplements: Supplement[];
  addSupplement: (sup: Supplement) => void;
  updateSupplement: (id: string, updates: Partial<Supplement>) => void;

  // Toast notifications
  toasts: { id: string; message: string; type: "success" | "error" | "info" }[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

let toastId = 0;

export const useAppStore = create<AppState>((set, get) => ({
  // Estimates
  estimates: mockEstimates,
  addEstimate: (est) => set((s) => ({ estimates: [...s.estimates, est] })),
  updateEstimate: (id, updates) =>
    set((s) => ({
      estimates: s.estimates.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  duplicateEstimate: (id) => {
    const est = get().estimates.find((e) => e.id === id);
    if (!est) return;
    const newId = `XE-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const dup: Estimate = {
      ...est,
      id: newId,
      project: `MN-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: "draft",
      dateCreated: new Date().toISOString().split("T")[0],
      dateApproved: null,
      version: 1,
    };
    set((s) => ({ estimates: [...s.estimates, dup] }));
    get().addToast(`Estimate duplicated as ${newId}`);
  },
  addLineToEstimate: (estimateId, line) =>
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== estimateId) return e;
        const newLines = [...e.lines, line];
        const totalRCV = newLines.reduce((a, l) => a + l.total, 0);
        return { ...e, lines: newLines, totalRCV, totalACV: totalRCV * 0.85, depreciation: totalRCV * 0.15 };
      }),
    })),
  removeLineFromEstimate: (estimateId, lineIndex) =>
    set((s) => ({
      estimates: s.estimates.map((e) => {
        if (e.id !== estimateId) return e;
        const newLines = e.lines.filter((_, i) => i !== lineIndex);
        const totalRCV = newLines.reduce((a, l) => a + l.total, 0);
        return { ...e, lines: newLines, totalRCV, totalACV: totalRCV * 0.85, depreciation: totalRCV * 0.15 };
      }),
    })),

  // Supplements
  supplements: mockSupplements,
  addSupplement: (sup) => set((s) => ({ supplements: [...s.supplements, sup] })),
  updateSupplement: (id, updates) =>
    set((s) => ({
      supplements: s.supplements.map((sup) => (sup.id === id ? { ...sup, ...updates } : sup)),
    })),

  // Toasts
  toasts: [],
  addToast: (message, type = "success") => {
    const id = String(++toastId);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 3000);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
