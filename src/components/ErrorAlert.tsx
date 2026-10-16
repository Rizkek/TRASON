'use client';

import React, { useEffect } from 'react';
import { WarningCircle as AlertCircle, X } from '@phosphor-icons/react';

interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
  autoClose?: number; // milliseconds
  position?: 'top' | 'bottom';
}

export function ErrorAlert({
  error,
  onDismiss,
  autoClose = 5000,
  position = 'top',
}: ErrorAlertProps) {
  useEffect(() => {
    if (error && autoClose) {
      const timer = setTimeout(onDismiss, autoClose);
      return () => clearTimeout(timer);
    }
  }, [error, autoClose, onDismiss]);

  if (!error) return null;

  const positionClass = position === 'top' ? 'top-[max(1rem,env(safe-area-inset-top))]' : 'bottom-[max(1rem,env(safe-area-inset-bottom))]';

  return (
    <div
      role="alert"
      className={`fixed ${positionClass} right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-up`}
    >
      <div className="flex items-start gap-3 rounded-md bg-danger py-3 pl-4 pr-1 text-background">
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="py-2 text-body-md font-medium">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md opacity-80 transition-opacity hover:opacity-100"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
