import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavIconProps {
  icon: LucideIcon;
  isActive: boolean;
  size?: number;
  className?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({
  icon: Icon,
  isActive,
  size = 20,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'} ${className}`}>
      {/* Background Soft Glow when active */}
      <div 
        className={`absolute inset-0 bg-primary/20 blur-md rounded-full transition-opacity duration-500 ease-out pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0'}`} 
      />
      
      {/* The Icon */}
      <Icon
        size={size}
        strokeWidth={isActive ? 2.5 : 2}
        className={`relative z-10 transition-colors duration-300 ${
          isActive 
            ? 'text-primary drop-shadow-[0_0_8px_rgba(244,201,93,0.5)]' 
            : 'text-gray-light group-hover:text-soft-cream group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.2)]'
        }`}
      />
    </div>
  );
};
