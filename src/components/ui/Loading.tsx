'use client';

import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
  showTip?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Loading your experience...',
  fullPage = false,
  showTip = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-md" role="status" aria-live="polite">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
        <div className="relative flex items-center justify-center rounded-full border border-primary/30 bg-gray-strong/80 p-md">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        </div>
      </div>
      {text && <p className="text-gray-very-light text-sm font-medium">{text}</p>}
      {showTip && <p className="text-gray-light text-xs">This usually takes a few seconds.</p>}
      <Sparkles size={14} className="text-secondary/80 animate-pulse" aria-hidden="true" />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-warm-black/85 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};
