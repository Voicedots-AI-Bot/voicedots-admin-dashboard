import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/LoginPage";
import { HomePage } from "@/pages/dashboard/HomePage";
import { ConversationsPage } from "@/pages/dashboard/ConversationsPage"


const AppRoutes = () => {
  return (
    <Routes>
      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          //<ProtectedRoute>
            <DashboardLayout />
          //</ProtectedRoute>
        }
      >
        {/* URL: /dashboard */}
        <Route index element={<HomePage />} />

        {/* URL: /dashboard/conversations */}
        <Route path="conversations" element={<ConversationsPage />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
