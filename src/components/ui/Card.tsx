'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  hover = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`card ${hover ? 'hover:shadow-2xl' : ''} ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-soft-cream/10">
          {title && (
            <h3 className="text-sm font-semibold tracking-tight text-soft-cream uppercase opacity-90">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[10px] text-gray-light mt-0.5 tracking-wide uppercase">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={title || description ? 'p-4 md:p-6' : ''}>{children}</div>
    </div>
  );
};
