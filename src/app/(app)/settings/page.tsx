'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Input, Loading, Alert, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { User, supabase } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { userQueries } from '@/services/core/userQueries';
import { sanitizeError, validateEmail } from '@/libs/validation';
import { useModuleStatus } from '@/hooks/useModuleStatus';
import { usePushNotification } from '@/hooks/usePushNotification';
import { useUserPreferences } from '@/hooks/useUserPreferences';

import { ModuleId } from '@/modules/types';
import { DEFAULT_MODULE_STATUS, MODULE_METADATA } from '@/modules/registry';
import {
  User as UserIcon,
  Paintbrush,
  ShieldCheck,
  BellRing,
  Camera,
  Globe,
  Save,
  Lock,
  Grid3X3,
  Wallet,
  TrendingUp,
  Clock,
  AlertTriangle,
  type LucideIcon
} from 'lucide-react';

// --- Interfaces ---
interface ProfileData {
  first_name: string;
  last_name: string;
  phone: string;
  bio: string;
}

interface PreferenceData {
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  email_digest_enabled: boolean;
  digest_frequency: string;
}

interface UserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  user_preferences?: PreferenceData[];
}

const MODULE_ICONS: Record<string, LucideIcon> = {
  Wallet,
  TrendingUp,
  Clock,
  Bell: BellRing,
  Lightbulb: Camera,
};

type Tab = 'profile' | 'preferences' | 'security' | 'notifications' | 'modules';

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'IDR', 'JPY', 'SGD', 'AUD', 'CAD'];
const TIMEZONE_OPTIONS = [
  'UTC', 'Asia/Jakarta', 'Asia/Singapore', 'Asia/Tokyo',
  'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
];
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
];

