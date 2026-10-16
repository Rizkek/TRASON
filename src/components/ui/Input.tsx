'use client';

import React, { forwardRef, memo } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  helperText?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    (
      {
        label,
        error,
        helperText,
        helpText,
        leftIcon,
        rightIcon,
        prefix,
        suffix,
        className = '',
        disabled,
        id,
        ...props
      },
      ref
    ) => {
      const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
      const effectiveLeft = leftIcon || prefix;
      const effectiveRight = rightIcon || suffix;
      const effectiveHelp = helperText || helpText;
      const errorId = error && inputId ? `${inputId}-error` : undefined;
      const helpId = effectiveHelp && inputId ? `${inputId}-help` : undefined;
      const ariaDescribedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;

      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5"
            >
              {label}
            </label>
          )}

          <div className="relative flex items-center">
            {effectiveLeft && (
              <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
                {effectiveLeft}
              </div>
            )}

            <input
              ref={ref}
              id={inputId}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={ariaDescribedBy}
              className={`w-full bg-foreground/[0.04] border text-foreground placeholder:text-muted-foreground/70 text-sm rounded-lg px-3.5 py-2.5 transition-colors duration-200 outline-none ${
                effectiveLeft ? 'pl-10' : ''
              } ${effectiveRight ? 'pr-10' : ''} ${
                error
                  ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                  : 'border-foreground/15 hover:border-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
              {...props}
            />

            {effectiveRight && (
              <div className={`absolute right-3 flex items-center text-muted-foreground ${!suffix ? 'pointer-events-none' : ''}`}>
                {effectiveRight}
              </div>
            )}
          </div>

          {error && (
            <p id={errorId} className="mt-1 text-xs text-danger font-medium">{error}</p>
          )}

          {!error && effectiveHelp && (
            <p id={helpId} className="mt-1 text-xs text-muted-foreground">{effectiveHelp}</p>
          )}
        </div>
      );
    }
  )
);

Input.displayName = 'Input';
