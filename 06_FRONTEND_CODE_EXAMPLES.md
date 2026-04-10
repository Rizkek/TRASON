# Frontend Code Examples - Next.js 14+

## 1. Setup & Configuration

### 1.1 next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 1.2 tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c2d57',
        },
        secondary: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          900: '#3d1d60',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

### 1.3 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "resolveJsonModule": true,
    "moduleResolution": "Node",
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## 2. Type Definitions

### 2.1 src/types/index.ts
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
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
  paymentMethod?: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  category: string;
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
  category?: string;
  createdAt: Date;
}

export interface Insight {
  id: string;
  date: Date;
  type: 'daily' | 'weekly' | 'monthly';
  totalIncome?: number;
  totalExpense?: number;
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
```

## 3. State Management (Zustand)

### 3.1 src/store/authStore.ts
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

### 3.2 src/store/transactionStore.ts
```typescript
import { create } from 'zustand';
import { Transaction } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  selectedMonth: Date;
  isLoading: boolean;
  error: string | null;

  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setSelectedMonth: (date: Date) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  selectedMonth: new Date(),
  isLoading: false,
  error: null,

  setTransactions: (transactions) => set({ transactions }),
  
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  
  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  
  setSelectedMonth: (date) => set({ selectedMonth: date }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
```

## 4. Custom Hooks

### 4.1 src/hooks/useAuth.ts
```typescript
import { useCallback, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/services/api/client';
import { AuthResponse } from '@/types/api';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, setUser, setTokens, logout } =
    useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiClient.post<AuthResponse>('/auth/login', {
          email,
          password,
        });
        
        if (response.data.success) {
          const { user, accessToken, refreshToken } = response.data.data;
          setUser(user);
          setTokens(accessToken, refreshToken);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login failed', error);
        return false;
      }
    },
    [setUser, setTokens]
  );

  const signup = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        const response = await apiClient.post<AuthResponse>('/auth/register', {
          email,
          password,
          firstName,
          lastName,
        });
        
        if (response.data.success) {
          const { user, accessToken, refreshToken } = response.data.data;
          setUser(user);
          setTokens(accessToken, refreshToken);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Signup failed', error);
        return false;
      }
    },
    [setUser, setTokens]
  );

  const handleLogout = useCallback(() => {
    logout();
    // Clear any stored data
    localStorage.removeItem('auth-storage');
  }, [logout]);

  return {
    user,
    accessToken,
    isAuthenticated,
    login,
    signup,
    logout: handleLogout,
  };
};
```

### 4.2 src/hooks/useTransaction.ts
```typescript
import { useCallback, useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { transactionService } from '@/services/api/transactions';
import { useAuth } from './useAuth';
import { Transaction } from '@/types';

export const useTransaction = () => {
  const { isAuthenticated } = useAuth();
  const { transactions, selectedMonth, setTransactions, addTransaction, deleteTransaction } =
    useTransactionStore();

  // Fetch transactions for selected month
  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const response = await transactionService.getTransactions({
        page: 1,
        limit: 100,
        startDate,
        endDate,
      });

      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  }, [isAuthenticated, selectedMonth, setTransactions]);

  // Create new transaction
  const createTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
      try {
        const response = await transactionService.create(data);
        addTransaction(response);
        return true;
      } catch (error) {
        console.error('Failed to create transaction', error);
        return false;
      }
    },
    [addTransaction]
  );

  // Delete transaction
  const removeTransaction = useCallback(
    async (id: string) => {
      try {
        await transactionService.delete(id);
        deleteTransaction(id);
        return true;
      } catch (error) {
        console.error('Failed to delete transaction', error);
        return false;
      }
    },
    [deleteTransaction]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    createTransaction,
    removeTransaction,
    refetch: fetchTransactions,
  };
};
```

## 5. API Services

### 5.1 src/services/api/client.ts
```typescript
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setTokens(accessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 5.2 src/services/api/transactions.ts
```typescript
import { apiClient } from './client';
import { Transaction } from '@/types';

export const transactionService = {
  async getTransactions(filters: {
    page: number;
    limit: number;
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
  }) {
    const response = await apiClient.get('/transactions', { params: filters });
    return response.data.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data.data;
  },

  async create(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const response = await apiClient.post('/transactions', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Transaction>) {
    const response = await apiClient.put(`/transactions/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/transactions/${id}`);
  },

  async getAnalytics() {
    const response = await apiClient.get('/transactions/analytics/spending');
    return response.data.data;
  },
};
```

## 6. Components

### 6.1 src/components/common/Card.tsx
```typescript
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default',
}) => {
  const baseStyles = 'rounded-lg p-4 transition-all';
  
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-transparent border-2 border-gray-300',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

### 6.2 src/components/finance/TransactionList.tsx
```typescript
'use client';

import React from 'react';
import { Transaction, Category } from '@/types';
import { useTransaction } from '@/hooks/useTransaction';
import { Card } from '@/components/common/Card';
import { formatCurrency, formatDate } from '@/libs/format';

export const TransactionList: React.FC = () => {
  const { transactions } = useTransaction();

  if (transactions.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500">No transactions yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <Card
          key={transaction.id}
          variant="outlined"
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              {transaction.category?.icon || '💳'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{transaction.title}</p>
              <p className="text-sm text-gray-500">
                {formatDate(new Date(transaction.date))}
              </p>
            </div>
          </div>
          <div className={`font-semibold ${
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </div>
        </Card>
      ))}
    </div>
  );
};
```

### 6.3 src/components/dashboard/SummaryCard.tsx
```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { formatCurrency } from '@/libs/format';
import { apiClient } from '@/services/api/client';
import { DashboardSummary } from '@/types';

export const SummaryCard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await apiClient.get('/dashboard/summary');
        setSummary(response.data.data);
      } catch (error) {
        console.error('Failed to fetch summary', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <Card>Loading...</Card>;
  }

  if (!summary) {
    return <Card>Failed to load summary</Card>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card variant="elevated">
        <p className="text-sm text-gray-600 mb-1">Today's Balance</p>
        <p className={`text-2xl font-bold ${
          summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatCurrency(summary.balance)}
        </p>
      </Card>

      <Card variant="elevated">
        <p className="text-sm text-gray-600 mb-1">Income Today</p>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(summary.todayIncome)}
        </p>
      </Card>

      <Card variant="elevated">
        <p className="text-sm text-gray-600 mb-1">Expenses Today</p>
        <p className="text-2xl font-bold text-red-600">
          {formatCurrency(summary.todayExpense)}
        </p>
      </Card>
    </div>
  );
};
```

## 7. Pages

### 7.1 src/app/(dashboard)/page.tsx
```typescript
import React from 'react';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { TransactionList } from '@/components/finance/TransactionList';
import { ReminderWidget } from '@/components/dashboard/ReminderWidget';

export const metadata = {
  title: 'Dashboard | TRASON',
  description: 'Your personal finance and life tracking dashboard',
};

export default function DashboardPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to TRASON</h1>

      {/* Summary Cards */}
      <section className="mb-8">
        <SummaryCard />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <TransactionList />
        </section>

        {/* Reminders Widget */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Pending Reminders</h2>
          <ReminderWidget />
        </section>
      </div>
    </main>
  );
}
```

### 7.2 src/app/(dashboard)/finance/page.tsx
```typescript
'use client';

import React, { useState } from 'react';
import { TransactionList } from '@/components/finance/TransactionList';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { DatePicker } from '@/components/common/DatePicker';
import { useTransaction } from '@/hooks/useTransaction';

export default function FinancePage() {
  const { selectedMonth, setSelectedMonth } = useTransaction();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Finance Tracker</h1>
        <Button onClick={() => setShowAddModal(true)}>
          + Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <DatePicker
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </Card>

      {/* Transactions */}
      <TransactionList />

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
        />
      )}
    </main>
  );
}
```

## 8. Service Worker Setup

### 8.1 public/sw.js
```javascript
// Service Worker for PWA
const CACHE_NAME = 'trason-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        return caches.match('/offline.html');
      });
    })
  );
});

// Push notification
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  };

  event.waitUntil(
    self.registration.showNotification('TRASON', options)
  );
});

// Click notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
```

## 9. Utility Functions

### 9.1 src/libs/format.ts
```typescript
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date, format = 'short'): string => {
  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
```

### 9.2 src/libs/validate.ts
```typescript
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\d{10,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};
```

This frontend code provides:
- Complete authentication flow
- Transaction management and visualization
- State management with Zustand
- Type-safe API integration
- Responsive component system
- PWA service worker integration
- Utility functions for common tasks

