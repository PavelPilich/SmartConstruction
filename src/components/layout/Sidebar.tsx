import { NavLink } from "react-router-dom";
import {
  BarChart3, FileText, List, PlusCircle, Link2, LayoutDashboard,
  FolderKanban, Users, Calendar, Truck, Receipt, DollarSign, Settings, Shield,
  ClipboardCheck, Briefcase, Camera, ExternalLink, Zap, Plane, Target, CloudLightning, Database,
  FileSignature, FileStack, Scale, RefreshCw, Table2, Calculator, Car, Wallet,
  GraduationCap, BookOpen, HardHat, ShieldCheck, Brain, UserPlus, Star, AlertTriangle, HardDrive,
} from "lucide-react";
import { priceList } from "../../data/xactimate";
import { useAppStore } from "../../stores/useAppStore";
import { useRegistrationStore } from "../../stores/useRegistrationStore";

/** Routes served under a different layout (PublicLayout, PortalLayout, SubPortalLayout).
 *  These open in a new tab so the admin shell is not lost. */
const EXTERNAL_PATHS = new Set(["/portal", "/estimate", "/storm-check", "/sub"]);

const navSections = [
  {
    label: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    ],
  },
  {
    label: "CRM",
    items: [
      { id: "projects", label: "Projects", icon: FolderKanban, path: "/crm/projects" },
      { id: "leads", label: "Leads Pipeline", icon: Users, path: "/crm/leads" },
    ],
  },
  {
    label: "INSPECTIONS",
    items: [
      { id: "inspections", label: "Drone Inspections", icon: Camera, path: "/inspections" },
      { id: "drone-flight", label: "Drone Flight Mgmt", icon: Plane, path: "/inspections" },
      { id: "ai-analysis", label: "AI Damage Analysis", icon: Target, path: "/inspections" },
    ],
  },
  {
    label: "STORM INTEL",
    items: [
      { id: "storm", label: "Storm Center", icon: CloudLightning, path: "/storm" },
      { id: "storm-history", label: "Storm History", icon: Database, path: "/storm/history" },
    ],
  },
  {
    label: "AI TOOLS",
    items: [
      { id: "ai-tools", label: "AI Tools", icon: Brain, path: "/ai" },
    ],
  },
  {
    label: "ESTIMATES",
    items: [
      { id: "estimates", label: "Estimates", icon: FileText, path: "/estimates" },
      { id: "pricelist", label: "Price List", icon: List, path: "/estimates/pricelist" },
      { id: "supplements", label: "Supplements", icon: PlusCircle, path: "/estimates/supplements" },
    ],
  },
  {
    label: "SCHEDULING",
    items: [
      { id: "calendar", label: "Calendar", icon: Calendar, path: "/scheduling/calendar" },
      { id: "crews", label: "Crews", icon: Truck, path: "/scheduling/crews" },
    ],
  },
  {
    label: "FINANCIAL",
    items: [
      { id: "invoices", label: "Invoices", icon: Receipt, path: "/financial/invoices" },
      { id: "reports", label: "Reports", icon: DollarSign, path: "/financial/reports" },
      { id: "expenses", label: "Job Expenses", icon: Wallet, path: "/financial/expenses" },
    ],
  },
  {
    label: "CONTRACTS",
    items: [
      { id: "contracts", label: "Contracts", icon: FileSignature, path: "/contracts" },
      { id: "templates", label: "Templates", icon: FileStack, path: "/contracts/templates" },
      { id: "legal", label: "AI Legal Monitor", icon: Scale, path: "/contracts/legal" },
    ],
  },
  {
    label: "QUICKBOOKS",
    items: [
      { id: "qb-sync", label: "QB Sync", icon: RefreshCw, path: "/quickbooks" },
      { id: "qb-1099", label: "1099 Tracking", icon: Table2, path: "/quickbooks/1099" },
      { id: "qb-tax", label: "Tax Reports", icon: Calculator, path: "/quickbooks/tax" },
      { id: "qb-mileage", label: "Mileage", icon: Car, path: "/quickbooks/mileage" },
    ],
  },
  {
    label: "REGISTRATION",
    items: [
      { id: "registrations", label: "Registrations", icon: ClipboardCheck, path: "/admin/registrations" },
      { id: "positions", label: "Positions", icon: Briefcase, path: "/admin/positions" },
    ],
  },
  {
    label: "CLIENT PORTAL",
    items: [
      { id: "portal", label: "Client Portal", icon: ExternalLink, path: "/portal" },
    ],
  },
  {
    label: "SALES",
    items: [
      { id: "roofle", label: "Instant Estimates", icon: Zap, path: "/estimate" },
      { id: "storm-check", label: "Storm Risk Tool", icon: CloudLightning, path: "/storm-check" },
    ],
  },
  {
    label: "HIRING",
    items: [
      { id: "hiring", label: "AI Hiring", icon: UserPlus, path: "/hiring" },
    ],
  },
  {
    label: "TRAINING",
    items: [
      { id: "training", label: "Training Center", icon: GraduationCap, path: "/training" },
      { id: "guide", label: "Platform Guide", icon: BookOpen, path: "/training/guide" },
    ],
  },
  {
    label: "SUB PORTAL",
    items: [
      { id: "subportal", label: "Sub Portal", icon: HardHat, path: "/sub" },
      { id: "compliance", label: "AI Compliance", icon: ShieldCheck, path: "/compliance" },
    ],
  },
  {
    label: "SAFETY",
    items: [
      { id: "safety-checklist", label: "Safety Checklists", icon: ClipboardCheck, path: "/safety/checklist" },
      { id: "ratings", label: "Crew Ratings", icon: Star, path: "/safety/ratings" },
      { id: "incidents", label: "Incident Reports", icon: AlertTriangle, path: "/safety/incidents" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { id: "integration", label: "Integrations", icon: Link2, path: "/settings/integrations" },
      { id: "admin", label: "Admin", icon: Settings, path: "/settings/admin" },
      { id: "backup", label: "Backup & Data", icon: HardDrive, path: "/settings/backup" },
    ],
  },
];

