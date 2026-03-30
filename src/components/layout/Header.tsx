import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HelpCircle, BookOpen, PlayCircle, X } Menu, } from "lucide-react";
import { Badge } from "../ui/Badge";

const pageTitles: Record<string, string> = {
  "/": "Xactimate Dashboard",
  "/estimates": "Estimates",
  "/estimates/pricelist": "Price List",
  "/estimates/supplements": "Supplements",
  "/settings/integrations": "API Settings",
  "/crm/projects": "Projects",
  "/crm/leads": "Leads Pipeline",
  "/scheduling/calendar": "Calendar",
  "/scheduling/crews": "Crews",
  "/financial/invoices": "Invoices",
  "/financial/reports": "Reports",
  "/financial/expenses": "Job Expenses",
  "/settings/admin": "Admin",
  "/inspections": "Drone Inspections",
  "/storm": "Storm Center",
  "/storm/history": "Storm History",
  "/contracts": "Contracts",
  "/contracts/templates": "Contract Templates",
  "/contracts/legal": "AI Legal Monitor",
  "/quickbooks": "QuickBooks Sync",
  "/quickbooks/1099": "1099 Tracking",
  "/quickbooks/tax": "Tax Reports",
  "/quickbooks/mileage": "Mileage",
  "/admin/registrations": "Registrations",
  "/admin/positions": "Positions",
  "/training": "Training Center",
  "/training/guide": "Platform Guide",
  "/compliance": "AI Compliance",
  "/ai": "AI Tools",
  "/hiring": "AI Hiring",
  "/safety/checklist": "Safety Checklists",
  "/safety/ratings": "Crew Ratings",
  "/safety/incidents": "Incident Reports",
  "/settings/backup": "Backup & Data",
};

/* Map page paths to guide section IDs and training module IDs */
const pageToGuideSection: Record<string, string> = {
  "/": "dashboard",
  "/estimates": "estimates",
  "/estimates/pricelist": "estimates",
  "/estimates/supplements": "estimates",
  "/crm/projects": "crm",
  "/crm/leads": "crm",
  "/scheduling/calendar": "scheduling",
  "/scheduling/crews": "scheduling",
  "/financial/invoices": "financial",
  "/financial/reports": "financial",
  "/financial/expenses": "financial",
  "/inspections": "inspections",
  "/storm": "storm-intel",
  "/storm/history": "storm-intel",
  "/contracts": "contracts",
  "/contracts/templates": "contracts",
  "/contracts/legal": "contracts",
  "/quickbooks": "quickbooks",
  "/quickbooks/1099": "quickbooks",
  "/quickbooks/tax": "quickbooks",
  "/quickbooks/mileage": "quickbooks",
  "/admin/registrations": "registration",
  "/admin/positions": "registration",
  "/settings/integrations": "settings",
  "/settings/admin": "settings",
  "/settings/backup": "settings",
  "/compliance": "compliance",
  "/ai": "ai-tools",
  "/hiring": "hiring",
  "/safety/checklist": "safety",
  "/safety/ratings": "safety",
  "/safety/incidents": "safety",
};

const pageToTrainingModule: Record<string, string> = {
  "/": "platform-overview",
  "/estimates": "estimating",
  "/estimates/pricelist": "estimating",
  "/estimates/supplements": "estimating",
  "/crm/projects": "crm-projects",
  "/crm/leads": "crm-projects",
  "/scheduling/calendar": "calendar-scheduling",
  "/scheduling/crews": "subcontractor-mgmt",
  "/financial/invoices": "financial-reports",
  "/financial/reports": "financial-reports",
  "/financial/expenses": "financial-reports",
  "/inspections": "drone-inspection",
  "/storm": "storm-intel",
  "/storm/history": "storm-intel",
  "/contracts": "econtracts",
  "/contracts/templates": "econtracts",
  "/contracts/legal": "econtracts",
  "/quickbooks": "quickbooks-integration",
  "/quickbooks/1099": "quickbooks-integration",
  "/quickbooks/tax": "quickbooks-integration",
  "/quickbooks/mileage": "quickbooks-integration",
  "/compliance": "compliance-safety",
  "/ai": "ai-tools",
  "/hiring": "hiring",
  "/safety/checklist": "safety-compliance",
  "/safety/ratings": "safety-compliance",
  "/safety/incidents": "safety-compliance",
  "/settings/backup": "settings",
};

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  const title = pageTitles[pathname] || (pathname.startsWith("/estimates/") ? "Estimate Detail" : pathname.startsWith("/crm/projects/") ? "Project Detail" : pathname.startsWith("/inspections/") ? "Inspection Detail" : pathname.startsWith("/storm/") ? "Storm Detail" : pathname.startsWith("/contracts/") ? "Contract Detail" : pathname.startsWith("/training/") ? "Training Module" : pathname.startsWith("/hiring/") ? "Hiring Position" : pathname.startsWith("/admin/registrations/") ? "Registrant Detail" : "Dashboard");

  const guideSection = pageToGuideSection[pathname] || "dashboard";
  const trainingModule = pageToTrainingModule[pathname];

  return (
    <header className="bg-white border-b px-5 py-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onMenuClick} className="md:hidden p-2 mr-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"><Menu className="w-5 h-5" /></button>
        <div className="flex items-center gap-3">
        <span className="font-bold text-gray-900">{title}</span>
        <Badge color="#10b981">Xactimate API</Badge>
        <Badge color="#3b82f6" sm>CRM Linked</Badge>
        <Badge color="#059669" sm>QB Sync</Badge>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-500">Smart Construction & Remodeling | (612) 216-1186</div>
        <div className="relative">
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="w-8 h-8 bg-blue-50 hover:bg-blue-100 rounded-full flex items-center justify-center transition"
            title="Help & Training"
          >
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </button>
          {helpOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setHelpOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-blue-50 border-b flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Help for this page</div>
                    <div className="text-xs text-gray-500">{title}</div>
                  </div>
                  <button onClick={() => setHelpOpen(false)} className="p-1 hover:bg-blue-100 rounded-lg transition">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <button
                    onClick={() => { setHelpOpen(false); nav(`/training/guide#${guideSection}`); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">View Guide for This Page</div>
                      <div className="text-xs text-gray-500">Buttons, features & how-tos</div>
                    </div>
                  </button>
                  {trainingModule && (
                    <button
                      onClick={() => { setHelpOpen(false); nav(`/training/${trainingModule}`); }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <PlayCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Watch Training Video</div>
                        <div className="text-xs text-gray-500">Video tutorial for this section</div>
                      </div>
                    </button>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <button
                      onClick={() => { setHelpOpen(false); nav("/training"); }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                    >
                      Open Training Center
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
