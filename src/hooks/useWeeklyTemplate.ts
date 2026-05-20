'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { templateQueries, overrideQueries } from '@/services/templateQueries';
import { useReminder } from './useReminder';
import { WeeklyTemplate, TemplateActivity, TemplateOverride, WeeklyScheduleSnapshot } from '@/types/database';
import { applyOverrides, getWeekStartDate } from '@/libs/template';
import { createWeeklyScheduleSnapshot } from '@/libs/schedule';
import { useAuthStore } from '@/store/authStore';
import { getLocalISODate } from '@/libs/format';

/**
 * Hook untuk manage weekly template
 */
export const useWeeklyTemplate = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: templates = [], isLoading, mutate: mutateTemplates } = useSWR(
    userId ? ['templates', userId] : null,
    async ([, uid]) => {
      return await templateQueries.getTemplates(uid);
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const { data: activeTemplate } = useSWR(
    userId ? ['template:active', userId] : null,
    async ([, uid]) => {
      return await templateQueries.getActiveTemplate(uid);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const createTemplate = useCallback(
    async (name: string, description?: string) => {
      if (!userId) return null;

      const template = await templateQueries.createTemplate(userId, {
        name,
        description,
        is_active: true,
        is_default: templates.length === 0,
      });

      if (template) {
        await mutateTemplates();
      }

      return template;
    },
    [userId, templates.length, mutateTemplates]
  );

  const updateTemplate = useCallback(
    async (templateId: string, updates: Partial<WeeklyTemplate>) => {
      const template = await templateQueries.updateTemplate(templateId, updates);

      if (template) {
        await mutateTemplates();
      }

      return template;
    },
    [mutateTemplates]
  );

  const setDefaultTemplate = useCallback(
    async (templateId: string) => {
      if (!userId) return false;

      const success = await templateQueries.setDefaultTemplate(userId, templateId);

      if (success) {
        await mutateTemplates();
      }

      return success;
    },
    [userId, mutateTemplates]
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      const success = await templateQueries.deleteTemplate(templateId);

      if (success) {
        await mutateTemplates();
      }

      return success;
    },
    [mutateTemplates]
  );

  return {
    templates,
    activeTemplate,
    isLoading,
    createTemplate,
    updateTemplate,
    setDefaultTemplate,
    deleteTemplate,
    mutate: mutateTemplates,
  };
};

/**
 * Hook untuk manage template activities
 */
export const useTemplateActivities = (templateId?: string) => {
  const { data: activities = [], isLoading, mutate } = useSWR(
    templateId ? ['template:activities', templateId] : null,
    async ([, tid]) => {
      return await templateQueries.getTemplateActivities(tid);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const createActivity = useCallback(
    async (activity: Omit<TemplateActivity, 'id' | 'created_at' | 'updated_at'>) => {
      const created = await templateQueries.createTemplateActivity({
        ...activity,
      });

      if (created) {
        await mutate();
      }

      return created;
    },
    [mutate]
  );

  const updateActivity = useCallback(
    async (activityId: string, updates: Partial<TemplateActivity>) => {
      const updated = await templateQueries.updateTemplateActivity(activityId, updates);

      if (updated) {
        await mutate();
      }

      return updated;
    },
    [mutate]
  );

  const deleteActivity = useCallback(
    async (activityId: string) => {
      const success = await templateQueries.deleteTemplateActivity(activityId);

      if (success) {
        await mutate();
      }

      return success;
    },
    [mutate]
  );

  return {
    activities,
    isLoading,
    createActivity,
    updateActivity,
    deleteActivity,
    mutate,
  };
};

/**
 * Hook untuk manage template overrides
 */
export const useTemplateOverride = (templateId?: string, weekStartDate?: Date) => {
  const userId = useAuthStore((s) => s.user?.id);

  const weekStartStr = weekStartDate
    ? weekStartDate.toISOString().split('T')[0]
    : getLocalISODate();

  const { data: override, isLoading, mutate } = useSWR(
    userId && templateId ? ['override', userId, templateId, weekStartStr] : null,
    async ([, uid, tid, dateStr]) => {
      return await overrideQueries.getOverrideForWeek(uid, tid, dateStr);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const createOverride = useCallback(
    async (data: Omit<TemplateOverride, 'id' | 'created_at' | 'updated_at'>) => {
      const created = await overrideQueries.createOverride({
        ...data,
      });

      if (created) {
        await mutate();
      }

      return created;
    },
    [mutate]
  );

  const updateOverride = useCallback(
    async (overrideId: string, updates: Partial<TemplateOverride>) => {
      const updated = await overrideQueries.updateOverride(overrideId, updates);

      if (updated) {
        await mutate();
      }

      return updated;
    },
    [mutate]
  );

  const deleteOverride = useCallback(
    async (overrideId: string) => {
      const success = await overrideQueries.deleteOverride(overrideId);

      if (success) {
        await mutate();
      }

      return success;
    },
    [mutate]
  );

  return {
    override,
    isLoading,
    createOverride,
    updateOverride,
    deleteOverride,
    mutate,
  };
};

/**
 * Hook untuk display weekly schedule (merged template + reminders)
 */
export const useWeekSchedule = (weekStartDate?: Date) => {
  const userId = useAuthStore((s) => s.user?.id);

  const startDate = weekStartDate || getWeekStartDate(new Date());
  const weekStartStr = startDate.toISOString().split('T')[0];

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  // Get template
  const { activeTemplate, isLoading: templateLoading } = useWeeklyTemplate();

  // Get template activities
  const { activities: templateActivities, isLoading: activitiesLoading } = useTemplateActivities(
    activeTemplate?.id
  );

  // Get overrides
  const { override, isLoading: overrideLoading } = useTemplateOverride(
    activeTemplate?.id,
    startDate
  );

  // Get reminders
  const { reminders = [], isLoading: remindersLoading } = useReminder(startDate, endDate);

  const { data: snapshot } = useSWR(
    userId && activeTemplate ? ['schedule:snapshot', userId, activeTemplate.id, weekStartStr] : null,
    async ([, uid, templateId]) => {
      if (!uid || !templateId) return null;

      return createWeeklyScheduleSnapshot(
        templateId,
        startDate,
        templateActivities,
        reminders,
        uid,
        override
      );
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    snapshot,
    template: activeTemplate,
    templateActivities,
    reminders,
    override,
    isLoading: templateLoading || activitiesLoading || overrideLoading || remindersLoading,
  };
};
