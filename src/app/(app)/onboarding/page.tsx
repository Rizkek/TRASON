'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Loading, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { ModuleSelectionCard } from './components/ModuleSelectionCard';
import { 
  Globe, Clock, Wallet, TrendingUp, BellRing, Briefcase, Activity, Sparkles, ChevronRight, Check, Paintbrush
} from 'lucide-react';

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

const MODULE_OPTIONS = [
  { id: 'finance', title: 'Finance', description: 'Track your income, expenses, and manage your budget effectively.', icon: Wallet, color: '#22c55e' },
  { id: 'investments', title: 'Investments', description: 'Monitor your portfolio, stocks, crypto, and asset allocation.', icon: TrendingUp, color: '#8b5cf6' },
  { id: 'sport', title: 'Sport & Workout', description: 'Plan workout routines, track progress, and log exercise sessions.', icon: Activity, color: '#ef4444' },
  { id: 'career', title: 'Career Tracker', description: 'Manage job applications, interview schedules, and career growth.', icon: Briefcase, color: '#f97316' },
  { id: 'timeline', title: 'Timeline & Tasks', description: 'Daily checklists, weekly logs, and habit tracking.', icon: Clock, color: '#3b82f6' },
  { id: 'reminders', title: 'Smart Reminders', description: 'Never miss an event with priority-based alerts and notifications.', icon: BellRing, color: '#f59e0b' },
  { id: 'insights', title: 'AI Insights', description: 'Get intelligent analytics and suggestions across all your data.', icon: Sparkles, color: '#eab308' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { updatePreferences, isUpdating: prefsLoading, ...preferences } = useUserPreferences();
  const { t } = useTranslation();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (preferences) {
      if (preferences.language) setLanguage(preferences.language);
      if (preferences.timezone) setTimezone(preferences.timezone);
      if (preferences.currency) setCurrency(preferences.currency);
      if (preferences.theme) setTheme(preferences.theme as 'dark' | 'light');
      if (preferences.module_features) setSelectedModules(preferences.module_features);
    }
  }, [preferences]);

  const handleToggleModule = (id: string) => {
    setSelectedModules((prev) => {
      // By default, toggling adds/removes the key or flips its boolean
      const isCurrentlyEnabled = prev[id] !== false; // If undefined, we assume it's disabled initially during onboarding, wait.
      // Actually, if it's not in prev, we are enabling it.
      const isPresent = id in prev;
      if (!isPresent || !prev[id]) {
        return { ...prev, [id]: true };
      } else {
        return { ...prev, [id]: false };
      }
    });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updatedPrefs = await updatePreferences({
        language,
        timezone,
        currency,
        theme,
        module_features: {
          ...selectedModules,
          onboarding_done: true,
        },
      });

      // Sync Zustand immediately so other pages know we're onboarded
      if (user && updatedPrefs) {
        useAuthStore.setState({ activeLanguage: language });
        const currentUserPrefs = Array.isArray((user as any).user_preferences) 
          ? (user as any).user_preferences[0] 
          : (user as any).user_preferences;
        
        setUser({
          ...user,
          user_preferences: [{
            ...currentUserPrefs,
            ...updatedPrefs
          }]
        } as any);
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
          <h1 className="text-3xl md:text-display font-serif text-white tracking-tight">
            Welcome to <span className="text-gradient">TRASON</span>
          </h1>
          <p className="text-gray-light text-sm md:text-base max-w-md mx-auto">
            {step === 1 
              ? "Let's personalize your digital space. Start by setting your region and language." 
              : "Select the modules you want to activate. You can always change this later in settings."}
          </p>
        </div>

        <Card className="glass border-white/5 p-xl md:p-2xl shadow-2xl relative overflow-hidden transition-all duration-500">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-black/20">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: step === 1 ? '50%' : '100%' }} 
            />
          </div>

          {step === 1 && (
            <div className="space-y-xl animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="space-y-md">
                  <label className="text-xs font-bold text-gray-light tracking-widest flex items-center gap-sm">
                    <Globe size={14} className="text-primary" /> LANGUAGE
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-12 bg-black/20 border border-white/10 rounded-lg px-lg text-sm text-soft-cream focus:border-primary focus:outline-none transition-colors"
                  >
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l.value} value={l.value} className="bg-gray-strong">{l.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-md">
                  <label className="text-xs font-bold text-gray-light tracking-widest flex items-center gap-sm">
                    <Clock size={14} className="text-secondary" /> TIMEZONE
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-12 bg-black/20 border border-white/10 rounded-lg px-lg text-sm text-soft-cream focus:border-primary focus:outline-none transition-colors"
                  >
                    {TIMEZONE_OPTIONS.map((t) => (
                      <option key={t} value={t} className="bg-gray-strong">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg pt-4 border-t border-white/5">
                <div className="space-y-md">
                  <label className="text-xs font-bold text-gray-light tracking-widest flex items-center gap-sm">
                    <Wallet size={14} className="text-warm-gold" /> PRIMARY CURRENCY
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
                  <label className="text-xs font-bold text-gray-light tracking-widest flex items-center gap-sm">
                    <Paintbrush size={14} className="text-primary" /> THEME
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

              <div className="flex justify-end pt-lg border-t border-white/5">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => setStep(2)}
                  rightIcon={<ChevronRight size={18} />}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-xl animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {MODULE_OPTIONS.map((module) => (
                  <ModuleSelectionCard
                    key={module.id}
                    id={module.id}
                    title={module.title}
                    description={module.description}
                    icon={module.icon}
                    color={module.color}
                    isSelected={selectedModules[module.id] === true}
                    onToggle={handleToggleModule}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center pt-lg border-t border-white/5">
                <Button 
                  variant="ghost" 
                  size="md" 
                  onClick={() => setStep(1)}
                  className="text-gray-light hover:text-white"
                >
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  rightIcon={<Check size={18} />}
                >
                  {isSubmitting ? 'Finalizing...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
