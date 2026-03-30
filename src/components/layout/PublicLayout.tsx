import { Outlet } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Smart Construction & Remodeling</h1>
            <p className="text-xs text-gray-500">Registration Portal</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Smart Construction & Remodeling Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