const ModuleItem: React.FC<{
  id: ModuleId;
  isEnabled: boolean;
  metadata: any;
  userId?: string;
  t: (key: string) => string;
}> = ({ id, isEnabled, metadata, userId, t }) => {
  const { toggle, isLoading: isHookLoading } = useModuleStatus(id, userId);
  const { updatePreferences, isUpdating: isHookLoadingPrefs, ...preferences } = useUserPreferences();
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const handleToggle = async () => {
    setIsLocalLoading(true);
    try {
      await toggle();
    } catch (err) {
      console.error(`Failed to toggle module ${id}:`, err);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleSubToggle = async (featureId: string) => {
    try {
      setIsLocalLoading(true);
      
      // Always fetch latest from Zustand store directly to avoid rapid-click closure stale state
      const latestUserPrefs = Array.isArray((useAuthStore.getState().user as any)?.user_preferences)
        ? (useAuthStore.getState().user as any)?.user_preferences[0]
        : (useAuthStore.getState().user as any)?.user_preferences;
        
      const currentFeatures = latestUserPrefs?.module_features || preferences?.module_features || {};
      const currentValue = currentFeatures[featureId] !== false; // default true
      
      const newModuleFeatures = {
        ...currentFeatures,
        [featureId]: !currentValue,
      };

      const updatedPrefs = await updatePreferences({
        module_features: newModuleFeatures
      });

      // Synchronize the SWR update into the global Zustand store 
      // so other pages immediately reflect the new preferences
      if (user && updatedPrefs) {
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
    } catch (err) {
      console.error('Failed to toggle sub-feature:', err);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const Icon = MODULE_ICONS[metadata.icon] || Grid3X3;
  const isPending = isHookLoading || isLocalLoading;

  // For Timeline and Reminders: detect if all sub-features are turned off
  const allSubFeaturesOff = isEnabled && (() => {
    const f = preferences?.module_features || {};
    if (id === 'timeline') {
      return f['timeline_weekly_log'] === false && f['timeline_daily_checklist'] === false;
    }
    if (id === 'reminders') {
      return f['reminders_active'] === false && f['reminders_history'] === false;
    }
    return false;
  })();

  return (
    <div className="space-y-sm">
      <div
        className={`flex items-center justify-between p-lg rounded-md border transition-all ${
          isEnabled && !allSubFeaturesOff
            ? 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]'
            : allSubFeaturesOff
            ? 'bg-orange-500/[0.04] border-orange-500/20'
            : 'bg-transparent border-black/[0.02] dark:border-white/[0.02] opacity-60'
        }`}
      >
        <div className="flex items-center gap-md">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${metadata.color}15` }}
          >
            <Icon size={20} style={{ color: allSubFeaturesOff ? '#f97316' : metadata.color }} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-soft-cream">{t(`nav.${id}`)}</h4>
            <p className="text-[10px] text-gray-light">
              {allSubFeaturesOff
                ? <span className="text-orange-400">{t('modules.all_sub_off_warning')}</span>
                : metadata.description
              }
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled
              ? 'bg-primary'
              : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
          } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Sub-toggles for Timeline and Reminders */}
      {isEnabled && (id === 'timeline' || id === 'reminders') && (
        <div className="ml-4 pl-3 border-l border-black/10 dark:border-white/10 space-y-sm mt-sm">
          {id === 'timeline' && (
            <>
              <div className="flex items-center justify-between gap-md py-sm">
                <span className="text-xs text-gray-light flex-1 min-w-0">{t('modules.timeline_weekly_log')}</span>
                <button
                  type="button"
                  onClick={() => handleSubToggle('timeline_weekly_log')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    preferences?.module_features?.['timeline_weekly_log'] !== false
                      ? 'bg-primary'
                      : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences?.module_features?.['timeline_weekly_log'] !== false ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-md py-sm">
                <span className="text-xs text-gray-light flex-1 min-w-0">{t('modules.timeline_daily_checklist')}</span>
                <button
                  type="button"
                  onClick={() => handleSubToggle('timeline_daily_checklist')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    preferences?.module_features?.['timeline_daily_checklist'] !== false
                      ? 'bg-primary'
                      : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences?.module_features?.['timeline_daily_checklist'] !== false ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </>
          )}
          {id === 'reminders' && (
            <>
              <div className="flex items-center justify-between gap-md py-sm">
                <span className="text-xs text-gray-light flex-1 min-w-0">{t('modules.reminders_active')}</span>
                <button
                  type="button"
                  onClick={() => handleSubToggle('reminders_active')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    preferences?.module_features?.['reminders_active'] !== false
                      ? 'bg-primary'
                      : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences?.module_features?.['reminders_active'] !== false ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-md py-sm">
                <span className="text-xs text-gray-light flex-1 min-w-0">{t('modules.reminders_history')}</span>
                <button
                  type="button"
                  onClick={() => handleSubToggle('reminders_history')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                    preferences?.module_features?.['reminders_history'] !== false
                      ? 'bg-primary'
                      : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences?.module_features?.['reminders_history'] !== false ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Module Settings Tab Component
const ModuleSettingsTab: React.FC<{ userId?: string; t: (key: string) => string }> = ({ userId, t }) => {
  const { module_features } = useUserPreferences();

  // Compute statuses from Supabase-synced preferences via Zustand
  const moduleIds = Object.keys(DEFAULT_MODULE_STATUS) as ModuleId[];
  const statuses = moduleIds.map((id) => ({
    id,
    isEnabled: (module_features?.[id] ?? DEFAULT_MODULE_STATUS[id]) !== false,
    metadata: MODULE_METADATA[id],
  }));

  const enabledCount = statuses.filter((s) => s.isEnabled).length;
  const disabledCount = statuses.filter((s) => !s.isEnabled).length;

  return (
    <div className="space-y-xl">
      <Card className="glass border-none" title={t('modules.title')}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.02] blur-3xl pointer-events-none" />

        <div className="space-y-lg relative z-10">
          <p className="text-xs text-gray-light leading-relaxed tracking-wide">
            {t('modules.description')}
          </p>

          <div className="grid gap-md">
            {statuses.map((status) => (
              <ModuleItem
                key={status.id}
                id={status.id}
                isEnabled={status.isEnabled}
                metadata={status.metadata}
                userId={userId}
                t={t}
              />
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass border-none bg-black/[0.01] dark:bg-white/[0.01]" title="MODULE STATUS">
        <div className="grid grid-cols-2 gap-md">
          <div className="p-lg rounded-md bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
            <div className="text-2xl font-bold text-primary">{enabledCount}</div>
            <div className="text-[10px] text-gray-light tracking-widest">{t('modules.enabled_count').toUpperCase()}</div>
          </div>
          <div className="p-lg rounded-md bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
            <div className="text-2xl font-bold text-secondary">{disabledCount}</div>
            <div className="text-[10px] text-gray-light tracking-widest">{t('modules.disabled_count').toUpperCase()}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setActiveLanguage = useAuthStore((s) => s.setActiveLanguage);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user) as UserData | null;
  const { language: activeLanguage } = useUserPreferences();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  /**
   * Guard: ensure the profile/prefs form is only initialized ONCE from the DB,
   * not on every re-render caused by setUser() (which would reset unsaved edits).
   */
  const isFormInitialized = React.useRef(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const push = usePushNotification();

  // Snapshot preferensi terakhir yang tersimpan di DB â€” untuk deteksi perubahan push setting
  const [originalPrefs, setOriginalPrefs] = useState<PreferenceData | null>(null);

  // Profile form
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
  });

  // Preferences form
  const [prefs, setPrefs] = useState<PreferenceData>({
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    notifications_enabled: true,
    push_notifications_enabled: true,
    email_digest_enabled: true,
    digest_frequency: 'weekly',
  });

  const { t } = useTranslation();

  // Apply theme instantly (Optimistic UI)
  useEffect(() => {
    const root = window.document.documentElement;
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (prefs.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [prefs.theme]);

  // Security form
  const [security, setSecurity] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      // Reset the init guard on sign-out so next login re-initializes the form
      isFormInitialized.current = false;
      router.push('/login');
      return;
    }

    if (user && !isFormInitialized.current) {
      const userPrefs = Array.isArray((user as any).user_preferences)
        ? (user as any).user_preferences[0]
        : (user as any).user_preferences;

      if (!userPrefs) {
        // Lock guard immediately to prevent multiple concurrent or sequential fetches
        isFormInitialized.current = true;

        userQueries.getUserWithPreferences().then((fullProfile) => {
          if (fullProfile) {
            const freshPrefs = Array.isArray((fullProfile as any).user_preferences)
              ? (fullProfile as any).user_preferences[0]
              : (fullProfile as any).user_preferences;
              
            setUser(fullProfile as any); // Sync complete profile + preferences to Zustand
            
            if (freshPrefs) {
              const loaded: PreferenceData = {
                theme: freshPrefs.theme || 'dark',
                language: freshPrefs.language || 'en',
                currency: freshPrefs.currency || 'USD',
                timezone: freshPrefs.timezone || 'UTC',
                notifications_enabled: freshPrefs.notifications_enabled ?? true,
                push_notifications_enabled: freshPrefs.push_notifications_enabled ?? true,
                email_digest_enabled: freshPrefs.email_digest_enabled ?? true,
                digest_frequency: freshPrefs.digest_frequency || 'weekly',
              };
              setPrefs(loaded);
              setOriginalPrefs(loaded);
            }
          }
        }).catch((err) => {
          if (navigator.onLine === false || err?.message === 'Offline') {
            setMessage({ type: 'error', text: 'You are offline. Showing cached preferences.' });
          }
        });

        // Initialize profile immediately while preference request is in-flight (avoids layout shift)
        setProfile({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          bio: user.bio || '',
        });
        return;
      }

      // User has cached preferences â€” initialize form directly
      isFormInitialized.current = true;
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      const loaded: PreferenceData = {
        theme: userPrefs.theme || 'dark',
        language: userPrefs.language || 'en',
        currency: userPrefs.currency || 'USD',
        timezone: userPrefs.timezone || 'UTC',
        notifications_enabled: userPrefs.notifications_enabled ?? true,
        push_notifications_enabled: userPrefs.push_notifications_enabled ?? true,
        email_digest_enabled: userPrefs.email_digest_enabled ?? true,
        digest_frequency: userPrefs.digest_frequency || 'weekly',
      };
      setPrefs(loaded);
      setOriginalPrefs(loaded);
    }
  }, [authLoading, isAuthenticated, router, user, setUser]);


  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveProfile = async () => {
    const errors: Record<string, string> = {};
    if (!profile.first_name.trim()) errors.first_name = 'First name is required';
    if (profile.bio.length > 500) errors.bio = 'Bio must be under 500 characters';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMessage('error', 'Validation failed. Check your inputs.');
      return;
    }

    setIsSavingProfile(true);
    setFormErrors({});
    try {
      if (navigator.onLine === false) throw new Error('Offline');
      await userQueries.updateUserProfile(profile);
      const updated = await userQueries.getUserWithPreferences();
      if (updated) setUser(updated as any);
      showMessage('success', 'Identity updated and persisted!');
    } catch (err) {
      showMessage('error', sanitizeError(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    let pushWarning: string | null = null;

    try {
      if (navigator.onLine === false) throw new Error('Offline');

      // Hanya jalankan push subscribe/unsubscribe jika setting notifikasi berubah
      const pushSettingChanged =
        !originalPrefs ||
        originalPrefs.notifications_enabled !== prefs.notifications_enabled ||
        originalPrefs.push_notifications_enabled !== prefs.push_notifications_enabled;

      if (pushSettingChanged) {
        if (prefs.notifications_enabled && prefs.push_notifications_enabled) {
          try {
            await push.subscribe();
          } catch (pushErr) {
            // Non-blocking: catat peringatan, JANGAN hentikan penyimpanan ke DB
            pushWarning = pushErr instanceof Error ? pushErr.message : 'Push subscription failed';
          }
        } else {
          try {
            await push.unsubscribe();
          } catch {
            // Abaikan error unsubscribe (mungkin memang belum terdaftar)
          }
        }
      }

      const updatedPrefs = await userQueries.updateUserPreferences(prefs);

      if (updatedPrefs) {
        const freshUser = useAuthStore.getState().user;

        const normalizedPrefs = {
          theme: updatedPrefs.theme,
          language: updatedPrefs.language,
          currency: updatedPrefs.currency,
          timezone: updatedPrefs.timezone,
          notifications_enabled: updatedPrefs.notifications_enabled,
          push_notifications_enabled: updatedPrefs.push_notifications_enabled,
          email_digest_enabled: updatedPrefs.email_digest_enabled,
          digest_frequency: updatedPrefs.digest_frequency,
        };

        setUser({ ...freshUser, user_preferences: [normalizedPrefs] } as any);
        // Sync language to the dedicated store primitive
        useAuthStore.setState({ activeLanguage: normalizedPrefs.language || 'en' });
        // Sync local prefs state to keep the form consistent
        setPrefs(normalizedPrefs as typeof prefs);
        setOriginalPrefs({ ...prefs, ...normalizedPrefs });
      }

      if (pushWarning) {
        showMessage('success', `Preferences saved! (Push: ${pushWarning})`);
      } else {
        showMessage('success', 'Digital environment sync successful!');
      }
    } catch (err) {
      // NOTE: We intentionally do NOT rollback the language on network failure.
      // The optimistic language change is already in Zustand + localStorage.
      // If Supabase is temporarily unreachable, the user's choice is preserved
      // locally and they can try saving again when online.
      showMessage('error', sanitizeError(err));
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!security.new_password) errors.new_password = 'New password is required';
    if (security.new_password.length < 8) errors.new_password = 'Password must be at least 8 characters';
    if (security.new_password !== security.confirm_password) errors.confirm_password = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMessage('error', 'Security override rejected. Check key requirements.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error: pwError } = await supabase.auth.updateUser({ password: security.new_password });
      if (pwError) throw pwError;
      setSecurity({ current_password: '', new_password: '', confirm_password: '' });
      showMessage('success', 'Security keys rotated successfully!');
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      showMessage('error', sanitizeError(err) || 'Failed to delete account. Migration 005 might be missing.');
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text="Loading your settings..." />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: UserIcon },
    { id: 'preferences', label: t('settings.tabs.interface'), icon: Paintbrush },
    { id: 'notifications', label: t('settings.tabs.alerts'), icon: BellRing },
    { id: 'modules', label: t('settings.tabs.modules'), icon: Grid3X3 },
    { id: 'security', label: t('settings.tabs.security'), icon: ShieldCheck },
  ];

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <Layout>
        <div className="space-y-xl animate-fade-in max-w-4xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md mb-xl">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-soft-cream">
                {t('settings.title')}
              </h1>
              <p className="text-gray-light mt-1 text-sm">{t('settings.subtitle')}</p>
            </div>
          </div>

          {message && (
            <Alert type={message.type} className="glow-primary">
              {message.text}
            </Alert>
          )}

          <div className="flex gap-md overflow-x-auto pb-md no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-md px-xl py-md text-[10px] font-bold whitespace-nowrap rounded-md border transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-warm-black border-primary shadow-lg shadow-primary/20'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] text-gray-light border-black/[0.05] dark:border-white/[0.05] hover:border-black/[0.1] dark:border-white/[0.1] hover:text-soft-cream'
                  }`}
                >
                  <Icon size={14} />
                  <span className="tracking-[0.2em]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="glass border-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.02] blur-3xl pointer-events-none" />

              <div className="p-xl space-y-xl relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-xl pb-xl border-b border-black/[0.05] dark:border-white/[0.05]">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-primary p-[2px]">
                      <div className="w-full h-full rounded-2xl bg-gray-strong flex items-center justify-center text-3xl font-serif font-bold text-white relative overflow-hidden">
                        {profile.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                        <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-20 transition-opacity" />
                      </div>
                    </div>
                    <button type="button" className="absolute -bottom-2 -right-2 p-sm bg-secondary text-white rounded-md shadow-lg border border-black/20 dark:border-white/20 hover:scale-110 transition-transform">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold text-soft-cream tracking-tight">
                      {profile.first_name || profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`.trim()
                        : 'Syncing Identity...'}
                    </h2>
                    <p className="text-sm text-gray-light italic">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                  <Input
                    label={t('settings.profile.firstName')}
                    value={profile.first_name}
                    onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                    error={formErrors.first_name}
                  />
                  <Input
                    label={t('settings.profile.lastName')}
                    value={profile.last_name}
                    onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                  />
                </div>

                <Input
                  label={t('settings.profile.contactNumber')}
                  placeholder="+00 000 000 000"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />

                <div className="space-y-sm">
                  <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('settings.profile.bio')}</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    placeholder={t('settings.profile.bioPlaceholder')}
                    rows={4}
                    className={`w-full bg-gray-strong/40 border rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none transition-all ${
                      formErrors.bio ? 'border-danger' : 'border-soft-cream/10'
                    }`}
                  />
                  {formErrors.bio && <p className="text-[10px] text-danger mt-1">{formErrors.bio}</p>}
                </div>

                <div className="flex justify-end pt-md">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    leftIcon={<Save size={18} />}
                  >
                    {isSavingProfile ? t('settings.profile.savingBtn') : t('settings.profile.updateBtn')}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-lg">
              <Card className="glass border-none" title={t('settings.interface.sectionTitle')}>
                <div className="space-y-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                    <div className="space-y-sm">
                      <label className="text-[10px] font-bold text-gray-light tracking-widest">{t('settings.interface.themeEngine')}</label>
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
                    <div className="space-y-sm">
                      <label className="text-[10px] font-bold text-gray-light tracking-widest flex items-center gap-sm">
                        <Globe size={12} className="text-secondary" /> {t('settings.interface.language')}
                      </label>
                      <select
                        value={prefs.language}
                        onChange={(e) => {
                          const newLang = e.target.value;
                          setPrefs((p) => ({ ...p, language: newLang }));
                        }}
                        className="w-full h-12 bg-gray-strong/40 border border-soft-cream/10 rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
                      >
                        {LANGUAGE_OPTIONS.map((l) => (
                          <option key={l.value} value={l.value} className="bg-gray-strong">{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                    <div className="space-y-sm">
                      <label className="text-[10px] font-bold text-gray-light tracking-widest">{t('settings.interface.currency')}</label>
                      <select
                        value={prefs.currency}
                        onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
                        className="w-full h-12 bg-gray-strong/40 border border-soft-cream/10 rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
                      >
                        {CURRENCY_OPTIONS.map((c) => <option key={c} value={c} className="bg-gray-strong">{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-sm">
                      <label className="text-[10px] font-bold text-gray-light tracking-widest">{t('settings.interface.timezone')}</label>
                      <select
                        value={prefs.timezone}
                        onChange={(e) => setPrefs((p) => ({ ...p, timezone: e.target.value }))}
                        className="w-full h-12 bg-gray-strong/40 border border-soft-cream/10 rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
                      >
                        {TIMEZONE_OPTIONS.map((tz) => <option key={tz} value={tz} className="bg-gray-strong">{tz}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button variant="primary" size="md" onClick={handleSavePreferences} disabled={isSavingPrefs} leftIcon={<Save size={18} />}>
                  {isSavingPrefs ? t('settings.interface.savingBtn') : t('settings.interface.persistBtn')}
                </Button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="glass border-none" title={t('settings.alerts.sectionTitle')}>
                <div className="space-y-xl">
                  <div className="flex items-center justify-between p-lg rounded-md border bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <BellRing size={20} className="text-secondary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-soft-cream">{t('settings.alerts.push')}</h4>
                        <p className="text-[10px] text-gray-light">{t('settings.alerts.pushDesc')}</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setPrefs((p) => ({ ...p, push_notifications_enabled: !p.push_notifications_enabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        prefs.push_notifications_enabled ? 'bg-primary' : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
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
                      onClick={() => setPrefs((p) => ({ ...p, email_digest_enabled: !p.email_digest_enabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        prefs.email_digest_enabled ? 'bg-primary' : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
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
                    <div className="space-y-sm animate-fade-in pl-14">
                      <label className="text-[10px] font-bold text-gray-light tracking-widest">{t('settings.alerts.frequency')}</label>
                      <select
                        value={prefs.digest_frequency}
                        onChange={(e) => setPrefs((p) => ({ ...p, digest_frequency: e.target.value }))}
                        className="w-full md:w-64 h-10 bg-gray-strong/40 border border-soft-cream/10 rounded-md px-md text-sm text-soft-cream focus:border-primary focus:outline-none"
                      >
                        <option value="daily" className="bg-gray-strong">{t('settings.alerts.daily')}</option>
                        <option value="weekly" className="bg-gray-strong">{t('settings.alerts.weekly')}</option>
                        <option value="monthly" className="bg-gray-strong">{t('settings.alerts.monthly')}</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-xl">
                  <Button variant="primary" size="md" onClick={handleSavePreferences} disabled={isSavingPrefs} leftIcon={<Save size={18} />}>
                    {isSavingPrefs ? t('settings.profile.savingBtn') : t('settings.alerts.persistBtn')}
                  </Button>
                </div>
              </Card>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-lg">
              <Card className="glass border-none" title={t('settings.modules.sectionTitle')}>
                <p className="text-sm text-gray-light mb-xl">
                  {t('settings.modules.description')}
                </p>
                <ModuleSettingsTab userId={user?.id} t={t} />
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-xl">
              <Card className="glass border-none border-t border-danger" title={t('settings.security.sectionTitle')}>
                <div className="space-y-xl max-w-md">
                  <Input
                    label={t('settings.security.currentPass')}
                    type="password"
                    value={security.current_password}
                    onChange={(e) => setSecurity((s) => ({ ...s, current_password: e.target.value }))}
                    error={formErrors.current_password}
                  />
                  <Input
                    label={t('settings.security.newPass')}
                    type="password"
                    value={security.new_password}
                    onChange={(e) => setSecurity((s) => ({ ...s, new_password: e.target.value }))}
                    error={formErrors.new_password}
                  />
                  <Input
                    label={t('settings.security.confirmPass')}
                    type="password"
                    value={security.confirm_password}
                    onChange={(e) => setSecurity((s) => ({ ...s, confirm_password: e.target.value }))}
                    error={formErrors.confirm_password}
                  />
                  <Button variant="primary" onClick={handleChangePassword} disabled={isChangingPassword} className="w-full">
                    {isChangingPassword ? t('settings.security.updatingBtn') : t('settings.security.updateBtn')}
                  </Button>
                </div>
              </Card>

              <Card className="glass border-none bg-danger/5 border-danger/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-xl">
                  <div>
                    <h3 className="text-lg font-bold text-danger flex items-center gap-2">
                      <AlertTriangle size={20} /> {t('settings.security.deleteAccount')}
                    </h3>
                    <p className="text-sm text-gray-light mt-1">
                      {t('settings.security.deleteDesc')}
                    </p>
                  </div>
                  <Button variant="danger" size="md" onClick={() => setDeleteConfirmOpen(true)}>
                    {t('settings.security.deleteBtn')}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteAccount}
          title={t('settings.security.deleteConfirmTitle')}
          description={t('settings.security.deleteConfirmDesc')}
          confirmText={t('settings.security.confirmDeleteBtn')}
          cancelText={t('nav.cancel')}
          isDangerous={true}
        />
      </Layout>
    </>
  );
}
