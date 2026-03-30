import { create } from "zustand";
import type { PositionType, Registrant, RegistrantDoc } from "../types/registration";
import { DEFAULT_POSITIONS, MOCK_REGISTRANTS } from "../data/registrationMockData";
import { simulateVerification } from "../lib/verificationService";

interface RegistrationState {
  positions: PositionType[];
  registrants: Registrant[];

  /* Position actions */
  addPosition: (pos: PositionType) => void;
  updatePosition: (id: string, updates: Partial<PositionType>) => void;
  removePosition: (id: string) => void;

  /* Registrant actions */
  addRegistrant: (reg: Registrant) => void;
  updateRegistrant: (id: string, updates: Partial<Registrant>) => void;
  removeRegistrant: (id: string) => void;
  updateRegistrantDoc: (registrantId: string, docId: string, updates: Partial<RegistrantDoc>) => void;

  /* Verification */
  verifyDocument: (registrantId: string, docId: string) => Promise<void>;

  /* Compliance checking */
  checkExpiredDocs: () => string[];  // returns list of auto-blocked registrant IDs
  unblockRegistrant: (id: string) => void;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  positions: [...DEFAULT_POSITIONS],
  registrants: [...MOCK_REGISTRANTS],

  addPosition: (pos) => set((s) => ({ positions: [...s.positions, pos] })),
  updatePosition: (id, updates) => set((s) => ({
    positions: s.positions.map((p) => (p.id === id ? { ...p, ...updates } : p)),
  })),
  removePosition: (id) => set((s) => ({
    positions: s.positions.filter((p) => p.id !== id),
  })),

  addRegistrant: (reg) => set((s) => ({ registrants: [...s.registrants, reg] })),
  updateRegistrant: (id, updates) => set((s) => ({
    registrants: s.registrants.map((r) => (r.id === id ? { ...r, ...updates } : r)),
  })),
  removeRegistrant: (id) => set((s) => ({
    registrants: s.registrants.filter((r) => r.id !== id),
  })),

  updateRegistrantDoc: (registrantId, docId, updates) => set((s) => ({
    registrants: s.registrants.map((r) =>
      r.id === registrantId
        ? { ...r, documents: r.documents.map((d) => (d.id === docId ? { ...d, ...updates } : d)) }
        : r
    ),
  })),

  verifyDocument: async (registrantId, docId) => {
    const state = get();
    const reg = state.registrants.find((r) => r.id === registrantId);
    const doc = reg?.documents.find((d) => d.id === docId);
    if (!reg || !doc) return;

    const result = await simulateVerification(doc);
    set((s) => ({
      registrants: s.registrants.map((r) =>
        r.id === registrantId
          ? {
              ...r,
              documents: r.documents.map((d) =>
                d.id === docId
                  ? {
                      ...d,
                      status: result.verified ? "verified" : (d.expirationDate && new Date(d.expirationDate) < new Date() ? "expired" : "rejected"),
                      verificationResult: result,
                    }
                  : d
              ),
              lastVerifiedAt: new Date().toISOString(),
            }
          : r
      ),
    }));

    // Re-check blocking after verification
    get().checkExpiredDocs();
  },

  checkExpiredDocs: () => {
    const now = new Date();
    const blockedIds: string[] = [];

    set((s) => ({
      registrants: s.registrants.map((reg) => {
        const pos = s.positions.find((p) => p.id === reg.positionId);
        if (!pos) return reg;

        const expiredDocs = reg.documents.filter(
          (d) => d.expirationDate && new Date(d.expirationDate) < now && d.status !== "expired"
        );

        // Mark expired docs
        const updatedDocs = reg.documents.map((d) => {
          if (d.expirationDate && new Date(d.expirationDate) < now && d.status !== "expired" && d.status !== "pending") {
            return { ...d, status: "expired" as const };
          }
          return d;
        });

        const hasExpired = updatedDocs.some((d) => d.status === "expired");
        const expiredNames = updatedDocs.filter((d) => d.status === "expired").map((d) => d.formName);

        if (hasExpired && reg.status !== "rejected") {
          blockedIds.push(reg.id);
          return {
            ...reg,
            documents: updatedDocs,
            status: "blocked" as const,
            blockedReason: expiredNames.join(", ") + " expired",
          };
        }

        // Auto-unblock if all expired docs are now renewed
        if (reg.status === "blocked" && !hasExpired) {
          return { ...reg, documents: updatedDocs, status: "active" as const, blockedReason: null };
        }

        return { ...reg, documents: updatedDocs };
      }),
    }));

    return blockedIds;
  },

  unblockRegistrant: (id) => set((s) => ({
    registrants: s.registrants.map((r) =>
      r.id === id ? { ...r, status: "active", blockedReason: null } : r
    ),
  })),
}));
