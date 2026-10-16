'use client';

import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'income' | 'expense' | 'insight' | 'activity' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-foreground/5 text-subtle border border-foreground/15',
      income: 'bg-success/10 text-success border border-success/20',
      success: 'bg-success/10 text-success border border-success/20',
      expense: 'bg-danger/10 text-danger border border-danger/20',
      danger: 'bg-danger/10 text-danger border border-danger/20',
      insight: 'bg-secondary/10 text-secondary border border-secondary/20',
      info: 'bg-info/10 text-info border border-info/20',
      activity: 'bg-primary/10 text-primary border border-primary/20',
      warning: 'bg-warning/10 text-warning border border-warning/20',
    };

    const sizeStyles = {
      sm: 'px-2 py-1 text-xs font-medium uppercase tracking-wider',
      md: 'px-4 py-2 text-xs font-medium uppercase tracking-widest',
      lg: 'px-6 py-4 text-sm font-medium uppercase tracking-widest',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-sm ${variantStyles[variant as keyof typeof variantStyles]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
