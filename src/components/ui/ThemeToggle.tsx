'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Sun, Moon } from '@phosphor-icons/react';

export function ThemeToggle() {
  const { activeTheme, setActiveTheme } = useAuthStore();
  const isDark = activeTheme === 'dark';

  return (
    <button
      onClick={() => setActiveTheme(isDark ? 'light' : 'dark')}
      className="p-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-medium dark:text-gray-light hover:text-primary dark:hover:text-primary hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center"
      aria-label="Toggle Theme"
      title="Toggle Theme"
    >
      {isDark ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
    </button>
  );
}
