import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  /**
   * ROUTE MAPPING
   * /dashboard                 -> home
   * /dashboard/conversations   -> conversations
   * /dashboard/conversations/5 -> conversations
   * /dashboard/settings        -> settings
   */
  const pathParts = location.pathname.split("/");

  let currentPage: "home" | "conversations" | "settings" = "home";

  if (pathParts.includes("conversations")) {
    currentPage = "conversations";
  } else if (pathParts.includes("settings")) {
    currentPage = "settings";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        // currentPage={currentPage}
      />

      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <TopBar
          onMenuClick={() => setIsSidebarOpen(true)}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main
          className={`flex-1 overflow-y-auto ${
            location.pathname.startsWith("/dashboard/conversations/")
              ? "p-0"
              : "p-4 md:p-8"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
