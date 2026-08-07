'use client';

import React from 'react';
import { Card, Button, Select } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { PreferenceData, CURRENCY_OPTIONS, TIMEZONE_OPTIONS, LANGUAGE_OPTIONS } from './types';
import { FloppyDisk as Save } from '@phosphor-icons/react';

interface PreferencesSectionProps {
  prefs: PreferenceData;
  setPrefs: React.Dispatch<React.SetStateAction<PreferenceData>>;
  isSavingPrefs: boolean;
  onSavePreferences: () => void;
}

export function PreferencesSection({
  prefs,
  setPrefs,
  isSavingPrefs,
  onSavePreferences,
}: PreferencesSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-lg">
      <Card className="glass border-none" title={t('settings.interface.sectionTitle')}>
        <div className="space-y-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold text-gray-light tracking-widest">
                {t('settings.interface.themeEngine')}
              </label>
              <div className="flex gap-md">
                {['light', 'dark'].map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, theme: th as 'light' | 'dark' }))}
                    className={`px-lg py-sm rounded-md border text-xs font-bold uppercase tracking-widest transition-all ${
                      prefs.theme === th
                        ? 'bg-primary text-warm-black border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-soft-cream/5 text-gray-light border-soft-cream/10 hover:bg-soft-cream/10 hover:border-soft-cream/20'
                    }`}
                  >
                    {t(`settings.interface.${th}`)}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-primary mt-2 italic opacity-80">
                {t('settings.interface.themePreview')}
              </p>
            </div>
            <Select
              label={t('settings.interface.language')}
              value={prefs.language}
              onValueChange={(newLang) => setPrefs((p) => ({ ...p, language: newLang }))}
              options={LANGUAGE_OPTIONS.map((l) => ({
                value: l.value,
                label: l.label,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <Select
              label={t('settings.interface.currency')}
              value={prefs.currency}
              onValueChange={(val) => setPrefs((p) => ({ ...p, currency: val }))}
              options={CURRENCY_OPTIONS.map((c) => ({
                value: c,
                label: c,
              }))}
            />
            <Select
              label={t('settings.interface.timezone')}
              value={prefs.timezone}
              onValueChange={(val) => setPrefs((p) => ({ ...p, timezone: val }))}
              options={TIMEZONE_OPTIONS.map((tz) => ({
                value: tz,
                label: tz,
              }))}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={onSavePreferences}
          disabled={isSavingPrefs}
          leftIcon={<Save size={18} />}
        >
          {isSavingPrefs ? t('settings.interface.savingBtn') : t('settings.interface.persistBtn')}
        </Button>
      </div>
    </div>
  );
}
