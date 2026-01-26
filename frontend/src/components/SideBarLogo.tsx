import React from 'react';
import { X } from 'lucide-react'; 

import logoIcon from "@/assets/logo.png";
import logoText from "@/assets/voicedots.png";

interface SidebarLogoProps {
  isCollapsed: boolean;
  onClose: () => void;
  className?: string;
}

const SidebarLogo: React.FC<SidebarLogoProps> = ({ 
  isCollapsed, 
  onClose, 
  className = "" 
}) => {
  return (
    <div className={`px-6 mb-8 flex items-center justify-between ${className}`}>
      
      {/* Logo Container */}
      <div className="flex items-center">
        {/* Icon logo */}
        <img
          src={logoIcon}
          alt="Voicedots Icon"
          className="w-12 h-12 object-contain"
        />

        {/* Text logo */}
        {!isCollapsed && (
          <img
            src={logoText}
            alt="Voicedots"
            className="h-8 md:h-10 object-contain mt-1.5"
          />
        )}
      </div>

      {/* Mobile close button */}
      <button
        onClick={onClose}
        aria-label="Close sidebar"
        className="md:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400 transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default SidebarLogo;