'use client';

import React from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { usePushNotification } from '@/hooks/usePushNotification';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { TrasonIcon } from '@/components/ui/TrasonIcon';
import { SYS_ICONS } from '@/config/icons';

export function NotificationToggle() {
  const { notifications_enabled, updatePreferences, isUpdating } = useUserPreferences();
  const push = usePushNotification();
  const { t } = useTranslation();

  const handleToggle = async () => {
    const next = !notifications_enabled;

    await updatePreferences({ notifications_enabled: next, push_notifications_enabled: next });

    try {
      if (next) await push.subscribe();
      else await push.unsubscribe();
    } catch (err) {
      console.error('Failed to update push subscription on toggle:', err);
    }
  };

  return (
    <button
      type="button"
      disabled={isUpdating || push.isLoading}
      onClick={handleToggle}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
        notifications_enabled
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
      }`}
      title={notifications_enabled ? t('nav.notifications_on') : t('nav.notifications_off')}
      aria-label={notifications_enabled ? t('nav.disable_notifications') : t('nav.enable_notifications')}
      aria-pressed={notifications_enabled}
    >
      <TrasonIcon icon={notifications_enabled ? SYS_ICONS.notifications : SYS_ICONS.notificationsOff} size={20} />
    </button>
  );
}
