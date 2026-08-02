'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ConfirmModal } from '../ConfirmModal';
import { Logo } from '../Logo';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useReminder } from '@/hooks/useReminder';
import { useScheduleNotifications } from '@/hooks/useScheduleNotifications';
import { usePushNotification } from '@/hooks/usePushNotification';
import { NavIcon } from '@/components/ui/NavIcon';
import { ModuleId } from '@/modules/types';
import { DEFAULT_MODULE_STATUS } from '@/modules/registry';
import { SYS_ICONS } from '@/config/icons';
import { TrasonIcon } from '@/components/ui/TrasonIcon';

/**
 * ReminderScheduler lives here (not in AuthProvider root) so it only
 * fetches and schedules reminders when the user is on a protected page.
 * This prevents a SWR fetch on every public page (landing, login, etc.).
 *
 * Wrapped in its own error boundary logic — if notification scheduling fails
 * (e.g., browser blocks Notification API), it silently returns null.
 */
function ReminderScheduler() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <ReminderSchedulerInner />;
}

function ReminderSchedulerInner() {
  const { reminders } = useReminder();
  const { scheduleReminders } = useScheduleNotifications();

  // Auto-register the Service Worker on first load (silent, no push subscription needed).
  // This ensures SW-based notifications work even if the user hasn't visited Settings.
  React.useEffect(() => {
    import('@/hooks/useScheduleNotifications').then(({ ensureSWRegistered }) => {
      ensureSWRegistered();
    });
  }, []);

  React.useEffect(() => {
    if (reminders.length > 0) {
      try {
        scheduleReminders(reminders);
      } catch (e) {
        // Notification API may be blocked or unavailable — fail silently
        console.warn('[ReminderScheduler] Could not schedule notifications:', e);
      }
    }
  // scheduleReminders is stable (useCallback with stable deps), so this is safe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  return null;
}

/**
 * useOnlineStatus — tracks browser online/offline state.
 * Returns { isOnline, justReconnected } for UI feedback.
 */
function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [justReconnected, setJustReconnected] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      // Auto-hide "back online" after 3s
      setTimeout(() => setJustReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, justReconnected };
}

/**
 * OfflineBanner — subtle status bar matching TRASON's glass design.
 * Shows when offline, confirms reconnection, auto-hides.
 */
function OfflineBanner() {
  const { isOnline, justReconnected } = useOnlineStatus();

  if (isOnline && !justReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-sm px-lg py-sm animate-fade-in backdrop-blur-md border-b text-[10px] font-bold tracking-[0.15em] uppercase ${
        justReconnected
          ? 'bg-success/10 border-success/20 text-soft-cream'
          : 'bg-warning/[0.08] border-warning/20 text-soft-cream'
      }`}
    >
      {justReconnected ? (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-success/90">Connection restored</span>
        </>
      ) : (
        <>
          <TrasonIcon icon={SYS_ICONS.offline} size={11} className="text-warning opacity-80" />
          <span className="text-warning/90">Offline — changes will sync when connected</span>
        </>
      )}
    </div>
  );
}

const NotificationToggle = () => {
  const { notifications_enabled, updatePreferences, isUpdating } = useUserPreferences();
  const push = usePushNotification();

  const handleToggle = async () => {
    const newState = !notifications_enabled;
    
    await updatePreferences({ 
      notifications_enabled: newState,
      push_notifications_enabled: newState 
    });

    if (newState) {
      try {
        await push.subscribe();
      } catch (err) {
        console.error('Failed to subscribe to push on toggle:', err);
      }
    } else {
      try {
        await push.unsubscribe();
      } catch (err) {
        console.error('Failed to unsubscribe from push on toggle:', err);
      }
    }
  };

  return (
    <button
      disabled={isUpdating || push.isLoading}
      onClick={handleToggle}
      className={`p-1.5 rounded-full transition-colors flex items-center justify-center shrink-0 ${
        notifications_enabled 
          ? 'text-primary bg-primary/10 hover:bg-primary/20' 
          : 'text-gray-light hover:text-soft-cream hover:bg-soft-cream/10'
      }`}
      title={notifications_enabled ? 'Notifications ON' : 'Notifications OFF'}
    >
      {notifications_enabled ? <TrasonIcon icon={SYS_ICONS.notifications} size={18} /> : <TrasonIcon icon={SYS_ICONS.notificationsOff} size={18} />}
    </button>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signOut = useAuthStore((s) => s.signOut);
  const pathname = usePathname();
  const router = useRouter();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const { module_features } = useUserPreferences();

  // Derive enabled modules directly from Supabase-synced preferences (via Zustand)
  // Falls back to DEFAULT_MODULE_STATUS if a key is absent
  const enabledModules = useMemo(() => {
    return (Object.keys(DEFAULT_MODULE_STATUS) as ModuleId[]).filter(
      (id) => (module_features?.[id] ?? DEFAULT_MODULE_STATUS[id]) !== false
    );
  }, [module_features]);

  // Memoized menu items — only recompute when enabled modules change
  const menuItems: { label: string; href: string; icon: any; moduleId?: ModuleId }[] = useMemo(() => [
    { label: 'Dashboard', href: '/dashboard', icon: SYS_ICONS.dashboard }, // Core, always visible
    { label: 'Finance', href: '/finance', icon: SYS_ICONS.finance.main, moduleId: 'finance' as ModuleId },
    { label: 'Investments', href: '/investments', icon: SYS_ICONS.investments, moduleId: 'investments' as ModuleId },
    { label: 'Timeline', href: '/timeline', icon: SYS_ICONS.timeline, moduleId: 'timeline' as ModuleId },
    { label: 'Sport', href: '/sport', icon: SYS_ICONS.sport, moduleId: 'sport' as ModuleId },
    { label: 'Career', href: '/career', icon: SYS_ICONS.career, moduleId: 'career' as ModuleId },
    { label: 'Reminders', href: '/reminders', icon: SYS_ICONS.notifications, moduleId: 'reminders' as ModuleId },
    { label: 'Insights', href: '/insights', icon: SYS_ICONS.insights, moduleId: 'insights' as ModuleId },
    { label: 'Settings', href: '/settings', icon: SYS_ICONS.settings }, // Core, always visible
  ], []);

  // Filter items based on enabled modules
  const visibleMenuItems = useMemo(
    () => menuItems.filter((item) => !item.moduleId || enabledModules.includes(item.moduleId)),
    [menuItems, enabledModules]
  );

  // ── Mobile bottom nav: Dashboard + up to 3 enabled module items (non-Settings)
  // Priority: order of visibleMenuItems (which respects user's module order)
  const primaryNavItems = useMemo(() => {
    const dashboard = visibleMenuItems.find((i) => i.href === '/dashboard')!;
    const others = visibleMenuItems.filter((i) => i.href !== '/dashboard' && i.href !== '/settings');
    return [dashboard, ...others.slice(0, 3)].filter(Boolean);
  }, [visibleMenuItems]);

  // Items that overflow into the bottom sheet
  const sheetNavItems = useMemo(() => {
    const primaryHrefs = new Set(primaryNavItems.map((i) => i.href));
    return visibleMenuItems.filter((i) => !primaryHrefs.has(i.href));
  }, [visibleMenuItems, primaryNavItems]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const currentMenuItem = menuItems.find((item) => isActive(item.href));

  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    setIsLogoutModalOpen(false);
    setIsLoggingOut(false);
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-warm-black text-soft-cream font-sans">
      <OfflineBanner />

      {/* ── Desktop Sidebar (md+) — hidden on mobile ─────────────────── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-72 shrink-0 bg-gray-strong border-r border-soft-cream/10 flex-col glass h-screen overflow-y-auto">
        <div className="px-lg py-xl flex flex-col items-center">
          <div className="w-12 h-12 flex items-center justify-center mb-md">
            <Logo size={40} variant="gold" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-gradient">
            TRASON
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-light mt-1 font-medium">Elevate Your Life</p>
        </div>

        <nav className="flex-1 px-md py-xl space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`flex items-center gap-md px-lg py-md rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive(item.href)
                    ? 'bg-white/5 border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] text-soft-cream'
                    : 'text-gray-light hover:text-soft-cream hover:bg-soft-cream/5 border border-transparent'
                  }`}
              >
                {isActive(item.href) && (
                  <div className="absolute left-0 top-[15%] bottom-[15%] w-1 bg-primary rounded-r-full shadow-[0_0_12px_rgba(244,201,93,0.8)]" />
                )}

                <NavIcon icon={Icon} isActive={isActive(item.href)} size={20} />
                
                <span className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${isActive(item.href) ? 'text-soft-cream drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`}>
                  {t(`nav.${item.href.replace('/', '')}`)}
                </span>

                {isActive(item.href) && (
                  <div className="absolute right-[-20%] top-[-50%] w-24 h-24 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-md mt-auto mb-md space-y-2">
          {/* User Profile */}
          <div className="flex items-center gap-md px-lg py-md rounded-md bg-soft-cream/5 border border-soft-cream/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-xs font-bold text-white shadow-lg overflow-hidden shrink-0">
              {(user as any)?.avatar_url ? (
                <Image src={(user as any).avatar_url} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
              ) : (
                user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-soft-cream truncate">{user?.first_name || user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-light truncate opacity-80">{user?.email}</p>
            </div>
            <NotificationToggle />
          </div>
          {/* Logout */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-md px-lg py-md rounded-md text-gray-light hover:text-danger hover:bg-danger/10 transition-all duration-300 group"
          >
            <TrasonIcon icon={SYS_ICONS.logout} size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold tracking-wide">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative md:ml-72">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary opacity-[0.03] blur-2xl md:blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary opacity-[0.02] blur-2xl md:blur-[100px] rounded-full pointer-events-none" />

        {/* Mobile top header */}
        <header className="bg-warm-black/95 backdrop-blur-md border-b border-soft-cream/5 px-md py-sm pt-[max(env(safe-area-inset-top),16px)] flex items-center justify-between md:hidden relative z-40 transition-colors">
          <div className="flex items-center gap-sm">
            <Logo size={20} variant="gold" />
            <h2 className="text-sm font-bold text-soft-cream tracking-wider uppercase">
              {currentMenuItem ? t(`nav.${currentMenuItem.href.replace('/', '')}`) : 'TRASON'}
            </h2>
          </div>
          <div className="flex items-center gap-sm">
            <NotificationToggle />
            <button onClick={() => setIsBottomSheetOpen(true)} className="relative w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-[10px] font-bold text-white shadow-lg overflow-hidden shrink-0">
              {(user as any)?.avatar_url ? (
                <Image src={(user as any).avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative z-10 pb-24 md:pb-0">
          <div className="container mx-auto px-sm py-sm md:px-2xl md:py-xl max-w-6xl">
            {children}
          </div>
        </main>

        {/* ── Mobile Smart Bottom Nav ───────────────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-warm-black/95 backdrop-blur-md border-t border-soft-cream/10 z-40 flex justify-around items-center px-2 py-2 safe-area-pb">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] transition-all duration-300 group ${
                  active
                    ? 'text-primary'
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                <div className="relative p-1.5 transition-all duration-300">
                  <NavIcon icon={Icon} isActive={active} size={22} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(244,201,93,0.9)] opacity-80" />
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-medium tracking-wide transition-colors ${active ? 'text-soft-cream drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]' : ''}`}>
                  {t(`nav.${item.href.replace('/', '')}`)}
                </span>
              </Link>
            );
          })}

          {/* "More" button — opens bottom sheet */}
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] transition-all duration-200 ${
              isBottomSheetOpen ? 'text-primary' : 'text-gray-light hover:text-soft-cream'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-200 ${isBottomSheetOpen ? 'bg-primary/15' : ''}`}>
              <TrasonIcon icon={SYS_ICONS.menu} size={22} />
            </div>
            <span className="text-[10px] mt-0.5 font-medium tracking-wide">More</span>
          </button>
        </nav>
      </div>

      {/* ── Mobile Bottom Sheet ───────────────────────────────────────── */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsBottomSheetOpen(false)}
          />

          {/* Sheet panel */}
          <div className="relative bg-gray-strong rounded-t-3xl border-t border-soft-cream/10 shadow-2xl animate-slide-up">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-soft-cream/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-lg py-md border-b border-soft-cream/5">
              <span className="font-semibold text-soft-cream text-sm tracking-wide">All Modules</span>
              <button
                onClick={() => setIsBottomSheetOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-soft-cream/5 hover:bg-soft-cream/10 transition-colors text-gray-light hover:text-soft-cream"
              >
                <TrasonIcon icon={SYS_ICONS.close} size={20} />
              </button>
            </div>

            {/* Menu grid */}
            <div className="px-lg pt-lg pb-md">
              {sheetNavItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-md mb-lg">
                  {sheetNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
                        onClick={() => setIsBottomSheetOpen(false)}
                        className={`flex flex-col items-center gap-sm p-md rounded-2xl border transition-all duration-300 group ${
                          active
                            ? 'bg-white/5 border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] text-soft-cream'
                            : 'bg-soft-cream/5 border-soft-cream/5 text-gray-light hover:bg-soft-cream/10 hover:text-soft-cream hover:border-soft-cream/10'
                        }`}
                      >
                        <NavIcon icon={Icon} isActive={active} size={24} />
                        <span className={`text-[11px] font-medium text-center leading-tight transition-colors ${active ? 'text-soft-cream drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]' : ''}`}>
                          {t(`nav.${item.href.replace('/', '')}`)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-light text-center py-md opacity-60">All modules are in the nav bar.</p>
              )}

              {/* Settings & User section */}
              <div className="border-t border-soft-cream/5 pt-md space-y-sm">
                <Link
                  href="/settings"
                  prefetch={false}
                  onClick={() => setIsBottomSheetOpen(false)}
                  className={`flex items-center gap-md px-md py-sm rounded-xl transition-all duration-200 ${
                    isActive('/settings')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-light hover:text-soft-cream hover:bg-soft-cream/5'
                  }`}
                >
                  <TrasonIcon icon={SYS_ICONS.settings} size={20} />
                  <span className="text-sm font-semibold">{t('nav.settings')}</span>
                </Link>

                {/* User profile row */}
                <div className="flex items-center gap-md px-md py-sm rounded-xl bg-soft-cream/5 border border-soft-cream/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-xs font-bold text-white shadow-lg flex-shrink-0 overflow-hidden">
                    {(user as any)?.avatar_url ? (
                      <Image src={(user as any).avatar_url} alt="Avatar" width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-soft-cream truncate">{user?.first_name || user?.name || 'User'}</p>
                    <p className="text-[10px] text-gray-light truncate opacity-80">{user?.email}</p>
                  </div>
                  <NotificationToggle />
                  <button
                    onClick={() => { setIsBottomSheetOpen(false); setIsLogoutModalOpen(true); }}
                    className="flex items-center gap-xs text-gray-light hover:text-danger transition-colors text-xs font-medium px-sm py-xs rounded-lg hover:bg-danger/10"
                  >
                    <TrasonIcon icon={SYS_ICONS.logout} size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Safe area padding for iOS */}
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title={t('nav.logoutConfirmTitle')}
        description={t('nav.logoutConfirmDesc')}
        confirmText={t('nav.logoutConfirmBtn')}
        cancelText={t('nav.cancel')}
        isDangerous={true}
        isLoading={isLoggingOut}
      />

      {/* Reminder Scheduler — only active on authenticated pages */}
      <ReminderScheduler />
    </div>
  );
};
