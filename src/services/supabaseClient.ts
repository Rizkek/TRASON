import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
const isValidHttpUrl = (str: string) => {
  try {
    new URL(str);
    return str.startsWith('http://') || str.startsWith('https://');
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file. ' +
    'See SQL_SETUP_INSTRUCTIONS.md for setup instructions.'
  );
}

if (!isValidHttpUrl(supabaseUrl)) {
  throw new Error(
    'Invalid NEXT_PUBLIC_SUPABASE_URL. Must be a valid HTTPS URL. ' +
    'Get your project URL from Supabase dashboard > Project Settings > API URLs.\n' +
    'Current value looks like: ' + (supabaseUrl.substring(0, 50) || 'empty')
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string; // For compatibility
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

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  time?: string;
  payment_method?: string;
  receipt_image_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  categories?: any; // To handle Supabase join output
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

export interface Insight {
  id: string;
  user_id: string;
  date: string;
  type: string;
  category?: string;
  insight_text: string;
  data?: Record<string, any>;
  confidence_score?: number;
  is_actionable: boolean;
  created_at: string;
  updated_at: string;
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
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

// Helper function to get current session
export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};
