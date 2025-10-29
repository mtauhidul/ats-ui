import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import DashboardLayout from "./components/dashboard-layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import LoginPage from "./pages/auth/login";
import RegisterAdminPage from "./pages/auth/register-admin";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ResetPasswordPage from "./pages/auth/reset-password";
import VerifyEmailPage from "./pages/auth/verify-email";
import MagicLinkPage from "./pages/auth/magic-link";
import VerifyMagicLinkPage from "./pages/auth/verify-magic-link";
import HomePage from "./pages/home";
import JobsPage from "./pages/jobs";
import PublicJobDetailPage from "./pages/jobs/detail";
import PublicApplyPage from "./pages/apply";
import ApplySuccessPage from "./pages/apply/success";
import DashboardMainPage from "./pages/dashboard/dashboard-main";
import ClientsPage from "./pages/dashboard/clients";
import ClientDetailPage from "./pages/dashboard/clients/detail";
import CandidatesPage from "./pages/dashboard/candidates";
import CandidateDetailsPage from "./pages/dashboard/candidates/details";
import QuickImportPage from "./pages/dashboard/candidates/quick-import";
import ApplicationsPage from "./pages/dashboard/applications";
import TeamPage from "./pages/dashboard/team";
import TeamMemberDetailPage from "./pages/dashboard/team/detail";
import DashboardJobsPage from "./pages/dashboard/jobs";
import JobDetailPage from "./pages/dashboard/jobs/detail";
import JobCandidateDetailPage from "./pages/dashboard/jobs/candidate-detail";
import JobPipelinePage from "./pages/dashboard/jobs/pipeline";
import InterviewPage from "./pages/dashboard/jobs/interview";
// import JobCandidateCommunicationPage from "./pages/dashboard/jobs/candidate-communication";
import TagsPage from "./pages/dashboard/tags";
import CategoriesPage from "./pages/dashboard/categories";
import AccountPage from "./pages/dashboard/account";
import NotificationsPage from "./pages/dashboard/notifications";
import SearchPage from "./pages/dashboard/search";
import SettingsPage from "./pages/dashboard/settings";
import HelpPage from "./pages/dashboard/help";
import MessagesPage from "./pages/dashboard/messages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:jobId" element={<PublicJobDetailPage />} />
          <Route path="apply/:jobId" element={<PublicApplyPage />} />
          <Route path="apply/success" element={<ApplySuccessPage />} />
        </Route>
        
        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register-admin" element={<RegisterAdminPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="magic-link" element={<MagicLinkPage />} />
        <Route path="magic-link/:token" element={<VerifyMagicLinkPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardMainPage />} />
          
          {/* Clients Routes */}
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:clientId" element={<ClientDetailPage />} />
          <Route path="clients/:clientId/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="clients/:clientId/jobs/:jobId/candidates/:candidateId" element={<JobCandidateDetailPage />} />
          <Route path="clients/:clientId/jobs/:jobId/candidates/:candidateId/interviews" element={<InterviewPage />} />
          
          {/* Jobs Routes */}
          <Route path="jobs" element={<DashboardJobsPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />
          <Route path="jobs/:jobId/candidates/:candidateId" element={<JobCandidateDetailPage />} />
          <Route path="jobs/:jobId/candidates/:candidateId/interviews" element={<InterviewPage />} />
          <Route path="jobs/pipeline/:jobId" element={<JobPipelinePage />} />
          
          {/* Candidates Routes */}
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="candidates/quick-import" element={<QuickImportPage />} />
          <Route path="candidates/:candidateId" element={<CandidateDetailsPage />} />
          
          {/* Other Routes */}
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="team/:memberId" element={<TeamMemberDetailPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
