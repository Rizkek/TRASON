'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Warning, Info } from '@phosphor-icons/react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-500" weight="fill" />,
    error: <Warning size={20} className="text-danger" weight="fill" />,
    info: <Info size={20} className="text-info" weight="fill" />,
  };

  const bgColors = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-danger/10 border-danger/20',
    info: 'bg-info/10 border-info/20',
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
        } ${bgColors[type]} bg-warm-black/90`}
      >
        {icons[type]}
        <p className="text-sm font-medium text-soft-cream">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="p-1 rounded-md hover:bg-white/10 text-gray-light hover:text-soft-cream transition-colors ml-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
