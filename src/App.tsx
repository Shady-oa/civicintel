import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Login from "./pages/Login";
import UserLayout from "./components/layouts/UserLayout";
import AdminLayout from "./components/layouts/AdminLayout";

import UserHome from "./pages/user/Home";
import ReportIssue from "./pages/user/ReportIssue";
import MyReports from "./pages/user/MyReports";
import MapView from "./pages/user/MapView";
import ChatPage from "./pages/user/ChatPage";
import NotificationsPage from "./pages/user/NotificationsPage";
import Profile from "./pages/user/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import AllReports from "./pages/admin/AllReports";
import RiskMonitoring from "./pages/admin/RiskMonitoring";
import ChatCenter from "./pages/admin/ChatCenter";
import AdminManagement from "./pages/admin/AdminManagement";
import Performance from "./pages/admin/Performance";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { session } = useAuth();

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (session.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><AllReports /></AdminLayout>} />
        <Route path="/admin/risk" element={<AdminLayout><RiskMonitoring /></AdminLayout>} />
        <Route path="/admin/performance" element={<AdminLayout><Performance /></AdminLayout>} />
        <Route path="/admin/chat" element={<AdminLayout><ChatCenter /></AdminLayout>} />
        <Route path="/admin/notifications" element={<AdminLayout><NotificationsPage /></AdminLayout>} />
        <Route path="/admin/management" element={<AdminLayout><AdminManagement /></AdminLayout>} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/user" element={<UserLayout><UserHome /></UserLayout>} />
      <Route path="/user/report" element={<UserLayout><ReportIssue /></UserLayout>} />
      <Route path="/user/my-reports" element={<UserLayout><MyReports /></UserLayout>} />
      <Route path="/user/map" element={<UserLayout><MapView /></UserLayout>} />
      <Route path="/user/chat" element={<UserLayout><ChatPage /></UserLayout>} />
      <Route path="/user/notifications" element={<UserLayout><NotificationsPage /></UserLayout>} />
      <Route path="/user/profile" element={<UserLayout><Profile /></UserLayout>} />
      <Route path="/" element={<Navigate to="/user" replace />} />
      <Route path="*" element={<Navigate to="/user" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
