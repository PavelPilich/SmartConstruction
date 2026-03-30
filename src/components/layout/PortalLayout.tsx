import { useState, createContext, useContext } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Building2, LayoutDashboard, Camera, FileText, Receipt, CalendarDays,
  LogOut, User,
} from "lucide-react";

interface PortalAuth {
  isLoggedIn: boolean;
  customerName: string;
  phone: string;
  login: (name: string, phone: string) => void;
  logout: () => void;
}

const PortalAuthContext = createContext<PortalAuth>({
  isLoggedIn: false,
  customerName: "",
  phone: "",
  login: () => {},
  logout: () => {},
});

export const usePortalAuth = () => useContext(PortalAuthContext);

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const login = (name: string, ph: string) => {
    setIsLoggedIn(true);
    setCustomerName(name);
    setPhone(ph);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCustomerName("");
    setPhone("");
    navigate("/portal");
  };

  const isLoginPage = location.pathname === "/portal";

  const tabs = [
    { label: "Overview", icon: LayoutDashboard, path: "/portal/overview" },
    { label: "Photos", icon: Camera, path: "/portal/photos" },
    { label: "Documents", icon: FileText, path: "/portal/documents" },
    { label: "Invoices", icon: Receipt, path: "/portal/invoices" },
    { label: "Schedule", icon: CalendarDays, path: "/portal/schedule" },
  ];

  return (
    <PortalAuthContext.Provider value={{ isLoggedIn, customerName, phone, login, logout }}>
      <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Inter',-apple-system,sans-serif" }}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 leading-tight">Smart Construction</h1>
                <p className="text-[11px] text-gray-500 leading-tight">Client Portal</p>
              </div>
            </div>
            {isLoggedIn && !isLoginPage && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{customerName}</span>
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
                        ? "text-blue-600 bg-blue-50"
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
              (612) 555-0190 &bull; info@smartconstruction.com &bull; Plymouth, MN
            </p>
            <p className="text-[11px] text-gray-400">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </PortalAuthContext.Provider>
  );
}
