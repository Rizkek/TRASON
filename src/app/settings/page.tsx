'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Input, Loading, Alert, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabaseClient';
import { userQueries } from '@/services/queries';
import { sanitizeError, validateEmail } from '@/libs/validation';
import { useAllModuleStatus, useModuleStatus } from '@/hooks/useModuleStatus';
import { usePushNotification } from '@/hooks/usePushNotification';
import { ModuleId } from '@/modules/types';
import {
  User as UserIcon,
  Paintbrush,
  ShieldCheck,
  BellRing,
  Camera,
  Globe,
  Save,
  Trash2,
  Lock,
  Grid3X3,
  Wallet,
  TrendingUp,
  Clock,
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
  theme: 'light' | 'dark' | 'auto';
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
];

// Module Item Component to handle its own hook logic
const ModuleItem: React.FC<{ 
  id: ModuleId; 
  isEnabled: boolean; 
  metadata: any; 
  userId?: string 
}> = ({ id, isEnabled, metadata, userId }) => {
  const { toggle, isLoading: isHookLoading } = useModuleStatus(id, userId);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

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

  const Icon = MODULE_ICONS[metadata.icon] || Grid3X3;
  const isPending = isHookLoading || isLocalLoading;

  return (
    <div
      className={`flex items-center justify-between p-lg rounded-md border transition-all ${
        isEnabled
          ? 'bg-white/[0.02] border-white/[0.05]'
          : 'bg-transparent border-white/[0.02] opacity-60'
      }`}
    >
      <div className="flex items-center gap-md">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${metadata.color}15` }}
        >
          <Icon size={20} style={{ color: metadata.color }} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-soft-cream">{metadata.name}</h4>
          <p className="text-[10px] text-gray-light">{metadata.description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled
            ? 'bg-primary'
            : 'bg-gray-strong border border-white/[0.1]'
        } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// Module Settings Tab Component
const ModuleSettingsTab: React.FC<{ userId?: string }> = ({ userId }) => {
  const { statuses, enabledModules, disabledModules, isLoading } = useAllModuleStatus(userId);

  if (isLoading) {
    return (
      <Card className="glass border-none">
        <div className="flex items-center justify-center py-xl">
          <Loading text="Loading modules..." />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-xl">
      <Card className="glass border-none" title="ACTIVE MODULES">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.02] blur-3xl pointer-events-none" />

        <div className="space-y-lg relative z-10">
          <p className="text-xs text-gray-light leading-relaxed tracking-wide">
            Enable or disable application modules to customize your experience.
            Disabled modules will not appear in the navigation or dashboard.
          </p>

          <div className="grid gap-md">
            {statuses.map((status) => (
              <ModuleItem
                key={status.id}
                id={status.id}
                isEnabled={status.isEnabled}
                metadata={status.metadata}
                userId={userId}
              />
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass border-none bg-white/[0.01]" title="MODULE STATUS">
        <div className="grid grid-cols-2 gap-md">
          <div className="p-lg rounded-md bg-white/[0.02] border border-white/[0.05]">
            <div className="text-2xl font-bold text-primary">{enabledModules.length}</div>
            <div className="text-[10px] text-gray-light tracking-widest">ENABLED MODULES</div>
          </div>
          <div className="p-lg rounded-md bg-white/[0.02] border border-white/[0.05]">
            <div className="text-2xl font-bold text-secondary">{disabledModules.length}</div>
            <div className="text-[10px] text-gray-light tracking-widest">DISABLED MODULES</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user) as UserData | null;

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const push = usePushNotification();

  // Profile form
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
  });

  // Preferences form
  const [prefs, setPrefs] = useState<PreferenceData>({
    theme: 'dark', // Default to dark for TRASON
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    notifications_enabled: true,
    push_notifications_enabled: true,
    email_digest_enabled: true,
    digest_frequency: 'weekly',
  });

  // Apply theme instantly (Optimistic UI)
  useEffect(() => {
    const root = window.document.documentElement;
    if (prefs.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (prefs.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // Auto: check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
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
      router.push('/login');
      return;
    }

    if (user) {
      setProfile({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      const userPrefs = user.user_preferences?.[0];
      if (userPrefs) {
        setPrefs({
          theme: userPrefs.theme || 'dark',
          language: userPrefs.language || 'en',
          currency: userPrefs.currency || 'USD',
          timezone: userPrefs.timezone || 'UTC',
          notifications_enabled: userPrefs.notifications_enabled ?? true,
          push_notifications_enabled: userPrefs.push_notifications_enabled ?? true,
          email_digest_enabled: userPrefs.email_digest_enabled ?? true,
          digest_frequency: userPrefs.digest_frequency || 'weekly',
        });
      }
    }
  }, [authLoading, isAuthenticated, router, user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveProfile = async () => {
    // Validation
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
    try {
      if (prefs.notifications_enabled && prefs.push_notifications_enabled) {
        await push.subscribe();
      } else {
        try {
          await push.unsubscribe();
        } catch {
          // Ignore
        }
      }

      await userQueries.updateUserPreferences(prefs);
      const updated = await userQueries.getUserWithPreferences();
      if (updated) setUser(updated as any);
      showMessage('success', 'Digital environment sync successful!');
    } catch (err) {
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
    { id: 'profile', label: 'PROFILE', icon: UserIcon },
    { id: 'preferences', label: 'INTERFACE', icon: Paintbrush },
    { id: 'notifications', label: 'ALERTS', icon: BellRing },
    { id: 'modules', label: 'MODULES', icon: Grid3X3 },
    { id: 'security', label: 'SECURITY', icon: ShieldCheck },
  ];

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <Layout>
        <div className="space-y-xl animate-fade-in max-w-4xl">
        <div className="space-y-sm">
          <h1 className="text-display font-serif text-gradient">Account Settings</h1>
          <p className="text-subtext">Manage your digital identity and preferences</p>
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
                    : 'bg-white/[0.02] text-gray-light border-white/[0.05] hover:border-white/[0.1] hover:text-soft-cream'
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
              <div className="flex flex-col md:flex-row items-center gap-xl pb-xl border-b border-white/[0.05]">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-primary p-[2px]">
                    <div className="w-full h-full rounded-2xl bg-gray-strong flex items-center justify-center text-3xl font-serif font-bold text-white relative overflow-hidden">
                      {profile.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                      <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-20 transition-opacity" />
                    </div>
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 p-sm bg-secondary text-white rounded-md shadow-lg border border-white/20 hover:scale-110 transition-transform">
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
                  label="FIRST NAME"
                  value={profile.first_name}
                  onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                  error={formErrors.first_name}
                />
                <Input
                  label="LAST NAME"
                  value={profile.last_name}
                  onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                />
              </div>

              <Input
                label="CONTACT NUMBER"
                placeholder="+00 000 000 000"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />

              <div className="space-y-sm">
                <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">SHORT BIO</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about your mission..."
                  rows={4}
                  className={`w-full bg-gray-strong/40 border rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none transition-all ${
                    formErrors.bio ? 'border-danger' : 'border-white/[0.05]'
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
                  {isSavingProfile ? 'PERSISTING...' : 'UPDATE PROFILE'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-lg">
            <Card className="glass border-none" title="DISPLAY & INTERFACE">
              <div className="space-y-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                  <div className="space-y-sm">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest">THEME ENGINE</label>
                    <div className="flex gap-md">
                      {['light', 'dark', 'auto'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPrefs((p) => ({ ...p, theme: t as 'light' | 'dark' | 'auto' }))}
                          className={`flex-1 py-md rounded-md border text-xs font-bold uppercase tracking-widest transition-all ${
                            prefs.theme === t
                              ? 'bg-primary text-warm-black border-primary shadow-lg shadow-primary/20 scale-105'
                              : 'bg-white/[0.02] text-gray-light border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.2]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-primary mt-2 italic opacity-80">
                      * Previewing {prefs.theme} mode instantly. Click persist to save globally.
                    </p>
                  </div>
                  <div className="space-y-sm">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest flex items-center gap-sm">
                      <Globe size={12} className="text-secondary" /> REGIONAL LANGUAGE
                    </label>
                    <select
                      value={prefs.language}
                      onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                      className="w-full h-12 bg-gray-strong/40 border border-white/[0.05] rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
                    >
                      {LANGUAGE_OPTIONS.map((l) => (
                        <option key={l.value} value={l.value} className="bg-gray-strong">{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                  <div className="space-y-sm">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest">LOCAL CURRENCY</label>
                    <select
                      value={prefs.currency}
                      onChange={(e) => setPrefs((p) => ({ ...p, currency: e.target.value }))}
                      className="w-full h-12 bg-gray-strong/40 border border-white/[0.05] rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
                    >
                      {CURRENCY_OPTIONS.map((c) => <option key={c} value={c} className="bg-gray-strong">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-sm">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest">TIMEZONE OFFSET</label>
                    <select
                      value={prefs.timezone}
                      onChange={(e) => setPrefs((p) => ({ ...p, timezone: e.target.value }))}
                      className="w-full h-12 bg-gray-strong/40 border border-white/[0.05] rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
                    >
                      {TIMEZONE_OPTIONS.map((tz) => <option key={tz} value={tz} className="bg-gray-strong">{tz}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" size="md" onClick={handleSavePreferences} disabled={isSavingPrefs} leftIcon={<Save size={18} />}>
                {isSavingPrefs ? 'SYNCING...' : 'PERSIST PREFERENCES'}
              </Button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-lg">
            <Card className="glass border-none" title="ALERTS & UPDATES">
              <div className="p-sm space-y-md">
                {[
                  { key: 'notifications_enabled', label: 'Push Sync', desc: 'Real-time heartbeat of your activities', icon: BellRing },
                  { key: 'push_notifications_enabled', label: 'Mobile Pulse', desc: 'Critical alerts direct to your hardware', icon: Globe },
                  { key: 'email_digest_enabled', label: 'Strategic Digest', desc: 'High-level weekly field reports', icon: Paintbrush },
                ].map(({ key, label, desc, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-lg rounded-md hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-all">
                    <div className="flex items-center gap-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-tight text-soft-cream uppercase">{label}</p>
                        <p className="text-[10px] text-gray-light mt-0.5 opacity-60 font-medium uppercase tracking-widest">{desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrefs((p) => ({ ...p, [key]: !(p as any)[key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        (prefs as any)[key] ? 'bg-primary' : 'bg-gray-strong border border-white/[0.1]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          (prefs as any)[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                {prefs.push_notifications_enabled && (
                  <p className="text-xs text-gray-light px-lg">
                    Browser permission: {push.isSupported ? Notification.permission : 'unsupported'}
                  </p>
                )}

                {prefs.email_digest_enabled && (
                  <div className="p-xl bg-white/[0.01] rounded-md border border-white/[0.03]">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest mb-md block">TRANSMISSION FREQUENCY</label>
                    <div className="flex gap-md">
                      {['daily', 'weekly', 'monthly'].map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => setPrefs((p) => ({ ...p, digest_frequency: freq }))}
                          className={`flex-1 py-md rounded-md border text-[10px] font-bold uppercase tracking-widest transition-all ${
                            prefs.digest_frequency === freq
                              ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20'
                              : 'bg-transparent text-gray-light border-white/[0.1] hover:text-soft-cream'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" size="md" onClick={handleSavePreferences} disabled={isSavingPrefs} leftIcon={<Save size={18} />}>
                {isSavingPrefs ? 'UPDATING...' : 'SYNC NOTIFICATIONS'}
              </Button>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <ModuleSettingsTab userId={user?.id} />
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-xl">
            <Card className="glass border-none" title="ACCESS PROTECTION">
               <div className="absolute top-0 right-0 w-32 h-32 bg-danger opacity-[0.02] blur-3xl pointer-events-none" />
              <div className="space-y-xl">
                <div className="relative group">
                   <Lock size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-primary" />
                   <Input
                    label="AUTHENTICATION OVERRIDE"
                    type="password"
                    placeholder="New Secure Key"
                    value={security.new_password}
                    onChange={(e) => setSecurity((s) => ({ ...s, new_password: e.target.value }))}
                    className="pl-xl"
                    error={formErrors.new_password}
                  />
                </div>
                <Input
                  label="CONFIRM KEY"
                  type="password"
                  placeholder="Repeat Secure Key"
                  value={security.confirm_password}
                  onChange={(e) => setSecurity((s) => ({ ...s, confirm_password: e.target.value }))}
                  error={formErrors.confirm_password}
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !security.new_password || !security.confirm_password}
                    leftIcon={<ShieldCheck size={18} />}
                  >
                    {isChangingPassword ? 'ENCRYPTING...' : 'RE-AUTHENTICATE'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="border border-danger/20 bg-danger/[0.02]" title="CRITICAL OVERRIDE">
              <div className="space-y-lg">
                <p className="text-xs text-gray-light leading-relaxed tracking-wide">
                  Terminating your identity will result in <strong className="text-danger">TOTAL DATA ERASURE</strong>. 
                </p>
                <div className="flex items-center gap-xl bg-danger/10 p-lg rounded-md border border-danger/20">
                  <div className="flex-1">
                    <p className="font-bold text-danger text-sm">Terminate Identity</p>
                    <p className="text-xs text-danger/80">Erase all data and revoke system access.</p>
                  </div>
                  <Button variant="danger" size="md" onClick={() => setDeleteConfirmOpen(true)}>ERASE DATA</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

        <ConfirmModal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="TERMINATE IDENTITY"
          description="Are you absolutely sure you want to terminate your account? All your data, modules, insights, and history will be permanently erased. This action cannot be undone."
          confirmText="ERASE EVERYTHING"
          isDangerous={true}
          requireInput="DELETE"
          onConfirm={handleDeleteAccount}
        />
      </Layout>
    </>
  );
}
