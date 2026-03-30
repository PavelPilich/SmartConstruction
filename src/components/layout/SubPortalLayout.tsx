import { useState, createContext, useContext } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  HardHat, LayoutDashboard, Briefcase, ClipboardList, Clock, DollarSign,
  LogOut, User, ShieldCheck, ShieldAlert, ShieldX,
} from "lucide-react";

interface SubAuth {
  isLoggedIn: boolean;
  subName: string;
  company: string;
  complianceStatus: "green" | "yellow" | "red";
  login: (name: string, company: string) => void;
  logout: () => void;
}

const SubAuthContext = createContext<SubAuth>({
  isLoggedIn: false,
  subName: "",
  company: "",
  complianceStatus: "green",
  login: () => {},
  logout: () => {},
});

export const useSubAuth = () => useContext(SubAuthContext);

export default function SubPortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [subName, setSubName] = useState("");
  const [company, setCompany] = useState("");
  const [complianceStatus, setComplianceStatus] = useState<"green" | "yellow" | "red">("yellow");

  const login = (name: string, comp: string) => {
    setIsLoggedIn(true);
    setSubName(name);
    setCompany(comp);
    setComplianceStatus("yellow");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setSubName("");
    setCompany("");
    navigate("/sub");
  };

  const isLoginPage = location.pathname === "/sub";

  const tabs = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/sub/dashboard" },
    { label: "Available Jobs", icon: Briefcase, path: "/sub/jobs" },
    { label: "My Jobs", icon: ClipboardList, path: "/sub/myjobs" },
    { label: "Timesheets", icon: Clock, path: "/sub/timesheets" },
    { label: "Payments", icon: DollarSign, path: "/sub/payments" },
  ];

  const complianceBadge = {
    green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", label: "Compliant", Icon: ShieldCheck },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", label: "Expiring Soon", Icon: ShieldAlert },
    red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Blocked", Icon: ShieldX },
  }[complianceStatus];

  return (
    <SubAuthContext.Provider value={{ isLoggedIn, subName, company, complianceStatus, login, logout }}>
      <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Inter',-apple-system,sans-serif" }}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">Smart Construction</h1>
                <p className="text-[11px] text-gray-500 leading-tight">Subcontractor Portal</p>
              </div>
            </div>
            {isLoggedIn && !isLoginPage && (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border ${complianceBadge.bg} ${complianceBadge.text} ${complianceBadge.border}`}>
                  <complianceBadge.Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{complianceBadge.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-700 leading-tight">{subName}</div>
                    <div className="text-[11px] text-gray-400 leading-tight">{company}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition px-2 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-24">
          <Outlet />
        </main>

        {/* Bottom Tab Navigation */}
        {isLoggedIn && !isLoginPage && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
            <div className="max-w-5xl mx-auto flex">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) =>
                    `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                      isActive
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}

        {/* Footer */}
        <footer className={`border-t border-gray-200 bg-white ${isLoggedIn && !isLoginPage ? "mb-14" : ""}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center space-y-1">
            <p className="text-xs text-gray-500">Smart Construction & Remodeling Inc.</p>
            <p className="text-xs text-gray-400">
              (612) 555-0190 &bull; subs@smartconstruction.com &bull; Plymouth, MN
            </p>
            <p className="text-[11px] text-gray-400">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </SubAuthContext.Provider>
  );
}
