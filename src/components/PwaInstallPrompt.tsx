'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Logo } from '@/components';

export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-strong border border-white/10 dark:border-white/5 rounded-xl p-4 shadow-2xl z-50 flex items-start gap-4">
      <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-black/20 border border-white/5">
        <Logo size={64} variant="gold" />
      </div>
      <div className="flex-1">
        <h3 className="text-soft-cream font-medium text-sm">Install TRASON App</h3>
        <p className="text-soft-cream/60 text-xs mt-1 leading-relaxed">
          Install TRASON on your home screen for a faster, full-screen sanctuary experience.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <button 
            onClick={handleInstallClick}
            className="text-xs bg-primary text-black font-medium px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
          >
            Install Now
          </button>
          <button 
            onClick={handleDismiss}
            className="text-xs text-soft-cream/60 hover:text-soft-cream transition-colors"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
