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
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with extreme blur */}
      <div
        className="fixed inset-0 bg-warm-black/60 backdrop-blur-md z-[60] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-md pointer-events-none">
        <div
          className="bg-gray-strong/80 glass rounded-md shadow-[0_32px_128px_-16px_rgba(0,0,0,0.7)] max-w-lg w-full max-h-[90vh] overflow-auto pointer-events-auto animate-slide-up relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {/* Header */}
          {(title || closeButton) && (
            <div className="flex items-center justify-between px-xl py-xl border-b border-white border-opacity-[0.05]">
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
                  className="text-gray-light hover:text-white hover:bg-white/5 p-sm rounded-md transition-all ml-2"
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
          <div className="px-xl py-xl">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-xl py-xl bg-white bg-opacity-[0.02] border-t border-white border-opacity-[0.05]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
