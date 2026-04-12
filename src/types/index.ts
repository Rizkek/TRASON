// Re-export types from supabaseClient for consistency
export type {
  User,
  UserPreferences,
  Category,
  Transaction,
  Activity,
  Reminder,
  Insight,
  PushSubscription,
  ActivityLog,
} from '@/services/supabaseClient';

import type { User, Activity } from '@/services/supabaseClient';

export interface DashboardSummary {
  balance: number;
  todayIncome: number;
  todayExpense: number;
  pendingReminders: number;
  recentActivities: Activity[];
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
