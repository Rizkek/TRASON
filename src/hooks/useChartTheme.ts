'use client';

import { useMemo } from 'react';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { getCategoryPalette, getChartChrome, getTokenColors } from '@/config/colors';

// Chart.js takes colors as options, not classes, so charts read them for the resolved theme.
export function useChartTheme() {
  const theme = useResolvedTheme();
  return useMemo(
    () => ({ theme, colors: getTokenColors(theme), palette: getCategoryPalette(theme), chrome: getChartChrome(theme) }),
    [theme]
  );
}
