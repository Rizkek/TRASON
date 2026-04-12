'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Input, Loading, Alert } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { 
  User as UserIcon, 
  Paintbrush, 
  ShieldCheck, 
  BellRing, 
  Camera, 
  Globe, 
  ChevronRight,
  Save,
  Trash2,
  Lock
} from 'lucide-react';

type Tab = 'profile' | 'preferences' | 'security' | 'notifications';

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

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
  });

  // Preferences form
  const [prefs, setPrefs] = useState({
    theme: 'light',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    notifications_enabled: true,
    push_notifications_enabled: true,
    email_digest_enabled: true,
    digest_frequency: 'weekly',
  });

  // Security form
  const [security, setSecurity] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Populate forms from user data
    if (user) {
      setProfile({
        first_name: (user as any).first_name || '',
        last_name: (user as any).last_name || '',
        phone: (user as any).phone || '',
        bio: (user as any).bio || '',
      });
      const userPrefs = (user as any).user_preferences?.[0];
      if (userPrefs) {
        setPrefs({
          theme: userPrefs.theme || 'light',
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
  }, [isAuthenticated, user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await userQueries.updateUserProfile(profile);
      // Refresh user data
      const updated = await userQueries.getUserWithPreferences();
      if (updated) setUser(updated as any);
      showMessage('success', 'Profile updated successfully!');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await userQueries.updateUserPreferences(prefs as any);
      showMessage('success', 'Preferences saved!');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.new_password !== security.confirm_password) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    if (security.new_password.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: security.new_password });
      if (error) throw error;
      setSecurity({ current_password: '', new_password: '', confirm_password: '' });
      showMessage('success', 'Password changed successfully!');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = prompt('Type "DELETE" to confirm account deletion');
    if (confirmed !== 'DELETE') return;
    showMessage('error', 'Account deletion requires server-side support. Contact support@trason.app');
  };

  if (!isAuthenticated) return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'PROFILE', icon: UserIcon },
    { id: 'preferences', label: 'INTERFACE', icon: Paintbrush },
    { id: 'notifications', label: 'ALERTS', icon: BellRing },
    { id: 'security', label: 'SECURITY', icon: ShieldCheck },
  ];

  return (
    <Layout>
      <div className="space-y-xl animate-fade-in max-w-4xl">
        <div className="space-y-sm">
          <h1 className="text-display font-serif text-gradient">Account Settings</h1>
          <p className="text-subtext">Manage your digital identity and preferences</p>
        </div>

        {/* Floating message */}
        {message && (
          <Alert type={message.type} className="glow-primary">
            {message.text}
          </Alert>
        )}

        {/* Tab bar - Modern Pill Style */}
        <div className="flex gap-md overflow-x-auto pb-md no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-md px-xl py-md text-[10px] font-bold whitespace-nowrap rounded-md border transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-white bg-opacity-[0.02] text-gray-light border-white border-opacity-[0.05] hover:border-white hover:border-opacity-[0.1] hover:text-soft-cream'
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
              <div className="flex flex-col md:flex-row items-center gap-xl pb-xl border-b border-white border-opacity-[0.05]">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-primary p-[2px]">
                    <div className="w-full h-full rounded-2xl bg-gray-strong flex items-center justify-center text-3xl font-serif font-bold text-white relative overflow-hidden">
                      {profile.first_name?.[0]?.toUpperCase() || (user as any)?.email?.[0]?.toUpperCase() || '?'}
                      <div className="absolute inset-0 bg-primary opacity-5 group-hover:opacity-20 transition-opacity" />
                    </div>
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-sm bg-secondary text-white rounded-md shadow-lg border border-white border-opacity-20 hover:scale-110 transition-transform">
                    <Camera size={14} />
                  </button>
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-xl font-bold text-soft-cream tracking-tight">
                    {profile.first_name || profile.last_name
                      ? `${profile.first_name} ${profile.last_name}`.trim()
                      : 'Syncing Identity...'}
                  </h2>
                  <p className="text-sm text-gray-light italic">{(user as any)?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                <Input
                  label="FIRST NAME"
                  value={profile.first_name}
                  onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
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
                  className="w-full bg-gray-strong bg-opacity-40 border border-white border-opacity-[0.05] rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none transition-all"
                />
              </div>

              <div className="flex justify-end pt-md">
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  leftIcon={<Save size={18} />}
                >
                  {isSaving ? 'PERSISTING...' : 'UPDATE PROFILE'}
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
                          onClick={() => setPrefs((p) => ({ ...p, theme: t }))}
                          className={`flex-1 py-md rounded-md border text-xs font-bold uppercase tracking-widest transition-all ${
                            prefs.theme === t
                              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                              : 'bg-white bg-opacity-[0.02] text-gray-light border-white border-opacity-[0.05] hover:bg-white hover:bg-opacity-[0.05]'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-sm">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest flex items-center gap-sm">
                      <Globe size={12} className="text-secondary" /> REGIONAL LANGUAGE
                    </label>
                    <select
                      value={prefs.language}
                      onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                      className="w-full h-12 bg-gray-strong bg-opacity-40 border border-white border-opacity-[0.05] rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
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
                      className="w-full h-12 bg-gray-strong bg-opacity-40 border border-white border-opacity-[0.05] rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
                    >
                      {CURRENCY_OPTIONS.map((c) => <option key={c} value={c} className="bg-gray-strong">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-sm">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest">TIMEZONE OFFSET</label>
                    <select
                      value={prefs.timezone}
                      onChange={(e) => setPrefs((p) => ({ ...p, timezone: e.target.value }))}
                      className="w-full h-12 bg-gray-strong bg-opacity-40 border border-white border-opacity-[0.05] rounded-md px-lg text-sm text-soft-cream focus:border-primary focus:outline-none"
                    >
                      {TIMEZONE_OPTIONS.map((tz) => <option key={tz} value={tz} className="bg-gray-strong">{tz}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" size="md" onClick={handleSavePreferences} disabled={isSaving} leftIcon={<Save size={18} />}>
                {isSaving ? 'SYNCING...' : 'PERSIST PREFERENCES'}
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
                  <div key={key} className="flex items-center justify-between p-lg rounded-md hover:bg-white hover:bg-opacity-[0.02] border border-transparent hover:border-white hover:border-opacity-[0.05] transition-all">
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
                      onClick={() => setPrefs((p) => ({ ...p, [key]: !(p as any)[key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        (prefs as any)[key] ? 'bg-primary' : 'bg-gray-strong border border-white border-opacity-[0.1]'
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

                {prefs.email_digest_enabled && (
                  <div className="p-xl bg-white bg-opacity-[0.01] rounded-md border border-white border-opacity-[0.03]">
                    <label className="text-[10px] font-bold text-gray-light tracking-widest mb-md block">TRANSMISSION FREQUENCY</label>
                    <div className="flex gap-md">
                      {['daily', 'weekly', 'monthly'].map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setPrefs((p) => ({ ...p, digest_frequency: freq }))}
                          className={`flex-1 py-md rounded-md border text-[10px] font-bold uppercase tracking-widest transition-all ${
                            prefs.digest_frequency === freq
                              ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20'
                              : 'bg-transparent text-gray-light border-white border-opacity-[0.1] hover:text-soft-cream'
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
              <Button variant="primary" size="md" onClick={handleSavePreferences} disabled={isSaving} leftIcon={<Save size={18} />}>
                {isSaving ? 'UPDATING...' : 'SYNC NOTIFICATIONS'}
              </Button>
            </div>
          </div>
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
                  />
                </div>
                <Input
                  label="CONFIRM KEY"
                  type="password"
                  placeholder="Repeat Secure Key"
                  value={security.confirm_password}
                  onChange={(e) => setSecurity((s) => ({ ...s, confirm_password: e.target.value }))}
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleChangePassword}
                    disabled={isSaving || !security.new_password || !security.confirm_password}
                    leftIcon={<ShieldCheck size={18} />}
                  >
                    {isSaving ? 'ENCRYPTING...' : 'RE-AUTHENTICATE'}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="border border-danger border-opacity-20 bg-danger bg-opacity-[0.02]" title="CRITICAL OVERRIDE">
              <div className="space-y-lg">
                <p className="text-xs text-gray-light leading-relaxed tracking-wide">
                  Terminating your identity will result in <strong className="text-danger">TOTAL DATA ERASURE</strong>. 
                  All logged focus sessions, financial data, and personal insights will be unrecoverable. 
                </p>
                <div className="pt-md">
                  <Button variant="danger" size="sm" onClick={handleDeleteAccount} leftIcon={<Trash2 size={14} />}>
                    TERMINATE IDENTITY
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
