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

export const ICON_NAME_SUGGESTIONS: Record<string, { en: string; id: string; ja: string; es: string }> = {
  ForkKnife:    { en: 'Food & Drink',       id: 'Makanan & Minuman',    ja: '食費',           es: 'Comida & Bebida' },
  Car:          { en: 'Transport',          id: 'Transportasi',         ja: '交通費',          es: 'Transporte' },
  Home:         { en: 'Home & Utilities',   id: 'Rumah & Utilitas',     ja: '住居・光熱費',     es: 'Hogar & Servicios' },
  House:        { en: 'Home & Utilities',   id: 'Rumah & Utilitas',     ja: '住居・光熱費',     es: 'Hogar & Servicios' },
  ShoppingCart: { en: 'Shopping',           id: 'Belanja',              ja: 'ショッピング',     es: 'Compras' },
  FirstAidKit:  { en: 'Health',             id: 'Kesehatan',            ja: '医療費',          es: 'Salud' },
  FilmStrip:    { en: 'Entertainment',      id: 'Hiburan',              ja: '娯楽',           es: 'Entretenimiento' },
  GraduationCap:{ en: 'Education',          id: 'Pendidikan',           ja: '教育',           es: 'Educación' },
  Barbell:      { en: 'Sports',             id: 'Olahraga',             ja: 'スポーツ',        es: 'Deportes' },
  Laptop:       { en: 'Technology',         id: 'Teknologi',            ja: 'テクノロジー',     es: 'Tecnología' },
  PiggyBank:    { en: 'Savings / Invest',   id: 'Tabungan / Invest',    ja: '貯蓄 / 投資',     es: 'Ahorros / Inversión' },
  Coffee:       { en: 'Coffee',             id: 'Kopi',                 ja: 'コーヒー',        es: 'Café' },
  Coins:        { en: 'Salary',             id: 'Gaji',                 ja: '給与',           es: 'Salario' },
  Briefcase:    { en: 'Freelance',          id: 'Freelance',            ja: 'フリーランス',     es: 'Freelance' },
  TrendUp:      { en: 'Investment',         id: 'Investasi',            ja: '投資',           es: 'Inversión' },
  Gift:         { en: 'Bonus / Gift',       id: 'Bonus / Hadiah',       ja: 'ボーナス',        es: 'Bonus / Regalo' },
  Storefront:   { en: 'Sales / Store',      id: 'Penjualan',            ja: '売上',           es: 'Ventas' },
  Wallet:       { en: 'Other Income',       id: 'Lain-lain',            ja: 'その他収入',      es: 'Otros Ingresos' },
  Package:      { en: 'Miscellaneous',      id: 'Lain-lain',            ja: 'その他',          es: 'Otros' },
  // Additional common icons
  Hamburger:    { en: 'Fast Food',          id: 'Cepat Saji',           ja: 'ファストフード',   es: 'Comida Rápida' },
  Airplane:     { en: 'Travel',             id: 'Perjalanan',           ja: '旅行',           es: 'Viajes' },
  GameController:{ en: 'Gaming',            id: 'Game',                 ja: 'ゲーム',          es: 'Juegos' },
  Heart:        { en: 'Wellness',           id: 'Kesejahteraan',        ja: 'ウェルネス',       es: 'Bienestar' },
  Book:         { en: 'Books',              id: 'Buku',                 ja: '書籍',           es: 'Libros' },
  MusicNotes:   { en: 'Music',              id: 'Musik',                ja: '音楽',           es: 'Música' },
  Pill:         { en: 'Pharmacy',           id: 'Apotek',               ja: '薬局',           es: 'Farmacia' },
  Bus:          { en: 'Public Transport',   id: 'Transportasi Umum',    ja: '公共交通',        es: 'Transporte Público' },
};
