'use client';

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'income' | 'expense' | 'insight' | 'activity' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-black/5 dark:bg-white/5 text-gray-very-light border border-black/10 dark:border-white/10',
      income: 'bg-success/10 text-success border border-success/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
      success: 'bg-success/10 text-success border border-success/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
      expense: 'bg-danger/10 text-danger border border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
      danger: 'bg-danger/10 text-danger border border-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
      insight: 'bg-secondary/10 text-secondary border border-secondary/20 shadow-[0_0_10px_rgba(6,143,255,0.1)]',
      info: 'bg-secondary/10 text-secondary border border-secondary/20 shadow-[0_0_10px_rgba(6,143,255,0.1)]',
      activity: 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(78,79,235,0.1)]',
      warning: 'bg-warning/10 text-warning border border-warning/20',
    };

    const sizeStyles = {
      sm: 'px-sm py-xs text-[9px] font-bold uppercase tracking-wider',
      md: 'px-md py-sm text-[10px] font-bold uppercase tracking-widest',
      lg: 'px-lg py-md text-xs font-bold uppercase tracking-widest',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-sm transition-all duration-300 ${variantStyles[variant as keyof typeof variantStyles]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
