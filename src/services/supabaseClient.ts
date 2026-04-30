import { createBrowserClient } from '@supabase/ssr';

// Re-export all canonical types from the single source of truth
export type {
  User,
  UserPreferences,
  Category,
  CategoryJoin,
  Transaction,
  Activity,
  Reminder,
  Insight,
  InvestmentPosition,
  InvestmentPriceSnapshot,
} from '@/types/database';

import type { User, UserPreferences } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables (warn instead of throw to avoid chunk load failures)
const isValidHttpUrl = (str: string) => {
  try {
    new URL(str);
    return str.startsWith('http://') || str.startsWith('https://');
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing required environment variables. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

if (supabaseUrl && !isValidHttpUrl(supabaseUrl)) {
  console.error(
    '[Supabase] Invalid NEXT_PUBLIC_SUPABASE_URL. Must be a valid HTTPS URL. ' +
    'Current value: ' + supabaseUrl.substring(0, 50)
  );
}

/**
 * Berkah dari integrasi SSR standar:
 * `createBrowserClient` sudah mengotomatisasi pola Singleton dalam browser 
 * dan mengirim autoRefresh lock secara aman. Ini memperbaiki bug "stolen lock" 
 * tanpa perlu modifikasi globalThis manual yang rentan terhadap edge cases.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Types only used internally — not duplicated from database.ts
export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  run_on_days: number[];
  preferred_hour: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
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
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

/**
 * getCurrentUser — reads from the local session (NO navigator lock).
 *
 * WHY getSession() instead of getUser():
 *   - getUser() validates against the Supabase server AND acquires the
 *     Web Locks API navigator lock for token refresh.
 *   - When multiple queries run concurrently (Promise.all in dashboard),
 *     they all call getCurrentUser() simultaneously → lock collision →
 *     NavigatorLockAcquireTimeoutError / AbortError "stolen lock".
 *   - getSession() reads from localStorage — instant, lock-free, safe.
 *   - Security: session JWT is already validated server-side by RLS policies.
 *     The AuthProvider's onAuthStateChange keeps the local session fresh.
 */
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
};

// Helper function to get current session
export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};
