'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeButton = true,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const modals = Array.from(document.querySelectorAll('.trason-modal'));
        if (modals.length > 0 && modals[modals.length - 1] === modalRef.current) {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with lighter blur for mobile performance */}
      <div
        className="fixed inset-0 bg-warm-black/60 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="fixed inset-0 z-[70] flex items-center justify-center p-md pointer-events-none trason-modal"
      >
        <div
          className="bg-gray-strong border border-black/10 dark:border-white/10 rounded-md shadow-[0_32px_128px_-16px_rgba(0,0,0,0.7)] max-w-lg w-full max-h-[85dvh] flex flex-col pointer-events-auto animate-slide-up relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {/* Header */}
          {(title || closeButton) && (
            <div className="flex-none flex items-center justify-between px-xl py-xl border-b border-black/[0.05] dark:border-white/[0.05]">
              {title && (
                <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">
                   {title}
                </h2>
              )}
              {closeButton && (
                <button
                  onClick={onClose}
                  title="Close modal"
                  aria-label="Close modal"
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
          <div className="flex-1 overflow-y-auto px-xl py-xl">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex-none px-xl py-xl bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.05]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
