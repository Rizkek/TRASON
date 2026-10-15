'use client';

import React from 'react';
import { IconProps as PhosphorIconProps } from '@phosphor-icons/react';

interface TrasonIconProps extends PhosphorIconProps {
  icon: React.ElementType; // The phosphor icon component
  variant?: 'navigation' | 'card' | 'analytics' | 'hero' | 'default';
  active?: boolean;
}

export function TrasonIcon({
  icon: Icon,
  variant = 'default',
  active = false,
  className = '',
  size,
  ...props
}: TrasonIconProps) {
  // Navigation: Simple outline, fill when active + gold color
  if (variant === 'navigation') {
    return (
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          active
            ? 'text-warm-gold scale-110'
            : 'text-gray-light hover:text-soft-cream hover:scale-105'
        }`}
      >
        <Icon
          weight={active ? 'fill' : 'regular'}
          size={size || 20}
          className={className}
          {...props}
        />
      </div>
    );
  }

  // Card Dashboard: Duotone, subtle interactive hover
  if (variant === 'card') {
    return (
      <div
        className={`p-2 rounded-xl bg-gray-medium/20 transition-all duration-300 group flex items-center justify-center ${className}`}
      >
        <Icon
          weight="duotone"
          size={size || 24}
          className={`text-gray-light group-hover:text-warm-gold transition-colors duration-300`}
          {...props}
        />
      </div>
    );
  }

  // Analytics: Colorful, duotone, active states
  if (variant === 'analytics') {
    return (
      <Icon
        weight={active ? 'fill' : 'duotone'}
        size={size || 24}
        className={`transition-colors duration-300 ${
          active ? 'text-warm-gold drop-shadow-md' : 'text-gray-light'
        } ${className}`}
        {...props}
      />
    );
  }

  // Hero: All out, glassmorphism, glow
  if (variant === 'hero') {
    return (
      <div
        className={`relative p-4 rounded-2xl bg-gray-strong border border-gray-medium/50 flex items-center justify-center ${className}`}
      >
        <Icon
          weight="duotone"
          size={size || 48}
          className="text-warm-gold relative z-10"
          {...props}
        />
      </div>
    );
  }

  // Default: Just a wrapper for consistent sizing and standard colors
  return (
    <Icon
      weight="regular"
      size={size || 20}
      className={`text-gray-light ${className}`}
      {...props}
    />
  );
}
