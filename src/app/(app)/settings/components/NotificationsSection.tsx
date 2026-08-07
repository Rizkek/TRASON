'use client';

import React from 'react';
import { Card, Button, Select } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { PreferenceData } from './types';
import { BellRinging, Globe, FloppyDisk as Save } from '@phosphor-icons/react';

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

  return (
    <Card className="glass border-none" title={t('settings.alerts.sectionTitle')}>
      <div className="space-y-xl">
        <div className="flex items-center justify-between p-lg rounded-md border bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <BellRinging size={20} className="text-secondary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-soft-cream">{t('settings.alerts.push')}</h4>
              <p className="text-[10px] text-gray-light">{t('settings.alerts.pushDesc')}</p>
            </div>
          </div>
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() =>
              setPrefs((p) => ({
                ...p,
                push_notifications_enabled: !p.push_notifications_enabled,
              }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              prefs.push_notifications_enabled
                ? 'bg-primary'
                : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.push_notifications_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-lg rounded-md border bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/10 flex items-center justify-center">
              <Globe size={20} className="text-accent-purple" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-soft-cream">{t('settings.alerts.email')}</h4>
              <p className="text-[10px] text-gray-light">{t('settings.alerts.emailDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setPrefs((p) => ({
                ...p,
                email_digest_enabled: !p.email_digest_enabled,
              }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              prefs.email_digest_enabled
                ? 'bg-primary'
                : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.email_digest_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {prefs.email_digest_enabled && (
          <div className="animate-fade-in pl-14 max-w-xs">
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

      <div className="flex justify-end mt-xl">
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
