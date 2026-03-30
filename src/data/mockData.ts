import type { Estimate, Supplement } from "../types";

export const estimates: Estimate[] = [
  {
    id: "XE-2026-0247", project: "MN-0247", customer: "James Wilson", address: "4821 Maple Dr, Plymouth, MN",
    insurance: { company: "State Farm", claim: "CLM-78432", adjuster: "Tom Bradley", adjPhone: "(651) 555-0300", deductible: 1000 },
    status: "approved", dateCreated: "2026-03-01", dateApproved: "2026-03-12", totalRCV: 28742.50, totalACV: 24431.13, depreciation: 4311.37,
    supplement: false, version: 3,
    lines: [
      { code: "RFG RFTOAK", desc: "Remove comp. shingles - 1 layer", qty: 24.5, unit: "SQ", price: 56.82, total: 1392.09 },
      { code: "RFG RFSYN", desc: "Synthetic underlayment", qty: 24.5, unit: "SQ", price: 22.43, total: 549.54 },
      { code: "RFG RFICW", desc: "Ice & water shield (eaves/valleys)", qty: 6, unit: "SQ", price: 68.50, total: 411.00 },
      { code: "RFG RFSHAC", desc: "OC Duration architectural shingles", qty: 24.5, unit: "SQ", price: 142.86, total: 3500.07 },
      { code: "RFG RFHRC", desc: "Hip & ridge cap shingles", qty: 85, unit: "LF", price: 6.85, total: 582.25 },
      { code: "RFG RFRV", desc: "Ridge vent - aluminum", qty: 45, unit: "LF", price: 8.45, total: 380.25 },
      { code: "RFG RFDE", desc: "Drip edge - aluminum", qty: 220, unit: "LF", price: 3.72, total: 818.40 },
      { code: "RFG RFFLSH", desc: "Step flashing (chimney)", qty: 24, unit: "EA", price: 12.50, total: 300.00 },
      { code: "RFG RFPIPE", desc: "Pipe jack / boot", qty: 4, unit: "EA", price: 28.75, total: 115.00 },
      { code: "RFG RFDEK", desc: "OSB decking replace (damaged)", qty: 96, unit: "SF", price: 2.85, total: 273.60 },
      { code: "SDG SDLPSP", desc: "LP SmartSide - west wall", qty: 480, unit: "SF", price: 5.68, total: 2726.40 },
      { code: "SDG SDHB", desc: "House wrap - west wall", qty: 480, unit: "SF", price: 0.58, total: 278.40 },
      { code: "GTR GT6K", desc: '6" K-style gutter - full perimeter', qty: 180, unit: "LF", price: 9.45, total: 1701.00 },
      { code: "GTR GTDS", desc: "Downspouts - aluminum", qty: 48, unit: "LF", price: 5.38, total: 258.24 },
      { code: "PNT PTEX2", desc: "Exterior paint - fascia/trim 2-coat", qty: 320, unit: "SF", price: 2.15, total: 688.00 },
      { code: "GEN GNDUM", desc: "Dumpster & debris removal", qty: 2, unit: "EA", price: 450.00, total: 900.00 },
    ],
  },
  {
    id: "XE-2026-0089", project: "MN-0089", customer: "Mary Johnson", address: "612 Oak Ave, Maple Grove, MN",
    insurance: { company: "State Farm", claim: "CLM-45291", adjuster: "Tom Bradley", adjPhone: "(651) 555-0300", deductible: 1000 },
    status: "pending", dateCreated: "2026-03-14", dateApproved: null, totalRCV: 18450.00, totalACV: 15682.50, depreciation: 2767.50,
    supplement: true, version: 1,
    lines: [
      { code: "SDG SDVNL", desc: "Vinyl siding - all walls", qty: 1800, unit: "SF", price: 4.12, total: 7416.00 },
      { code: "SDG SDHB", desc: "House wrap", qty: 1800, unit: "SF", price: 0.58, total: 1044.00 },
      { code: "WDW WDDH", desc: "Double-hung windows (8)", qty: 8, unit: "EA", price: 385.00, total: 3080.00 },
      { code: "WDW WDPD", desc: "Patio door - sliding", qty: 1, unit: "EA", price: 1250.00, total: 1250.00 },
      { code: "PNT PTEX2", desc: "Exterior paint - trim", qty: 450, unit: "SF", price: 2.15, total: 967.50 },
      { code: "GEN GNDUM", desc: "Dumpster", qty: 1, unit: "EA", price: 450.00, total: 450.00 },
    ],
  },
  {
    id: "XE-2026-0156", project: "MN-0156", customer: "Robert Chen", address: "7234 Cedar Ln, Maple Grove, MN",
    insurance: { company: "Allstate", claim: "ALT-92471", adjuster: "Lisa Morgan", adjPhone: "(651) 555-0400", deductible: 1500 },
    status: "draft", dateCreated: "2026-03-16", dateApproved: null, totalRCV: 0, totalACV: 0, depreciation: 0,
    supplement: false, version: 1, lines: [],
  },
];

export const supplements: Supplement[] = [
  { id: "SUP-001", estimate: "XE-2026-0247", date: "2026-03-10", reason: "Hidden deck rot found during tear-off", addedItems: 3, addedAmount: 1847.20, status: "approved" },
  { id: "SUP-002", estimate: "XE-2026-0089", date: "2026-03-15", reason: "Additional window frame damage not visible pre-tear", addedItems: 2, addedAmount: 1250.00, status: "submitted" },
];
