export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar_url?: string;
  email_verified: boolean;
  phone?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  push_notifications_enabled: boolean;
  email_digest_enabled: boolean;
  digest_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type: 'income' | 'expense';
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/** Minimal shape returned when Supabase joins categories via a foreign key */
export interface CategoryJoin {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  time?: string;
  payment_method?: string;
  receipt_image_url?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  /** Populated by Supabase join when selecting categories:category_id(...) — Supabase returns an array even for single-row joins */
  categories?: CategoryJoin[] | null;
}

export interface Activity {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  mood?: string;
  rating?: number;
  location?: string;
  participants?: string[];
  tags?: string[];
  image_urls?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  due_datetime?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_custom_rule?: string;
  recurrence_end_date?: string;
  recurrence_occurrences?: number;
  notify_days_before?: number;
  notify_hours_before?: number;
  notify_times?: number[];
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface InvestmentPosition {
  id: string;
  user_id: string;
  asset_type: 'stock' | 'crypto' | 'gold';
  symbol: string;
  display_name?: string | null;
  amount: number;
  buy_price: number;
  buy_date: string;
  quote_currency: string;
  price_source: string;
  external_id?: string | null;
  manual_current_price?: number | null;
  last_price?: number | null;
  last_price_change_pct?: number | null;
  last_valued_at?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface InvestmentPriceSnapshot {
  id: string;
  user_id: string;
  position_id: string;
  snapshot_date: string;
  price: number;
  change_percent?: number | null;
  source: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  date: string;
  type: string;
  category?: string;
  insight_text: string;
  data?: Record<string, unknown>;
  confidence_score?: number;
  is_actionable: boolean;
  created_at: string;
  updated_at: string;
}
