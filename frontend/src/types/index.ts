export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  categoryId: string;
  category?: Category;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  createdAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  category?: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  mood?: 'angry' | 'sad' | 'neutral' | 'happy' | 'excellent';
  rating?: number;
  location?: string;
  tags?: string[];
  createdAt: Date;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt: Date;
}

export interface Insight {
  id: string;
  date: Date;
  type: 'daily' | 'weekly' | 'monthly';
  summary?: string;
  recommendations?: string[];
  data: Record<string, any>;
}

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
