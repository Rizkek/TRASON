'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Loading, Toast, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { userQueries } from '@/services/core/userQueries';
import { sanitizeError } from '@/libs/validation';
import { usePushNotification } from '@/hooks/usePushNotification';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import {
  User as UserIcon,
  PaintBrush,
  ShieldCheck,
  BellRinging,
  GridNine,
  type Icon,
} from '@phosphor-icons/react';
import {
  Tab,
  UserData,
  ProfileData,
  PreferenceData,
  ProfileSection,
  PreferencesSection,
  NotificationsSection,
  ModulesSection,
  SecuritySection,
} from './components';

export function SettingsClient() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user) as UserData | null;
  const { language: activeLanguage } = useUserPreferences();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const push = usePushNotification();

  const isFormInitialized = React.useRef(false);
  const [originalPrefs, setOriginalPrefs] = useState<PreferenceData | null>(null);

  // Profile form
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    avatar_url: '',
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  // Theme is now synchronized globally via ThemeSync component based on useAuthStore activeTheme

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      isFormInitialized.current = false;
      router.push('/login');
      return;
    }

    if (user && !isFormInitialized.current) {
      const userPrefs = Array.isArray((user as any).user_preferences)
        ? (user as any).user_preferences[0]
        : (user as any).user_preferences;

      if (!userPrefs) {
        isFormInitialized.current = true;

        userQueries
          .getUserWithPreferences()
          .then((fullProfile) => {
            if (fullProfile) {
              const freshPrefs = Array.isArray((fullProfile as any).user_preferences)
                ? (fullProfile as any).user_preferences[0]
                : (fullProfile as any).user_preferences;

              setUser(fullProfile as any);

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
                  module_features: freshPrefs.module_features,
                };
                setPrefs(loaded);
                setOriginalPrefs(loaded);
              }
            }
          })
          .catch((err) => {
            if (navigator.onLine === false || err?.message === 'Offline') {
              setMessage({ type: 'error', text: 'You are offline. Showing cached preferences.' });
            }
          });

        setProfile({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          bio: user.bio || '',
          avatar_url: user.avatar_url || '',
        });
        return;
      }

      isFormInitialized.current = true;
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Image must be smaller than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { storageQueries } = await import('@/services/core/storageQueries');
      const publicUrl = await storageQueries.uploadAvatar(user.id, file);

      setProfile((p) => ({ ...p, avatar_url: publicUrl }));
      await userQueries.updateUserProfile({ avatar_url: publicUrl });
      setUser({ ...user, avatar_url: publicUrl } as any);

      showMessage('success', 'Avatar updated successfully!');
    } catch (err) {
      showMessage('error', sanitizeError(err));
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
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

      const pushSettingChanged =
        !originalPrefs ||
        originalPrefs.notifications_enabled !== prefs.notifications_enabled ||
        originalPrefs.push_notifications_enabled !== prefs.push_notifications_enabled;

      if (pushSettingChanged) {
        if (prefs.notifications_enabled && prefs.push_notifications_enabled) {
          try {
            await push.subscribe();
          } catch (pushErr) {
            pushWarning = pushErr instanceof Error ? pushErr.message : 'Push subscription failed';
          }
        } else {
          try {
            await push.unsubscribe();
          } catch {
            // Silently ignore unsubscribe errors
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
          module_features: updatedPrefs.module_features,
        };

        setUser({ ...freshUser, user_preferences: [normalizedPrefs] } as any);
        useAuthStore.setState({ activeLanguage: normalizedPrefs.language || 'en' });
        setPrefs(normalizedPrefs as typeof prefs);
        setOriginalPrefs({ ...prefs, ...normalizedPrefs });
      }

      if (pushWarning) {
        showMessage('success', `Preferences saved! (Push: ${pushWarning})`);
      } else {
        showMessage('success', 'Digital environment sync successful!');
      }
    } catch (err) {
      showMessage('error', sanitizeError(err));
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error: rpcErr } = await supabase.rpc('delete_user');
      if (rpcErr) throw rpcErr;
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      showMessage(
        'error',
        sanitizeError(err) || 'Failed to delete account. Migration 005 might be missing.'
      );
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

  const tabs: { id: Tab; label: string; icon: Icon }[] = [
    { id: 'profile', label: t('settings.tabs.profile'), icon: UserIcon },
    { id: 'preferences', label: t('settings.tabs.interface'), icon: PaintBrush },
    { id: 'notifications', label: t('settings.tabs.alerts'), icon: BellRinging },
    { id: 'modules', label: t('settings.tabs.modules'), icon: GridNine },
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
            <Toast
              type={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
              duration={4000}
            />
          )}

          <div className="flex gap-sm overflow-x-auto pb-md no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  aria-label={tab.label}
                  className={`flex items-center justify-center p-md md:px-xl md:py-md gap-md text-[10px] font-bold whitespace-nowrap rounded-md border transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-primary text-warm-black border-primary shadow-lg shadow-primary/20'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] text-gray-light border-black/[0.05] dark:border-white/[0.05] hover:border-black/[0.1] dark:hover:border-white/[0.1] hover:text-soft-cream'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="hidden md:inline tracking-[0.2em]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileSection
              user={user}
              profile={profile}
              setProfile={setProfile}
              formErrors={formErrors}
              isSavingProfile={isSavingProfile}
              isUploadingAvatar={isUploadingAvatar}
              onAvatarChange={handleAvatarChange}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <PreferencesSection
              prefs={prefs}
              setPrefs={setPrefs}
              isSavingPrefs={isSavingPrefs}
              onSavePreferences={handleSavePreferences}
            />
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <NotificationsSection
              prefs={prefs}
              setPrefs={setPrefs}
              isSavingPrefs={isSavingPrefs}
              onSavePreferences={handleSavePreferences}
            />
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && <ModulesSection />}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <SecuritySection
              showMessage={showMessage}
              setError={setError}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </div>
      </Layout>
    </>
  );
}
