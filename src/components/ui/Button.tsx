'use client';

import React, { memo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        variant = 'primary',
        size = 'md',
        isLoading = false,
        loadingText,
        leftIcon,
        rightIcon,
        fullWidth = false,
        className = '',
        disabled,
        children,
        ...props
      },
      ref
    ) => {
      const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none tracking-tight overflow-hidden relative focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-warm-black';
      
      const variants = {
        primary: 'bg-warm-gold text-warm-black font-bold shadow-lg shadow-warm-gold/20 hover:bg-[#E3B84D] hover:shadow-warm-gold/30 hover:-translate-y-0.5',
        secondary: 'bg-gray-medium text-soft-cream border border-gray-light/30 hover:bg-gray-strong',
        outline: 'bg-transparent border-2 border-warm-gold text-warm-gold hover:bg-warm-gold hover:text-warm-black',
        ghost: 'bg-transparent text-soft-cream hover:bg-white/10',
        danger: 'bg-danger text-white hover:bg-red-500',
      };

      const sizes = {
        sm: 'px-md py-sm text-xs rounded-sm uppercase tracking-wide',
        md: 'px-lg py-md text-sm rounded-sm',
        lg: 'px-xl py-lg text-base rounded-md',
      };

      const widthStyle = fullWidth ? 'w-full' : '';

      return (
        <button
          ref={ref}
          disabled={disabled || isLoading}
          className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${isLoading ? 'cursor-wait' : ''} ${className}`}
          aria-busy={isLoading}
          {...props}
        >
          {isLoading ? (
            <div className="mr-md animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : leftIcon ? (
            <span className="mr-md">{leftIcon}</span>
          ) : null}
          
          <span className="relative z-10">{isLoading && loadingText ? loadingText : children}</span>
          
          {!isLoading && rightIcon && <span className="ml-md">{rightIcon}</span>}
          
          {/* Subtle reflection effect for primary */}
          {variant === 'primary' && (
            <div className="absolute top-0 -left-full w-1/2 h-full bg-white opacity-10 skew-x-[-25deg] group-hover:left-[150%] transition-all duration-700" />
          )}
        </button>
      );
    }
  )
);

Button.displayName = 'Button';
