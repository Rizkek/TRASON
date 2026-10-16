'use client';

import React from 'react';
import { CheckCircle, XCircle, Warning, Info, X } from '@phosphor-icons/react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const TYPE_STYLES = {
  success: { box: 'border-success/40 bg-success/10', icon: CheckCircle, iconColor: 'text-success' },
  error: { box: 'border-danger/40 bg-danger/10', icon: XCircle, iconColor: 'text-danger' },
  warning: { box: 'border-warning/40 bg-warning/10', icon: Warning, iconColor: 'text-warning' },
  info: { box: 'border-info/40 bg-info/10', icon: Info, iconColor: 'text-info' },
} as const;

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ type = 'info', title, dismissible = true, onDismiss, className = '', children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const style = TYPE_STYLES[type];
    const Icon = style.icon;

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        role={type === 'error' ? 'alert' : 'status'}
        className={`rounded-md border p-4 sm:p-5 ${style.box} ${className}`}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon size={22} weight="fill" aria-hidden="true" className={`mt-0.5 shrink-0 ${style.iconColor}`} />
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-label-md text-foreground">{title}</h3>}
            <div className="text-body-md text-foreground">{children}</div>
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
