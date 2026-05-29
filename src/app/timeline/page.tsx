'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert, ConfirmModal } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useActivity } from '@/hooks/useActivity';
import { validateActivity, sanitizeError } from '@/libs/validation';
import { Activity } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import {
  Plus,
  Trash2,
  Clock,
  Tag,
  Smile,
  MapPin,
  Star,
  Activity as ActivityIcon,
} from 'lucide-react';

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
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return { start: mon, end: sun };
}

function getDaysOfWeek(start: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
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
};

const CELL_HEIGHT = 64; // px per hour row

export default function TimelinePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { t } = useTranslation();

  const { start: weekStart, end: weekEnd } = getCurrentWeekBounds();
  const daysOfWeek = getDaysOfWeek(weekStart);

  const { activities, isLoading, createActivity, updateActivity, deleteActivity } = useActivity(
    weekStart,
    weekEnd
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState<ActivityFormData>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  // Build lookup: day index (0=Mon) → hour → activities
  const grid: Record<number, Record<number, Activity[]>> = {};
  for (let d = 0; d < 7; d++) {
    grid[d] = {};
    for (let h = 0; h < 24; h++) grid[d][h] = [];
  }
  activities.forEach((act) => {
    const start = new Date(act.start_time);
    const dayDate = start.toDateString();
    const dayIdx = daysOfWeek.findIndex((d) => d.toDateString() === dayDate);
    if (dayIdx >= 0) {
      const h = start.getHours();
      if (!grid[dayIdx][h]) grid[dayIdx][h] = [];
      grid[dayIdx][h].push(act);
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
              <h1 className="text-display font-serif text-gradient">{t('timeline_page.title')}</h1>
              <p className="text-subtext flex items-center gap-sm">
                <Clock size={14} className="text-primary" />
                {t('timeline_page.desc')}
              </p>
            </div>
            <div className="flex items-center gap-md">
              {activities.length > 0 && (
                <div className="flex items-center gap-xl text-center">
                  <div>
                    <p className="text-2xl font-bold text-gradient">{activities.length}</p>
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
              <Button variant="primary" size="md" onClick={() => openAddModal()} leftIcon={<Plus size={18} />}>
                {t('timeline_page.log_activity_btn')}
              </Button>
            </div>
          </div>

          {/* Hour Grid */}
          {isLoading ? (
            <div className="flex justify-center py-2xl">
              <Loading />
            </div>
          ) : (
            <div className="glass rounded-xl border border-white/[0.05] overflow-hidden">
              {/* Day Headers — sticky */}
              <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-white/[0.05] bg-gray-strong/60 sticky top-0 z-20">
                <div className="border-r border-white/[0.03]" />
                {daysOfWeek.map((day, idx) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={idx}
                      className={`px-sm py-md text-center border-r border-white/[0.03] last:border-r-0 relative ${
                        isToday ? 'bg-primary/10' : ''
                      }`}
                    >
                      {isToday && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${
                        isToday ? 'text-primary' : 'text-gray-light'
                      }`}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
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
                        <div className={`flex items-start justify-end pr-sm pt-sm border-r border-white/[0.03] sticky left-0 bg-gray-strong/40 ${
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

                          return (
                            <div
                              key={dayIdx}
                              role="gridcell"
                              className={`border-r border-b border-white/[0.03] last:border-r-0 p-0.5 cursor-pointer group relative ${
                                isToday ? 'bg-primary/[0.02]' : 'hover:bg-white/[0.01]'
                              }`}
                              onClick={() => {
                                if (cellActivities.length === 0) openAddModal(day, hour);
                              }}
                              aria-label={`${day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at ${formatHour(hour)}`}
                            >
                              {/* Empty slot hint */}
                              {cellActivities.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <Plus size={12} className="text-primary opacity-50" />
                                </div>
                              )}

                              {/* Activity cards */}
                              {cellActivities.map((act) => (
                                <div
                                  key={act.id}
                                  onClick={(e) => { e.stopPropagation(); openEditModal(act); }}
                                  className="rounded p-1 mb-0.5 cursor-pointer group/card hover:brightness-110 transition-all text-left relative overflow-hidden"
                                  style={{
                                    background: `linear-gradient(135deg, #4e4feb22, #4e4feb11)`,
                                    borderLeft: '2px solid #4e4feb',
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => e.key === 'Enter' && openEditModal(act)}
                                  aria-label={`${act.title}, ${act.category || 'activity'}`}
                                >
                                  <p className="text-[9px] font-bold text-soft-cream truncate leading-tight">
                                    {act.title}
                                  </p>
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
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
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
            <Input
              label={t('timeline_page.form.title')}
              placeholder={t('timeline_page.form.title_placeholder')}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={formErrors.title}
              autoFocus
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="form-day">{t('timeline_page.form.day')}</label>
                <select
                  id="form-day"
                  value={form.dayIndex}
                  onChange={(e) => setForm((f) => ({ ...f, dayIndex: +e.target.value }))}
                  disabled={form.applyToAllDays}
                  className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none disabled:opacity-50"
                >
                  {daysOfWeek.map((d, i) => (
                    <option key={i} value={i}>{d.toLocaleDateString('en-US', { weekday: 'long' })}</option>
                  ))}
                </select>
                {!editingActivity && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="form-apply-all"
                      checked={form.applyToAllDays}
                      onChange={(e) => setForm(f => ({ ...f, applyToAllDays: e.target.checked }))}
                      className="accent-primary rounded-sm bg-white/5 border-white/10"
                    />
                    <label htmlFor="form-apply-all" className="text-[10px] text-gray-light uppercase tracking-wider cursor-pointer select-none">
                      {t('timeline_page.form.repeat_everyday')}
                    </label>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="form-hour">{t('timeline_page.form.hour')}</label>
                <select
                  id="form-hour"
                  value={form.start_hour}
                  onChange={(e) => setForm((f) => ({ ...f, start_hour: +e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  {HOURS.map((h) => <option key={h} value={h}>{formatHour(h)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="form-min">{t('timeline_page.form.min')}</label>
                <select
                  id="form-min"
                  value={form.start_minute}
                  onChange={(e) => setForm((f) => ({ ...f, start_minute: +e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="form-dur">{t('timeline_page.form.duration')}</label>
                <select
                  id="form-dur"
                  value={form.duration_minutes}
                  onChange={(e) => setForm((f) => ({ ...f, duration_minutes: +e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  {[15, 30, 45, 60, 90, 120, 180, 240].map((m) => <option key={m} value={m}>{m < 60 ? `${m}m` : `${m / 60}h`}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="form-cat">{t('timeline_page.form.category')}</label>
                <select
                  id="form-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="">{t('timeline_page.form.uncategorized')}</option>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{t(`timeline_page.form.categories.${c}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-light mb-1 block" htmlFor="form-mood">{t('timeline_page.form.mood')}</label>
                <select
                  id="form-mood"
                  value={form.mood}
                  onChange={(e) => setForm((f) => ({ ...f, mood: e.target.value }))}
                  className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary focus:outline-none"
                >
                  <option value="">{t('timeline_page.form.none')}</option>
                  {MOOD_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.emoji} {t(`timeline_page.form.moods.${m.labelKey}`)}</option>)}
                </select>
              </div>
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
                className="w-full pl-xl pr-md py-md bg-gray-strong/40 border border-white/5 rounded-md text-sm focus:border-primary focus:outline-none transition-all"
              />
            </div>

            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={t('timeline_page.form.notes')}
              rows={3}
              aria-label="Notes"
              className="w-full bg-gray-strong border border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </Modal>

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
