import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import PublicLayout from "./components/layout/PublicLayout";
import PortalLayout from "./components/layout/PortalLayout";
import { ToastContainer } from "./components/ui/Toast";
import DashboardPage from "./pages/DashboardPage";
import EstimatesPage from "./pages/estimates/EstimatesPage";
import EstimateDetailPage from "./pages/estimates/EstimateDetailPage";
import PriceListPage from "./pages/estimates/PriceListPage";
import SupplementsPage from "./pages/estimates/SupplementsPage";
import ProjectsPage from "./pages/crm/ProjectsPage";
import ProjectDetailPage from "./pages/crm/ProjectDetailPage";
import LeadsPage from "./pages/crm/LeadsPage";
import CalendarPage from "./pages/scheduling/CalendarPage";
import CrewsPage from "./pages/scheduling/CrewsPage";
import InvoicesPage from "./pages/financial/InvoicesPage";
import ReportsPage from "./pages/financial/ReportsPage";
import JobExpensesPage from "./pages/financial/JobExpensesPage";
import IntegrationPage from "./pages/settings/IntegrationPage";
import AdminPage from "./pages/settings/AdminPage";
import RegistrationPage from "./pages/registration/RegistrationPage";
import RegistrationSuccessPage from "./pages/registration/RegistrationSuccessPage";
import RegistrationsListPage from "./pages/admin/RegistrationsListPage";
import RegistrantDetailPage from "./pages/admin/RegistrantDetailPage";
import PositionManagerPage from "./pages/admin/PositionManagerPage";
import PortalLoginPage from "./pages/portal/PortalLoginPage";
import PortalOverviewPage from "./pages/portal/PortalOverviewPage";
import PortalPhotosPage from "./pages/portal/PortalPhotosPage";
import PortalDocumentsPage from "./pages/portal/PortalDocumentsPage";
import PortalInvoicesPage from "./pages/portal/PortalInvoicesPage";
import PortalSchedulePage from "./pages/portal/PortalSchedulePage";
import ContractsPage from "./pages/contracts/ContractsPage";
import ContractDetailPage from "./pages/contracts/ContractDetailPage";
import ContractTemplatesPage from "./pages/contracts/ContractTemplatesPage";
import ContractAiLegalPage from "./pages/contracts/ContractAiLegalPage";
import QuickBooksPage from "./pages/quickbooks/QuickBooksPage";
import QB1099Page from "./pages/quickbooks/QB1099Page";
import QBTaxReportsPage from "./pages/quickbooks/QBTaxReportsPage";
import QBMileagePage from "./pages/quickbooks/QBMileagePage";
import TrainingDashboardPage from "./pages/training/TrainingDashboardPage";
import TrainingModulePage from "./pages/training/TrainingModulePage";
import PlatformGuidePage from "./pages/training/PlatformGuidePage";
import SubPortalLayout from "./components/layout/SubPortalLayout";
import SubLoginPage from "./pages/subportal/SubLoginPage";
import SubDashboardPage from "./pages/subportal/SubDashboardPage";
import SubAvailableJobsPage from "./pages/subportal/SubAvailableJobsPage";
import SubMyJobsPage from "./pages/subportal/SubMyJobsPage";
import SubTimesheetsPage from "./pages/subportal/SubTimesheetsPage";
import SubPaymentsPage from "./pages/subportal/SubPaymentsPage";
import AiToolsPage from "./pages/ai/AiToolsPage";
import BackupPage from "./pages/settings/BackupPage";
import NotFoundPage from "./pages/NotFoundPage";

