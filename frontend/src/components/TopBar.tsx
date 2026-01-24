import { Bell, Menu, ChevronDown, PanelLeft } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
}

export function TopBar({ onMenuClick, onToggleSidebar }: TopBarProps) {
  return (
    <header className="sticky top-0 inset-x-0 flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white border-b border-gray-200 text-sm py-3 sm:py-0 dark:bg-slate-900 dark:border-slate-700">
      <nav className="relative max-w-7xl w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between h-16" aria-label="Global">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onMenuClick} className="md:hidden p-2 inline-flex justify-center items-center gap-2 rounded-lg border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-gray-400 dark:focus:ring-offset-gray-800">
              <Menu size={20} />
            </button>
            <button onClick={onToggleSidebar} className="hidden md:flex p-2 items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-400 dark:hover:bg-slate-800">
              <PanelLeft size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-4 w-full sm:w-auto">
          {/* Notifications */}
          <button className="relative inline-flex flex-shrink-0 justify-center items-center h-[38px] w-[38px] rounded-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-400 dark:hover:bg-slate-800">
            <Bell size={18} />
            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500 dark:ring-slate-900"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="hs-dropdown relative inline-flex">
            <button id="hs-dropdown-profile" type="button" className="hs-dropdown-toggle inline-flex items-center gap-x-2 text-sm font-semibold rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 pr-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                SK
              </div>
              <span className="hidden sm:block text-gray-600 dark:text-gray-400">Sai Kumar</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}