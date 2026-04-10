import { Response, Request } from 'express';
import type { IncomingHttpHeaders } from 'http';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
  token?: string;
  body: any;
  headers: IncomingHttpHeaders;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description?: string;
  amount: number;
  type: TransactionType;
  date: Date;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  type: 'income' | 'expense';
  isDefault: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  mood?: string;
  rating?: number;
  location?: string;
  tags?: string[];
  createdAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recurrencePattern?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface Insight {
  id: string;
  userId: string;
  date: Date;
  type: 'daily' | 'weekly' | 'monthly';
  summary?: string;
  recommendations?: string[];
  data: Record<string, any>;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}
