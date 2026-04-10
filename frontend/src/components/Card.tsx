'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  titleClassName?: string;
  description?: string;
  footer?: React.ReactNode;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, titleClassName = '', description, footer, hover = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-gray-strong bg-opacity-50 rounded-md border border-deep-sage border-opacity-20 overflow-hidden transition-all duration-300 ${
          hover ? 'hover:border-warm-gold hover:border-opacity-40 hover:bg-opacity-70' : ''
        } ${className}`}
        {...props}
      >
        {(title || description) && (
          <div className="px-lg py-lg border-b border-deep-sage border-opacity-20">
            {title && (
              <h3 className={`text-heading font-serif text-soft-cream ${titleClassName}`}>
                {title}
              </h3>
            )}
            {description && <p className="text-subtext mt-md">{description}</p>}
          </div>
        )}

        <div className="px-lg py-lg">{children}</div>

        {footer && (
          <div className="px-lg py-lg bg-gray-strong bg-opacity-40 border-t border-deep-sage border-opacity-20">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';
