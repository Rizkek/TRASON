/**
 * Core module types for the modular architecture
 */

import { ReactNode } from 'react';

// Module identifiers
export type ModuleId = 'finance' | 'investments' | 'timeline' | 'insights' | 'reminders';

// Module metadata
export interface ModuleMetadata {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

// Module data state
export interface ModuleDataState {
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

// Module settings schema
export interface ModuleSetting {
  key: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  label: string;
  description?: string;
  defaultValue: unknown;
  options?: { label: string; value: unknown }[];
}

// Module configuration
export interface ModuleConfig {
  metadata: ModuleMetadata;
  settings: ModuleSetting[];
  requiredTables: string[];
  dependencies: ModuleId[];
}

// Module status
export interface ModuleStatus {
  id: ModuleId;
  isEnabled: boolean;
  isAvailable: boolean; // Whether user has access (subscription, etc.)
  lastSyncedAt: Date | null;
}

// Module hook result
export interface ModuleHookResult<T> extends ModuleDataState {
  data: T | null;
}

// Module mutation result
export interface ModuleMutationResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  mutate: (data: Partial<T>) => Promise<T | null>;
}

// Cross-module insight
export interface CrossModuleInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  relatedModules: ModuleId[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Module page props
export interface ModulePageProps {
  moduleId: ModuleId;
}

// Module layout props
export interface ModuleLayoutProps {
  moduleId: ModuleId;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  showBreadcrumbs?: boolean;
}
