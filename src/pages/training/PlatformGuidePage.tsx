import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Search, ChevronDown, ChevronRight,
  LayoutDashboard, FolderKanban, Camera, CloudLightning, FileText,
  Calendar, Receipt, RefreshCw, FileSignature, ClipboardCheck,
  ExternalLink, Zap, Settings, Lightbulb, MousePointer, Target,
} from "lucide-react";
import { Badge, Btn } from "../../components/ui";

/* ───── Guide data ───── */
interface GuideFeature {
  title: string;
  what: string;
  where: string;
  buttons: { name: string; action: string }[];
  tips: string[];
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  features: GuideFeature[];
}

const guideSections: GuideSection[] = [
  {
    id: "dashboard", title: "1. Dashboard", icon: LayoutDashboard,
    features: [
      {
        title: "Xactimate 7-Step Workflow",
        what: "Seven numbered step cards showing the complete process from project creation to invoicing. Each card has a step number, title, and description of what to do at that phase.",
        where: "Dashboard (home page) — center section",
        buttons: [
          { name: "Each workflow step card", action: "Informational only — serves as a visual guide and checklist for every project." },
        ],
        tips: ["Follow these 7 steps for every single project. Skipping steps leads to missed revenue and unhappy customers.", "Print and post this workflow in the office for quick reference."],
      },
      {
        title: "Stat Cards",
        what: "Row of 6 cards at the top: Total Estimates, Approved, Pending, Declined, Total Value ($), Average Estimate ($). Each shows real-time counts and values.",
        where: "Dashboard — top row",
        buttons: [
          { name: "Click any stat card", action: "Navigates to the Estimates page filtered by that status (e.g., click 'Approved' to see only approved estimates)." },
        ],
        tips: ["Check stat cards every morning to see overnight changes.", "The Total Value card shows your pipeline — if it drops, you need more leads."],
      },
      {
        title: "Quick Actions",
        what: "Four action buttons for the most common tasks: New Estimate, New Project, Schedule Inspection, View Reports.",
        where: "Dashboard — below stat cards",
        buttons: [
          { name: "New Estimate", action: "Opens the estimate creation form with blank fields." },
          { name: "New Project", action: "Opens the project creation form in the CRM." },
          { name: "Schedule Inspection", action: "Navigates to Inspections page with the scheduling form open." },
          { name: "View Reports", action: "Navigates to Financial > Reports page." },
        ],
        tips: ["These buttons are shortcuts. The same actions are available through the sidebar navigation."],
      },
      {
        title: "Recent Estimates Table",
        what: "A table showing the most recent estimates with columns: Date, Customer, Address, Status (badge), Amount, and Actions.",
        where: "Dashboard — lower section",
        buttons: [
          { name: "Click any table row", action: "Opens the full Estimate Detail page for that estimate." },
          { name: "Status badge", action: "Shows current status: Draft (gray), Pending (yellow), Approved (green), Declined (red)." },
        ],
        tips: ["Sort by clicking column headers. Sort by Amount to see your largest pending estimates."],
      },
      {
        title: "Blocked Personnel Alerts",
        what: "A warning section that appears when any registered employee has been blocked by an administrator. Shows the employee name and block reason.",
        where: "Dashboard — bottom section (only visible when blocked employees exist)",
        buttons: [
          { name: "View Details", action: "Navigates to the Registration detail page for that employee." },
        ],
        tips: ["Blocked employees cannot access the platform. Review blocks weekly to ensure no legitimate employees are locked out."],
      },
      {
        title: "Storm Alerts",
        what: "Weather alerts banner that appears when active storms are detected in your service area. Shows severity, location, and recommended actions.",
        where: "Dashboard — top banner (conditional)",
        buttons: [
          { name: "View Storm Details", action: "Navigates to Storm Intel > Storm Center with the alert details." },
        ],
        tips: ["Storm alerts are your trigger to activate the door knocking team. Every alert = potential leads."],
      },
    ],
  },
  {
    id: "crm", title: "2. CRM", icon: FolderKanban,
    features: [
      {
        title: "Projects — Create, Edit, Delete",
        what: "The Projects page lists all jobs in a searchable, filterable table. Each project has: customer name, address, phone, email, type, stage, dates, notes, and linked estimates.",
        where: "Sidebar > CRM > Projects",
        buttons: [
          { name: "New Project", action: "Opens creation form. Required fields: Customer Name, Address, Phone. Optional: Email, Type, Notes." },
          { name: "Search bar", action: "Filters projects by customer name or address in real-time." },
          { name: "Stage filter dropdown", action: "Filters projects by stage: All, Lead, Contacted, Inspected, Estimated, Approved, In Progress, Completed, Closed." },
          { name: "Click project row", action: "Opens the Project Detail page." },
          { name: "Edit (on detail page)", action: "Opens edit form to change any project field." },
          { name: "Delete (on detail page)", action: "Deletes the project after confirmation. Cannot be undone." },
          { name: "Add Note", action: "Adds a timestamped note to the project history." },
          { name: "Change Stage dropdown", action: "Moves the project to a different stage. Auto-saves." },
        ],
        tips: ["Always enter the full street address for drone scheduling.", "Add a note after every customer interaction to create a paper trail."],
      },
      {
        title: "Project Detail — Estimates, Inspections, Notes",
        what: "Full project view showing all linked data: customer info at top, stage selector, linked estimates table, inspection history, and notes timeline.",
        where: "CRM > Projects > Click any project",
        buttons: [
          { name: "Create Estimate", action: "Creates a new estimate pre-linked to this project." },
          { name: "Schedule Inspection", action: "Opens inspection scheduler with address pre-filled." },
          { name: "View Estimate", action: "Opens linked estimate detail." },
          { name: "Back to Projects", action: "Returns to the projects list." },
        ],
        tips: ["A project can have multiple estimates — original, supplement, and revised. Link them all for a complete history."],
      },
      {
        title: "Leads Pipeline — Kanban View",
        what: "Visual kanban board showing projects as cards organized in columns by stage. Provides a bird's-eye view of the sales pipeline.",
        where: "Sidebar > CRM > Leads Pipeline",
        buttons: [
          { name: "Click any project card", action: "Opens the Project Detail page." },
          { name: "Filter bar", action: "Filter by project type (Roof, Siding, Window, etc.)." },
          { name: "Stage columns", action: "Each column represents a stage. Cards appear in the column matching their current stage." },
        ],
        tips: ["Focus on 'Contacted' and 'Inspected' columns — those are your hottest leads.", "Check the pipeline every morning. Stale leads in early stages need follow-up."],
      },
    ],
  },
  {
    id: "inspections", title: "3. Inspections", icon: Camera,
    features: [
      {
        title: "12 Inspection Types",
        what: "Shingle Roof, Metal Roof, Flat Roof, Tile Roof, Siding, Windows, Gutters, Chimney, Skylights, Ventilation, Fascia & Soffit, Full Property. Each type configures different flight patterns and camera angles.",
        where: "Sidebar > Inspections > Schedule Inspection > Type dropdown",
        buttons: [
          { name: "Type dropdown", action: "Select one or more inspection types. Full Property combines all types." },
        ],
        tips: ["For insurance claims, always select 'Full Property' to capture everything. Missing a section means missing revenue."],
      },
      {
        title: "Scheduling — Form Fields & Flight Settings",
        what: "Schedule form collects: property address, date, time, inspection type, flight altitude (80-120 ft), camera overlap (75% recommended), assigned operator.",
        where: "Sidebar > Inspections > Schedule Inspection button",
        buttons: [
          { name: "Schedule Inspection", action: "Opens the scheduling form." },
          { name: "Address field", action: "Enter the full property address. Auto-validates format." },
          { name: "Date/Time picker", action: "Select inspection date and time slot." },
          { name: "Altitude slider", action: "Set flight altitude: 80-120 ft for roofs, 40-60 ft for siding." },
          { name: "Overlap setting", action: "Set image overlap: 75% standard, 85% for detailed analysis." },
          { name: "Assign Operator", action: "Select a crew member to perform the inspection." },
          { name: "Schedule button", action: "Confirms and creates the inspection appointment." },
        ],
        tips: ["Schedule for mid-morning (10am-2pm) for optimal lighting and minimal shadows."],
      },
      {
        title: "AI Damage Detection — Sensitivity & Reports",
        what: "After uploading inspection images, the AI analyzes them for damage. Sensitivity ranges from 1 (conservative) to 10 (aggressive). Generates two reports.",
        where: "Inspections > Inspection Detail > AI Analysis tab",
        buttons: [
          { name: "Run AI Analysis", action: "Starts the AI damage detection on uploaded images." },
          { name: "Sensitivity slider (1-10)", action: "1-3: Only obvious damage. 4-6: Balanced. 7-10: Catches subtle damage (more false positives)." },
          { name: "Accept Finding", action: "Confirms an AI-flagged damage area as legitimate." },
          { name: "Dismiss Finding", action: "Marks an AI finding as a false positive." },
          { name: "Generate Reports", action: "Creates Conservative and Aggressive inspection reports." },
          { name: "Download Report", action: "Downloads the selected report as PDF." },
          { name: "Share Report", action: "Generates a shareable link for the report." },
        ],
        tips: ["Use sensitivity 7 for insurance claims, 4-5 for maintenance inspections.", "Show the Conservative report to the adjuster first. Keep the Aggressive report for supplements."],
      },
      {
        title: "Autonomous Flight Sequence",
        what: "The drone flies an automated grid pattern based on the property dimensions and inspection type. Captures overlapping images, then performs focused passes on flagged areas.",
        where: "On-site — DJI Mavic flight controller app",
        buttons: [
          { name: "Load Scheduled Inspection", action: "Loads the pre-configured flight plan from the platform." },
          { name: "Pre-Flight Check", action: "Runs safety checklist: weather, obstacles, airspace, battery." },
          { name: "Start Autonomous Flight", action: "Launches the automated grid flight pattern." },
          { name: "Emergency Stop", action: "Immediately stops the drone and hovers in place." },
          { name: "Return to Home", action: "Commands the drone to return to launch point." },
          { name: "Upload Images", action: "Transfers captured images to the platform for AI analysis." },
        ],
        tips: ["Always maintain visual line of sight (FAA Part 107 requirement).", "Check weather 1 hour before the flight — winds above 20 mph mean reschedule."],
      },
    ],
  },
  {
    id: "storm-intel", title: "4. Storm Intel", icon: CloudLightning,
    features: [
      {
        title: "Storm Center — Alerts, Radar, Social Media",
        what: "Real-time dashboard showing active weather alerts, radar imagery, and social media posts about storm damage in your service area.",
        where: "Sidebar > Storm Intel > Storm Center",
        buttons: [
          { name: "Active Alerts list", action: "Shows current NWS weather alerts with severity badges (Watch, Warning, Emergency)." },
          { name: "View Storm Detail", action: "Opens the Storm Detail page for a specific event." },
          { name: "Radar toggle", action: "Shows/hides the weather radar overlay on the map." },
          { name: "Social Media feed", action: "Displays filtered social media posts mentioning storm damage in your area." },
        ],
        tips: ["When a Warning appears, immediately brief the sales team and prepare door knocking routes."],
      },
      {
        title: "Storm Detail — Addresses, Routes, Scripts, Ads",
        what: "Detailed view for a specific storm event. Shows affected addresses, optimized door-knocking routes, pre-loaded sales scripts, and ready-to-launch ad campaigns.",
        where: "Storm Intel > Storm Center > Click any storm",
        buttons: [
          { name: "Affected Addresses", action: "Lists addresses in the storm path with damage probability scores." },
          { name: "Generate Route", action: "Creates an optimized door-knocking route through the highest-probability addresses." },
          { name: "Load Sales Script", action: "Opens the storm-specific door knocking script with weather details pre-filled." },
          { name: "Launch Ad Campaign", action: "Deploys pre-built Facebook/Google ads targeting the storm area." },
          { name: "Export Addresses", action: "Downloads the address list as CSV for direct mail campaigns." },
        ],
        tips: ["Hit affected neighborhoods within 48 hours of the storm. After that, competitors have already been there."],
      },
      {
        title: "Storm History — Database & Reports",
        what: "Historical database of all storms in your area with dates, severity, affected areas, and business results (leads generated, jobs won, revenue).",
        where: "Sidebar > Storm Intel > Storm History",
        buttons: [
          { name: "Search/Filter", action: "Filter by date range, severity, or location." },
          { name: "View Storm", action: "Opens the historical storm detail page." },
          { name: "Export Report", action: "Downloads storm history report as PDF or CSV." },
        ],
        tips: ["Review storm history quarterly. Patterns help you predict which areas to focus on."],
      },
    ],
  },
  {
    id: "estimates", title: "5. Estimates", icon: FileText,
    features: [
      {
        title: "Estimate List — Create, Filter, Search",
        what: "Master list of all estimates with search, status filters, and sort. Shows: date, customer, address, status badge, amount, linked project.",
        where: "Sidebar > Estimates > Estimates",
        buttons: [
          { name: "New Estimate", action: "Opens the estimate creation form." },
          { name: "Search bar", action: "Search by customer name, address, or estimate number." },
          { name: "Status filter", action: "Filter by: All, Draft, Pending, Approved, Declined." },
          { name: "Sort columns", action: "Click column headers to sort by date, amount, or status." },
          { name: "Click estimate row", action: "Opens the Estimate Detail page." },
        ],
        tips: ["Sort by amount descending to focus on your biggest opportunities first."],
      },
      {
        title: "Estimate Detail — Line Items, Price List, Submit",
        what: "Full estimate view with customer info, line item table, totals, and action buttons. Line items come from the Xactimate price list with codes, descriptions, quantities, and prices.",
        where: "Estimates > Click any estimate",
        buttons: [
          { name: "Add Line Item", action: "Opens the price list search to add items. Search by name or Xactimate code." },
          { name: "Edit Line Item", action: "Change quantity or override price for a specific line item." },
          { name: "Remove Line Item", action: "Deletes a line item from the estimate." },
          { name: "Duplicate Estimate", action: "Creates an exact copy (useful for creating supplements)." },
          { name: "Submit to Insurance", action: "Generates the Xactimate-formatted document and prepares it for insurance submission." },
          { name: "Edit Customer Info", action: "Change the customer name, address, or contact details." },
          { name: "Print/Download PDF", action: "Downloads the estimate as a formatted PDF." },
          { name: "Back to Estimates", action: "Returns to the estimates list." },
        ],
        tips: ["Before submitting to insurance, have a senior estimator review the scope.", "Use the 'Duplicate' button to create supplements that reference the original."],
      },
      {
        title: "Price List — Categories & Sync",
        what: "Complete Xactimate price list organized by category. Shows item code, description, unit, and current price. Syncs with Xactimate quarterly.",
        where: "Sidebar > Estimates > Price List",
        buttons: [
          { name: "Search bar", action: "Search items by name, code, or category." },
          { name: "Category filter", action: "Filter by: Roofing, Siding, Windows, Gutters, Interior, etc." },
          { name: "Sync Now", action: "Manually trigger a price list sync with Xactimate." },
          { name: "Last Synced badge", action: "Shows the date and time of the last successful sync." },
        ],
        tips: ["Check the sync date before creating estimates. Outdated prices mean inaccurate estimates."],
      },
      {
        title: "Supplements — Create & View",
        what: "Supplements are additional estimates linked to an original. They capture additional work discovered during the project that was not in the original scope.",
        where: "Sidebar > Estimates > Supplements",
        buttons: [
          { name: "Create Supplement", action: "Opens form to create a new supplement linked to an existing estimate." },
          { name: "Link to Original", action: "Dropdown to select the original estimate this supplement extends." },
          { name: "Submit Supplement", action: "Sends the supplement to the insurance adjuster with supporting documentation." },
          { name: "Attach Photos", action: "Upload photos documenting the additional damage." },
        ],
        tips: ["Document everything with photos BEFORE starting work. Undocumented supplements get denied.", "File supplements as soon as additional damage is found — waiting reduces approval rates."],
      },
    ],
  },
  {
    id: "scheduling", title: "6. Scheduling", icon: Calendar,
    features: [
      {
        title: "Calendar — Events & Month Navigation",
        what: "Monthly calendar view showing all scheduled events: inspections, installations, meetings, follow-ups. Color-coded by type.",
        where: "Sidebar > Scheduling > Calendar",
        buttons: [
          { name: "New Event", action: "Opens event creation form: title, date, time, type, assigned crew, notes." },
          { name: "Previous/Next Month arrows", action: "Navigate between months." },
          { name: "Click any event", action: "Opens event detail with edit/delete options." },
          { name: "Today button", action: "Jumps to the current month/day." },
        ],
        tips: ["Color coding: Blue = inspections, Green = installations, Yellow = follow-ups, Red = urgent."],
      },
      {
        title: "Crews — Add, Compliance, Documents",
        what: "Manage crew members: add/edit/remove, track certifications, upload compliance documents (licenses, insurance, W-9s).",
        where: "Sidebar > Scheduling > Crews",
        buttons: [
          { name: "Add Crew Member", action: "Opens form: name, role, phone, email, certifications." },
          { name: "Edit Crew Member", action: "Modify any crew member details." },
          { name: "Upload Document", action: "Attach compliance documents: license, insurance cert, W-9." },
          { name: "View Certifications", action: "Shows expiration dates for all certifications. Red = expired or expiring soon." },
          { name: "Deactivate", action: "Removes crew member from scheduling (does not delete records)." },
        ],
        tips: ["Review crew certifications monthly. Expired insurance = uninsured on your job site."],
      },
    ],
  },
  {
    id: "financial", title: "7. Financial", icon: Receipt,
    features: [
      {
        title: "Invoices — Create, Send, Mark Paid",
        what: "Invoice management: create invoices from estimates, send to customers or insurance, track payment status.",
        where: "Sidebar > Financial > Invoices",
        buttons: [
          { name: "Create Invoice", action: "Opens form pre-populated from an approved estimate." },
          { name: "Send Invoice", action: "Emails the invoice PDF to the customer or insurance company." },
          { name: "Mark as Paid", action: "Records payment received. Updates financial reports." },
          { name: "Send Reminder", action: "Sends a payment reminder email for overdue invoices." },
          { name: "Download PDF", action: "Downloads the invoice as a formatted PDF." },
          { name: "Filter by Status", action: "Filter: All, Draft, Sent, Paid, Overdue." },
        ],
        tips: ["Send invoices the same day work is completed. Delayed invoicing = delayed payment."],
      },
      {
        title: "Reports — Export & Charts",
        what: "Financial reporting dashboard with charts: revenue by month, profit margins, top customers, estimates pipeline value.",
        where: "Sidebar > Financial > Reports",
        buttons: [
          { name: "Date range selector", action: "Filter reports by custom date range." },
          { name: "Export CSV", action: "Download report data as a CSV spreadsheet." },
          { name: "Export PDF", action: "Download formatted PDF report for printing." },
          { name: "Chart type toggle", action: "Switch between bar chart, line chart, and pie chart views." },
        ],
        tips: ["Run the monthly P&L report on the 1st of every month. Share with the owner for review."],
      },
      {
        title: "Job Expenses — Add, Filter, Profit per Job",
        what: "Track expenses per project: materials, labor, subcontractors, equipment rental. Calculates profit per job.",
        where: "Sidebar > Financial > Job Expenses",
        buttons: [
          { name: "Add Expense", action: "Opens form: project, category, amount, date, vendor, receipt upload." },
          { name: "Filter by Project", action: "See all expenses for a specific job." },
          { name: "Filter by Category", action: "Filter: Materials, Labor, Subcontractor, Equipment, Other." },
          { name: "Profit Summary", action: "Shows invoice total vs expenses for each job = profit." },
        ],
        tips: ["Log expenses the day they happen. End-of-month expense entry is always inaccurate."],
      },
    ],
  },
  {
    id: "quickbooks", title: "8. QuickBooks", icon: RefreshCw,
    features: [
      {
        title: "QB Sync, 1099, Tax Reports, Mileage",
        what: "QuickBooks integration: sync invoices and expenses, track 1099 payments to subcontractors, generate tax reports, and log mileage.",
        where: "Sidebar > QuickBooks",
        buttons: [
          { name: "Sync Now", action: "Manually syncs all invoices and expenses to QuickBooks." },
          { name: "Auto-Sync toggle", action: "Enable/disable automatic daily sync." },
          { name: "1099 Tracking", action: "Lists subcontractor payments. Flags those above the $600 1099 threshold." },
          { name: "Generate 1099", action: "Creates 1099-NEC forms for qualified subcontractors." },
          { name: "Tax Reports", action: "Generates quarterly and annual tax summaries." },
          { name: "Mileage Log", action: "Track business mileage with start/end addresses and IRS rate calculation." },
          { name: "Add Mileage Entry", action: "Log a trip: date, from, to, miles, purpose." },
        ],
        tips: ["Sync daily to keep QuickBooks current. Monthly syncs create reconciliation nightmares.", "Log mileage daily — the IRS standard deduction adds up fast."],
      },
    ],
  },
  {
    id: "contracts", title: "9. Contracts", icon: FileSignature,
    features: [
      {
        title: "Contracts, Templates, E-Sign, Legal Monitor",
        what: "Contract management: create contracts from templates, send for electronic signature, track signing status, and monitor compliance.",
        where: "Sidebar > Contracts",
        buttons: [
          { name: "New Contract", action: "Create a contract from a template, pre-filled with project data." },
          { name: "Choose Template", action: "Select from: Standard Roofing, Siding, Window, Insurance Assignment, Subcontractor." },
          { name: "Send for Signature", action: "Emails the contract to the customer with an e-signature link." },
          { name: "Track Status", action: "Shows: Draft, Sent, Viewed, Signed, Expired." },
          { name: "Templates page", action: "Create, edit, and manage contract templates." },
          { name: "AI Legal Monitor", action: "AI scans contracts for compliance issues, missing clauses, and legal risks." },
          { name: "Download Signed", action: "Downloads the fully executed contract as PDF." },
        ],
        tips: ["Never start work without a signed contract. Verbal agreements are not enforceable.", "Run every new template through the AI Legal Monitor before using it."],
      },
    ],
  },
  {
    id: "registration", title: "10. Registration", icon: ClipboardCheck,
    features: [
      {
        title: "Public Registration & Admin Review",
        what: "Prospective employees register through a public form. Admin reviews, verifies, approves, or blocks each registration.",
        where: "Sidebar > Registration > Registrations",
        buttons: [
          { name: "Registration list", action: "Shows all registrations with status: Pending, Approved, Blocked." },
          { name: "Click registration row", action: "Opens the Registrant Detail page." },
          { name: "Approve", action: "Approves the registration and grants platform access." },
          { name: "Block", action: "Blocks the registration with a reason. Employee cannot access the platform." },
          { name: "Unblock", action: "Removes the block and restores access." },
          { name: "Positions page", action: "Manage available positions that appear on the registration form." },
        ],
        tips: ["Review new registrations daily. A slow response loses good candidates.", "Always add a reason when blocking — it's required for legal compliance."],
      },
    ],
  },
  {
    id: "client-portal", title: "11. Client Portal", icon: ExternalLink,
    features: [
      {
        title: "Customer View — Overview, Photos, Documents, Invoices, Schedule",
        what: "The client portal gives customers read-only access to their project: overview, inspection photos, documents (contracts, estimates), invoices, and schedule.",
        where: "Sidebar > Client Portal (opens in separate view)",
        buttons: [
          { name: "Overview tab", action: "Project summary: status, address, assigned crew, timeline." },
          { name: "Photos tab", action: "All drone inspection photos organized by date." },
          { name: "Documents tab", action: "Contracts, estimates, and approval letters." },
          { name: "Invoices tab", action: "All invoices with payment status and pay online button." },
          { name: "Schedule tab", action: "Upcoming events: inspections, work dates, completion." },
        ],
        tips: ["Share the portal link with customers proactively. It reduces 'when is my project starting' calls by 80%."],
      },
    ],
  },
  {
    id: "sales", title: "12. Sales", icon: Zap,
    features: [
      {
        title: "Instant Estimates (Roofle) — 6-Step Flow",
        what: "Public-facing instant estimate tool. Homeowners enter their address and get a rough roofing estimate in seconds. Captures leads for follow-up. Six steps: Address, Roof Type, Material, Dimensions (auto-calculated), Estimate Result, Contact Info.",
        where: "Sidebar > Sales > Instant Estimates (public URL: /estimate)",
        buttons: [
          { name: "Step 1: Address Input", action: "Homeowner enters their address. System auto-detects roof dimensions." },
          { name: "Step 2: Roof Type", action: "Select: Asphalt Shingle, Metal, Tile, Flat." },
          { name: "Step 3: Material Grade", action: "Select: Standard, Premium, Luxury." },
          { name: "Step 4: Auto Dimensions", action: "System calculates roof area. Homeowner confirms." },
          { name: "Step 5: Instant Estimate", action: "Shows price range with breakdown." },
          { name: "Step 6: Contact Form", action: "Captures name, phone, email for follow-up." },
          { name: "Submit", action: "Creates a lead in the CRM for follow-up." },
        ],
        tips: ["Embed this on your website. It generates leads 24/7 while you sleep.", "Follow up on every instant estimate lead within 1 hour for maximum conversion."],
      },
      {
        title: "AI Chat Widget",
        what: "An AI-powered chat widget that answers customer questions about roofing, insurance claims, and company services. Runs 24/7 on the website.",
        where: "Embedded on public website pages",
        buttons: [
          { name: "Chat bubble", action: "Opens the chat interface for customers." },
          { name: "Suggested Questions", action: "Pre-set questions customers can click: 'Do you offer free inspections?', 'How does insurance work?'" },
        ],
        tips: ["Review chat transcripts weekly. Common questions reveal what your website is missing."],
      },
    ],
  },
  {
    id: "settings", title: "13. Settings", icon: Settings,
    features: [
      {
        title: "Integrations & Admin",
        what: "Manage API connections (Xactimate, QuickBooks, Stripe, DJI), company settings, and administrator tools.",
        where: "Sidebar > Settings",
        buttons: [
          { name: "Integrations page", action: "View and configure API connections. Green = connected, Red = disconnected." },
          { name: "Connect/Disconnect toggle", action: "Enable or disable individual integrations." },
          { name: "API Key fields", action: "Enter or update API keys for each integration." },
          { name: "Test Connection", action: "Verifies the API connection is working." },
          { name: "Admin page", action: "Company settings: name, address, logo, default settings." },
          { name: "User Management", action: "Add, edit, and manage platform users and permissions." },
        ],
        tips: ["Test API connections weekly. A silent disconnection means data stops syncing.", "Only admins should have access to the Settings section."],
      },
    ],
  },
];

