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
  sm: 'md:max-w-sm',
  md: 'md:max-w-md',
  lg: 'md:max-w-lg',
  xl: 'md:max-w-xl',
  '2xl': 'md:max-w-2xl',
  '3xl': 'md:max-w-3xl',
  '4xl': 'md:max-w-4xl',
  '5xl': 'md:max-w-5xl',
  fit: 'md:max-w-fit',
  full: 'md:max-w-[95vw]',
};

/** Every dialog: a sheet anchored to the bottom below `md`, within thumb reach, and centered from `md` up. */
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
      <div
        className="fixed inset-0 bg-black/60 animate-fade-in"
        style={{ zIndex: baseZIndex }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="fixed inset-0 flex items-end justify-center pointer-events-none trason-modal md:items-center md:p-4"
        style={{ zIndex: baseZIndex + 10 }}
      >
        <div
          className={`bg-surface border-x border-t border-foreground/15 rounded-t-xl ${maxWidthMap[maxWidth]} w-full max-h-[90dvh] pb-[env(safe-area-inset-bottom)] flex flex-col overflow-hidden pointer-events-auto animate-slide-up relative md:border md:rounded-md md:max-h-[85dvh] md:pb-0`}
          onClick={(e) => e.stopPropagation()}
        >
          <div aria-hidden="true" className="flex justify-center pt-3 md:hidden" onClick={onClose}>
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
          </div>

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
            <div className="px-4 pt-4 sm:px-6 sm:pt-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex-none px-4 py-4 sm:px-6 bg-foreground/[0.03] border-t border-foreground/10">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};
