'use client';

import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      type = 'info',
      title,
      dismissible = true,
      onDismiss,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const typeStyles = {
      success: {
        bg: 'bg-success/12',
        border: 'border-success/40',
        text: 'text-soft-cream',
        title: 'text-soft-cream font-semibold',
        icon: '✓',
      },
      error: {
        bg: 'bg-danger/12',
        border: 'border-danger/45',
        text: 'text-soft-cream',
        title: 'text-soft-cream font-semibold',
        icon: '✕',
      },
      warning: {
        bg: 'bg-warning/14',
        border: 'border-warning/45',
        text: 'text-soft-cream',
        title: 'text-soft-cream font-semibold',
        icon: '!',
      },
      info: {
        bg: 'bg-info/14',
        border: 'border-info/45',
        text: 'text-soft-cream',
        title: 'text-soft-cream font-semibold',
        icon: 'ℹ',
      },
    };

    const style = typeStyles[type];

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={`border rounded-md p-lg ${style.bg} ${style.border} ${className}`}
        {...props}
      >
        <div className="flex gap-lg">
          <div className={`flex-shrink-0 text-lg font-bold ${style.text}`} aria-hidden="true">{style.icon}</div>
          <div className="flex-1">
            {title && <h3 className={`${style.title} text-sm`}>{title}</h3>}
            <div className={`${style.text} text-base`}>{children}</div>
          </div>
          {dismissible && (
            <button
              onClick={handleDismiss}
              aria-label="Dismiss alert"
              className={`flex-shrink-0 ${style.text} hover:opacity-80 transition focus-visible:ring-2 focus-visible:ring-secondary rounded-sm`}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
