import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { UI } from "@/ui/ui";

export default function Dashboard() {
  // Mobile sidebar (overlay)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Desktop sidebar (collapsed / expanded)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = location.pathname.includes("conversations")
    ? "conversations"
    : location.pathname.includes("settings")
    ? "settings"
    : "home";

  const onNavigate = (page: string) => {
    if (page === "home") navigate("/dashboard");
    if (page === "conversations") navigate("/dashboard/conversations");
    if (page === "settings") navigate("/dashboard/settings");
  };

  return (
    <div
      className="flex min-h-screen w-full font-sans"
      style={{
        color: UI.colors.text.primary,
        backgroundImage: UI.colors.gradient.app,
      }}
    >
      {/* SIDEBAR (desktop + mobile handled internally) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() =>
          setIsSidebarCollapsed((prev) => !prev)
        }
      />

      {/* MAIN CONTENT */}
      <div className="relative flex flex-1 flex-col">
        {/* TOP BAR */}
        <TopBar
          onMenuClick={() => setIsSidebarOpen(true)} // mobile
          onToggleSidebar={() =>
            setIsSidebarCollapsed((prev) => !prev)
          } // desktop
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
