'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Loading, ErrorAlert, Select } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { DEFAULT_FINANCE_CATEGORIES } from '@/libs/defaultCategories';
import { ModuleSelectionCard } from './components/ModuleSelectionCard';
import { Globe, Clock, Wallet, TrendUp as TrendingUp, BellRinging, Briefcase, Heartbeat, Sparkle, CaretRight as ChevronRight, Check, PaintBrush, User as UserIcon } from '@phosphor-icons/react';
import { supabase } from '@/services/supabase/supabaseClient';
import { DEFAULT_MODULE_STATUS, getAllModules } from '@/modules/registry';

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


export function OnboardingClient() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { updatePreferences, isUpdating: prefsLoading, ...preferences } = useUserPreferences();
  const { t } = useTranslation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>(DEFAULT_MODULE_STATUS);

  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current && Object.keys(preferences).length > 0) {
      if (preferences.language) setLanguage(preferences.language);
      if (preferences.timezone) setTimezone(preferences.timezone);
      if (preferences.currency) setCurrency(preferences.currency);
      if (preferences.theme) setTheme(preferences.theme as 'dark' | 'light');
      if (preferences.module_features) setSelectedModules({ ...DEFAULT_MODULE_STATUS, ...preferences.module_features });
      initialized.current = true;
    }
  }, [preferences]);

  const handleToggleModule = (id: string) => {
    setSelectedModules((prev) => {
      const isCurrentlyEnabled = prev[id] ?? true;
      return { ...prev, [id]: !isCurrentlyEnabled };
    });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Save Profile Data
      if (firstName || lastName) {
        await supabase.auth.updateUser({
          data: { first_name: firstName, last_name: lastName }
        });
      }

      // 2. Save Preferences
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
          user_preferences: [{
            ...currentUserPrefs,
            ...updatedPrefs
          }]
        } as any);
      }

      // Seed default categories if finance module is enabled
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
      setError(err.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (prefsLoading) {
    return (
      <div className="min-h-screen bg-warm-black flex items-center justify-center">
        <Loading text="Preparing your space..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-black flex flex-col items-center justify-center p-md md:p-xl relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary opacity-5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-lg animate-fade-in">
        <ErrorAlert error={error} onDismiss={() => setError(null)} />

        <div className="text-center space-y-sm mb-xl">
          <h1 className="text-heading-xl md:text-display-lg font-display font-extrabold tracking-tight text-white">
            {t('onboarding.welcome')}
          </h1>
          <p className="text-gray-light text-sm md:text-base max-w-md mx-auto">
            {step === 1 
              ? "Let's set up your persona so TRASON knows what to call you." 
              : step === 2
              ? "Let's personalize your digital space. Start by setting your region and language."
              : "Select the modules you want to activate. You can always change this later in settings."}
          </p>
        </div>

        <Card className="glass border-white/5 p-xl md:p-2xl shadow-2xl relative overflow-hidden transition-all duration-500">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }} 
            />
          </div>

          {step === 1 && (
            <div className="space-y-xl animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="space-y-md">
                  <label className="text-xs font-bold text-gray-light tracking-widest uppercase flex items-center gap-sm">
                    <UserIcon size={14} className="text-primary" /> {t("onboarding.first_name")}
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("onboarding.first_name_ph")}
                    className="w-full h-12 bg-black/20 border border-white/10 rounded-lg px-lg text-sm text-soft-cream focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-md">
                  <label className="text-xs font-bold text-gray-light tracking-widest uppercase flex items-center gap-sm">
                    {t("onboarding.last_name")}
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("onboarding.last_name_ph")}
                    className="w-full h-12 bg-black/20 border border-white/10 rounded-lg px-lg text-sm text-soft-cream focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-lg border-t border-white/5">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => setStep(2)}
                  rightIcon={<ChevronRight size={18} />}
                  disabled={!firstName.trim()}
                >{t("onboarding.continue")}</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-xl animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <Select
                  label={t("onboarding.language")}
                  value={language}
                  onValueChange={(val) => setLanguage(val)}
                  options={LANGUAGE_OPTIONS.map((l) => ({
                    value: l.value,
                    label: l.label,
                  }))}
                />
                
                <Select
                  label={t("onboarding.timezone")}
                  value={timezone}
                  onValueChange={(val) => setTimezone(val)}
                  options={TIMEZONE_OPTIONS.map((t) => ({
                    value: t,
                    label: t,
                  }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg pt-4 border-t border-white/5">
                <div className="space-y-md">
                  <label className="text-xs font-bold text-gray-light tracking-widest uppercase flex items-center gap-sm">
                    <Wallet size={14} className="text-warm-gold" /> {t("onboarding.currency")}
                  </label>
                  <div className="flex flex-wrap gap-sm">
                    {CURRENCY_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={`px-lg py-sm rounded-lg border text-sm font-bold transition-all ${
                          currency === c 
                            ? 'bg-primary text-warm-black border-primary shadow-lg shadow-primary/20 scale-105' 
                            : 'bg-black/10 border-white/5 text-gray-light hover:bg-black/20 hover:border-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-md">
                  <label className="text-xs font-bold text-gray-light tracking-widest uppercase flex items-center gap-sm">
                    <PaintBrush size={14} className="text-primary" /> {t("onboarding.theme")}
                  </label>
                  <div className="flex gap-sm">
                    {['dark', 'light'].map((th) => (
                      <button
                        key={th}
                        onClick={() => setTheme(th as 'dark' | 'light')}
                        className={`px-lg py-sm rounded-lg border text-sm font-bold uppercase transition-all ${
                          theme === th 
                            ? 'bg-primary text-warm-black border-primary shadow-lg shadow-primary/20 scale-105' 
                            : 'bg-black/10 border-white/5 text-gray-light hover:bg-black/20 hover:border-white/10'
                        }`}
                      >
                        {th}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-lg border-t border-white/5">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={() => setStep(1)}
                  className="text-gray-light"
                >{t("onboarding.back")}</Button>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => setStep(3)}
                  rightIcon={<ChevronRight size={18} />}
                >{t("onboarding.continue")}</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-xl animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {getAllModules().map((module) => {
                  const Icon = { Wallet, TrendingUp, Heartbeat, Briefcase, Clock, BellRinging, Sparkle, Dumbbell: Heartbeat, Bell: BellRinging, Lightbulb: Sparkle }[module.icon] || Globe;
                  return (
                    <ModuleSelectionCard
                      key={module.id}
                      id={module.id}
                      title={t(`nav.${module.id}`)}
                      description={t(`modules.${module.id}_desc`)}
                      icon={Icon}
                      color={module.color}
                      isSelected={selectedModules[module.id] !== false}
                      onToggle={handleToggleModule}
                    />
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-lg border-t border-white/5">
                <Button 
                  variant="ghost" 
                  size="md" 
                  onClick={() => setStep(2)}
                  className="text-gray-light hover:text-white"
                >{t("onboarding.back")}</Button>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  rightIcon={<Check size={18} />}
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
