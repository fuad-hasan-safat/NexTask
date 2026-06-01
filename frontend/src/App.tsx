import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";
import LoginPage from "./pages/auth/LoginPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import "./App.css";
import RegisterPage from "./pages/auth/RegisterPage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import type { ReactNode } from "react";
import ProjectBoardPage from "./pages/dashboard/ProjectBoardPage";
import InvitesPage from "./pages/invites/InvitesPage";
import InviteMemberPage from "./pages/org/InviteMemberPage";
import MembersPage from "./pages/org/MembersPage";
import ActivityFeed from "./pages/org/ActivityFeed";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import LandingPage from "./pages/LandingPage";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* /app */}
        <Route index element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectBoardPage />} />
        <Route path="invites" element={<InvitesPage />} />
        <Route path="org/invite" element={<InviteMemberPage />} />
        <Route path="org/members" element={<MembersPage />} />
        <Route path="activity" element={<ActivityFeed />} />
        <Route path="notifications" element={<NotificationsPage />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
