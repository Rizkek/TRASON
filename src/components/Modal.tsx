'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
  baseZIndex?: number;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'fit' | 'full';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  fit: 'max-w-fit',
  full: 'max-w-[95vw]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeButton = true,
  baseZIndex = 60,
  maxWidth = 'lg',
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const modals = Array.from(document.querySelectorAll('.trason-modal'));
        if (modals.length > 0 && modals[modals.length - 1] === modalRef.current) {
          onClose();
        }
      } else if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Auto-focus first focusable element
      setTimeout(() => {
        if (modalRef.current) {
          const focusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          if (focusable) focusable.focus();
        }
      }, 10);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop with lighter blur for mobile performance */}
      <div
        className={`fixed inset-0 bg-warm-black/60 backdrop-blur-sm animate-fade-in z-[${baseZIndex}]`}
        style={{ zIndex: baseZIndex }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`fixed inset-0 flex items-center justify-center p-4 pointer-events-none trason-modal z-[${baseZIndex + 10}]`}
        style={{ zIndex: baseZIndex + 10 }}
      >
        <div
          className={`bg-gray-strong border border-black/10 dark:border-white/10 rounded-md shadow-[0_32px_128px_-16px_rgba(0,0,0,0.7)] ${maxWidthMap[maxWidth]} w-full max-h-[85dvh] flex flex-col pointer-events-auto animate-slide-up relative`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top highlight glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          {/* Header */}
          {(title || closeButton) && (
            <div className="flex-none flex items-center justify-between px-8 py-8 border-b border-black/[0.05] dark:border-white/[0.05]">
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold tracking-tight text-white uppercase italic">
                   {title}
                </h2>
              )}
              {closeButton && (
                <button
                  onClick={onClose}
                  title="Close modal"
                  aria-label="Close modal"
                  className="text-gray-light hover:text-white hover:bg-black/5 dark:bg-white/5 p-2 rounded-md transition-all ml-2"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="px-8 pt-8">
              <p className="text-sm text-gray-light italic opacity-80 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex-none px-8 py-8 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.05]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
