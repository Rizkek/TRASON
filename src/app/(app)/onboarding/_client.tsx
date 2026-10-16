'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, ErrorAlert, Select } from '@/components';
import { Placeholder } from '@/components/ui/Placeholder';
import { useAuthStore } from '@/store/authStore';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { DEFAULT_FINANCE_CATEGORIES } from '@/libs/defaultCategories';
import { ModuleSelectionCard } from './components/ModuleSelectionCard';
import {
  Globe,
  Clock,
  Wallet,
  TrendUp as TrendingUp,
  BellRinging,
  Briefcase,
  Heartbeat,
  Lightbulb,
  CaretRight as ChevronRight,
  Check,
} from '@phosphor-icons/react';
import { supabase } from '@/services/supabase/supabaseClient';
import { DEFAULT_MODULE_STATUS, getAllModules } from '@/modules/registry';
import { Heading, Paragraph } from '@/components/ui/typography';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
];

const TIMEZONE_OPTIONS = [
  'UTC', 'Asia/Jakarta', 'Asia/Singapore', 'Asia/Tokyo',
  'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'IDR', 'JPY', 'SGD', 'AUD', 'CAD'];

const MODULE_ICONS: Record<string, React.ElementType> = {
  Wallet,
  TrendingUp,
  Heartbeat,
  Briefcase,
  Clock,
  BellRinging,
  Lightbulb,
  Dumbbell: Heartbeat,
  Bell: BellRinging,
};

const TOTAL_STEPS = 3;
type Step = 1 | 2 | 3;

const CHOICE_BASE = 'min-h-11 rounded-lg border px-4 py-2 text-body-md font-semibold transition-colors';
const CHOICE_ON = 'border-primary bg-primary text-on-primary';
const CHOICE_OFF = 'border-foreground/20 bg-foreground/[0.03] text-muted-foreground hover:border-foreground/40 hover:text-foreground';
const FIELD_LABEL = 'mb-2 block text-label-sm uppercase text-muted-foreground';

export function OnboardingClient() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const setActiveTheme = useAuthStore((s) => s.setActiveTheme);
  const setActiveLanguage = useAuthStore((s) => s.setActiveLanguage);
  const resolvedTheme = useResolvedTheme();
  const { updatePreferences, isUpdating: prefsLoading, ...preferences } = useUserPreferences();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [currency, setCurrency] = useState('USD');
  // Until the user picks one, the theme on screen (the device theme for a new account) is the choice.
  const [pickedTheme, setPickedTheme] = useState<'dark' | 'light' | null>(null);
  const theme = pickedTheme ?? resolvedTheme;
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>(DEFAULT_MODULE_STATUS);

  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current && Object.keys(preferences).length > 0) {
      if (preferences.language) setLanguage(preferences.language);
      if (preferences.timezone) setTimezone(preferences.timezone);
      if (preferences.currency) setCurrency(preferences.currency);
      // A new account has the database default, not a choice: start from the device theme instead.
      if ((preferences as { onboarding_done?: boolean }).onboarding_done === true) {
        if (preferences.theme === 'light' || preferences.theme === 'dark') setPickedTheme(preferences.theme);
      } else {
        setActiveTheme('system');
      }
      if (preferences.module_features) setSelectedModules({ ...DEFAULT_MODULE_STATUS, ...preferences.module_features });
      initialized.current = true;
    }
  }, [preferences, setActiveTheme]);

  // The detected timezone may not be in the short list; keep it selectable.
  const timezoneOptions = useMemo(
    () => (TIMEZONE_OPTIONS.includes(timezone) ? TIMEZONE_OPTIONS : [timezone, ...TIMEZONE_OPTIONS]),
    [timezone]
  );

  const selectedCount = getAllModules().filter((m) => selectedModules[m.id] !== false).length;
  const nameMissing = !firstName.trim();

  // Language and theme apply as soon as they are picked, so the rest of the flow shows the result.
  const chooseLanguage = (value: string) => {
    setLanguage(value);
    setActiveLanguage(value);
  };
  const chooseTheme = (value: 'dark' | 'light') => {
    setPickedTheme(value);
    setActiveTheme(value);
  };

  const handleToggleModule = (id: string) => {
    setSelectedModules((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (firstName || lastName) {
        await supabase.auth.updateUser({ data: { first_name: firstName, last_name: lastName } });
      }

      const updatedPrefs = await updatePreferences({
        language,
        timezone,
        currency,
        theme,
        onboarding_done: true,
        module_features: selectedModules,
      });

      // Sync Zustand immediately so other pages know we're onboarded
      if (user && updatedPrefs) {
        useAuthStore.setState({ activeLanguage: language });
        const currentUserPrefs = Array.isArray((user as any).user_preferences)
          ? (user as any).user_preferences[0]
          : (user as any).user_preferences;

        setUser({
          ...user,
          first_name: firstName,
          last_name: lastName,
          user_preferences: [{ ...currentUserPrefs, ...updatedPrefs }],
        } as any);
      }

      if (selectedModules['finance']) {
        try {
          const { categoryQueries } = await import('@/services/activity/categoryQueries');
          const existing = await categoryQueries.getCategories();
          if (!existing || existing.length === 0) {
            await categoryQueries.seedDefaultCategories(DEFAULT_FINANCE_CATEGORIES);
          }
        } catch (err) {
          console.error('Failed to seed categories:', err);
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || t('onboarding.error_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (prefsLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-3 text-center">
          <Placeholder className="h-3 w-full" label={t('onboarding.preparing')} />
          <p className="text-body-md text-muted-foreground">{t('onboarding.preparing')}</p>
        </div>
      </div>
    );
  }

  const description =
    step === 1 ? t('onboarding.step1_desc') : step === 2 ? t('onboarding.step2_desc') : t('onboarding.step3_desc');

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] text-foreground sm:px-8">
      <div className="w-full max-w-2xl animate-fade-in space-y-6">
        <ErrorAlert error={error} onDismiss={() => setError(null)} />

        <header className="space-y-2 text-center">
          <Heading as="h1" size="h2" weight="semibold">
            {t('onboarding.welcome')}
          </Heading>
          <Paragraph className="mx-auto max-w-md text-body-md text-muted-foreground">{description}</Paragraph>
        </header>

        <Card className="p-5 sm:p-8 md:p-10">
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-label-sm text-muted-foreground">
              <span>{t('onboarding.step_of').replace('{current}', String(step)).replace('{total}', String(TOTAL_STEPS))}</span>
              {step === 3 && (
                <span>{t('onboarding.modules_selected').replace('{count}', String(selectedCount))}</span>
              )}
            </div>
            <div
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={TOTAL_STEPS}
              aria-valuenow={step}
              className="flex gap-1.5"
            >
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-foreground/15'}`} />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t('onboarding.first_name')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('onboarding.first_name_ph')}
                  autoComplete="given-name"
                />
                <Input
                  label={t('onboarding.last_name')}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('onboarding.last_name_ph')}
                  autoComplete="family-name"
                />
              </div>
              <div className="flex flex-col gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-body-md text-muted-foreground" aria-live="polite">
                  {nameMissing ? t('onboarding.name_required') : ''}
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(2)}
                  rightIcon={<ChevronRight size={18} />}
                  disabled={nameMissing}
                  className="w-full sm:w-auto"
                >
                  {t('onboarding.continue')}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label={t('onboarding.language')}
                  value={language}
                  onValueChange={chooseLanguage}
                  options={LANGUAGE_OPTIONS}
                />
                <Select
                  label={t('onboarding.timezone')}
                  value={timezone}
                  onValueChange={setTimezone}
                  options={timezoneOptions.map((tz) => ({ value: tz, label: tz }))}
                />
              </div>

              <div className="space-y-5 border-t border-foreground/10 pt-5">
                <div>
                  <span id="currency-label" className={FIELD_LABEL}>
                    {t('onboarding.currency')}
                  </span>
                  <div role="radiogroup" aria-labelledby="currency-label" className="flex flex-wrap gap-2">
                    {CURRENCY_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={currency === c}
                        onClick={() => setCurrency(c)}
                        className={`${CHOICE_BASE} ${currency === c ? CHOICE_ON : CHOICE_OFF}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span id="theme-label" className={FIELD_LABEL}>
                    {t('onboarding.theme')}
                  </span>
                  <div role="radiogroup" aria-labelledby="theme-label" className="grid grid-cols-2 gap-2">
                    {(['light', 'dark'] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={theme === value}
                        onClick={() => chooseTheme(value)}
                        className={`${CHOICE_BASE} ${theme === value ? CHOICE_ON : CHOICE_OFF}`}
                      >
                        {value === 'light' ? t('onboarding.theme_light') : t('onboarding.theme_dark')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:justify-between">
                <Button variant="ghost" size="lg" onClick={() => setStep(1)} className="w-full sm:w-auto">
                  {t('onboarding.back')}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setStep(3)}
                  rightIcon={<ChevronRight size={18} />}
                  className="w-full sm:w-auto"
                >
                  {t('onboarding.continue')}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {getAllModules().map((module) => (
                  <ModuleSelectionCard
                    key={module.id}
                    id={module.id}
                    title={t(`nav.${module.id}`)}
                    description={t(`modules.${module.id}_desc`)}
                    icon={MODULE_ICONS[module.icon] || Globe}
                    isSelected={selectedModules[module.id] !== false}
                    onToggle={handleToggleModule}
                  />
                ))}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" size="lg" onClick={() => setStep(2)} disabled={isSubmitting} className="w-full sm:w-auto">
                  {t('onboarding.back')}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  rightIcon={<Check size={18} />}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? t('onboarding.finalizing') : t('onboarding.complete')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
