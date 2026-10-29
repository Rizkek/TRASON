'use client';

import React, { useState, useCallback } from 'react';
import { Card, Switch } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ModuleId } from '@/modules/types';
import { DEFAULT_MODULE_STATUS, MODULE_METADATA } from '@/modules/registry';
import { cn } from '@/lib/utils';
import { MODULE_ICONS } from './types';
import { GridNine } from '@phosphor-icons/react';
import { Paragraph } from '@/components/ui/typography';

// Sub-features are stored in module_features next to the module flags; missing means on.
const SUB_FEATURES: Partial<Record<ModuleId, string[]>> = {
  timeline: ['timeline_weekly_log', 'timeline_daily_checklist'],
  reminders: ['reminders_history'],
};

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

  const run = useCallback(async (action: () => Promise<void>) => {
    setIsLocalLoading(true);
    try {
      await action();
    } catch (err) {
      console.error(`Failed to update module ${id}:`, err);
    } finally {
      setIsLocalLoading(false);
    }
  }, [id]);

  const Icon = MODULE_ICONS[metadata.icon] || GridNine;
  const subFeatures = SUB_FEATURES[id] ?? [];
  const isSubOn = (featureId: string) => moduleFeatures?.[featureId] !== false;
  // A module that is on but has every sub-feature off shows nothing, so flag it.
  const allSubFeaturesOff = isEnabled && subFeatures.length > 1 && subFeatures.every((f) => !isSubOn(f));
  const name = t(`nav.${id}`);

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        allSubFeaturesOff
          ? 'border-warning/30 bg-warning/[0.04]'
          : isEnabled
            ? 'border-foreground/10 bg-foreground/[0.02]'
            : 'border-foreground/[0.06] bg-transparent'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${metadata.color}15` }}
        >
          <Icon
            size={20}
            aria-hidden="true"
            className={allSubFeaturesOff ? 'text-warning' : undefined}
            style={allSubFeaturesOff ? undefined : { color: metadata.color }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={cn('text-label-md', isEnabled ? 'text-foreground' : 'text-muted-foreground')}>{name}</h4>
          <p className={cn('mt-0.5 text-body-sm', allSubFeaturesOff ? 'text-warning' : 'text-muted-foreground')}>
            {allSubFeaturesOff ? t('modules.all_sub_off_warning') : t(`modules.${id}_desc`)}
          </p>
        </div>
        <Switch checked={isEnabled} onChange={() => run(() => onToggle(id))} busy={isLocalLoading} label={name} />
      </div>

      {isEnabled && subFeatures.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-foreground/10 pt-2">
          {subFeatures.map((featureId) => {
            const label = t(`modules.${featureId}`);
            return (
              <li key={featureId} className="flex min-h-11 items-center justify-between gap-3 pl-[3.25rem]">
                <span className="min-w-0 text-body-sm text-muted-foreground">{label}</span>
                <Switch
                  checked={isSubOn(featureId)}
                  onChange={() => run(() => onSubToggle(featureId))}
                  busy={isLocalLoading}
                  label={`${name}: ${label}`}
                />
              </li>
            );
          })}
        </ul>
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
    <Card className="glass border-none" title={t('settings.modules.sectionTitle')}>
      <Paragraph className="text-body-sm text-muted-foreground">{t('settings.modules.description')}</Paragraph>
      <p className="mt-1 text-label-sm text-muted-foreground" aria-live="polite">
        {t('modules.count_summary').replace('{on}', String(enabledCount)).replace('{total}', String(statuses.length))}
      </p>
      <div className="mt-5 grid items-start gap-3 lg:grid-cols-2">
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
    </Card>
  );
}
