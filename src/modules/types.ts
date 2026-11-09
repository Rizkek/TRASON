/**
 * Core module types for the modular architecture
 */


// Module identifiers
export type ModuleId = 'finance' | 'investments' | 'timeline' | 'insights' | 'reminders' | 'sport' | 'career';

// Module metadata
export interface ModuleMetadata {
  id: ModuleId;
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
