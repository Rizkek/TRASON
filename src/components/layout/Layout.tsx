'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ConfirmModal, Logo } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useReminder } from '@/hooks/useReminder';
import { useScheduleNotifications } from '@/hooks/useScheduleNotifications';
import { ModuleId } from '@/modules/types';
import { DEFAULT_MODULE_STATUS } from '@/modules/registry';
import { FaDumbbell } from 'react-icons/fa6';
import {
  RiDashboardLine,
  RiWallet3Line,
  RiCalendarLine,
  RiNotification3Line,
  RiLightbulbLine,
  RiBriefcase4Line,
  RiBriefcaseLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiCloseLine,
  RiAppsLine,
} from 'react-icons/ri';

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
    { label: 'Dashboard', href: '/dashboard', icon: RiDashboardLine }, // Core, always visible
    { label: 'Finance', href: '/finance', icon: RiWallet3Line, moduleId: 'finance' as ModuleId },
    { label: 'Investments', href: '/investments', icon: RiBriefcase4Line, moduleId: 'investments' as ModuleId },
    { label: 'Timeline', href: '/timeline', icon: RiCalendarLine, moduleId: 'timeline' as ModuleId },
    { label: 'Sport', href: '/sport', icon: FaDumbbell, moduleId: 'sport' as ModuleId },
    { label: 'Career', href: '/career', icon: RiBriefcaseLine, moduleId: 'career' as ModuleId },
    { label: 'Reminders', href: '/reminders', icon: RiNotification3Line, moduleId: 'reminders' as ModuleId },
    { label: 'Insights', href: '/insights', icon: RiLightbulbLine, moduleId: 'insights' as ModuleId },
    { label: 'Settings', href: '/settings', icon: RiSettings4Line }, // Core, always visible
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

  const { t } = useTranslation();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    setIsLogoutModalOpen(false);
    setIsLoggingOut(false);
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-warm-black text-soft-cream font-sans">

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
                className={`flex items-center gap-md px-lg py-md rounded-md transition-all duration-300 relative group overflow-hidden ${isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-light hover:text-soft-cream hover:bg-soft-cream/5'
                  }`}
              >
                {isActive(item.href) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r shadow-[0_0_10px_rgba(78,79,235,0.8)]" />
                )}

                <Icon size={20} className={`${isActive(item.href) ? 'text-primary' : 'group-hover:text-secondary'} transition-colors`} />
                <span className="text-sm font-semibold tracking-wide">{t(`nav.${item.href.replace('/', '')}`)}</span>

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
                <img src={(user as any).avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-soft-cream truncate">{user?.first_name || user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-light truncate opacity-80">{user?.email}</p>
            </div>
          </div>
          {/* Logout */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-md px-lg py-md rounded-md text-gray-light hover:text-danger hover:bg-danger/10 transition-all duration-300 group"
          >
            <RiLogoutBoxRLine size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold tracking-wide">{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative md:ml-72">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

        {/* Mobile top header */}
        <header className="bg-warm-black border-b border-soft-cream/5 px-lg py-md flex items-center justify-center md:hidden relative z-10 transition-colors">
          <div className="flex items-center gap-sm">
            <Logo size={24} variant="gold" />
            <h2 className="text-xl font-serif font-bold text-gradient">
              TRASON
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative z-10 pb-24 md:pb-0">
          <div className="container mx-auto px-md py-lg md:px-2xl md:py-xl max-w-6xl">
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
                className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] transition-all duration-200 ${
                  active
                    ? 'text-primary'
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                <div className={`relative p-1.5 rounded-lg transition-all duration-200 ${active ? 'bg-primary/15' : ''}`}>
                  <Icon size={22} className={active ? 'text-primary' : ''} />
                  {active && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(78,79,235,0.9)]" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 font-medium tracking-wide">
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
              <RiAppsLine size={22} />
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
                <RiCloseLine size={18} />
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
                        className={`flex flex-col items-center gap-sm p-md rounded-2xl border transition-all duration-200 ${
                          active
                            ? 'bg-primary/15 border-primary/30 text-primary'
                            : 'bg-soft-cream/5 border-soft-cream/5 text-gray-light hover:bg-soft-cream/10 hover:text-soft-cream'
                        }`}
                      >
                        <Icon size={24} />
                        <span className="text-[11px] font-medium text-center leading-tight">
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
                  <RiSettings4Line size={20} />
                  <span className="text-sm font-semibold">{t('nav.settings')}</span>
                </Link>

                {/* User profile row */}
                <div className="flex items-center gap-md px-md py-sm rounded-xl bg-soft-cream/5 border border-soft-cream/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-xs font-bold text-white shadow-lg flex-shrink-0 overflow-hidden">
                    {(user as any)?.avatar_url ? (
                      <img src={(user as any).avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-soft-cream truncate">{user?.first_name || user?.name || 'User'}</p>
                    <p className="text-[10px] text-gray-light truncate opacity-80">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setIsBottomSheetOpen(false); setIsLogoutModalOpen(true); }}
                    className="flex items-center gap-xs text-gray-light hover:text-danger transition-colors text-xs font-medium px-sm py-xs rounded-lg hover:bg-danger/10"
                  >
                    <RiLogoutBoxRLine size={16} />
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
