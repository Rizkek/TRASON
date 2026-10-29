'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

const BASE_STYLES =
  'inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none tracking-tight overflow-hidden relative focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary font-semibold hover:bg-secondary',
  secondary: 'bg-surface-hover text-foreground border border-foreground/20 hover:bg-surface',
  outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-on-primary',
  ghost: 'bg-transparent text-foreground hover:bg-foreground/10',
  danger: 'bg-danger text-background hover:bg-danger/90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-label-md rounded-sm',
  md: 'h-10 px-5 text-sm rounded-sm',
  lg: 'h-12 px-8 text-base rounded-md',
};

const ICON_ONLY_ON_MOBILE: Record<ButtonSize, string> = {
  sm: 'w-9 px-0 sm:w-auto sm:px-3.5',
  md: 'w-10 px-0 sm:w-auto sm:px-5',
  lg: 'w-12 px-0 sm:w-auto sm:px-8',
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconOnlyOnMobile?: boolean;
  className?: string;
}

/**
 * Button classes for elements that must not be a <button>, such as a Next <Link> that looks
 * like one. Never wrap a Button in a Link: nested interactive elements break keyboard and
 * screen-reader use. With iconOnlyOnMobile, put the label in a `hidden sm:inline` span.
 */
export function buttonClassName({ variant = 'primary', size = 'md', fullWidth, iconOnlyOnMobile, className }: ButtonStyleOptions = {}) {
  return cn(BASE_STYLES, VARIANTS[variant], SIZES[size], iconOnlyOnMobile && ICON_ONLY_ON_MOBILE[size], fullWidth && 'w-full', className);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  /** Below `sm`, show only the icon; the text label becomes the accessible name. */
  iconOnlyOnMobile?: boolean;
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
        iconOnlyOnMobile = false,
        className = '',
        disabled,
        children,
        ...props
      },
      ref
    ) => {
      const accessibleName = iconOnlyOnMobile && typeof children === 'string' ? children : undefined;

      return (
        <button
          ref={ref}
          disabled={disabled || isLoading}
          aria-disabled={disabled || isLoading}
          className={buttonClassName({ variant, size, fullWidth, iconOnlyOnMobile, className: cn(isLoading && 'cursor-wait', className) })}
          aria-busy={isLoading}
          aria-label={accessibleName}
          {...props}
        >
          {!isLoading && leftIcon ? <span aria-hidden="true" className="flex shrink-0">{leftIcon}</span> : null}

          <span className={cn('relative z-10', iconOnlyOnMobile && 'hidden sm:inline')}>
            {isLoading && loadingText ? loadingText : children}
          </span>

          {!isLoading && rightIcon && <span aria-hidden="true" className="flex shrink-0">{rightIcon}</span>}
        </button>
      );
    }
  )
);

Button.displayName = 'Button';
