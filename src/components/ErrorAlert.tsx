'use client';

import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

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

  const positionClass = position === 'top' ? 'top-4' : 'bottom-4';

  return (
    <div
      className={`fixed ${positionClass} right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-in`}
    >
      <div className="bg-danger text-white px-lg py-md rounded-md shadow-lg flex items-start gap-md">
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
