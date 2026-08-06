'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal, Select } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useActivity } from '@/hooks/useActivity';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { validateActivity, sanitizeError } from '@/libs/validation';
import { Activity, Reminder } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useReminder } from '@/hooks/useReminder';
import { Plus, Trash as Trash2, Clock, Tag, Smiley, MapPin, Star, Heartbeat as ActivityIcon, CheckSquare, Square, ListChecks, Calendar, ArrowCounterClockwise, ProjectorScreenChart, CaretLeft, CaretRight, Bell, Warning, Repeat } from '@phosphor-icons/react';


const MOOD_OPTIONS = [
  { labelKey: 'happy', emoji: '😊', value: 'Happy' },
  { labelKey: 'neutral', emoji: '😐', value: 'Neutral' },
  { labelKey: 'tired', emoji: '😴', value: 'Tired' },
  { labelKey: 'energized', emoji: '💪', value: 'Energized' },
  { labelKey: 'stressed', emoji: '😤', value: 'Stressed' },
  { labelKey: 'calm', emoji: '🧘', value: 'Calm' },
];

const CATEGORY_OPTIONS = ['work', 'study', 'exercise', 'sport', 'meals', 'social', 'rest', 'personal', 'other'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function getDurationLabel(activity: Activity) {
  if (!activity.end_time) return null;
  const mins = Math.round(
    (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) / 60000
  );
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Get current week: Mon-Sun
function getCurrentWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getDaysOfWeek(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

interface ActivityFormData {
  title: string;
  description: string;
  category: string;
  mood: string;
  dayIndex: number; // 0 = Mon, 1 = Tue, ..., 6 = Sun
  start_hour: number;
  start_minute: number;
  duration_minutes: number;
  location: string;
  rating: number;
  applyToAllDays: boolean;
  isWeeklyRoutine: boolean;
}

const defaultForm: ActivityFormData = {
  title: '',
  description: '',
  category: '',
  mood: '',
  dayIndex: (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=Mon, 6=Sun
  })(),
  start_hour: new Date().getHours(),
  start_minute: 0,
  duration_minutes: 60,
  location: '',
  rating: 0,
  applyToAllDays: false,
  isWeeklyRoutine: false,
};

const CELL_HEIGHT = 64; // px per hour row

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
  const [form, setForm] = useState<ActivityFormData>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Daily checklist tab
  const [activeTab, setActiveTab] = useState<'weekly-log' | 'daily-checklist'>('weekly-log');
  const [mobileDayIdx, setMobileDayIdx] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const { tasks, isLoading: isTasksLoading, completedCount, totalCount, createTask, toggleTask, deleteTask } = useDailyTasks();
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-redirect if current tab is deactivated
    if (activeTab === 'weekly-log' && module_features?.['timeline_weekly_log'] === false) {
      if (module_features?.['timeline_daily_checklist'] !== false) {
        setActiveTab('daily-checklist');
      }
    } else if (activeTab === 'daily-checklist' && module_features?.['timeline_daily_checklist'] === false) {
      if (module_features?.['timeline_weekly_log'] !== false) {
        setActiveTab('weekly-log');
      }
    }
  }, [module_features, activeTab]);


  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll to current time on mount
  useEffect(() => {
    if (gridRef.current) {
      const scrollTarget = currentHour * CELL_HEIGHT - 150;
      gridRef.current.scrollTop = Math.max(0, scrollTarget);
    }
  }, [currentHour]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const openAddModal = useCallback((date?: Date, hour?: number) => {
    setEditingActivity(null);
    let dayIdx = defaultForm.dayIndex;
    if (date) {
      const jsDay = date.getDay();
      dayIdx = jsDay === 0 ? 6 : jsDay - 1;
    }
    setForm({
      ...defaultForm,
      dayIndex: dayIdx,
      start_hour: hour ?? new Date().getHours(),
    });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((activity: Activity) => {
    const start = new Date(activity.start_time);
    const end = activity.end_time ? new Date(activity.end_time) : null;
    const jsDay = start.getDay();
    const isRoutine = Boolean((activity.metadata as any)?.is_weekly_routine || (activity as any).is_weekly_template);
    
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
        // Calculate actual date for the selected day in THIS week
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
          // Loop and create for all 7 days of the week
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
          // Calculate actual date for the selected day in THIS week
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
    // Hide auto-generated daily_tasks summaries from the visual grid
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

  // Current time indicator position in pixels from top of grid
  const currentTimeOffset = currentHour * CELL_HEIGHT + (currentMinute / 60) * CELL_HEIGHT;

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <Layout>
        <div className="space-y-xl animate-fade-in">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-md">
            <div className="space-y-xs">
              <h1 className="text-heading-xl md:text-display-lg font-display font-extrabold tracking-tight text-soft-cream">{t('timeline_page.title')}</h1>
              <p className="text-subtext flex items-center gap-sm">
                {t('timeline_page.desc')}
              </p>
            </div>
            <div className="flex items-center gap-md">
              {activeTab === 'weekly-log' && module_features?.['timeline_weekly_log'] !== false && activities.length > 0 && (
                <div className="flex items-center gap-xl text-center">
                  <div>
                    <p className="text-2xl font-bold text-gradient-static">{activities.length}</p>
                    <p className="text-[10px] text-gray-light uppercase tracking-widest">{t('timeline_page.logs_upper')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">
                      {totalHours > 0 ? `${totalHours}h` : `${remMinutes}m`}
                    </p>
                    <p className="text-[10px] text-gray-light uppercase tracking-widest">{t('timeline_page.logged_upper')}</p>
                  </div>
                </div>
              )}
              {activeTab === 'daily-checklist' && module_features?.['timeline_daily_checklist'] !== false && totalCount > 0 && (
                <div className="flex items-center gap-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gradient-static">{completedCount}<span className="text-gray-light opacity-50 text-lg">/{totalCount}</span></p>
                    <p className="text-[10px] text-gray-light uppercase tracking-widest">{t('timeline_page.done_today')}</p>
                  </div>
                </div>
              )}
              {activeTab === 'weekly-log' && module_features?.['timeline_weekly_log'] !== false && (
                <Button variant="primary" size="md" onClick={() => openAddModal()} leftIcon={<Plus size={18} />}>
                  {t('timeline_page.log_activity_btn')}
                </Button>
              )}
            </div>
          </div>

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
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                    completedCount === totalCount ? 'bg-income/20 text-income' : 'bg-black/10 dark:bg-white/10 text-gray-light'
                  }`}>
                    {completedCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Daily Checklist Panel */}
          {activeTab === 'daily-checklist' && module_features?.['timeline_daily_checklist'] !== false && (
            <div className="glass rounded-xl border border-black/[0.05] dark:border-white/[0.05] overflow-hidden">
              {/* Checklist Header */}
              <div className="flex items-center justify-between px-xl py-lg border-b border-black/[0.05] dark:border-white/[0.05] bg-gray-strong/40">
                <div className="space-y-xs">
                  <h2 className="text-sm font-bold text-soft-cream uppercase tracking-widest flex items-center gap-sm">
                    <ListChecks size={15} className="text-primary" />
                    {new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                  {totalCount > 0 && (
                    <div className="flex items-center gap-sm">
                      <div className="flex-1 h-1.5 bg-black/[0.05] dark:bg-white/[0.05] rounded-full overflow-hidden" style={{ width: '120px' }}>
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                          style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-light">
                        {completedCount === totalCount && totalCount > 0 ? `🎉 ${t('timeline_page.all_done')}` : `${completedCount} of ${totalCount}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-sm text-[9px] text-gray-light opacity-50">
                  <ArrowCounterClockwise size={11} />
                  {t('timeline_page.resets_midnight')}
                </div>
              </div>

              {/* Add Task Input */}
              <div className="px-xl py-lg border-b border-black/[0.05] dark:border-white/[0.05]">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const title = newTaskInput.trim();
                    if (!title || isAddingTask) return;
                    setIsAddingTask(true);
                    setTaskError(null);
                    try {
                      await createTask({ title, description: undefined, category: undefined });
                      setNewTaskInput('');
                    } catch (err) {
                      setTaskError(sanitizeError(err));
                    } finally {
                      setIsAddingTask(false);
                    }
                  }}
                  className="flex gap-sm"
                >
                  <input
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder={t('timeline_page.add_task_placeholder')}
                    disabled={isAddingTask}
                    className="flex-1 bg-gray-strong/40 border border-black/5 dark:border-white/5 rounded-md px-lg py-sm text-sm text-soft-cream placeholder-gray-light/40 focus:border-primary focus:outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!newTaskInput.trim() || isAddingTask}
                    className="flex items-center gap-sm px-lg py-sm bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-md text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                    {t('timeline_page.add')}
                  </button>
                </form>
                {taskError && <p className="text-[11px] text-expense mt-sm">{taskError}</p>}
              </div>

              {/* Task List */}
              <div className="divide-y divide-white/[0.03]">
                {isTasksLoading ? (
                  <div className="flex justify-center py-2xl">
                    <Loading />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex flex-col items-center py-3xl gap-md text-center px-xl">
                    <ListChecks size={40} className="text-gray-light opacity-20" />
                    <p className="text-sm text-gray-light opacity-60 font-light italic">
                      {t('dailyTasks.empty')}
                    </p>
                    <p className="text-[10px] text-gray-light opacity-40">
                      {t('timeline_page.resets_midnight')}
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-lg px-xl py-lg group transition-all hover:bg-black/[0.01] dark:bg-white/[0.01] ${
                        task.completed_today ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTask(task.id, !task.completed_today)}
                        className={`flex-shrink-0 transition-all ${
                          task.completed_today ? 'text-income' : 'text-gray-light hover:text-primary'
                        }`}
                        aria-label={task.completed_today ? 'Mark as not done' : 'Mark as done'}
                      >
                        {task.completed_today ? (
                          <CheckSquare size={20} className="drop-shadow-[0_0_6px_rgba(0,200,100,0.4)]" />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>

                      {/* Title */}
                      <span
                        className={`flex-1 text-sm transition-all ${
                          task.completed_today
                            ? 'line-through text-gray-light'
                            : 'text-soft-cream'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Delete (hover) */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-light hover:text-expense transition-all p-sm"
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Hour Grid â€” only shown on weekly-log tab */}
          {activeTab === 'weekly-log' && module_features?.['timeline_weekly_log'] !== false && isLoading ? (
            <div className="flex justify-center py-2xl">
              <Loading />
            </div>
          ) : activeTab === 'weekly-log' && module_features?.['timeline_weekly_log'] !== false && (
            <div className="glass rounded-xl border border-black/[0.05] dark:border-white/[0.05] overflow-hidden">
              <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <div className="min-w-[700px] md:min-w-0">
                  <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-black/[0.05] dark:border-white/[0.05] bg-gray-strong/60 sticky top-0 z-20">
                <div className="border-r border-black/[0.03] dark:border-white/[0.03]" />
                {daysOfWeek.map((day, idx) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={idx}
                      className={`px-sm py-md text-center border-r border-black/[0.03] dark:border-white/[0.03] last:border-r-0 relative ${
                        isToday ? 'bg-primary/10' : ''
                      }`}
                    >
                      {isToday && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${
                        isToday ? 'text-primary' : 'text-gray-light'
                      }`}>
                        {day.toLocaleDateString(locale, { weekday: 'short' })}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Scrollable Grid Body */}
              <div
                ref={gridRef}
                className="overflow-y-auto"
                style={{ maxHeight: 'calc(100vh - 280px)' }}
                role="grid"
                aria-label="Weekly schedule grid"
              >
                <div className="relative">
                  {/* Current time line */}
                  <div
                    className="absolute left-16 right-0 z-10 pointer-events-none"
                    style={{ top: `${currentTimeOffset}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                      <div className="flex-1 h-px bg-red-500/70" />
                    </div>
                  </div>

                  {HOURS.map((hour) => {
                    const isCurrentHour = hour === currentHour && new Date().toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={hour}
                        className="grid grid-cols-[64px_repeat(7,1fr)]"
                        style={{ minHeight: `${CELL_HEIGHT}px` }}
                        role="row"
                      >
                        {/* Hour label */}
                        <div className={`flex items-start justify-end pr-sm pt-sm border-r border-black/[0.03] dark:border-white/[0.03] sticky left-0 bg-gray-strong/40 ${
                          isCurrentHour ? 'text-red-400' : 'text-gray-light opacity-40'
                        }`}>
                          <span className="text-[10px] font-bold font-mono">
                            {formatHour(hour)}
                          </span>
                        </div>

                        {/* Day cells */}
                        {daysOfWeek.map((day, dayIdx) => {
                          const isToday = day.toDateString() === new Date().toDateString();
                          const cellActivities = grid[dayIdx][hour] || [];
                          const cellReminders = remindersGrid[dayIdx][hour] || [];
                          const hasClash = cellActivities.length > 0 && cellReminders.length > 0;

                          return (
                            <div
                              key={dayIdx}
                              role="gridcell"
                              className={`border-r border-b border-black/[0.03] dark:border-white/[0.03] last:border-r-0 p-1 cursor-pointer group relative ${
                                isToday ? 'bg-primary/[0.02]' : 'hover:bg-black/[0.01] dark:bg-white/[0.01]'
                              }`}
                              onClick={() => {
                                if (cellActivities.length === 0 && cellReminders.length === 0) openAddModal(day, hour);
                              }}
                              aria-label={`${day.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' })} at ${formatHour(hour)}`}
                            >
                              {/* Empty slot hint */}
                              {cellActivities.length === 0 && cellReminders.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <Plus size={12} className="text-primary opacity-50" />
                                </div>
                              )}

                              {/* Clash indicator */}
                              {hasClash && (
                                <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded px-1.5 py-0.5 mb-1 text-[8px] font-bold">
                                  <Warning size={10} className="shrink-0" />
                                  <span className="truncate">Bentrok ({cellReminders.length} Pengingat)</span>
                                </div>
                              )}

                              {/* Reminder cards */}
                              {cellReminders.map((rem) => (
                                <div
                                  key={rem.id}
                                  className="rounded p-1 mb-1 text-left border-l-2 border-amber-400 bg-amber-500/10 text-soft-cream relative group/rem"
                                  title={`Pengingat: ${rem.title}${rem.due_time ? ' (' + rem.due_time + ')' : ''}`}
                                >
                                  <div className="flex items-center gap-1">
                                    <Bell size={10} className="text-amber-400 shrink-0" />
                                    <p className="text-[9px] font-bold text-amber-200 truncate leading-tight flex-1">
                                      {rem.title}
                                    </p>
                                  </div>
                                  {rem.due_time && (
                                    <span className="text-[8px] text-amber-300/70 font-mono block mt-0.5">
                                      {rem.due_time}
                                    </span>
                                  )}
                                </div>
                              ))}

                              {/* Activity cards */}
                              {cellActivities.map((act) => {
                                const isRoutine = Boolean((act.metadata as any)?.is_weekly_routine || (act as any).is_weekly_template);
                                return (
                                <div
                                  key={act.id}
                                  onClick={(e) => { e.stopPropagation(); openEditModal(act); }}
                                  className={`rounded p-1 mb-0.5 cursor-pointer group/card hover:brightness-110 transition-all text-left relative overflow-hidden ${
                                    isRoutine ? 'border-dashed' : ''
                                  }`}
                                  style={{
                                    background: isRoutine 
                                      ? `linear-gradient(135deg, rgba(78,79,235,0.15), rgba(78,79,235,0.05))` 
                                      : `linear-gradient(135deg, #4e4feb22, #4e4feb11)`,
                                    borderLeft: isRoutine ? '2px dashed #818cf8' : '2px solid #4e4feb',
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => e.key === 'Enter' && openEditModal(act)}
                                  aria-label={`${act.title}, ${act.category || 'activity'}`}
                                >
                                  <div className="flex items-center gap-1">
                                    {isRoutine && (
                                      <span title="Jadwal Rutin Mingguan" className="inline-flex items-center shrink-0">
                                        <Repeat size={10} className="text-indigo-300" />
                                      </span>
                                    )}
                                    <p className="text-[9px] font-bold text-soft-cream truncate leading-tight flex-1">
                                      {act.title}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    {act.category && (
                                      <span className="text-[8px] text-primary opacity-80 uppercase tracking-wide">
                                        {act.category}
                                      </span>
                                    )}
                                    {getDurationLabel(act) && (
                                      <span className="text-[8px] text-gray-light opacity-60">
                                        {getDurationLabel(act)}
                                      </span>
                                    )}
                                  </div>
                                  {/* Delete on hover */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(act.id); }}
                                    className="absolute top-0.5 right-0.5 opacity-0 group-hover/card:opacity-100 text-gray-light hover:text-red-400 transition-all"
                                    aria-label={`Delete ${act.title}`}
                                  >
                                    <Trash2 size={9} />
                                  </button>
                                </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
                </div>
              </div>

              {/* Mobile Day View */}
              <div className="md:hidden p-md space-y-md min-h-[50vh]">
                <div className="flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.05] pb-2 mb-md">
                  <button
                    onClick={() => setMobileDayIdx((p) => (p > 0 ? p - 1 : 6))}
                    className="p-1 hover:bg-black/5 rounded-full"
                  >
                    <CaretLeft size={20} />
                  </button>
                  <h3 className="font-bold text-soft-cream uppercase tracking-widest text-sm flex-1 text-center">
                    {daysOfWeek[mobileDayIdx].toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setMobileDayIdx((p) => (p < 6 ? p + 1 : 0))}
                    className="p-1 hover:bg-black/5 rounded-full"
                  >
                    <CaretRight size={20} />
                  </button>
                </div>
                {(() => {
                  const todaysActivities = grid[mobileDayIdx] ? HOURS.flatMap(h => grid[mobileDayIdx][h] || []) : [];
                  const todaysReminders = remindersGrid[mobileDayIdx] ? HOURS.flatMap(h => remindersGrid[mobileDayIdx][h] || []) : [];
                  
                  if (todaysActivities.length === 0 && todaysReminders.length === 0) {
                    return (
                      <div className="text-center py-xl space-y-sm">
                        <p className="text-gray-light italic text-xs">{t('timeline_page.no_activities_today')}</p>
                        <button onClick={() => openAddModal()} className="text-primary hover:text-primary-light flex items-center gap-1 text-sm mx-auto mt-4">
                          <Plus size={16} /> {t('timeline_page.log_activity_btn')}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Reminders section in mobile */}
                      {todaysReminders.map(rem => (
                        <div key={rem.id} className="p-sm rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-md">
                          <Bell size={16} className="text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-amber-200 truncate">{rem.title}</p>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase tracking-wider">Pengingat</span>
                            </div>
                            {rem.due_time && (
                              <p className="text-xs text-amber-300/80 font-mono mt-0.5">Waktu: {rem.due_time}</p>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Activities */}
                      {todaysActivities.map(act => {
                        const isRoutine = Boolean((act.metadata as any)?.is_weekly_routine || (act as any).is_weekly_template);
                        return (
                        <div key={act.id} onClick={() => openEditModal(act)} className="glass-card p-sm flex items-start gap-md active:bg-black/10 transition-colors">
                          <div className="text-[10px] font-bold text-gray-light w-10 text-right pt-0.5 shrink-0">
                            {formatHour(new Date(act.start_time).getHours())}
                          </div>
                          <div className={`flex-1 border-l-2 ${isRoutine ? 'border-indigo-400 border-dashed' : 'border-primary'} pl-md relative group min-w-0`}>
                            <div className="flex items-center gap-1.5">
                              {isRoutine && <Repeat size={12} className="text-indigo-400 shrink-0" />}
                              <p className="font-bold text-sm text-soft-cream truncate">{act.title}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[8px] text-gray-light uppercase tracking-widest mt-1">
                              {isRoutine && <span className="text-indigo-300 bg-indigo-500/20 px-1 rounded shrink-0">Rutin</span>}
                              {act.category && <span className="text-primary shrink-0">{act.category}</span>}
                              {getDurationLabel(act) && <span className="shrink-0">• {getDurationLabel(act)}</span>}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(act.id); }}
                              className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 text-gray-light hover:text-expense transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                      <button onClick={() => openAddModal()} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/10 hover:border-primary/50 text-gray-light hover:text-primary rounded-lg transition-colors text-xs font-bold uppercase tracking-widest mt-4">
                        <Plus size={14} /> {t('timeline_page.log_activity_btn')}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingActivity ? t('timeline_page.edit_log') : t('timeline_page.log_activity_modal')}
          footer={
            <div className="flex gap-md justify-end">
              <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>{t('investment_page.cancel_upper')}</Button>
              <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('investment_page.saving_upper') : t('career_page.save')}
              </Button>
            </div>
          }
        >
          <div className="space-y-xl">
            {/* Weekly Routine Template selector */}
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Repeat size={18} className="text-indigo-400 shrink-0" />
                <div>
                  <label htmlFor="routine-checkbox" className="text-xs font-bold text-soft-cream cursor-pointer block">
                    Jadwal Rutin Mingguan (Template)
                  </label>
                  <p className="text-[10px] text-gray-light">
                    Aktivitas berulang tiap minggu (misal: jam kerja, kuliah, olahraga, standup).
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="routine-checkbox"
                checked={form.isWeeklyRoutine}
                onChange={(e) => setForm((f) => ({ ...f, isWeeklyRoutine: e.target.checked }))}
                className="w-4 h-4 rounded border-indigo-400 text-indigo-500 focus:ring-indigo-400 bg-black/20"
              />
            </div>

            <Input
              label={t('timeline_page.form.title')}
              placeholder={t('timeline_page.form.title_placeholder')}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={formErrors.title}
              autoFocus
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
              <div className="space-y-1.5">
                <Select
                  id="form-day"
                  label={t('timeline_page.form.day')}
                  value={String(form.dayIndex)}
                  onValueChange={(val) => setForm((f) => ({ ...f, dayIndex: +val }))}
                  disabled={form.applyToAllDays}
                  options={daysOfWeek.map((d, i) => ({
                    value: String(i),
                    label: d.toLocaleDateString(locale, { weekday: 'long' }),
                  }))}
                />
                {!editingActivity && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="form-apply-all"
                      checked={form.applyToAllDays}
                      onChange={(e) => setForm(f => ({ ...f, applyToAllDays: e.target.checked }))}
                      className="accent-primary rounded-sm bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                    />
                    <label htmlFor="form-apply-all" className="text-[10px] text-gray-light uppercase tracking-wider cursor-pointer select-none">
                      {t('timeline_page.form.repeat_everyday')}
                    </label>
                  </div>
                )}
              </div>
              <Select
                id="form-hour"
                label={t('timeline_page.form.hour')}
                value={String(form.start_hour)}
                onValueChange={(val) => setForm((f) => ({ ...f, start_hour: +val }))}
                options={HOURS.map((h) => ({
                  value: String(h),
                  label: formatHour(h),
                }))}
              />
              <Select
                id="form-min"
                label={t('timeline_page.form.min')}
                value={String(form.start_minute)}
                onValueChange={(val) => setForm((f) => ({ ...f, start_minute: +val }))}
                options={[0, 15, 30, 45].map((m) => ({
                  value: String(m),
                  label: String(m).padStart(2, '0'),
                }))}
              />
              <Select
                id="form-dur"
                label={t('timeline_page.form.duration')}
                value={String(form.duration_minutes)}
                onValueChange={(val) => setForm((f) => ({ ...f, duration_minutes: +val }))}
                options={[15, 30, 45, 60, 90, 120, 180, 240].map((m) => ({
                  value: String(m),
                  label: m < 60 ? `${m}m` : `${m / 60}h`,
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <Select
                id="form-cat"
                label={t('timeline_page.form.category')}
                value={form.category || 'none'}
                onValueChange={(val) => setForm((f) => ({ ...f, category: val === 'none' ? '' : val }))}
                options={[
                  { value: 'none', label: t('timeline_page.form.uncategorized') },
                  ...CATEGORY_OPTIONS.map((c) => ({
                    value: c,
                    label: t(`timeline_page.form.categories.${c}`),
                  })),
                ]}
              />
              <Select
                id="form-mood"
                label={t('timeline_page.form.mood')}
                value={form.mood || 'none'}
                onValueChange={(val) => setForm((f) => ({ ...f, mood: val === 'none' ? '' : val }))}
                options={[
                  { value: 'none', label: t('timeline_page.form.none') },
                  ...MOOD_OPTIONS.map((m) => ({
                    value: m.value,
                    label: `${m.emoji} ${t(`timeline_page.form.moods.${m.labelKey}`)}`,
                  })),
                ]}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-light mb-2 block">{t('timeline_page.form.rating')}</label>
              <div className="flex gap-md" role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rating: f.rating === s ? 0 : s }))}
                    aria-label={`${s} star${s > 1 ? 's' : ''}`}
                    className={`transition-all ${s <= form.rating ? 'text-primary scale-125' : 'text-gray-light opacity-20 hover:opacity-100 hover:text-primary'}`}
                  >
                    <Star fill={s <= form.rating ? 'currentColor' : 'none'} size={22} />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <MapPin size={14} className="absolute left-md top-1/2 -translate-y-1/2 text-primary" />
              <input
                placeholder={t('timeline_page.form.location')}
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                aria-label="Location"
                className="w-full pl-xl pr-md py-md bg-gray-strong/40 border border-black/5 dark:border-white/5 rounded-md text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>

            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t('timeline_page.form.notes')}
              rows={3}
              aria-label="Notes"
              className="w-full bg-gray-strong border border-black/5 dark:border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </Modal>
        )}

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
