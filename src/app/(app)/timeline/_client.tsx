'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Loading, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useActivity } from '@/hooks/useActivity';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { validateActivity, sanitizeError } from '@/libs/validation';
import { Activity, Reminder } from '@/services/supabase/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useReminder } from '@/hooks/useReminder';
import { Calendar, ListChecks } from '@phosphor-icons/react';
import {
  getCurrentWeekBounds,
  getDaysOfWeek,
  defaultActivityForm,
  ActivityFormData,
  TimelineHeader,
  DailyTasksPanel,
  TimelineCanvas,
  ActivityModal,
} from './components';

export function TimelineClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { module_features, locale } = useUserPreferences();
  const { t } = useTranslation();

  const { start: weekStart, end: weekEnd } = getCurrentWeekBounds();
  const daysOfWeek = getDaysOfWeek(weekStart);

  const { activities, isLoading, createActivity, updateActivity, deleteActivity } = useActivity(
    weekStart,
    weekEnd
  );
  const { reminders } = useReminder(weekStart, weekEnd);

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
    createTask,
    toggleTask,
    deleteTask,
  } = useDailyTasks();

  // Indonesian National Holidays state
  const [holidays, setHolidays] = useState<Array<{ date: string; name: string; is_cuti_bersama: boolean }>>([]);

  useEffect(() => {
    const year = weekStart.getFullYear();
    fetch(`/api/timeline/holidays?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.holidays)) {
          setHolidays(data.holidays);
        }
      })
      .catch(() => {
        // Silently continue if offline
      });
  }, [weekStart]);

  const getHolidayForDate = useCallback(
    (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${d}`;
      return holidays.find((h) => h.date === key);
    },
    [holidays]
  );

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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

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
      mood: activity.mood || '',
      dayIndex: jsDay === 0 ? 6 : jsDay - 1,
      start_hour: start.getHours(),
      start_minute: start.getMinutes(),
      duration_minutes: end ? Math.round((end.getTime() - start.getTime()) / 60000) : 60,
      location: activity.location || '',
      rating: activity.rating || 0,
      applyToAllDays: false,
      isWeeklyRoutine: isRoutine,
    });
    setIsModalOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;

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
          mood: form.mood || undefined,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          duration_minutes: form.duration_minutes,
          location: form.location.trim() || undefined,
          rating: form.rating || undefined,
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
              mood: form.mood || undefined,
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              duration_minutes: form.duration_minutes,
              location: form.location.trim() || undefined,
              rating: form.rating || undefined,
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
            mood: form.mood || undefined,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            duration_minutes: form.duration_minutes,
            location: form.location.trim() || undefined,
            rating: form.rating || undefined,
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
      <Layout>
        <div className="flex justify-center py-2xl">
          <Loading text={t('dashboard.checking_session')} />
        </div>
      </Layout>
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
    if (!rem.due_date || rem.status === 'completed' || rem.status === 'cancelled') return;
    const remDate = new Date(rem.due_date);
    const dayIdx = daysOfWeek.findIndex((d) => d.toDateString() === remDate.toDateString());
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
      <Layout>
        <div className="space-y-xl animate-fade-in">
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
          <div className="flex items-center gap-sm bg-black/[0.02] dark:bg-white/[0.02] p-md rounded-lg mb-xl w-max border border-black/[0.05] dark:border-white/[0.05]">
            {module_features?.['timeline_weekly_log'] !== false && (
              <button
                onClick={() => setActiveTab('weekly-log')}
                title={t('timeline_page.weekly_log')}
                className={`flex items-center gap-sm px-lg py-sm rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'weekly-log'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                <Calendar size={14} />
                <span className="hidden md:inline">{t('timeline_page.weekly_log')}</span>
              </button>
            )}
            {module_features?.['timeline_daily_checklist'] !== false && (
              <button
                onClick={() => setActiveTab('daily-checklist')}
                title={t('timeline_page.daily_checklist')}
                className={`flex items-center gap-sm px-lg py-sm rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'daily-checklist'
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-light hover:text-soft-cream'
                }`}
              >
                <ListChecks size={14} />
                <span className="hidden md:inline">{t('timeline_page.daily_checklist')}</span>
                {totalCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      completedCount === totalCount
                        ? 'bg-income/20 text-income'
                        : 'bg-black/10 dark:bg-white/10 text-gray-light'
                    }`}
                  >
                    {completedCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Daily Checklist Panel */}
          {activeTab === 'daily-checklist' && module_features?.['timeline_daily_checklist'] !== false && (
            <DailyTasksPanel
              locale={locale}
              tasks={tasks}
              isTasksLoading={isTasksLoading}
              completedCount={completedCount}
              totalCount={totalCount}
              createTask={createTask}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              getHolidayForDate={getHolidayForDate}
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
              getHolidayForDate={getHolidayForDate}
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
      </Layout>
    </>
  );
}
