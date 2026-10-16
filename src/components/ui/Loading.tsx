'use client';

import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
  showTip?: boolean;
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-body-md',
  lg: 'text-body-lg',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
  showTip = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-1" role="status" aria-live="polite">
      {text && <p className={`font-medium text-subtle ${textSizeClasses[size]}`}>{text}</p>}
      {showTip && <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
