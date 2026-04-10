'use client';

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'income' | 'expense' | 'insight' | 'activity';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-gray-strong bg-opacity-50 text-soft-cream border border-gray-light border-opacity-30',
      income: 'bg-muted-green bg-opacity-20 text-muted-green border border-muted-green border-opacity-40',
      expense: 'bg-warm-brown bg-opacity-20 text-warm-brown border border-warm-brown border-opacity-40',
      insight: 'bg-insight-taupe bg-opacity-20 text-insight-taupe border border-insight-taupe border-opacity-40',
      activity: 'bg-peachy bg-opacity-20 text-peachy border border-peachy border-opacity-40',
    };

    const sizeStyles = {
      sm: 'px-md py-xs text-xs font-medium',
      md: 'px-lg py-sm text-sm font-medium',
      lg: 'px-2xl py-md text-base font-semibold',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-md font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
