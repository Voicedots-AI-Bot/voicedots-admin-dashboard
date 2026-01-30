import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
      />

      {/* MAIN COLUMN */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* TOP BAR (FIXED HEIGHT) */}
        <TopBar
          onMenuClick={() => setIsSidebarOpen(true)}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        {/* 
          IMPORTANT:
          - NO overflow here
          - NO scrolling here
        */}
        <main
          className={`flex-1 overflow-hidden ${
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
