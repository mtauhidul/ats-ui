import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import DashboardLayout from "./components/dashboard-layout";
import { Toaster } from "./components/ui/sonner";
import AuthPage from "./pages/auth";
import HomePage from "./pages/home";
import JobsPage from "./pages/jobs";
import DashboardMainPage from "./pages/dashboard/dashboard-main";
import ClientsPage from "./pages/dashboard/clients";
import CandidatesPage from "./pages/dashboard/candidates";
import CandidateDetailsPage from "./pages/dashboard/candidates/details";
import ApplicationsPage from "./pages/dashboard/applications";
import TeamPage from "./pages/dashboard/team";
import AnalyticsPage from "./pages/dashboard/analytics";
import DashboardJobsPage from "./pages/dashboard/jobs";
import JobPipelinePage from "./pages/dashboard/jobs/pipeline";
import JobCandidateCommunicationPage from "./pages/dashboard/jobs/candidate-communication";
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
          <Route path="auth" element={<AuthPage />} />
          <Route path="jobs" element={<JobsPage />} />
        </Route>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardMainPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="jobs" element={<DashboardJobsPage />} />
          <Route path="jobs/pipeline/:jobId" element={<JobPipelinePage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="candidates/:candidateId" element={<CandidateDetailsPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
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
