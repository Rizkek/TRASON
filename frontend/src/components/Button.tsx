'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-warm-black disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-warm-gold text-warm-black hover:bg-pale-blush focus:ring-warm-gold font-semibold',
      secondary: 'bg-deep-sage text-soft-cream hover:bg-pale-blush hover:text-warm-black focus:ring-deep-sage',
      danger: 'bg-warm-brown text-soft-cream hover:bg-opacity-80 focus:ring-warm-brown',
      ghost: 'bg-transparent text-warm-gold hover:bg-gray-strong hover:text-pale-blush focus:ring-warm-gold border border-warm-gold border-opacity-30',
    };

    const sizeStyles = {
      sm: 'px-md py-sm text-micro',
      md: 'px-lg py-md text-base',
      lg: 'px-2xl py-lg text-lg',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
