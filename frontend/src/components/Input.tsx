'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-base font-medium text-soft-cream mb-md">
            {label}
            {props.required && <span className="text-warm-brown ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-md top-1/2 -translate-y-1/2 text-gray-light">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full px-lg py-md border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 bg-gray-strong text-soft-cream placeholder-gray-light disabled:bg-gray-strong disabled:bg-opacity-60 disabled:cursor-not-allowed ${
              icon ? 'pl-2xl' : ''
            } ${error ? 'border-warm-brown focus:ring-warm-brown' : 'border-deep-sage border-opacity-20 focus:ring-warm-gold focus:border-warm-gold'} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-md text-sm text-warm-brown">{error}</p>}
        {helpText && !error && (
          <p className="mt-md text-sm text-gray-light">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
