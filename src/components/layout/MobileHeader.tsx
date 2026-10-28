'use client';

import React from 'react';
import { Logo } from '../Logo';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Avatar } from './Avatar';
import { NotificationToggle } from './NotificationToggle';

interface MobileHeaderProps {
  title: string;
  user: { first_name?: string | null; name?: string | null; email?: string | null; avatar_url?: string | null } | null;
  menuOpen: boolean;
  onOpenMenu: () => void;
}

export function MobileHeader({ title, user, menuOpen, onOpenMenu }: MobileHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="relative z-40 flex items-center justify-between border-b border-foreground/10 bg-background pb-1 pl-4 pr-2 pt-[max(env(safe-area-inset-top),0.5rem)] lg:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <Logo size={24} variant="gold" />
        <h2 className="truncate text-label-md uppercase text-foreground">{title}</h2>
      </div>
      <div className="flex items-center">
        <NotificationToggle />
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t('nav.open_menu')}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-full"
        >
          <Avatar user={user} size={32} />
        </button>
      </div>
    </header>
  );
}
