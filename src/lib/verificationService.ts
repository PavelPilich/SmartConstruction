import type { RegistrantDoc } from "../types/registration";

interface VerificationResult {
  verified: boolean;
  checkedAt: string;
  source: string;
  message: string;
}

const SOURCES: Record<string, string> = {
  "W-9 Form": "IRS Database",
  "General Liability Insurance": "Insurance Carrier Database",
  "Workers Compensation Insurance": "MN Department of Labor & Industry",
  "State Contractor Registration": "MN Secretary of State",
  "Certificate of Insurance (COI)": "Insurance Carrier Database",
  "Non-Compete Agreement": "Legal Document Review",
  "Sales License": "MN Department of Commerce",
  "PMP Certification": "PMI Database",
  "Background Check": "National Background Check Service",
  "I-9 Employment Eligibility": "E-Verify / USCIS",
};

const SUCCESS_MESSAGES: Record<string, string> = {
  "W-9 Form": "EIN/SSN format validated, IRS records match",
  "General Liability Insurance": "Policy active, coverage meets minimum requirements ($1M+)",
  "Workers Compensation Insurance": "WC Policy active, compliant with MN state requirements",
  "State Contractor Registration": "License active and in good standing with MN Secretary of State",
  "Certificate of Insurance (COI)": "COI verified, Smart Construction listed as additional insured",
  "Non-Compete Agreement": "Document reviewed, properly executed and notarized",
  "Sales License": "Sales license active and in good standing",
  "PMP Certification": "PMP credential active and verified with PMI",
  "Background Check": "No disqualifying records found, cleared for employment",
  "I-9 Employment Eligibility": "Employment eligibility confirmed via E-Verify",
};

const FAIL_MESSAGES: Record<string, string> = {
  "W-9 Form": "EIN/SSN mismatch — name does not match IRS records",
  "General Liability Insurance": "Policy not found or coverage below minimum requirements",
  "Workers Compensation Insurance": "Policy lapsed or not found in MN DLI records",
  "State Contractor Registration": "License not found, expired, or revoked by MN Secretary of State",
  "Certificate of Insurance (COI)": "COI does not list Smart Construction as additional insured",
  "Background Check": "Disqualifying records found — review required",
};

export function simulateVerification(doc: RegistrantDoc): Promise<VerificationResult> {
  return new Promise((resolve) => {
    const delay = 1200 + Math.random() * 800; // 1.2–2s

    setTimeout(() => {
      const now = new Date().toISOString();
      const source = SOURCES[doc.formName] || "General Verification Service";

      // Auto-fail if expired
      if (doc.expirationDate && new Date(doc.expirationDate) < new Date()) {
        resolve({
          verified: false,
          checkedAt: now,
          source,
          message: `EXPIRED — Document expired on ${new Date(doc.expirationDate).toLocaleDateString()}`,
        });
        return;
      }

      // 85% success rate for simulation
      const success = Math.random() < 0.85;

      resolve({
        verified: success,
        checkedAt: now,
        source,
        message: success
          ? (SUCCESS_MESSAGES[doc.formName] || "Document verified successfully")
          : (FAIL_MESSAGES[doc.formName] || "Verification failed — document could not be confirmed"),
      });
    }, delay);
  });
}

export function getExpirationAlerts(registrants: { documents: RegistrantDoc[]; firstName: string; lastName: string; id: string }[]) {
  const now = new Date();
  const alerts: { registrantId: string; registrantName: string; docId: string; formName: string; daysUntilExpiry: number; tier: "warning" | "urgent" | "expired" }[] = [];

  for (const reg of registrants) {
    for (const doc of reg.documents) {
      if (!doc.expirationDate || doc.status === "pending") continue;
      const exp = new Date(doc.expirationDate);
      const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);

      if (days <= 0) {
        alerts.push({ registrantId: reg.id, registrantName: `${reg.firstName} ${reg.lastName}`, docId: doc.id, formName: doc.formName, daysUntilExpiry: days, tier: "expired" });
      } else if (days <= 7) {
        alerts.push({ registrantId: reg.id, registrantName: `${reg.firstName} ${reg.lastName}`, docId: doc.id, formName: doc.formName, daysUntilExpiry: days, tier: "urgent" });
      } else if (days <= 30) {
        alerts.push({ registrantId: reg.id, registrantName: `${reg.firstName} ${reg.lastName}`, docId: doc.id, formName: doc.formName, daysUntilExpiry: days, tier: "warning" });
      }
    }
  }

  return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}
