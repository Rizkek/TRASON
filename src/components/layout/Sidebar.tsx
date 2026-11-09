'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from '@phosphor-icons/react';
import { Logo } from '../Logo';
import { openSmartInput } from '../SmartInput';
import { Button } from '@/components/ui/Button';
import { NavIcon } from '@/components/ui/NavIcon';
import { TrasonIcon } from '@/components/ui/TrasonIcon';
import { SYS_ICONS } from '@/config/icons';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Avatar } from './Avatar';
import { NotificationToggle } from './NotificationToggle';
import { navLabelKey, type NavItem } from './useNavItems';

interface SidebarProps {
  items: NavItem[];
  isActive: (href: string) => boolean;
  user: { first_name?: string | null; name?: string | null; email?: string | null; avatar_url?: string | null } | null;
  onLogout: () => void;
}

// Desktop navigation (lg and up). Phones and tablets use MobileHeader, BottomNav and MoreSheet instead.
export function Sidebar({ items, isActive, user, onLogout }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-foreground/10 bg-surface lg:flex">
      <div className="flex items-center gap-3 px-6 py-6">
        <Logo size={32} variant="gold" />
        <p className="font-brand text-heading-md font-normal text-primary">TRASON</p>
      </div>

      <div className="px-3 pb-2">
        <Button variant="secondary" size="sm" fullWidth onClick={openSmartInput} leftIcon={<Plus size={16} />}>
          {t('nav.quick_add')}
        </Button>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                active
                  ? 'bg-foreground/[0.06] text-foreground'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />}
              <NavIcon icon={item.icon} isActive={active} size={20} />
              <span className="text-label-md">{t(navLabelKey(item.href))}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-2">
          <Avatar user={user} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-label-md text-foreground">{user?.first_name || user?.name || t('common.user')}</p>
            <p className="truncate text-label-sm font-normal text-muted-foreground">{user?.email}</p>
          </div>
          <NotificationToggle />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <TrasonIcon icon={SYS_ICONS.logout} size={20} />
          <span className="text-label-md">{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
