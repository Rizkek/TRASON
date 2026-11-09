'use client';

import React from 'react';
import { Plus } from '@phosphor-icons/react';
import { Logo } from '../Logo';
import { openSmartInput } from '../SmartInput';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Avatar } from './Avatar';
import { NotificationToggle } from './NotificationToggle';

interface MobileHeaderProps {
  user: { first_name?: string | null; name?: string | null; email?: string | null; avatar_url?: string | null } | null;
  menuOpen: boolean;
  onOpenMenu: () => void;
}

// The page title lives in each page's own heading, so the header carries only the brand.
export function MobileHeader({ user, menuOpen, onOpenMenu }: MobileHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="relative z-40 flex items-center justify-between border-b border-foreground/10 bg-background pb-1 pl-4 pr-2 pt-[max(env(safe-area-inset-top),0.5rem)] lg:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <Logo size={24} variant="gold" />
        <span className="font-brand text-title-md font-normal text-primary">TRASON</span>
      </div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={openSmartInput}
          aria-label={t('nav.quick_add')}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus size={20} aria-hidden="true" />
        </button>
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
