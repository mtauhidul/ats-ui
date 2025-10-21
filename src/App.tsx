import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import { Toaster } from "./components/ui/sonner";
import AuthPage from "./pages/auth";
import DashboardPage from "./pages/dashboard";
import HomePage from "./pages/home";
import JobsPage from "./pages/jobs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="jobs" element={<JobsPage />} />
        </Route>
        <Route path="dashboard" element={<DashboardPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
