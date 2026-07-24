import React from 'react';
import { TrasonIcon } from './TrasonIcon';

interface NavIconProps {
  icon: React.ElementType;
  isActive: boolean;
  size?: number;
  className?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({
  icon,
  isActive,
  size = 20,
  className = '',
}) => {
  return (
    <TrasonIcon 
      icon={icon} 
      variant="navigation" 
      active={isActive} 
      size={size} 
      className={className} 
    />
  );
};