export function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const estimates = useAppStore((s) => s.estimates);
  const { registrants } = useRegistrationStore();
  const totalRegistrants = registrants.length;
  const blockedCount = registrants.filter((r) => r.status === "blocked").length;

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-gray-900 text-white flex flex-col flex-shrink-0 transform transition-transform duration-200 md:relative md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-black">SC</div>
          <div>
            <div className="font-bold text-sm leading-tight">Smart Construction &amp; Remodeling Inc</div>
            <div className="text-gray-400 text-xs leading-tight">Full AI-Integrated Construction Management CRM System</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">All Systems Online</span>
        </div>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label || "main"}>
            {section.label && (
              <div className="px-4 pt-4 pb-1 text-[10px] font-bold text-gray-500 tracking-wider">
                {section.label}
              </div>
            )}
            {section.items.map((item) =>
              EXTERNAL_PATHS.has(item.path) ? (
                <a
                  key={item.id}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
              ) : (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2.5 px-4 py-2 text-sm transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            )}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-3 space-y-1">
          <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Quick Stats
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Estimates</span>
            <span className="text-blue-400 font-bold">{estimates.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Approved</span>
            <span className="text-green-400 font-bold">{estimates.filter((e) => e.status === "approved").length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Pending</span>
            <span className="text-yellow-400 font-bold">{estimates.filter((e) => e.status === "pending").length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Price Items</span>
            <span className="text-gray-300 font-bold">{priceList.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Registrants</span>
            <span className="text-blue-400 font-bold">{totalRegistrants}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Blocked</span>
            <span className={`font-bold ${blockedCount > 0 ? "text-red-400" : "text-gray-300"}`}>{blockedCount}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
