import React, { useState } from "react";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  PanelLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UI } from "@/ui/ui";

interface TopBarProps {
  onMenuClick: () => void;          // mobile
  onToggleSidebar: () => void;      // desktop collapse
  isSidebarCollapsed: boolean;
}

export function TopBar({
  onMenuClick,
  onToggleSidebar,
  isSidebarCollapsed,
}: TopBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header
      className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 md:px-10 backdrop-blur-xl"
      style={{
        background: UI.colors.surface.glassSm,
        borderBottom: `1px solid ${UI.colors.border.strong}`,
      }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 md:hidden"
          style={{ color: UI.colors.text.secondary }}
        >
          <Menu size={24} />
        </button>

        {/* DESKTOP SIDEBAR TOGGLE */}
        <div
          className="relative hidden md:block"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <motion.button
            onClick={onToggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-2"
            style={{
              background: UI.colors.surface.glassSm,
              border: `1px solid ${UI.colors.border.glass}`,
              color: UI.colors.text.secondary,
            }}
          >
            <PanelLeft size={20} />
          </motion.button>

          {/* TOOLTIP */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md px-3 py-1.5 text-xs"
                style={{
                  background: UI.colors.surface.glassLg,
                  border: `1px solid ${UI.colors.border.glass}`,
                  color: UI.colors.text.primary,
                  boxShadow: UI.colors.shadow.sm,
                }}
              >
                {isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SEARCH */}
      
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative rounded-full p-2.5"
          style={{
            background: UI.colors.surface.glassSm,
            color: UI.colors.text.secondary,
          }}
        >
          <Bell size={20} />
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full"
            style={{
              background: UI.colors.danger,
              border: `2px solid ${UI.colors.surface.glassLg}`,
            }}
          />
        </motion.button>

        {/* Profile */}
        <div className="relative">
          <motion.button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 rounded-full p-1.5 pr-4"
            style={{
              background: UI.colors.surface.glassSm,
              border: `1px solid ${UI.colors.border.glass}`,
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                backgroundImage: UI.colors.gradient.accent,
                color: UI.colors.text.inverse,
                boxShadow: UI.colors.shadow.sm,
              }}
            >
              <User size={16} />
            </div>

            <span
              className="hidden text-sm font-medium md:block"
              style={{ color: UI.colors.text.secondary }}
            >
              Sai Kumar
            </span>

            <ChevronDown
              size={16}
              className={`transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
              style={{ color: UI.colors.text.muted }}
            />
          </motion.button>

          {/* Dropdown (unchanged) */}
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 origin-top-right overflow-hidden rounded-xl p-1 backdrop-blur-2xl"
                style={{
                  background: UI.colors.surface.glassLg,
                  border: `1px solid ${UI.colors.border.strong}`,
                  boxShadow: UI.colors.shadow.lg,
                }}
              >
                {/* same content */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
