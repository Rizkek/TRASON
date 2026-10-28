'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Button, Logo } from '@/components';
import { useAuthStore } from '@/store/authStore';

const DISMISS_KEY = 'trason_pwa_dismissed_until';
// 30-day cooldown after "Not now"
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Custom install card for the app shell only. Chrome logs "Banner not shown:
 * beforeinstallpromptevent.preventDefault() called" whenever we hold the native prompt to show
 * this card instead; that message is expected and not an error.
 */
export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const savingRef = useRef(false);

  const user = useAuthStore((s) => s.user);
  const moduleFeatures: Record<string, unknown> | undefined = (() => {
    const prefs = (user as { user_preferences?: unknown } | null)?.user_preferences;
    return (Array.isArray(prefs) ? prefs[0] : prefs as { module_features?: Record<string, unknown> } | undefined)?.module_features;
  })();
  const installedElsewhere = moduleFeatures?.['pwa_installed'] === true;

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || installedElsewhere) return;

    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [installedElsewhere]);

  const handleInstallClick = async () => {
    if (!deferredPrompt || savingRef.current) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    // Remember the install on the account so other devices stop asking.
    if (outcome === 'accepted' && user) {
      savingRef.current = true;
      try {
        const { userQueries } = await import('@/services/core/userQueries');
        await userQueries.updateUserPreferences({
          module_features: { ...(moduleFeatures ?? {}), pwa_installed: true },
        } as never);
      } catch {
        // The standalone check above still hides the card on this device.
      } finally {
        savingRef.current = false;
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DURATION_MS));
    setDeferredPrompt(null);
  };

  if (!deferredPrompt || installedElsewhere) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[80] flex items-start gap-4 rounded-xl border border-foreground/10 bg-surface p-4 sm:left-auto sm:w-96 lg:bottom-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-foreground/5 bg-background">
        <Logo size={32} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 id="pwa-install-title" className="text-label-md text-foreground">
          {t('pwa.install_title')}
        </h3>
        <p id="pwa-install-desc" className="mt-1 text-body-sm text-muted-foreground">
          {t('pwa.install_desc')}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" onClick={handleInstallClick}>
            {t('pwa.install')}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            {t('pwa.not_now')}
          </Button>
        </div>
      </div>
    </div>
  );
}
