'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ConfirmModal } from '../ConfirmModal';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { OfflineBanner } from './OfflineBanner';
import { PushSubscriptionSync } from './PushSubscriptionSync';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';
import { MoreSheet } from './MoreSheet';
import { navLabelKey, useNavItems } from './useNavItems';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * The persistent shell of every authenticated page: sidebar on desktop, header, bottom bar and
 * "More" sheet on phones. Onboarding is a full-screen flow and renders without it.
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const signOut = useAuthStore((s) => s.signOut);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { visibleItems, barItems, sheetItems, isActive, current } = useNavItems();

  const mainRef = React.useRef<HTMLElement>(null);
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  // The shell persists across navigations, so the scroll container must be reset by hand.
  React.useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // The one client-side auth guard for every authenticated page. It waits for the first session
  // check because the persisted isAuthenticated flag can be stale in either direction.
  React.useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.replace(`/login?redirect_to=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthReady, isAuthenticated, pathname, router]);

  const closeMore = React.useCallback(() => setMoreOpen(false), []);

  if (!isAuthenticated || pathname.startsWith('/onboarding')) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    setLogoutOpen(false);
    setLoggingOut(false);
    router.push('/login');
  };

  return (
    <div className="flex h-dvh bg-background font-sans text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        {t('nav.skip_to_content')}
      </a>
      <OfflineBanner />

      <Sidebar items={visibleItems} isActive={isActive} user={user} onLogout={() => setLogoutOpen(true)} />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:ml-72">
        <MobileHeader
          title={current ? t(navLabelKey(current.href)) : 'TRASON'}
          user={user}
          menuOpen={moreOpen}
          onOpenMenu={() => setMoreOpen(true)}
        />

        <main id="main-content" tabIndex={-1} ref={mainRef} className="relative z-10 flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] outline-none md:pb-0">
          <div className="container mx-auto max-w-6xl px-4 py-4 md:px-8 md:py-8 lg:px-12">{children}</div>
        </main>

        <BottomNav items={barItems} isActive={isActive} moreOpen={moreOpen} onOpenMore={() => setMoreOpen(true)} />
      </div>

      <MoreSheet
        open={moreOpen}
        items={sheetItems}
        isActive={isActive}
        user={user}
        onClose={closeMore}
        onLogout={() => setLogoutOpen(true)}
      />

      <ConfirmModal
        isOpen={logoutOpen}
        onClose={() => !loggingOut && setLogoutOpen(false)}
        onConfirm={handleLogout}
        title={t('nav.logoutConfirmTitle')}
        description={t('nav.logoutConfirmDesc')}
        confirmText={t('nav.logoutConfirmBtn')}
        cancelText={t('nav.cancel')}
        isDangerous={true}
        isLoading={loggingOut}
      />

      <PushSubscriptionSync />
    </div>
  );
};
