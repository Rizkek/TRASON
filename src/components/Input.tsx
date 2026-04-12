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
      <div className="w-full space-y-md">
        {label && (
          <label className="block text-[10px] font-bold text-gray-light tracking-widest uppercase">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-md top-1/2 -translate-y-1/2 text-gray-light group-focus-within:text-primary transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-12 px-lg bg-gray-strong bg-opacity-40 border transition-all duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 text-soft-cream placeholder-gray-light/30 disabled:opacity-50 disabled:cursor-not-allowed ${
              icon ? 'pl-2xl' : ''
            } ${error ? 'border-danger focus:border-danger' : 'border-white border-opacity-[0.05] focus:border-primary'} ${className}`}
            {...props}
          />
          {/* Bottom highlight beam on focus */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-primary group-focus-within:w-full transition-all duration-500 rounded-full" />
        </div>
        {error && <p className="text-[10px] font-bold text-danger uppercase tracking-wider">{error}</p>}
        {helpText && !error && (
          <p className="text-[10px] text-gray-light uppercase tracking-widest opacity-60">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
