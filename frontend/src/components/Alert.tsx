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
        bg: 'bg-muted-green bg-opacity-10',
        border: 'border-muted-green border-opacity-30',
        text: 'text-muted-green',
        title: 'text-muted-green font-semibold',
        icon: '✓',
      },
      error: {
        bg: 'bg-warm-brown bg-opacity-10',
        border: 'border-warm-brown border-opacity-30',
        text: 'text-warm-brown',
        title: 'text-warm-brown font-semibold',
        icon: '✕',
      },
      warning: {
        bg: 'bg-peachy bg-opacity-10',
        border: 'border-peachy border-opacity-30',
        text: 'text-peachy',
        title: 'text-peachy font-semibold',
        icon: '!',
      },
      info: {
        bg: 'bg-deep-sage bg-opacity-10',
        border: 'border-deep-sage border-opacity-30',
        text: 'text-deep-sage',
        title: 'text-deep-sage font-semibold',
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
          <div className={`flex-shrink-0 text-lg font-bold ${style.text}`}>{style.icon}</div>
          <div className="flex-1">
            {title && <h3 className={style.title}>{title}</h3>}
            <div className={`${style.text} text-base`}>{children}</div>
          </div>
          {dismissible && (
            <button
              onClick={handleDismiss}
              className={`flex-shrink-0 ${style.text} hover:opacity-75 transition`}
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
