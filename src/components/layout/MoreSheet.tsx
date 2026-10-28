'use client';

import React from 'react';
import Link from 'next/link';
import { NavIcon } from '@/components/ui/NavIcon';
import { TrasonIcon } from '@/components/ui/TrasonIcon';
import { SYS_ICONS } from '@/config/icons';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Avatar } from './Avatar';
import { NotificationToggle } from './NotificationToggle';
import { navLabelKey, type NavItem } from './useNavItems';

const DISMISS_DISTANCE = 100;

interface MoreSheetProps {
  open: boolean;
  items: NavItem[];
  isActive: (href: string) => boolean;
  user: { first_name?: string | null; name?: string | null; email?: string | null; avatar_url?: string | null } | null;
  onClose: () => void;
  onLogout: () => void;
}

// Bottom sheet on phones: modules that do not fit in the bar, settings, profile and logout.
// Dragging the sheet down past DISMISS_DISTANCE closes it, as does Escape and the backdrop.
export function MoreSheet({ open, items, isActive, user, onClose, onLogout }: MoreSheetProps) {
  const { t } = useTranslation();
  const [offset, setOffset] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const startY = React.useRef(0);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragging) setOffset(Math.max(0, e.touches[0].clientY - startY.current));
  };
  const onTouchEnd = () => {
    setDragging(false);
    if (offset > DISMISS_DISTANCE) onClose();
    setOffset(0);
  };

  const settingsActive = isActive('/settings');

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end lg:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('modules.title')}
        className="safe-area-pb relative animate-slide-up rounded-t-3xl border-t border-foreground/15 bg-surface"
        style={{
          transform: `translateY(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-center pb-1 pt-3" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>

        <div className="flex items-center justify-between border-b border-foreground/10 py-2 pl-6 pr-3">
          <span className="text-label-md text-foreground">{t('modules.title')}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.close_menu')}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <TrasonIcon icon={SYS_ICONS.close} size={20} />
          </button>
        </div>

        <div className="px-4 pb-4 pt-5 sm:px-6">
          {items.filter((i) => i.href !== '/settings').length > 0 ? (
            <div className="mb-5 grid grid-cols-3 gap-3">
              {items
                .filter((i) => i.href !== '/settings')
                .map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-colors ${
                        active
                          ? 'border-foreground/20 bg-foreground/[0.06] text-foreground'
                          : 'border-foreground/10 bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground'
                      }`}
                    >
                      <NavIcon icon={item.icon} isActive={active} size={24} />
                      <span className="text-center text-label-sm leading-tight">{t(navLabelKey(item.href))}</span>
                    </Link>
                  );
                })}
            </div>
          ) : (
            <p className="py-3 text-center text-label-sm font-normal text-muted-foreground">{t('nav.all_in_bar')}</p>
          )}

          <div className="space-y-2 border-t border-foreground/10 pt-4">
            <Link
              href="/settings"
              prefetch={false}
              onClick={onClose}
              aria-current={settingsActive ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-4 rounded-lg px-4 py-2 transition-colors ${
                settingsActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <TrasonIcon icon={SYS_ICONS.settings} size={20} />
              <span className="text-label-md">{t('nav.settings')}</span>
            </Link>

            <div className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.03] py-2 pl-4 pr-2">
              <Avatar user={user} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-md text-foreground">{user?.first_name || user?.name || t('common.user')}</p>
                <p className="truncate text-label-sm font-normal text-muted-foreground">{user?.email}</p>
              </div>
              <NotificationToggle />
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex min-h-11 w-full items-center gap-4 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <TrasonIcon icon={SYS_ICONS.logout} size={20} />
              <span className="text-label-md">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
