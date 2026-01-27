import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/LoginPage";

import { HomePage } from "@/pages/dashboard/HomePage";
import { ConversationsPage } from "@/pages/dashboard/ConversationsPage";
import { ConversationDetails } from "@/pages/dashboard/ConversationDetails";
import SettingsPage from "@/pages/dashboard/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ROOT */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<HomePage />} />

        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="conversations/:id" element={<ConversationDetails />} />

        {/* SETTINGS */}
        <Route path="settings" element={<SettingsPage />} />

        {/* DASHBOARD FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Route>

      {/* GLOBAL 404 */}
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
};

export default AppRoutes;
