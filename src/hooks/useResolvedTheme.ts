'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { resolveTheme, type Theme } from '@/libs/theme';

// The theme actually on screen: a 'system' preference resolved against the device.
export function useResolvedTheme(): Theme {
  const preference = useAuthStore((s) => s.activeTheme);
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(preference, false));

  useEffect(() => {
    const device = window.matchMedia('(prefers-color-scheme: light)');
    const sync = () => setTheme(resolveTheme(preference, device.matches));
    sync();

    if (preference !== 'system') return;
    device.addEventListener('change', sync);
    return () => device.removeEventListener('change', sync);
  }, [preference]);

  return theme;
}
