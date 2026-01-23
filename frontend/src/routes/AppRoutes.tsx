import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/LoginPage";
import Dashboard from "@/pages/dashboard/Dashboard";
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
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<HomePage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route
          path="settings"
          element={
            <div className="flex h-[50vh] items-center justify-center rounded-2xl border border-white/40 bg-white/20 backdrop-blur-md">
              <p className="text-slate-500">Settings page placeholder</p>
            </div>
          }
        />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
