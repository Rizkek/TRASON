'use client';

import { Tabs } from '@/components/ui/Tabs';
import React, { useEffect, useState, useCallback } from 'react';
import { Button, Loading, ErrorAlert, InlineError, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useActivity } from '@/hooks/useActivity';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { validateActivity, sanitizeError } from '@/libs/validation';
import { Activity, Reminder } from '@/services/supabase/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useReminder } from '@/hooks/useReminder';
import { useNow } from '@/hooks/useNow';
import { getReminderDueAt, isReminderActive } from '@/libs/notificationLogic';
import { Calendar, CaretLeft, CaretRight, ListChecks } from '@phosphor-icons/react';
import {
  getWeekBounds,
  getDaysOfWeek,
  defaultActivityForm,
  ActivityFormData,
  TimelineHeader,
  DailyTasksPanel,
  TimelineCanvas,
  ActivityModal,
} from './components';

export function TimelineClient() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { module_features, locale } = useUserPreferences();
  const { t } = useTranslation();

  const [weekOffset, setWeekOffset] = useState(0);
  const { start: weekStart, end: weekEnd } = getWeekBounds(weekOffset);
  const daysOfWeek = getDaysOfWeek(weekStart);

  const { activities, isLoading, userErrorMessage: activitiesError, refresh: refreshActivities, createActivity, updateActivity, deleteActivity } = useActivity(
    weekStart,
    weekEnd
  );
  const { reminders } = useReminder(weekStart, weekEnd);
  const now = useNow();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState<ActivityFormData>(defaultActivityForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Daily checklist tab
  const [activeTab, setActiveTab] = useState<'weekly-log' | 'daily-checklist'>('weekly-log');
  const [mobileDayIdx, setMobileDayIdx] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const {
    tasks,
    isLoading: isTasksLoading,
    completedCount,
    totalCount,
    pendingToggleIds,
    pendingDeleteIds,
    createTask,
    toggleTask,
    deleteTask,
  } = useDailyTasks();

  useEffect(() => {
    // Auto-redirect if current tab is deactivated
    if (activeTab === 'weekly-log' && module_features?.['timeline_weekly_log'] === false) {
      if (module_features?.['timeline_daily_checklist'] !== false) {
        setActiveTab('daily-checklist');
      }
    } else if (
      activeTab === 'daily-checklist' &&
      module_features?.['timeline_daily_checklist'] === false
    ) {
      if (module_features?.['timeline_weekly_log'] !== false) {
        setActiveTab('weekly-log');
      }
    }
  }, [module_features, activeTab]);

  const openAddModal = useCallback((date?: Date, hour?: number) => {
    setEditingActivity(null);
    let dayIdx = defaultActivityForm.dayIndex;
    if (date) {
      const jsDay = date.getDay();
      dayIdx = jsDay === 0 ? 6 : jsDay - 1;
    }
    setForm({
      ...defaultActivityForm,
      dayIndex: dayIdx,
      start_hour: hour ?? new Date().getHours(),
    });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((activity: Activity) => {
    const start = new Date(activity.start_time);
    const end = activity.end_time ? new Date(activity.end_time) : null;
    const jsDay = start.getDay();
    const isRoutine = Boolean(
      (activity.metadata as any)?.is_weekly_routine || (activity as any).is_weekly_template
    );

    setEditingActivity(activity);
    setForm({
      title: activity.title,
      description: activity.description || '',
      category: activity.category || '',
      dayIndex: jsDay === 0 ? 6 : jsDay - 1,
      start_hour: start.getHours(),
      start_minute: start.getMinutes(),
      duration_minutes: end ? Math.round((end.getTime() - start.getTime()) / 60000) : 60,
      applyToAllDays: false,
      isWeeklyRoutine: isRoutine,
    });
    setIsModalOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormErrors({ title: t('timeline_page.title_required') });
      return;
    }

    setIsSaving(true);
    setFormErrors({});
    setError(null);

    try {
      if (editingActivity) {
        const startDate = new Date(weekStart);
        startDate.setDate(startDate.getDate() + form.dayIndex);
        startDate.setHours(form.start_hour, form.start_minute, 0, 0);
        const endDate = new Date(startDate.getTime() + form.duration_minutes * 60000);

        const payload = {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          category: form.category || undefined,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          duration_minutes: form.duration_minutes,
          metadata: {
            ...(editingActivity?.metadata || {}),
            is_weekly_routine: form.isWeeklyRoutine,
          },
        };

        const validation = validateActivity(payload);
        if (!validation.isValid) {
          setFormErrors(validation.errors);
          setIsSaving(false);
          return;
        }

        await updateActivity(editingActivity.id, payload);
      } else {
        if (form.applyToAllDays) {
          const promises = [];
          for (let i = 0; i < 7; i++) {
            const startDate = new Date(weekStart);
            startDate.setDate(startDate.getDate() + i);
            startDate.setHours(form.start_hour, form.start_minute, 0, 0);
            const endDate = new Date(startDate.getTime() + form.duration_minutes * 60000);

            const payload = {
              title: form.title.trim(),
              description: form.description.trim() || undefined,
              category: form.category || undefined,
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              duration_minutes: form.duration_minutes,
              metadata: {
                is_weekly_routine: form.isWeeklyRoutine,
              },
            };

            const validation = validateActivity(payload);
            if (!validation.isValid) {
              setFormErrors(validation.errors);
              setIsSaving(false);
              return;
            }
            promises.push(createActivity(payload));
          }
          await Promise.all(promises);
        } else {
          const startDate = new Date(weekStart);
          startDate.setDate(startDate.getDate() + form.dayIndex);
          startDate.setHours(form.start_hour, form.start_minute, 0, 0);
          const endDate = new Date(startDate.getTime() + form.duration_minutes * 60000);

          const payload = {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            category: form.category || undefined,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            duration_minutes: form.duration_minutes,
            metadata: {
              is_weekly_routine: form.isWeeklyRoutine,
            },
          };

          const validation = validateActivity(payload);
          if (!validation.isValid) {
            setFormErrors(validation.errors);
            setIsSaving(false);
            return;
          }

          await createActivity(payload);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteActivity(deleteConfirmId);
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (authLoading) {
    return (
      <>
        <div className="flex justify-center py-12">
          <Loading text={t('dashboard.checking_session')} />
        </div>
      </>
    );
  }

  if (!isAuthenticated) return null;

  // Build lookup: day index (0=Mon) -> hour -> activities & reminders
  const grid: Record<number, Record<number, Activity[]>> = {};
  const remindersGrid: Record<number, Record<number, Reminder[]>> = {};
  for (let d = 0; d < 7; d++) {
    grid[d] = {};
    remindersGrid[d] = {};
    for (let h = 0; h < 24; h++) {
      grid[d][h] = [];
      remindersGrid[d][h] = [];
    }
  }

  activities.forEach((act) => {
    if (act.category === 'daily_tasks') return;
    const start = new Date(act.start_time);
    const dayDate = start.toDateString();
    const dayIdx = daysOfWeek.findIndex((d) => d.toDateString() === dayDate);
    if (dayIdx >= 0) {
      const h = start.getHours();
      if (!grid[dayIdx][h]) grid[dayIdx][h] = [];
      grid[dayIdx][h].push(act);
    }
  });

  reminders.forEach((rem) => {
    if (!rem.due_date || !isReminderActive(now, rem)) return;
    const remDate = getReminderDueAt(rem);
    const dayIdx = daysOfWeek.findIndex((d) => d.toDateString() === remDate?.toDateString());
    if (dayIdx >= 0) {
      let h = 9;
      if (rem.due_time) {
        const parsedH = parseInt(rem.due_time.split(':')[0], 10);
        if (!isNaN(parsedH)) h = parsedH;
      }
      if (!remindersGrid[dayIdx][h]) remindersGrid[dayIdx][h] = [];
      remindersGrid[dayIdx][h].push(rem);
    }
  });

  const totalMinutes = activities.reduce((acc, a) => acc + (a.duration_minutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      {activitiesError && (
        <InlineError message={activitiesError} retryLabel={t('common.try_again')} onRetry={() => refreshActivities()} className="mb-4" />
      )}
      <>
        <div className="space-y-8 animate-fade-in">
          {/* Header & Overview Stats */}
          <TimelineHeader
            activeTab={activeTab}
            hasWeeklyLogFeature={module_features?.['timeline_weekly_log'] !== false}
            hasDailyChecklistFeature={module_features?.['timeline_daily_checklist'] !== false}
            activitiesCount={activities.length}
            totalHours={totalHours}
            remMinutes={remMinutes}
            completedCount={completedCount}
            totalCount={totalCount}
            onOpenAddModal={() => openAddModal()}
          />

          {/* Tab Switcher */}
          <Tabs
            label={t('timeline_page.title')}
            value={activeTab}
            onChange={setActiveTab}
            items={[
              ...(module_features?.['timeline_weekly_log'] !== false
                ? [{ id: 'weekly-log' as const, label: t('timeline_page.weekly_log'), icon: Calendar }]
                : []),
              ...(module_features?.['timeline_daily_checklist'] !== false
                ? [{ id: 'daily-checklist' as const, label: t('timeline_page.daily_checklist'), icon: ListChecks }]
                : []),
            ]}
          />

          {activeTab === 'weekly-log' && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={() => setWeekOffset((w) => w - 1)} aria-label={t('schedule_ui.prev_week')} title={t('schedule_ui.prev_week')} className="h-11 w-11 px-0">
                <CaretLeft size={16} aria-hidden="true" />
              </Button>
              <span className="min-w-36 text-center text-label-md text-foreground" aria-live="polite">
                {daysOfWeek[0].toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – {daysOfWeek[6].toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
              </span>
              <Button variant="ghost" onClick={() => setWeekOffset((w) => w + 1)} aria-label={t('schedule_ui.next_week')} title={t('schedule_ui.next_week')} className="h-11 w-11 px-0">
                <CaretRight size={16} aria-hidden="true" />
              </Button>
              {weekOffset !== 0 && (
                <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
                  {t('schedule_ui.this_week')}
                </Button>
              )}
            </div>
          )}

          {/* Daily Checklist Panel */}
          {activeTab === 'daily-checklist' && module_features?.['timeline_daily_checklist'] !== false && (
            <DailyTasksPanel
              locale={locale}
              tasks={tasks}
              isTasksLoading={isTasksLoading}
              completedCount={completedCount}
              totalCount={totalCount}
              pendingToggleIds={pendingToggleIds}
              pendingDeleteIds={pendingDeleteIds}
              createTask={createTask}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
            />
          )}

          {/* Weekly Log Grid Canvas */}
          {activeTab === 'weekly-log' && module_features?.['timeline_weekly_log'] !== false && (
            <TimelineCanvas
              locale={locale}
              daysOfWeek={daysOfWeek}
              activities={activities}
              reminders={reminders}
              grid={grid}
              remindersGrid={remindersGrid}
              isLoading={isLoading}
              onOpenAddModal={openAddModal}
              onOpenEditModal={openEditModal}
              onConfirmDelete={(id) => setDeleteConfirmId(id)}
              mobileDayIdx={mobileDayIdx}
              setMobileDayIdx={setMobileDayIdx}
            />
          )}
        </div>

        {/* Activity Create/Edit Modal */}
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingActivity={editingActivity}
          form={form}
          setForm={setForm}
          formErrors={formErrors}
          isSaving={isSaving}
          onSave={handleSave}
          onDelete={() => {
            setIsModalOpen(false);
            setDeleteConfirmId(editingActivity?.id ?? null);
          }}
          daysOfWeek={daysOfWeek}
          locale={locale}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title={t('timeline_page.delete_activity')}
          description={t('timeline_page.delete_desc')}
          confirmText={t('timeline_page.delete_btn')}
          isDangerous={true}
          onConfirm={handleConfirmDelete}
        />
      </>
    </>
  );
}
