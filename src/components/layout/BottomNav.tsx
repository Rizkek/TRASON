'use client';

import React from 'react';
import Link from 'next/link';
import { NavIcon } from '@/components/ui/NavIcon';
import { TrasonIcon } from '@/components/ui/TrasonIcon';
import { SYS_ICONS } from '@/config/icons';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { navLabelKey, type NavItem } from './useNavItems';

interface BottomNavProps {
  items: NavItem[];
  isActive: (href: string) => boolean;
  moreOpen: boolean;
  onOpenMore: () => void;
}

export function BottomNav({ items, isActive, moreOpen, onOpenMore }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Main"
      className="safe-area-pb fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-foreground/10 bg-background px-1 lg:hidden"
    >
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <NavIcon icon={item.icon} isActive={active} size={22} />
            <span className={`text-label-sm ${active ? 'text-foreground' : ''}`}>{t(navLabelKey(item.href))}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onOpenMore}
        aria-label={t('nav.more')}
        aria-expanded={moreOpen}
        className={`flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 transition-colors ${
          moreOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <TrasonIcon icon={SYS_ICONS.menu} size={22} />
        <span className="text-label-sm">{t('nav.more')}</span>
      </button>
    </nav>
  );
}
