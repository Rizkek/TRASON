// Hex mirrors of the color tokens in tailwind.config.js, for code that cannot use Tailwind classes
// (Chart.js options, inline styles). Keep both in sync; prefer classes everywhere else.
export const TOKEN_COLORS = {
  primary: '#F4C95D',
  success: '#4ADE80',
  danger: '#F87171',
  warning: '#FB923C',
  info: '#60A5FA',
  accentPurple: '#8B5CF6',
  deepSage: '#8DA399',
  insightTaupe: '#A39482',
  grayLight: '#94A3B8',
  grayVeryLight: '#CBD5E1',
  softCream: '#FCFCFD',
} as const;

// Ordered so adjacent slices of a doughnut chart stay distinguishable.
export const CATEGORY_PALETTE = [
  TOKEN_COLORS.primary,
  TOKEN_COLORS.success,
  TOKEN_COLORS.info,
  TOKEN_COLORS.accentPurple,
  TOKEN_COLORS.warning,
  TOKEN_COLORS.danger,
  TOKEN_COLORS.deepSage,
  TOKEN_COLORS.insightTaupe,
];

export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