/* ── Lazy-loaded heavy pages (code splitting) ── */
const InspectionsPage = lazy(() => import("./pages/inspections/InspectionsPage"));
const InspectionDetailPage = lazy(() => import("./pages/inspections/InspectionDetailPage"));
const RooflePage = lazy(() => import("./pages/roofle/RooflePage"));
const StormDashboardPage = lazy(() => import("./pages/storm/StormDashboardPage"));
const StormDetailPage = lazy(() => import("./pages/storm/StormDetailPage"));
const StormHistoryPage = lazy(() => import("./pages/storm/StormHistoryPage"));
const ComplianceDashboardPage = lazy(() => import("./pages/compliance/ComplianceDashboardPage"));
const HiringDashboardPage = lazy(() => import("./pages/hiring/HiringDashboardPage"));
const HiringPositionPage = lazy(() => import("./pages/hiring/HiringPositionPage"));
const CareersPage = lazy(() => import("./pages/hiring/CareersPage"));
const SafetyChecklistPage = lazy(() => import("./pages/safety/SafetyChecklistPage"));
const EmployeeRatingsPage = lazy(() => import("./pages/safety/EmployeeRatingsPage"));
const IncidentReportPage = lazy(() => import("./pages/safety/IncidentReportPage"));
const WeatherDamageEstimatorPage = lazy(() => import("./pages/leadmagnet/WeatherDamageEstimatorPage"));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/estimates" element={<EstimatesPage />} />
              <Route path="/estimates/:id" element={<EstimateDetailPage />} />
              <Route path="/estimates/pricelist" element={<PriceListPage />} />
              <Route path="/estimates/supplements" element={<SupplementsPage />} />
              <Route path="/crm/projects" element={<ProjectsPage />} />
              <Route path="/crm/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/crm/leads" element={<LeadsPage />} />
              <Route path="/scheduling/calendar" element={<CalendarPage />} />
              <Route path="/scheduling/crews" element={<CrewsPage />} />
              <Route path="/financial/invoices" element={<InvoicesPage />} />
              <Route path="/financial/reports" element={<ReportsPage />} />
              <Route path="/financial/expenses" element={<JobExpensesPage />} />
              <Route path="/settings/integrations" element={<IntegrationPage />} />
              <Route path="/settings/admin" element={<AdminPage />} />
              <Route path="/settings/backup" element={<BackupPage />} />
              <Route path="/admin/registrations" element={<RegistrationsListPage />} />
              <Route path="/admin/registrations/:id" element={<RegistrantDetailPage />} />
              <Route path="/admin/positions" element={<PositionManagerPage />} />
              <Route path="/inspections" element={<InspectionsPage />} />
              <Route path="/inspections/:id" element={<InspectionDetailPage />} />
              <Route path="/storm" element={<StormDashboardPage />} />
              <Route path="/storm/history" element={<StormHistoryPage />} />
              <Route path="/storm/:id" element={<StormDetailPage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/contracts/templates" element={<ContractTemplatesPage />} />
              <Route path="/contracts/legal" element={<ContractAiLegalPage />} />
              <Route path="/contracts/:id" element={<ContractDetailPage />} />
              <Route path="/quickbooks" element={<QuickBooksPage />} />
              <Route path="/quickbooks/1099" element={<QB1099Page />} />
              <Route path="/quickbooks/tax" element={<QBTaxReportsPage />} />
              <Route path="/quickbooks/mileage" element={<QBMileagePage />} />
              <Route path="/training" element={<TrainingDashboardPage />} />
              <Route path="/training/guide" element={<PlatformGuidePage />} />
              <Route path="/training/:id" element={<TrainingModulePage />} />
              <Route path="/compliance" element={<ComplianceDashboardPage />} />
              <Route path="/ai" element={<AiToolsPage />} />
              <Route path="/hiring" element={<HiringDashboardPage />} />
              <Route path="/hiring/:id" element={<HiringPositionPage />} />
              <Route path="/safety/checklist" element={<SafetyChecklistPage />} />
              <Route path="/safety/ratings" element={<EmployeeRatingsPage />} />
              <Route path="/safety/incidents" element={<IncidentReportPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/register/success" element={<RegistrationSuccessPage />} />
          <Route path="/estimate" element={<RooflePage />} />
          <Route path="/storm-check" element={<WeatherDamageEstimatorPage />} />
          <Route path="/careers" element={<CareersPage />} />
        </Route>

        {/* Client Portal routes */}
        <Route element={<PortalLayout />}>
          <Route path="/portal" element={<PortalLoginPage />} />
          <Route path="/portal/overview" element={<PortalOverviewPage />} />
          <Route path="/portal/photos" element={<PortalPhotosPage />} />
          <Route path="/portal/documents" element={<PortalDocumentsPage />} />
          <Route path="/portal/invoices" element={<PortalInvoicesPage />} />
          <Route path="/portal/schedule" element={<PortalSchedulePage />} />
        </Route>

        {/* Subcontractor Portal routes */}
        <Route element={<SubPortalLayout />}>
          <Route path="/sub" element={<SubLoginPage />} />
          <Route path="/sub/dashboard" element={<SubDashboardPage />} />
          <Route path="/sub/jobs" element={<SubAvailableJobsPage />} />
          <Route path="/sub/myjobs" element={<SubMyJobsPage />} />
          <Route path="/sub/timesheets" element={<SubTimesheetsPage />} />
          <Route path="/sub/payments" element={<SubPaymentsPage />} />
        </Route>

        {/* Admin routes (existing layout with Sidebar + Header) */}
        <Route path="/*" element={<AdminLayout />} />
      </Routes>
    </Suspense>
  );
}
