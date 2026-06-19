/**
 * Centralized Cache Key Definitions
 * Using this pattern ensures consistency and makes cache invalidation predictable
 * All SWR cache keys should be defined here
 *
 * Pattern: [resource, filters...] or string for simple keys
 * Example: ['transactions', '2025-01', '2025-02'] or 'user-profile'
 */

export const CACHE_KEYS = {
  // Auth
  auth: {
    profile: 'auth:profile',
    session: 'auth:session',
    user: (id: string) => ['auth', 'user', id],
  },

  // Transactions
  transactions: {
    list: (start: string, end: string) => ['transactions', start, end],
    byId: (id: string) => ['transactions', id],
    all: () => ['transactions', '*'],
  },

  // Activities (Daily Schedule)
  activities: {
    list: (start: string, end: string) => ['activities', start, end],
    byDate: (date: string) => ['activities', date],
    byMonth: (month: string) => ['activities', 'month', month],
    all: () => ['activities', '*'],
  },

  // Reminders
  reminders: {
    list: (filter?: 'pending' | 'completed') => 
      filter ? ['reminders', filter] : ['reminders', 'all'],
    byId: (id: string) => ['reminders', id],
    pending: () => ['reminders', 'pending'],
    completed: () => ['reminders', 'completed'],
  },

  // Investments
  investments: {
    portfolio: 'investments:portfolio',
    positions: () => ['investments', 'positions'],
    position: (id: string) => ['investments', 'position', id],
    summary: 'investments:summary',
    insights: 'investments:insights',
    prices: (symbol: string) => ['investments', 'prices', symbol],
  },

  // User Settings
  settings: {
    profile: (userId: string) => ['settings', 'profile', userId],
    preferences: (userId: string) => ['settings', 'preferences', userId],
    moduleStatus: (userId: string) => ['settings', 'moduleStatus', userId],
    notifications: (userId: string) => ['settings', 'notifications', userId],
  },

  // Dashboard
  dashboard: {
    summary: (date: string) => ['dashboard', 'summary', date],
    overview: 'dashboard:overview',
  },

  // Notifications
  notifications: {
    list: 'notifications:list',
    unread: 'notifications:unread',
  },

  // Sport
  sport: {
    history: (start: string, end: string) => ['sport', 'history', start, end],
    recentSessions: () => ['sport', 'sessions', 'recent'],
    sessions: (start: string, end: string) => ['sport', 'sessions', start, end],
    prBoard: () => ['sport', 'pr-board'],
    weeklySummary: (weekStart: string) => ['sport', 'weekly', weekStart],
  },

  // Workout Plans
  workoutPlans: {
    list: () => ['workout-plans', 'list'],
    byId: (id: string) => ['workout-plans', id],
    active: () => ['workout-plans', 'active'],
  },
} as const;

/**
 * Cache invalidation patterns
 * Use these to invalidate related caches when data changes
 */
export const INVALIDATION_PATTERNS = {
  // When transaction changes, invalidate these caches
  onTransactionChange: () => [
    CACHE_KEYS.transactions.all(),
    CACHE_KEYS.dashboard.overview,
    'financial-summary',
  ],

  // When activity changes, invalidate these
  onActivityChange: (date: string) => [
    CACHE_KEYS.activities.byDate(date),
    CACHE_KEYS.dashboard.overview,
  ],

  // When reminder changes, invalidate these
  onReminderChange: () => [
    CACHE_KEYS.reminders.pending(),
    CACHE_KEYS.reminders.completed(),
    CACHE_KEYS.dashboard.overview,
  ],

  // When investment changes, invalidate these
  onInvestmentChange: () => [
    CACHE_KEYS.investments.portfolio,
    CACHE_KEYS.investments.summary,
    CACHE_KEYS.investments.insights,
    CACHE_KEYS.dashboard.overview,
  ],

  // When user profile changes
  onProfileChange: (userId: string) => [
    CACHE_KEYS.auth.profile,
    CACHE_KEYS.settings.profile(userId),
    CACHE_KEYS.dashboard.overview,
  ],

  // When settings change
  onSettingsChange: (userId: string) => [
    CACHE_KEYS.settings.preferences(userId),
    CACHE_KEYS.settings.notifications(userId),
  ],
} as const;

/**
 * Utility to generate wildcard patterns for SWR mutate
 * Example: mutate(key => matchesPattern(key, CACHE_KEYS.transactions.all()))
 */
export function matchesPattern(key: any, pattern: any[]): boolean {
  if (!Array.isArray(key)) return false;
  if (key.length !== pattern.length) return false;
  
  return key.every((k, i) => {
    const p = pattern[i];
    return p === '*' || p === k;
  });
}
