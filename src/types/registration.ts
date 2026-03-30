export interface PositionType {
  id: string;
  name: string;
  color: string;
  requiredForms: string[];
  isDefault: boolean;
}

export interface RegistrantDoc {
  id: string;
  formName: string;
  status: "pending" | "uploaded" | "verified" | "rejected" | "expired";
  fileName: string;
  uploadedAt: string | null;
  expirationDate: string | null;
  verificationResult: null | {
    verified: boolean;
    checkedAt: string;
    source: string;
    message: string;
  };
  rejectionReason: string | null;
}

export type RegistrantStatus = "pending_review" | "active" | "blocked" | "rejected";

export interface Registrant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  positionId: string;
  status: RegistrantStatus;
  blockedReason: string | null;
  documents: RegistrantDoc[];
  registeredAt: string;
  lastVerifiedAt: string | null;
  notes: string;
}

export const DOC_STATUS_COLORS: Record<RegistrantDoc["status"], string> = {
  pending: "#94a3b8",
  uploaded: "#3b82f6",
  verified: "#10b981",
  rejected: "#ef4444",
  expired: "#ef4444",
};

export const REGISTRANT_STATUS_COLORS: Record<RegistrantStatus, string> = {
  pending_review: "#f59e0b",
  active: "#10b981",
  blocked: "#ef4444",
  rejected: "#94a3b8",
};

export const REGISTRANT_STATUS_LABELS: Record<RegistrantStatus, string> = {
  pending_review: "Pending Review",
  active: "Active",
  blocked: "Blocked",
  rejected: "Rejected",
};
