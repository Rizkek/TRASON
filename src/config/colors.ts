import type { Theme } from '@/libs/theme';

// Hex mirrors of the color tokens in src/app/globals.css, for code that cannot use Tailwind classes
// (Chart.js options, inline styles). Keep both in sync; prefer classes everywhere else.
// Charts draw on the page surface, so the light set uses the darker values that keep 3:1 or better.
export const TOKEN_COLORS_BY_THEME = {
  dark: {
    primary: '#F4C95D',
    success: '#4ADE80',
    danger: '#F87171',
    warning: '#FB923C',
    info: '#60A5FA',
    accentPurple: '#A78BFA',
    deepSage: '#8DA399',
    insightTaupe: '#A39482',
    grayLight: '#94A3B8',
    grayVeryLight: '#CBD5E1',
    foreground: '#FCFCFD',
  },
  light: {
    primary: '#8F6B00',
    success: '#166534',
    danger: '#B91C1C',
    warning: '#92400E',
    info: '#1D4ED8',
    accentPurple: '#6D28D9',
    deepSage: '#3F6252',
    insightTaupe: '#6B5E4C',
    grayLight: '#5B6472',
    grayVeryLight: '#334155',
    foreground: '#0B0F14',
  },
} as const;

export type TokenColors = (typeof TOKEN_COLORS_BY_THEME)[Theme];

export const getTokenColors = (theme: Theme): TokenColors => TOKEN_COLORS_BY_THEME[theme];

// Ordered so adjacent slices of a doughnut chart stay distinguishable.
export const getCategoryPalette = (theme: Theme): string[] => {
  const c = getTokenColors(theme);
  return [c.primary, c.success, c.info, c.accentPurple, c.warning, c.danger, c.deepSage, c.insightTaupe];
};

// Non-series chart colors: tooltip surface, axis ticks and the empty-bar track.
export const getChartChrome = (theme: Theme) =>
  theme === 'dark'
    ? { tooltipBg: 'rgba(0, 0, 0, 0.85)', tooltipBorder: 'rgba(255, 255, 255, 0.1)', tick: 'rgba(255, 255, 255, 0.55)', track: 'rgba(255, 255, 255, 0.06)' }
    : { tooltipBg: 'rgba(255, 255, 255, 0.98)', tooltipBorder: 'rgba(11, 15, 20, 0.15)', tick: 'rgba(11, 15, 20, 0.65)', track: 'rgba(11, 15, 20, 0.07)' };

export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
