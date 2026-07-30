/**
 * Default Finance Categories
 * Icons must match keys in CategoryIcon.tsx's iconMap (Phosphor icon names or aliases).
 * This single source of truth is used in:
 *  - Onboarding (_client.tsx) — seeded when finance module is first enabled
 *  - FinanceClient — auto-seeded if user has zero categories
 */

export type DefaultCategory = {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  is_default: boolean;
  sort_order: number;
};

export const DEFAULT_FINANCE_CATEGORIES: DefaultCategory[] = [
  // ── EXPENSE ──────────────────────────────────────────────────────────
  { name: 'Makanan & Minuman', type: 'expense', icon: 'ForkKnife',   is_default: true, sort_order: 1 },
  { name: 'Transportasi',      type: 'expense', icon: 'Car',          is_default: true, sort_order: 2 },
  { name: 'Rumah & Utilitas',  type: 'expense', icon: 'Home',         is_default: true, sort_order: 3 },
  { name: 'Belanja',           type: 'expense', icon: 'ShoppingCart', is_default: true, sort_order: 4 },
  { name: 'Kesehatan',         type: 'expense', icon: 'FirstAidKit',  is_default: true, sort_order: 5 },
  { name: 'Hiburan',           type: 'expense', icon: 'FilmStrip',    is_default: true, sort_order: 6 },
  { name: 'Pendidikan',        type: 'expense', icon: 'GraduationCap',is_default: true, sort_order: 7 },
  { name: 'Olahraga',          type: 'expense', icon: 'Barbell',      is_default: true, sort_order: 8 },
  { name: 'Teknologi',         type: 'expense', icon: 'Laptop',       is_default: true, sort_order: 9 },
  { name: 'Tabungan / Investasi', type: 'expense', icon: 'PiggyBank', is_default: true, sort_order: 10 },
  { name: 'Lain-lain',         type: 'expense', icon: 'Package',      is_default: true, sort_order: 11 },

  // ── INCOME ───────────────────────────────────────────────────────────
  { name: 'Gaji',              type: 'income',  icon: 'Coins',        is_default: true, sort_order: 1 },
  { name: 'Freelance',         type: 'income',  icon: 'Briefcase',    is_default: true, sort_order: 2 },
  { name: 'Investasi',         type: 'income',  icon: 'TrendUp',      is_default: true, sort_order: 3 },
  { name: 'Bonus',             type: 'income',  icon: 'Gift',         is_default: true, sort_order: 4 },
  { name: 'Penjualan',         type: 'income',  icon: 'Storefront',   is_default: true, sort_order: 5 },
  { name: 'Lain-lain',         type: 'income',  icon: 'Wallet',       is_default: true, sort_order: 6 },
];
