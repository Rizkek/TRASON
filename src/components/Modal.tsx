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
  // Callers pass inline handlers. Keeping onClose out of the effect deps stops the focus
  // setup and cleanup from running on every parent render (every keystroke in a form).
  const onCloseRef = React.useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let focusTimer: ReturnType<typeof setTimeout> | undefined;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const modals = Array.from(document.querySelectorAll('.trason-modal'));
        if (modals.length > 0 && modals[modals.length - 1] === modalRef.current) {
          onCloseRef.current();
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
      
      // Focus the first form field; the close button comes first in the DOM but is the wrong target.
      focusTimer = setTimeout(() => {
        if (modalRef.current) {
          const focusable = (modalRef.current.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled])') ??
            modalRef.current.querySelector('button, [href], [tabindex]:not([tabindex="-1"])')) as HTMLElement | null;
          focusable?.focus();
        }
      }, 10);
    }

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      if (isOpen) previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Backdrop with lighter blur for mobile performance */}
      <div
        className={`fixed inset-0 bg-black/60 animate-fade-in z-[${baseZIndex}]`}
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
          className={`bg-surface border border-foreground/15 rounded-md ${maxWidthMap[maxWidth]} w-full max-h-[85dvh] flex flex-col pointer-events-auto animate-slide-up relative`}
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          {(title || closeButton) && (
            <div className="flex-none flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-foreground/10">
              {title && (
                <h2 id="modal-title" className="text-title-lg tracking-tight text-foreground">
                   {title}
                </h2>
              )}
              {closeButton && (
                <button
                  onClick={onClose}
                  title="Close modal"
                  aria-label="Close modal"
                  className="text-muted-foreground hover:text-foreground hover:bg-foreground/10 p-2 rounded-md transition-colors ml-2"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="px-4 pt-4 sm:px-8 sm:pt-8">
              <p className="text-sm text-muted-foreground italic opacity-80 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-8">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex-none px-4 py-4 sm:px-8 sm:py-8 bg-foreground/[0.03] border-t border-foreground/10">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
