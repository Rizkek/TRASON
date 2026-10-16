'use client';

import React from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import { Button } from './ui/Button';

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Persistent in-page error for failed data loads. Unlike ErrorAlert it does not auto-dismiss,
 * so a failed load is never mistaken for an empty list.
 */
export const InlineError: React.FC<InlineErrorProps> = ({ message, onRetry, retryLabel = 'Try again', className = '' }) => (
  <div
    role="alert"
    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 ${className}`}
  >
    <div className="flex items-start gap-3 min-w-0">
      <WarningCircle size={20} weight="fill" className="text-danger shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm text-foreground">{message}</p>
    </div>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry} className="self-start sm:self-auto shrink-0">
        {retryLabel}
      </Button>
    )}
  </div>
);