/* ───── Component ───── */
export default function PlatformGuidePage() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});

  // Auto-expand section from hash
  useState(() => {
    const hash = location.hash.replace("#", "");
    if (hash) {
      setExpandedSections({ [hash]: true });
    }
  });

  const toggleSection = (id: string) => setExpandedSections((s) => ({ ...s, [id]: !s[id] }));
  const toggleFeature = (key: string) => setExpandedFeatures((s) => ({ ...s, [key]: !s[key] }));

  const q = searchQuery.toLowerCase();
  const filteredSections = q
    ? guideSections.map((s) => ({
        ...s,
        features: s.features.filter(
          (f) =>
            f.title.toLowerCase().includes(q) ||
            f.what.toLowerCase().includes(q) ||
            f.buttons.some((b) => b.name.toLowerCase().includes(q) || b.action.toLowerCase().includes(q)) ||
            f.tips.some((t) => t.toLowerCase().includes(q))
        ),
      })).filter((s) => s.features.length > 0)
    : guideSections;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => nav("/training")} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Smart Construction Platform Guide</h1>
          <p className="text-sm text-gray-500">Complete Reference — Every Page, Every Button</p>
        </div>
        <Btn color="#3b82f6" onClick={() => nav("/training")}>Back to Training</Btn>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search all guide content... (e.g., 'create estimate', 'drone', 'submit to insurance')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">Clear</button>
        )}
      </div>

      {/* Table of contents */}
      {!searchQuery && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-3">Table of Contents</h2>
          <div className="grid grid-cols-3 gap-2">
            {guideSections.map((s) => (
              <button
                key={s.id}
                onClick={() => { setExpandedSections({ [s.id]: true }); document.getElementById(`guide-${s.id}`)?.scrollIntoView({ behavior: "smooth" }); }}
                className="flex items-center gap-2 text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition"
              >
                <s.icon className="w-4 h-4 text-blue-500" />
                <span>{s.title}</span>
                <Badge color="#6b7280" sm>{s.features.length}</Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {filteredSections.map((section) => (
          <div key={section.id} id={`guide-${section.id}`} className="bg-white border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <section.icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-bold text-gray-900 text-lg">{section.title}</span>
                <Badge color="#3b82f6">{section.features.length} features</Badge>
              </div>
              {expandedSections[section.id] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>

            {(expandedSections[section.id] || !!searchQuery) && (
              <div className="border-t divide-y">
                {section.features.map((feature, fi) => {
                  const fKey = `${section.id}-${fi}`;
                  const isExpanded = expandedFeatures[fKey] ?? !!searchQuery;
                  return (
                    <div key={fi}>
                      <button onClick={() => toggleFeature(fKey)} className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition text-left">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-indigo-500" />
                          <span className="font-semibold text-gray-800 text-sm">{feature.title}</span>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 space-y-3">
                          {/* What */}
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-blue-700 uppercase mb-1">What</div>
                            <p className="text-sm text-gray-700">{feature.what}</p>
                          </div>
                          {/* Where */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Where</div>
                            <p className="text-sm text-gray-700 font-mono">{feature.where}</p>
                          </div>
                          {/* Buttons */}
                          <div className="bg-indigo-50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-indigo-700 uppercase mb-2 flex items-center gap-1">
                              <MousePointer className="w-3 h-3" /> Buttons & Actions
                            </div>
                            <div className="space-y-1.5">
                              {feature.buttons.map((btn, bi) => (
                                <div key={bi} className="flex items-start gap-2 text-sm">
                                  <Badge color="#4f46e5" sm>{btn.name}</Badge>
                                  <span className="text-gray-600">{btn.action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Tips */}
                          {feature.tips.length > 0 && (
                            <div className="bg-yellow-50 rounded-lg p-3">
                              <div className="text-xs font-semibold text-yellow-700 uppercase mb-1 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" /> Pro Tips
                              </div>
                              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                                {feature.tips.map((tip, ti) => <li key={ti}>{tip}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {searchQuery && filteredSections.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <div className="text-lg font-medium">No results for "{searchQuery}"</div>
          <div className="text-sm mt-1">Try different keywords or browse the table of contents</div>
        </div>
      )}
    </div>
  );
}
