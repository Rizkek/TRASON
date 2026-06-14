'use client';

import React, { memo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
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
      const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none tracking-tight overflow-hidden relative';
      
      const variants = {
        primary: 'bg-gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5',
        secondary: 'bg-black/10 dark:bg-white/10 text-white backdrop-blur-md hover:bg-black/20 dark:bg-white/20 border border-black/10 dark:border-white/10',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'bg-transparent text-gray-light hover:text-soft-cream hover:bg-black/[0.05] dark:bg-white/[0.05]',
        danger: 'bg-danger/10 text-danger hover:bg-black/20 dark:bg-white/20 border border-danger/20',
      };

      const sizes = {
        sm: 'px-md py-sm text-[10px] rounded-sm uppercase tracking-widest',
        md: 'px-lg py-md text-sm rounded-sm',
        lg: 'px-xl py-lg text-base rounded-md',
      };

      const widthStyle = fullWidth ? 'w-full' : '';

      return (
        <button
          ref={ref}
          disabled={disabled || isLoading}
          className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
          {...props}
        >
          {isLoading ? (
            <div className="mr-md animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : leftIcon ? (
            <span className="mr-md">{leftIcon}</span>
          ) : null}
          
          <span className="relative z-10">{children}</span>
          
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
