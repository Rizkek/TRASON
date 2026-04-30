import { Transaction, Activity, Reminder, User } from './database';

export * from './database';

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
