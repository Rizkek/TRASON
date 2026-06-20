'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Logo } from '@/components';
import { useAuthStore } from '@/store/authStore';

const DISMISS_KEY = 'trason_pwa_dismissed_until';
// 30-day cooldown after "Not Now"
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const savingRef = useRef(false);

  // Read module_features from Supabase-synced auth store
  const user = useAuthStore((s) => s.user);
  const moduleFeatures: Record<string, any> | undefined = (() => {
    const prefs = (user as any)?.user_preferences;
    return (Array.isArray(prefs) ? prefs[0] : prefs)?.module_features;
  })();

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Server says already installed on any device — never show again
    if (moduleFeatures?.['pwa_installed'] === true) {
      setIsVisible(false);
      return;
    }

    // Local 30-day cooldown (device-level — user clicked "Not Now")
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setIsVisible(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [moduleFeatures]);

  const handleInstallClick = async () => {
    if (!deferredPrompt || savingRef.current) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (outcome === 'accepted') {
      setIsVisible(false);
      // Persist install flag to Supabase so it won't show on any device
      if (user && !savingRef.current) {
        savingRef.current = true;
        try {
          const { userQueries } = await import('@/services/core/userQueries');
          await userQueries.updateUserPreferences({
            module_features: { ...(moduleFeatures ?? {}), pwa_installed: true },
          } as any);
        } catch {
          // Fail silently — prompt simply won't reappear on this device due to standalone check
        } finally {
          savingRef.current = false;
        }
      }
    }
  };

  const handleDismiss = () => {
    // Set 30-day cooldown in localStorage (device-level)
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-strong border border-white/10 dark:border-white/5 rounded-xl p-4 shadow-2xl z-[80] flex items-start gap-4 animate-fade-in">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-black/20 border border-white/5">
        <Logo size={36} variant="gold" />
      </div>
      <div className="flex-1">
        <h3 className="text-soft-cream font-medium text-sm">Install TRASON App</h3>
        <p className="text-soft-cream/60 text-xs mt-1 leading-relaxed">
          Install TRASON on your home screen for a faster, full-screen experience.
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
