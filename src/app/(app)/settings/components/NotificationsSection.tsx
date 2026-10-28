'use client';

import React from 'react';
import { Card, Button, Select, Switch } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { PreferenceData } from './types';
import { BellRinging, Globe, FloppyDisk as Save } from '@phosphor-icons/react';
import { Paragraph } from '@/components/ui/typography';

interface NotificationsSectionProps {
  prefs: PreferenceData;
  setPrefs: React.Dispatch<React.SetStateAction<PreferenceData>>;
  isSavingPrefs: boolean;
  onSavePreferences: () => void;
}

export function NotificationsSection({
  prefs,
  setPrefs,
  isSavingPrefs,
  onSavePreferences,
}: NotificationsSectionProps) {
  const { t } = useTranslation();
  const [testNotificationStatus, setTestNotificationStatus] = React.useState('');

  const sendTestNotification = async () => {
    setTestNotificationStatus('');

    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      setTestNotificationStatus(t('settings.alerts.testNoPermission'));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) throw new Error('Service worker is not registered');

      await registration.showNotification(t('settings.alerts.testTitle'), {
        body: t('settings.alerts.testBody'),
        icon: '/icon-192x192.png',
        tag: 'trason-notification-test',
      });
      setTestNotificationStatus(t('settings.alerts.testSent'));
    } catch {
      setTestNotificationStatus(t('settings.alerts.testFailed'));
    }
  };

  return (
    <Card className="glass border-none" title={t('settings.alerts.sectionTitle')}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
            <BellRinging size={20} aria-hidden="true" className="text-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-label-md text-foreground">{t('settings.alerts.push')}</h4>
            <p className="mt-0.5 text-body-sm text-muted-foreground">{t('settings.alerts.pushDesc')}</p>
          </div>
          <Switch
            checked={prefs.push_notifications_enabled}
            label={t('settings.alerts.push')}
            onChange={() =>
              setPrefs((p) => ({
                ...p,
                push_notifications_enabled: !p.push_notifications_enabled,
                notifications_enabled: !p.notifications_enabled,
              }))
            }
          />
        </div>

        <div className="rounded-md border border-secondary/20 bg-secondary/5 p-4">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              {t('settings.alerts.dndTitle')}
            </summary>
            <Paragraph className="mt-3 text-xs text-muted-foreground">
              {t('settings.alerts.dndDescription')}
            </Paragraph>
          </details>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={sendTestNotification}
              disabled={!prefs.notifications_enabled || !prefs.push_notifications_enabled}
              leftIcon={<BellRinging size={16} />}
            >
              {t('settings.alerts.testButton')}
            </Button>
            {testNotificationStatus && (
              <Paragraph role="status" className="text-xs text-muted-foreground">
                {testNotificationStatus}
              </Paragraph>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Globe size={20} aria-hidden="true" className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-label-md text-foreground">{t('settings.alerts.email')}</h4>
            <p className="mt-0.5 text-body-sm text-muted-foreground">{t('settings.alerts.emailDesc')}</p>
          </div>
          <Switch
            checked={prefs.email_digest_enabled}
            label={t('settings.alerts.email')}
            onChange={() =>
              setPrefs((p) => ({
                ...p,
                email_digest_enabled: !p.email_digest_enabled,
              }))
            }
          />
        </div>

        {prefs.email_digest_enabled && (
          <div className="animate-fade-in max-w-xs sm:pl-[3.25rem]">
            <Select
              label={t('settings.alerts.frequency')}
              value={prefs.digest_frequency}
              onValueChange={(val) => setPrefs((p) => ({ ...p, digest_frequency: val }))}
              options={[
                { value: 'daily', label: t('settings.alerts.daily') },
                { value: 'weekly', label: t('settings.alerts.weekly') },
                { value: 'monthly', label: t('settings.alerts.monthly') },
              ]}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <Button
          variant="primary"
          size="md"
          onClick={onSavePreferences}
          disabled={isSavingPrefs}
          leftIcon={<Save size={18} />}
        >
          {isSavingPrefs ? t('settings.profile.savingBtn') : t('settings.alerts.persistBtn')}
        </Button>
      </div>
    </Card>
  );
}
