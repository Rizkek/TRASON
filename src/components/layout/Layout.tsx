'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ConfirmModal } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useAllModuleStatus } from '@/hooks/useModuleStatus';
import { useReminder } from '@/hooks/useReminder';
import { useScheduleNotifications } from '@/hooks/useScheduleNotifications';
import { ModuleId } from '@/modules/types';
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
  RiMenuLine,
  RiCloseLine
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const { enabledModules } = useAllModuleStatus(user?.id);

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
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 bg-gray-strong border-r border-soft-cream/10 transition-all duration-500 ease-in-out md:static md:translate-x-0 flex flex-col glass h-screen overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="px-lg py-xl flex flex-col items-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-md flex items-center justify-center mb-md glow-primary">
            <span className="text-2xl font-serif font-bold text-white italic">T</span>
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
                className={`flex items-center gap-md px-lg py-md rounded-md transition-all duration-300 relative group overflow-hidden ${isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-light hover:text-soft-cream hover:bg-soft-cream/5'
                  }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {isActive(item.href) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r shadow-[0_0_10px_rgba(78,79,235,0.8)]" />
                )}

                <Icon size={20} className={`${isActive(item.href) ? 'text-primary' : 'group-hover:text-secondary'} transition-colors`} />
                <span className="text-sm font-semibold tracking-wide">{t(`nav.${item.href.replace('/', '')}`)}</span>

                {isActive(item.href) && (
                  <div className="absolute right-[-20%] top-[-50%] w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-md mt-auto mb-md space-y-2">
          {/* User Profile */}
          <div className="flex items-center gap-md px-lg py-md rounded-md bg-soft-cream/5 border border-soft-cream/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
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

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-secondary opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

        <header className="bg-warm-black border-b border-soft-cream/5 px-lg py-md flex items-center justify-between md:hidden relative z-10 transition-colors">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-md text-primary hover:text-secondary transition-colors"
          >
            {isSidebarOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
          </button>
          <h2 className="text-xl font-serif font-bold text-gradient">
            TRASON
          </h2>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="container mx-auto px-md py-lg md:px-2xl md:py-xl max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-warm-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
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
