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

      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold text-soft-cream/80 uppercase tracking-wider mb-1.5"
            >
              {label}
            </label>
          )}

          <div className="relative flex items-center">
            {effectiveLeft && (
              <div className="absolute left-3 flex items-center pointer-events-none text-gray-light">
                {effectiveLeft}
              </div>
            )}

            <input
              ref={ref}
              id={inputId}
              disabled={disabled}
              className={`w-full bg-black/30 border text-soft-cream placeholder:text-gray-light/50 text-sm rounded-lg px-3.5 py-2.5 transition-all duration-200 outline-none ${
                effectiveLeft ? 'pl-10' : ''
              } ${effectiveRight ? 'pr-10' : ''} ${
                error
                  ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                  : 'border-white/10 hover:border-white/20 focus:border-warm-gold focus:ring-1 focus:ring-warm-gold/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed bg-black/40' : ''} ${className}`}
              {...props}
            />

            {effectiveRight && (
              <div className={`absolute right-3 flex items-center text-gray-light ${!suffix ? 'pointer-events-none' : ''}`}>
                {effectiveRight}
              </div>
            )}
          </div>

          {error && (
            <p className="mt-1 text-xs text-danger font-medium">{error}</p>
          )}

          {!error && effectiveHelp && (
            <p className="mt-1 text-xs text-gray-light">{effectiveHelp}</p>
          )}
        </div>
      );
    }
  )
);

Input.displayName = 'Input';
