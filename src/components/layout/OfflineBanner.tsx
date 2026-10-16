'use client';

import React from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { TrasonIcon } from '@/components/ui/TrasonIcon';
import { SYS_ICONS } from '@/config/icons';

// Tracks browser connectivity. justReconnected stays true for three seconds after coming back.
function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [justReconnected, setJustReconnected] = React.useState(false);

  React.useEffect(() => {
    setIsOnline(navigator.onLine);
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      hideTimer = setTimeout(() => setJustReconnected(false), 3000);
    };
    const handleOffline = () => {
      clearTimeout(hideTimer);
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, justReconnected };
}

export function OfflineBanner() {
  const { isOnline, justReconnected } = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline && !justReconnected) return null;

  return (
    <div
      role="status"
      className={`fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 border-b px-4 pb-2 pt-[max(env(safe-area-inset-top),0.5rem)] text-label-sm ${
        justReconnected ? 'border-success/30 bg-background text-success' : 'border-primary/30 bg-background text-primary'
      }`}
    >
      {justReconnected ? (
        <>
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
          <span>{t('nav.back_online')}</span>
        </>
      ) : (
        <>
          <TrasonIcon icon={SYS_ICONS.offline} size={14} />
          <span>{t('nav.offline_banner')}</span>
        </>
      )}
    </div>
  );
}
