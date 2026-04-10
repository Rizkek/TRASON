'use client';

import React, { useEffect } from 'react';
import { Button } from './Button';

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-warm-black bg-opacity-60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
        <div
          className="bg-gray-strong rounded-md shadow-xl border border-deep-sage border-opacity-30 max-w-md w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || closeButton) && (
            <div className="flex items-center justify-between px-lg py-lg border-b border-deep-sage border-opacity-20">
              {title && (
                <h2 className="text-heading font-serif text-soft-cream">
                  {title}
                </h2>
              )}
              {closeButton && (
                <button
                  onClick={onClose}
                  title="Close modal"
                  aria-label="Close modal"
                  className="text-gray-light hover:text-warm-gold transition-colors ml-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="px-lg pt-lg text-base text-gray-light">{description}</p>
          )}

          {/* Content */}
          <div className="px-lg py-lg">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-lg py-lg bg-gray-strong bg-opacity-40 border-t border-deep-sage border-opacity-20 flex gap-md justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
