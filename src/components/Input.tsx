'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, suffix, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-sm">
        {label && (
          <label className="block text-xs font-semibold text-gray-very-light tracking-wide">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-md top-1/2 -translate-y-1/2 text-gray-light group-focus-within:text-primary transition-colors z-10 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-12 px-lg bg-gray-strong/70 border transition-all duration-300 rounded-md focus:ring-2 focus:ring-secondary/40 text-soft-cream placeholder:text-gray-light/70 disabled:opacity-50 disabled:cursor-not-allowed ${
              icon ? 'pl-2xl' : ''
            } ${suffix ? 'pr-2xl' : ''} ${error ? 'border-danger focus:border-danger' : 'border-gray-light/25 focus:border-secondary'} ${className}`}
            {...props}
          />
          {suffix && (
            <div className="absolute right-md top-1/2 -translate-y-1/2 text-gray-light transition-colors z-10">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
        {helpText && !error && (
          <p className="text-xs text-gray-light">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
