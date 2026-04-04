import { Home, MessageSquare, Settings, LogOut, Users, Ticket } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import authApi from "@/api/authApi";
import SidebarLogo from "./SideBarLogo";

interface SidebarProps {
  isOpen: boolean; // mobile
  onClose: () => void;
  isCollapsed: boolean; // desktop
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // const { logout } = useAuth();

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/dashboard" },
    {
      id: "conversations",
      icon: MessageSquare,
      label: "Conversations",
      path: "/dashboard/conversations",
    },
    {
      id: "leads",
      icon: Users,
      label: "Leads",
      path: "/dashboard/leads",
    },
    {
      id: "tickets",
      icon: Ticket,
      label: "Tickets",
      path: "/dashboard/tickets",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      path: "/dashboard/settings",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 start-0 z-[70] transition-all duration-300 transform
        bg-white border-e border-gray-200 dark:bg-slate-900 dark:border-slate-700
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "md:w-20" : "md:w-64"}
        md:translate-x-0 md:sticky md:top-0 md:h-screen md:block`}
      >
        <div className="flex flex-col h-full py-6">
          {/* Logo */}
          <SidebarLogo
            isCollapsed={isCollapsed}
            onClose={onClose}
          />

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                item.path === "/dashboard"
                  ? location.pathname === "/dashboard"
                  : location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-x-3.5 py-3 px-4 text-sm rounded-lg transition-colors
                    ${isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-300"
                    }
                    ${isCollapsed ? "md:justify-center md:px-0" : ""}`}
                >
                  <item.icon size={20} />
                  {!isCollapsed && item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                authApi.logout().then(() => {
                  navigate("/login", { replace: true });
                });
              }}
              className={`w-full flex items-center gap-x-3.5 py-3 px-4 text-sm text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors
                ${isCollapsed ? "md:justify-center md:px-0" : ""}`}
            >
              <LogOut size={20} />
              {!isCollapsed && "Logout"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
