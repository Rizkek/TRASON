'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function ThemeSync() {
  const activeTheme = useAuthStore((s) => s.activeTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (activeTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [activeTheme]);

  return null;
}
