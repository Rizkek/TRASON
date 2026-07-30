'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeButton = true,
}) => {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const sheets = Array.from(document.querySelectorAll('.trason-bottom-sheet'));
        if (sheets.length > 0 && sheets[sheets.length - 1] === sheetRef.current) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-warm-black/60 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div 
        ref={sheetRef}
        className="fixed inset-0 z-[70] flex items-end md:items-center justify-center pointer-events-none trason-bottom-sheet"
      >
        <div
          className="bg-gray-strong border-t border-x md:border border-black/10 dark:border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] md:shadow-[0_32px_128px_-16px_rgba(0,0,0,0.7)] 
            w-full md:max-w-lg md:rounded-md rounded-t-xl 
            max-h-[90dvh] md:max-h-[85dvh] flex flex-col pointer-events-auto 
            animate-slide-up-sheet md:animate-slide-up relative
            pb-[env(safe-area-inset-bottom)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile pull indicator */}
          <div className="md:hidden flex justify-center pt-3 pb-1 w-full" onClick={onClose}>
            <div className="w-12 h-1.5 bg-gray-light/30 rounded-full" />
          </div>

          {/* Top highlight glow (Desktop only for a cleaner modal look, or keep it?) */}
          <div className="hidden md:block absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {/* Header */}
          {(title || closeButton) && (
            <div className="flex-none flex items-center justify-between px-xl pb-md pt-sm md:py-xl border-b border-black/[0.05] dark:border-white/[0.05]">
              {title && (
                <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
                   {title}
                </h2>
              )}
              {closeButton && (
                <button
                  onClick={onClose}
                  title="Close"
                  aria-label="Close"
                  className="text-gray-light hover:text-white hover:bg-black/5 dark:bg-white/5 p-sm rounded-md transition-all ml-2"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="px-xl pt-xl">
              <p className="text-sm text-gray-light italic opacity-80 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0 px-xl py-xl">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex-none px-xl py-xl bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.05]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
