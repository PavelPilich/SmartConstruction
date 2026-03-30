import type { PositionType, Registrant } from "../types/registration";

export const DEFAULT_POSITIONS: PositionType[] = [
  {
    id: "pos-sub", name: "Subcontractor", color: "#ef4444", isDefault: true,
    requiredForms: ["W-9 Form", "General Liability Insurance", "Workers Compensation Insurance", "State Contractor Registration", "Certificate of Insurance (COI)"],
  },
  {
    id: "pos-sales", name: "Salesperson", color: "#3b82f6", isDefault: true,
    requiredForms: ["W-9 Form", "Non-Compete Agreement", "Sales License"],
  },
  {
    id: "pos-pm", name: "Project Manager", color: "#8b5cf6", isDefault: true,
    requiredForms: ["W-9 Form", "PMP Certification", "Background Check"],
  },
  {
    id: "pos-labor", name: "General Laborer", color: "#f59e0b", isDefault: true,
    requiredForms: ["W-9 Form", "I-9 Employment Eligibility"],
  },
];

export const MOCK_REGISTRANTS: Registrant[] = [
  {
    id: "reg-001", firstName: "Viktor", lastName: "Petrov", email: "viktor@petrovroofing.com", phone: "(612) 555-0101", company: "Petrov Roofing LLC",
    positionId: "pos-sub", status: "active", blockedReason: null, registeredAt: "2026-01-15T10:00:00Z", lastVerifiedAt: "2026-02-20T14:00:00Z", notes: "Verified by SoS on Feb 20",
    documents: [
      { id: "d1", formName: "W-9 Form", status: "verified", fileName: "w9-petrov-roofing.pdf", uploadedAt: "2026-01-15", expirationDate: null, verificationResult: { verified: true, checkedAt: "2026-01-16", source: "IRS Database", message: "EIN 41-XXXXXXX validated" }, rejectionReason: null },
      { id: "d2", formName: "General Liability Insurance", status: "verified", fileName: "liability-insurance-petrov.pdf", uploadedAt: "2026-01-15", expirationDate: "2027-01-15", verificationResult: { verified: true, checkedAt: "2026-01-16", source: "Insurance Carrier DB", message: "Policy #GL-449821 active, $2M coverage" }, rejectionReason: null },
      { id: "d3", formName: "Workers Compensation Insurance", status: "verified", fileName: "workers-comp-petrov.pdf", uploadedAt: "2026-01-15", expirationDate: "2027-01-15", verificationResult: { verified: true, checkedAt: "2026-01-16", source: "MN DLI", message: "WC Policy active, MN License" }, rejectionReason: null },
      { id: "d4", formName: "State Contractor Registration", status: "verified", fileName: "state-reg-petrov.pdf", uploadedAt: "2026-01-15", expirationDate: "2027-06-30", verificationResult: { verified: true, checkedAt: "2026-01-16", source: "MN Secretary of State", message: "License #CR-20198 active, good standing" }, rejectionReason: null },
      { id: "d5", formName: "Certificate of Insurance (COI)", status: "verified", fileName: "coi-petrov.pdf", uploadedAt: "2026-01-15", expirationDate: "2027-01-15", verificationResult: { verified: true, checkedAt: "2026-01-16", source: "Insurance Carrier DB", message: "COI verified, names Smart Construction as additional insured" }, rejectionReason: null },
    ],
  },
  {
    id: "reg-002", firstName: "Maria", lastName: "Santos", email: "maria@santossales.com", phone: "(651) 555-0202", company: "Santos Sales Group",
    positionId: "pos-sales", status: "pending_review", blockedReason: null, registeredAt: "2026-03-28T09:30:00Z", lastVerifiedAt: null, notes: "",
    documents: [
      { id: "d6", formName: "W-9 Form", status: "uploaded", fileName: "w9-santos.pdf", uploadedAt: "2026-03-28", expirationDate: null, verificationResult: null, rejectionReason: null },
      { id: "d7", formName: "Non-Compete Agreement", status: "uploaded", fileName: "nca-santos-signed.pdf", uploadedAt: "2026-03-28", expirationDate: null, verificationResult: null, rejectionReason: null },
      { id: "d8", formName: "Sales License", status: "pending", fileName: "", uploadedAt: null, expirationDate: null, verificationResult: null, rejectionReason: null },
    ],
  },
  {
    id: "reg-003", firstName: "Andrei", lastName: "Volkov", email: "andrei@volkovsiding.com", phone: "(763) 555-0303", company: "Volkov Siding & Exteriors",
    positionId: "pos-sub", status: "blocked", blockedReason: "Workers Compensation Insurance expired", registeredAt: "2025-08-10T12:00:00Z", lastVerifiedAt: "2026-01-10T14:00:00Z", notes: "Was active, WC expired on Feb 28",
    documents: [
      { id: "d9", formName: "W-9 Form", status: "verified", fileName: "w9-volkov.pdf", uploadedAt: "2025-08-10", expirationDate: null, verificationResult: { verified: true, checkedAt: "2025-08-11", source: "IRS Database", message: "EIN validated" }, rejectionReason: null },
      { id: "d10", formName: "General Liability Insurance", status: "verified", fileName: "liability-volkov.pdf", uploadedAt: "2025-08-10", expirationDate: "2026-11-30", verificationResult: { verified: true, checkedAt: "2025-08-11", source: "Insurance Carrier DB", message: "$1M coverage active" }, rejectionReason: null },
      { id: "d11", formName: "Workers Compensation Insurance", status: "expired", fileName: "wc-volkov.pdf", uploadedAt: "2025-08-10", expirationDate: "2026-02-28", verificationResult: { verified: false, checkedAt: "2026-03-01", source: "MN DLI", message: "EXPIRED — Policy lapsed on 2/28/2026" }, rejectionReason: null },
      { id: "d12", formName: "State Contractor Registration", status: "verified", fileName: "state-reg-volkov.pdf", uploadedAt: "2025-08-10", expirationDate: "2027-03-15", verificationResult: { verified: true, checkedAt: "2025-08-11", source: "MN Secretary of State", message: "Active, good standing" }, rejectionReason: null },
      { id: "d13", formName: "Certificate of Insurance (COI)", status: "verified", fileName: "coi-volkov.pdf", uploadedAt: "2025-08-10", expirationDate: "2026-11-30", verificationResult: { verified: true, checkedAt: "2025-08-11", source: "Insurance Carrier DB", message: "COI on file" }, rejectionReason: null },
    ],
  },
  {
    id: "reg-004", firstName: "Tom", lastName: "Bradley", email: "tom@bradleypm.com", phone: "(952) 555-0404", company: "Bradley Project Management",
    positionId: "pos-pm", status: "rejected", blockedReason: null, registeredAt: "2026-03-01T08:00:00Z", lastVerifiedAt: "2026-03-05T10:00:00Z", notes: "Background check failed",
    documents: [
      { id: "d14", formName: "W-9 Form", status: "verified", fileName: "w9-bradley.pdf", uploadedAt: "2026-03-01", expirationDate: null, verificationResult: { verified: true, checkedAt: "2026-03-02", source: "IRS Database", message: "EIN validated" }, rejectionReason: null },
      { id: "d15", formName: "PMP Certification", status: "verified", fileName: "pmp-cert-bradley.pdf", uploadedAt: "2026-03-01", expirationDate: "2028-06-15", verificationResult: { verified: true, checkedAt: "2026-03-02", source: "PMI Database", message: "PMP #2451890 active" }, rejectionReason: null },
      { id: "d16", formName: "Background Check", status: "rejected", fileName: "bg-check-bradley.pdf", uploadedAt: "2026-03-01", expirationDate: null, verificationResult: { verified: false, checkedAt: "2026-03-05", source: "National Background Check", message: "Disqualifying records found" }, rejectionReason: "Failed background check — see verification details" },
    ],
  },
  {
    id: "reg-005", firstName: "Elena", lastName: "Kozlov", email: "elena@kozlovgeneral.com", phone: "(612) 555-0505", company: "Kozlov General Contracting",
    positionId: "pos-sub", status: "active", blockedReason: null, registeredAt: "2025-11-01T10:00:00Z", lastVerifiedAt: "2026-02-01T14:00:00Z", notes: "COI expires in 10 days — needs renewal",
    documents: [
      { id: "d17", formName: "W-9 Form", status: "verified", fileName: "w9-kozlov.pdf", uploadedAt: "2025-11-01", expirationDate: null, verificationResult: { verified: true, checkedAt: "2025-11-02", source: "IRS Database", message: "EIN validated" }, rejectionReason: null },
      { id: "d18", formName: "General Liability Insurance", status: "verified", fileName: "liability-kozlov.pdf", uploadedAt: "2025-11-01", expirationDate: "2026-12-01", verificationResult: { verified: true, checkedAt: "2025-11-02", source: "Insurance Carrier DB", message: "$2M coverage" }, rejectionReason: null },
      { id: "d19", formName: "Workers Compensation Insurance", status: "verified", fileName: "wc-kozlov.pdf", uploadedAt: "2025-11-01", expirationDate: "2026-12-01", verificationResult: { verified: true, checkedAt: "2025-11-02", source: "MN DLI", message: "Active policy" }, rejectionReason: null },
      { id: "d20", formName: "State Contractor Registration", status: "verified", fileName: "state-reg-kozlov.pdf", uploadedAt: "2025-11-01", expirationDate: "2027-06-30", verificationResult: { verified: true, checkedAt: "2025-11-02", source: "MN Secretary of State", message: "Active" }, rejectionReason: null },
      { id: "d21", formName: "Certificate of Insurance (COI)", status: "verified", fileName: "coi-kozlov.pdf", uploadedAt: "2025-11-01", expirationDate: "2026-04-09", verificationResult: { verified: true, checkedAt: "2025-11-02", source: "Insurance Carrier DB", message: "COI on file — EXPIRES SOON" }, rejectionReason: null },
    ],
  },
];
