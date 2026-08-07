'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ModuleId } from '@/modules/types';
import { DEFAULT_MODULE_STATUS, MODULE_METADATA } from '@/modules/registry';
import { MODULE_ICONS } from './types';
import { GridNine } from '@phosphor-icons/react';

interface ModuleItemProps {
  id: ModuleId;
  isEnabled: boolean;
  metadata: any;
  moduleFeatures?: Record<string, boolean>;
  onToggle: (id: ModuleId) => Promise<void>;
  onSubToggle: (featureId: string) => Promise<void>;
  t: (key: string) => string;
}

export const ModuleItem = React.memo(function ModuleItem({
  id,
  isEnabled,
  metadata,
  moduleFeatures,
  onToggle,
  onSubToggle,
  t,
}: ModuleItemProps) {
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    setIsLocalLoading(true);
    try {
      await onToggle(id);
    } catch (err) {
      console.error(`Failed to toggle module ${id}:`, err);
    } finally {
      setIsLocalLoading(false);
    }
  }, [id, onToggle]);

  const handleSubToggle = useCallback(
    async (featureId: string) => {
      setIsLocalLoading(true);
      try {
        await onSubToggle(featureId);
      } catch (err) {
        console.error('Failed to toggle sub-feature:', err);
      } finally {
        setIsLocalLoading(false);
      }
    },
    [onSubToggle]
  );

  const Icon = MODULE_ICONS[metadata.icon] || GridNine;

  const allSubFeaturesOff =
    isEnabled &&
    (() => {
      const f = moduleFeatures || {};
      if (id === 'timeline') {
        return f['timeline_weekly_log'] === false && f['timeline_daily_checklist'] === false;
      }
      return false;
    })();

  return (
    <div className="space-y-sm">
      <div
        className={`flex items-center justify-between p-lg rounded-md border transition-all ${
          isEnabled && !allSubFeaturesOff
            ? 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]'
            : allSubFeaturesOff
            ? 'bg-orange-500/[0.04] border-orange-500/20'
            : 'bg-transparent border-black/[0.02] dark:border-white/[0.02] opacity-60'
        }`}
      >
        <div className="flex items-center gap-md flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${metadata.color}15` }}
          >
            <Icon size={20} style={{ color: allSubFeaturesOff ? '#f97316' : metadata.color }} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-soft-cream truncate">{t(`nav.${id}`)}</h4>
            <p className="text-[10px] text-gray-light">
              {allSubFeaturesOff ? (
                <span className="text-orange-400">{t('modules.all_sub_off_warning')}</span>
              ) : (
                metadata.description
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLocalLoading}
          aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${metadata.name}`}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors will-change-transform ${
            isEnabled
              ? 'bg-primary'
              : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
          } ${isLocalLoading ? 'opacity-50 cursor-wait' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Sub-toggles for Timeline and Reminders */}
      {isEnabled && (id === 'timeline' || id === 'reminders') && (
        <div className="ml-4 pl-3 border-l border-black/10 dark:border-white/10 space-y-sm mt-sm">
          {id === 'timeline' && (
            <>
              <div className="flex items-center justify-between gap-md py-sm">
                <span className="text-xs text-gray-light flex-1 min-w-0">
                  {t('modules.timeline_weekly_log')}
                </span>
                <button
                  type="button"
                  onClick={() => handleSubToggle('timeline_weekly_log')}
                  disabled={isLocalLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 will-change-transform ${
                    moduleFeatures?.['timeline_weekly_log'] !== false
                      ? 'bg-primary'
                      : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      moduleFeatures?.['timeline_weekly_log'] !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between gap-md py-sm">
                <span className="text-xs text-gray-light flex-1 min-w-0">
                  {t('modules.timeline_daily_checklist')}
                </span>
                <button
                  type="button"
                  onClick={() => handleSubToggle('timeline_daily_checklist')}
                  disabled={isLocalLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 will-change-transform ${
                    moduleFeatures?.['timeline_daily_checklist'] !== false
                      ? 'bg-primary'
                      : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      moduleFeatures?.['timeline_daily_checklist'] !== false ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </>
          )}
          {id === 'reminders' && (
            <div className="flex items-center justify-between gap-md py-sm">
              <span className="text-xs text-gray-light flex-1 min-w-0">
                {t('modules.reminders_history')}
              </span>
              <button
                type="button"
                onClick={() => handleSubToggle('reminders_history')}
                disabled={isLocalLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 will-change-transform ${
                  moduleFeatures?.['reminders_history'] !== false
                    ? 'bg-primary'
                    : 'bg-gray-strong border border-black/[0.1] dark:border-white/[0.1]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    moduleFeatures?.['reminders_history'] !== false ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export function ModulesSection() {
  const { t } = useTranslation();
  const { module_features, updatePreferences } = useUserPreferences();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  const moduleIds = Object.keys(DEFAULT_MODULE_STATUS) as ModuleId[];
  const statuses = moduleIds.map((id) => ({
    id,
    isEnabled: (module_features?.[id] ?? DEFAULT_MODULE_STATUS[id]) !== false,
    metadata: MODULE_METADATA[id],
  }));

  const enabledCount = statuses.filter((s) => s.isEnabled).length;
  const disabledCount = statuses.filter((s) => !s.isEnabled).length;

  const handleModuleToggle = useCallback(
    async (id: ModuleId) => {
      const latestPrefs = Array.isArray((useAuthStore.getState().user as any)?.user_preferences)
        ? (useAuthStore.getState().user as any)?.user_preferences[0]
        : (useAuthStore.getState().user as any)?.user_preferences;

      const currentFeatures: Record<string, boolean> = latestPrefs?.module_features || {};
      const currentEnabled = currentFeatures[id] ?? DEFAULT_MODULE_STATUS[id];
      const newFeatures = { ...currentFeatures, [id]: !currentEnabled };

      await updatePreferences({ module_features: newFeatures });
    },
    [updatePreferences]
  );

  const handleSubToggle = useCallback(
    async (featureId: string) => {
      const latestPrefs = Array.isArray((useAuthStore.getState().user as any)?.user_preferences)
        ? (useAuthStore.getState().user as any)?.user_preferences[0]
        : (useAuthStore.getState().user as any)?.user_preferences;

      const currentFeatures: Record<string, boolean> = latestPrefs?.module_features || {};
      const currentValue = currentFeatures[featureId] !== false;
      const newFeatures = { ...currentFeatures, [featureId]: !currentValue };

      const updatedPrefs = await updatePreferences({ module_features: newFeatures });

      if (user && updatedPrefs) {
        const currentUserPrefs = Array.isArray((user as any).user_preferences)
          ? (user as any).user_preferences[0]
          : (user as any).user_preferences;
        setUser({
          ...user,
          user_preferences: [{ ...currentUserPrefs, ...updatedPrefs }],
        } as any);
      }
    },
    [updatePreferences, user, setUser]
  );

  return (
    <div className="space-y-lg">
      <Card className="glass border-none" title={t('settings.modules.sectionTitle')}>
        <p className="text-sm text-gray-light mb-xl">{t('settings.modules.description')}</p>
        <div className="space-y-xl">
          <div className="grid gap-md">
            {statuses.map((status) => (
              <ModuleItem
                key={status.id}
                id={status.id}
                isEnabled={status.isEnabled}
                metadata={status.metadata}
                moduleFeatures={module_features}
                onToggle={handleModuleToggle}
                onSubToggle={handleSubToggle}
                t={t}
              />
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass border-none bg-black/[0.01] dark:bg-white/[0.01]" title="MODULE STATUS">
        <div className="grid grid-cols-2 gap-md">
          <div className="p-lg rounded-md bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
            <div className="text-2xl font-bold text-primary">{enabledCount}</div>
            <div className="text-[10px] text-gray-light tracking-widest">
              {t('modules.enabled_count').toUpperCase()}
            </div>
          </div>
          <div className="p-lg rounded-md bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
            <div className="text-2xl font-bold text-secondary">{disabledCount}</div>
            <div className="text-[10px] text-gray-light tracking-widest">
              {t('modules.disabled_count').toUpperCase()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
