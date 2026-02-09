import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      {/* SIDEBAR */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
      />

      {/* MAIN COLUMN */}
      <div className="flex flex-col flex-1 w-full">
        {/* TOP BAR (fixed height) */}
        <TopBar
          onMenuClick={() => setIsSidebarOpen(true)}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        {/* 
          ✅ THIS IS THE SCROLL CONTAINER
          - overflow-y-auto ENABLED
          - flex-1 to take remaining height
        */}
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
