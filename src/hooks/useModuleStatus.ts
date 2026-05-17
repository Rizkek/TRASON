'use client';

import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { ModuleId, ModuleStatus } from '@/modules/types';
import {
  DEFAULT_MODULE_STATUS,
  getModuleConfig,
  getModuleMetadata,
  checkDependencies,
} from '@/modules/registry';
import { SWR_CONFIG_STABLE } from '@/config/swr';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { logError, handleQueryError } from '@/libs/apiErrors';

// Default module status for initial render
const createDefaultStatus = (id: ModuleId): ModuleStatus => ({
  id,
  isEnabled: DEFAULT_MODULE_STATUS[id],
  isAvailable: true,
  lastSyncedAt: null,
});

export interface UseModuleStatusReturn {
  status: ModuleStatus;
  isLoading: boolean;
  error: Error | null;
  toggle: () => Promise<void>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  metadata: ReturnType<typeof getModuleMetadata>;
  config: ReturnType<typeof getModuleConfig>;
  dependencyStatus: { ok: boolean; missing: ModuleId[] };
}

/**
 * Hook to manage a single module's enabled/disabled status
 * Uses SWR for caching and optimistic updates
 */
export const useModuleStatus = (
  moduleId: ModuleId,
  userId?: string
): UseModuleStatusReturn => {
  const cacheKey = userId ? CACHE_KEYS.settings.preferences(userId) : null;

  const {
    data: preferences,
    error,
    isLoading,
    mutate,
  } = useSWR<Record<string, boolean> | null>(
    cacheKey,
    async () => {
      // This would fetch from API in real implementation
      // For now, return from localStorage or default
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(`module_status_${userId}`);
      return stored ? JSON.parse(stored) : null;
    },
    SWR_CONFIG_STABLE
  );

  // Calculate current status
  const status = useMemo<ModuleStatus>(() => {
    const enabled = preferences?.[moduleId] ?? DEFAULT_MODULE_STATUS[moduleId];
    return {
      id: moduleId,
      isEnabled: enabled,
      isAvailable: true,
      lastSyncedAt: preferences ? new Date() : null,
    };
  }, [preferences, moduleId]);

  // Check dependencies
  const dependencyStatus = useMemo(() => {
    return checkDependencies(moduleId, preferences ?? {});
  }, [moduleId, preferences]);

  // Update module status
  const updateStatus = useCallback(
    async (enabled: boolean) => {
      try {
        // Optimistic update
        const newPreferences = {
          ...(preferences ?? {}),
          [moduleId]: enabled,
        };

        await mutate(newPreferences, false);

        // Persist to localStorage (in real app, this would be an API call)
        if (typeof window !== 'undefined' && userId) {
          localStorage.setItem(
            `module_status_${userId}`,
            JSON.stringify(newPreferences)
          );
        }

        // Revalidate
        await mutate();
      } catch (err) {
        logError(err, `useModuleStatus.updateStatus.${moduleId}`);
        throw handleQueryError(err);
      }
    },
    [moduleId, preferences, mutate, userId]
  );

  const toggle = useCallback(async () => {
    await updateStatus(!status.isEnabled);
  }, [status.isEnabled, updateStatus]);

  const enable = useCallback(async () => {
    await updateStatus(true);
  }, [updateStatus]);

  const disable = useCallback(async () => {
    await updateStatus(false);
  }, [updateStatus]);

  const metadata = getModuleMetadata(moduleId);
  const config = getModuleConfig(moduleId);

  return {
    status,
    isLoading,
    error: error as Error | null,
    toggle,
    enable,
    disable,
    metadata,
    config,
    dependencyStatus,
  };
};

/**
 * Hook to get status of all modules
 */
export const useAllModuleStatus = (userId?: string) => {
  const cacheKey = userId ? CACHE_KEYS.settings.preferences(userId) : null;

  const { data: preferences, error, isLoading } = useSWR<
    Record<string, boolean> | null
  >(
    cacheKey,
    async () => {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(`module_status_${userId}`);
      return stored ? JSON.parse(stored) : null;
    },
    SWR_CONFIG_STABLE
  );

  const moduleIds = Object.keys(DEFAULT_MODULE_STATUS) as ModuleId[];

  const statuses = useMemo(() => {
    return moduleIds.map((id) => ({
      id,
      isEnabled: preferences?.[id] ?? DEFAULT_MODULE_STATUS[id],
      isAvailable: true,
      lastSyncedAt: preferences ? new Date() : null,
      metadata: getModuleMetadata(id),
    }));
  }, [preferences, moduleIds]);

  const enabledModules = useMemo(
    () => statuses.filter((s) => s.isEnabled).map((s) => s.id),
    [statuses]
  );

  const disabledModules = useMemo(
    () => statuses.filter((s) => !s.isEnabled).map((s) => s.id),
    [statuses]
  );

  return {
    statuses,
    enabledModules,
    disabledModules,
    isLoading,
    error: error as Error | null,
  };
};

export default useModuleStatus;
