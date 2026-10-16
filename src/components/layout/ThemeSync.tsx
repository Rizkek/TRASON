'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { applyTheme, resolveTheme } from '@/libs/theme';

// The only owner of the theme class on <html>. A 'system' preference follows the device live.
export function ThemeSync() {
  const preference = useAuthStore((s) => s.activeTheme);

  useEffect(() => {
    const device = window.matchMedia('(prefers-color-scheme: light)');
    const sync = () => applyTheme(resolveTheme(preference, device.matches));
    sync();

    if (preference !== 'system') return;
    device.addEventListener('change', sync);
    return () => device.removeEventListener('change', sync);
  }, [preference]);

  return null;
}
