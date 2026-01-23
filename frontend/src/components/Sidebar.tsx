import {
  Home,
  MessageSquare,
  Settings,
  LogOut,
  X,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UI } from "@/ui/ui";

interface SidebarProps {
  isOpen: boolean; // mobile
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;

  isCollapsed: boolean; // desktop
  onToggleCollapse: () => void;
}

const SIDEBAR_EXPANDED = 256;
const SIDEBAR_COLLAPSED = 72;

export function Sidebar({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "conversations", icon: MessageSquare, label: "Conversations" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const SidebarContent = (
    <div className="relative flex h-full flex-col p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xl"
            style={{
              background: UI.colors.primary,
              color: UI.colors.text.inverse,
              boxShadow: UI.colors.shadow.md,
            }}
          >
            V
          </div>

          {!isCollapsed && (
            <span
              className="text-xl font-bold"
              style={{ color: UI.colors.text.primary }}
            >
              VoiceDots
            </span>
          )}
        </div>

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="rounded-lg p-1 md:hidden"
          style={{ color: UI.colors.text.secondary }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Collapse toggle (desktop) */}


      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onClose();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex w-full items-center rounded-xl py-3 text-sm font-medium transition-all
                ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"}
              `}
              style={{
                background: isActive
                  ? UI.colors.surface.glassMd
                  : "transparent",
                color: isActive
                  ? UI.colors.text.primary
                  : UI.colors.text.secondary,
                border: isActive
                  ? `1px solid ${UI.colors.border.glass}`
                  : "1px solid transparent",
              }}
            >
              <item.icon
                size={20}
                style={{
                  color: isActive
                    ? UI.colors.text.primary
                    : UI.colors.text.muted,
                }}
              />
              {!isCollapsed && item.label}
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="pt-6"
        style={{ borderTop: `1px solid ${UI.colors.border.subtle}` }}
      >
        <motion.button
          onClick={() => {
            localStorage.clear();
            navigate("/login", { replace: true });
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex w-full items-center rounded-xl py-3 text-sm font-medium transition-all
            ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"}
          `}
          style={{ color: UI.colors.text.secondary }}
        >
          <LogOut size={20} />
          {!isCollapsed && "Logout"}
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 md:hidden"
              style={{
                background: UI.colors.surface.overlay,
                backdropFilter: "blur(4px)",
              }}
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
              style={{
                background: UI.colors.surface.glassSm,
                borderRight: `1px solid ${UI.colors.border.strong}`,
              }}
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{
          width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative z-30 hidden h-screen md:block"
        style={{
          background: UI.colors.surface.glassSm,
          borderRight: `1px solid ${UI.colors.border.strong}`,
          backdropFilter: "blur(20px)",
        }}
      >
        {SidebarContent}
      </motion.aside>
    </>
  );
}
