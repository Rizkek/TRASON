'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, id, className, ...props }, ref) => {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error && fieldId ? `${fieldId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={cn(
          'w-full resize-none rounded-lg border bg-foreground/[0.04] px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted-foreground/70',
          error
            ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
            : 'border-foreground/15 hover:border-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/50',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
