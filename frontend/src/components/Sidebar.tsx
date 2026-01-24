import { Home, MessageSquare, Settings, LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean; // mobile
  onClose: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  isCollapsed: boolean; // desktop
}

export function Sidebar({ isOpen, onClose, currentPage, onNavigate, isCollapsed }: SidebarProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "conversations", icon: MessageSquare, label: "Conversations" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div className={`fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 start-0 z-[70] transition-all duration-300 transform bg-white border-e border-gray-200 dark:bg-slate-900 dark:border-slate-700 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${isCollapsed ? 'md:w-20' : 'md:w-64'} 
        md:translate-x-0 md:static md:block`}>
        
        <div className="flex flex-col h-full py-6">
          {/* Logo Area */}
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                V
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-800 dark:text-white">voicedots</span>
              )}
            </div>
            <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400">
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-slate-700 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { 
                    // 1. Trigger the URL change
                    if (item.id === "home") {
                      navigate("/dashboard");
                    } else {
                      navigate(`/dashboard/${item.id}`);
                    }
                    
                    // 2. Call the parent function if it exists (for state highlighting)
                    if (onNavigate) onNavigate(item.id); 
                    
                    // 3. Close mobile menu
                    onClose(); 
                  }}
                  className={`w-full flex items-center gap-x-3.5 py-3 px-4 text-sm rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-300'}
                    ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}
                >
                  <item.icon size={20} />
                  {!isCollapsed && item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="px-3 mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              onClick={() => { localStorage.clear(); navigate("/login"); }}
              className={`w-full flex items-center gap-x-3.5 py-3 px-4 text-sm text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors
                ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}
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