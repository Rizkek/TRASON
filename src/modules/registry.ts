/**
 * Central module registry
 * All modules must be registered here
 */

import { ModuleConfig, ModuleId, ModuleMetadata, ModuleStatus } from './types';

// Module metadata definitions
export const MODULE_METADATA: Record<ModuleId, ModuleMetadata> = {
  finance: {
    id: 'finance',
    name: 'Finance',
    description: 'Track income and expenses, manage budgets',
    icon: 'Wallet',
    color: '#10b981', // emerald-500
    order: 1,
  },
  investments: {
    id: 'investments',
    name: 'Investments',
    description: 'Portfolio tracking and investment insights',
    icon: 'TrendingUp',
    color: '#3b82f6', // blue-500
    order: 2,
  },
  timeline: {
    id: 'timeline',
    name: 'Timeline',
    description: 'Daily activities and schedule management',
    icon: 'Clock',
    color: '#8b5cf6', // violet-500
    order: 3,
  },
  reminders: {
    id: 'reminders',
    name: 'Reminders',
    description: 'Task reminders and notifications',
    icon: 'Bell',
    color: '#f59e0b', // amber-500
    order: 4,
  },
  insights: {
    id: 'insights',
    name: 'Insights',
    description: 'AI-powered analytics and recommendations',
    icon: 'Lightbulb',
    color: '#ec4899',
    order: 5,
  },
  sport: {
    id: 'sport',
    name: 'Sport',
    description: 'Track workouts, activity streaks, and fitness habits',
    icon: 'Dumbbell',
    color: '#10b981',
    order: 6,
  },
  career: {
    id: 'career',
    name: 'Career',
    description: 'Track job applications, interviews, and opportunities',
    icon: 'Briefcase',
    color: '#f59e0b',
    order: 7,
  },
};

// Module configuration
export const MODULE_CONFIG: Record<ModuleId, ModuleConfig> = {
  finance: {
    metadata: MODULE_METADATA.finance,
    settings: [
      {
        key: 'defaultCurrency',
        type: 'select',
        label: 'Default Currency',
        defaultValue: 'IDR',
        options: [
          { label: 'Indonesian Rupiah', value: 'IDR' },
          { label: 'US Dollar', value: 'USD' },
          { label: 'Euro', value: 'EUR' },
        ],
      },
      {
        key: 'budgetAlerts',
        type: 'boolean',
        label: 'Budget Alerts',
        description: 'Notify when approaching budget limits',
        defaultValue: true,
      },
    ],
    requiredTables: ['transactions', 'categories'],
    dependencies: [],
  },
  investments: {
    metadata: MODULE_METADATA.investments,
    settings: [
      {
        key: 'autoRefresh',
        type: 'boolean',
        label: 'Auto-refresh Prices',
        description: 'Automatically update investment prices',
        defaultValue: true,
      },
      {
        key: 'refreshInterval',
        type: 'select',
        label: 'Refresh Interval',
        defaultValue: 300,
        options: [
          { label: '5 minutes', value: 300 },
          { label: '15 minutes', value: 900 },
          { label: '1 hour', value: 3600 },
        ],
      },
    ],
    requiredTables: ['investment_positions', 'price_snapshots'],
    dependencies: [],
  },
  timeline: {
    metadata: MODULE_METADATA.timeline,
    settings: [
      {
        key: 'defaultView',
        type: 'select',
        label: 'Default View',
        defaultValue: 'day',
        options: [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ],
      },
    ],
    requiredTables: ['activities'],
    dependencies: [],
  },
  reminders: {
    metadata: MODULE_METADATA.reminders,
    settings: [
      {
        key: 'defaultReminderTime',
        type: 'string',
        label: 'Default Reminder Time',
        defaultValue: '09:00',
      },
    ],
    requiredTables: ['reminders'],
    dependencies: [],
  },
  insights: {
    metadata: MODULE_METADATA.insights,
    settings: [
      {
        key: 'enabledModules',
        type: 'select',
        label: 'Insight Sources',
        defaultValue: ['finance', 'investments'],
        options: [
          { label: 'Finance', value: 'finance' },
          { label: 'Investments', value: 'investments' },
          { label: 'Timeline', value: 'timeline' },
          { label: 'Sport', value: 'sport' },
          { label: 'Career', value: 'career' },
        ],
      },
    ],
    requiredTables: ['insights'],
    dependencies: ['finance', 'investments'],
  },
  sport: {
    metadata: MODULE_METADATA.sport,
    settings: [],
    requiredTables: ['activities', 'sport_logs'],
    dependencies: [],
  },
  career: {
    metadata: MODULE_METADATA.career,
    settings: [],
    requiredTables: ['career_applications'],
    dependencies: [],
  },
};

// Default module status (all enabled)
export const DEFAULT_MODULE_STATUS: Record<ModuleId, boolean> = {
  finance: true,
  investments: false,
  timeline: true,
  reminders: true,
  insights: true,
  sport: true,
  career: true,
};

// Get module metadata
export const getModuleMetadata = (id: ModuleId): ModuleMetadata => {
  return MODULE_METADATA[id];
};

// Get module config
export const getModuleConfig = (id: ModuleId): ModuleConfig => {
  return MODULE_CONFIG[id];
};

// Get all modules
export const getAllModules = (): ModuleMetadata[] => {
  return Object.values(MODULE_METADATA).sort((a, b) => a.order - b.order);
};

// Get enabled modules from user preferences
export const getEnabledModules = (
  preferences: Record<string, boolean> = {}
): ModuleId[] => {
  return (Object.keys(DEFAULT_MODULE_STATUS) as ModuleId[]).filter(
    (id) => preferences[id] ?? DEFAULT_MODULE_STATUS[id]
  );
};

// Check if module is valid
export const isValidModule = (id: string): id is ModuleId => {
  return id in MODULE_METADATA;
};

// Get module dependencies
export const getModuleDependencies = (id: ModuleId): ModuleId[] => {
  return MODULE_CONFIG[id].dependencies;
};

// Check if all dependencies are enabled
export const checkDependencies = (
  id: ModuleId,
  enabledModules: Record<string, boolean>
): { ok: boolean; missing: ModuleId[] } => {
  const deps = getModuleDependencies(id);
  const missing = deps.filter(
    (dep) => !(enabledModules[dep] ?? DEFAULT_MODULE_STATUS[dep])
  );
  return { ok: missing.length === 0, missing };
};
