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
      const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none tracking-tight overflow-hidden relative focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

      const variants = {
        primary: 'bg-primary text-on-primary font-semibold hover:bg-secondary',
        secondary: 'bg-surface-hover text-foreground border border-foreground/20 hover:bg-surface',
        outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-on-primary',
        ghost: 'bg-transparent text-foreground hover:bg-foreground/10',
        danger: 'bg-danger text-background hover:bg-danger/90',
      };

      const sizes = {
        sm: 'h-8 px-4 text-xs rounded-sm uppercase tracking-wide',
        md: 'h-10 px-6 text-sm rounded-sm',
        lg: 'h-12 px-8 text-base rounded-md',
      };

      const widthStyle = fullWidth ? 'w-full' : '';

      return (
        <button
          ref={ref}
          disabled={disabled || isLoading}
          aria-disabled={disabled || isLoading}
          className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${isLoading ? 'cursor-wait' : ''} ${className}`}
          aria-busy={isLoading}
          {...props}
        >
          {!isLoading && leftIcon ? <span className="mr-4">{leftIcon}</span> : null}
          
          <span className="relative z-10">{isLoading && loadingText ? loadingText : children}</span>
          
          {!isLoading && rightIcon && <span className="ml-4">{rightIcon}</span>}
        </button>
      );
    }
  )
);

Button.displayName = 'Button';
