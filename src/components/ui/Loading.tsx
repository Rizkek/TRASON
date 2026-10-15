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
  md: 'text-sm',
  lg: 'text-base',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Loading...',
  fullPage = false,
  showTip = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-1" role="status" aria-live="polite">
      {text && <p className={`text-gray-very-light font-medium ${textSizeClasses[size]}`}>{text}</p>}
      {showTip && <p className="text-gray-light text-xs">This usually takes a few seconds.</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-warm-black/85 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};
