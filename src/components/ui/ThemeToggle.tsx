'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Sun, Moon } from '@phosphor-icons/react';

export function ThemeToggle() {
  const setActiveTheme = useAuthStore((s) => s.setActiveTheme);
  const isDark = useResolvedTheme() === 'dark';
  const { t } = useTranslation();
  const label = isDark ? t('nav.switch_to_light') : t('nav.switch_to_dark');

  return (
    <button
      type="button"
      onClick={() => setActiveTheme(isDark ? 'light' : 'dark')}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-primary"
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
    </button>
  );
}
