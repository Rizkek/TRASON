'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  /** Hover feedback. On by default for a clickable card, off otherwise. */
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  hover,
  className = '',
  children,
  ...props
}) => {
  const isInteractive = hover ?? Boolean(props.onClick);

  return (
    <div
      className={`card ${isInteractive ? 'card-interactive' : ''} ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-foreground/10">
          {title && (
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={title || description ? 'p-4 md:p-6' : ''}>{children}</div>
    </div>
  );
};
