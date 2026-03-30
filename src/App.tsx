import { Routes, Route } from "react-router-dom";
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
import InspectionsPage from "./pages/inspections/InspectionsPage";
import InspectionDetailPage from "./pages/inspections/InspectionDetailPage";
import PortalLoginPage from "./pages/portal/PortalLoginPage";
import PortalOverviewPage from "./pages/portal/PortalOverviewPage";
import PortalPhotosPage from "./pages/portal/PortalPhotosPage";
import PortalDocumentsPage from "./pages/portal/PortalDocumentsPage";
import PortalInvoicesPage from "./pages/portal/PortalInvoicesPage";
import PortalSchedulePage from "./pages/portal/PortalSchedulePage";
import RooflePage from "./pages/roofle/RooflePage";
import StormDashboardPage from "./pages/storm/StormDashboardPage";
import StormDetailPage from "./pages/storm/StormDetailPage";
import StormHistoryPage from "./pages/storm/StormHistoryPage";
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
import ComplianceDashboardPage from "./pages/compliance/ComplianceDashboardPage";
import WeatherDamageEstimatorPage from "./pages/leadmagnet/WeatherDamageEstimatorPage";
import AiToolsPage from "./pages/ai/AiToolsPage";
import HiringDashboardPage from "./pages/hiring/HiringDashboardPage";
import HiringPositionPage from "./pages/hiring/HiringPositionPage";
import CareersPage from "./pages/hiring/CareersPage";
import SafetyChecklistPage from "./pages/safety/SafetyChecklistPage";
import EmployeeRatingsPage from "./pages/safety/EmployeeRatingsPage";
import IncidentReportPage from "./pages/safety/IncidentReportPage";
import BackupPage from "./pages/settings/BackupPage";

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-5">
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
          </Routes>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
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
  );
}
