'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useActivity } from '@/hooks/useActivity';
import { validateActivity, sanitizeError } from '@/libs/validation';
import { Activity } from '@/services/supabaseClient';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Clock, 
  Tag, 
  Smile, 
  MapPin, 
  Star,
  Activity as ActivityIcon
} from 'lucide-react';

const MOOD_OPTIONS = [
  { label: 'Happy', emoji: '😊', value: 'Happy' },
  { label: 'Neutral', emoji: '😐', value: 'Neutral' },
  { label: 'Tired', emoji: '😴', value: 'Tired' },
  { label: 'Energized', emoji: '💪', value: 'Energized' },
  { label: 'Stressed', emoji: '😤', value: 'Stressed' },
  { label: 'Calm', emoji: '🧘', value: 'Calm' },
];

function formatHour(h: number) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function getActivityHour(activity: Activity) {
  return new Date(activity.start_time).getHours();
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

interface ActivityFormData {
  title: string;
  description: string;
  category: string;
  mood: string;
  date: string;
  start_hour: number;
  start_minute: number;
  duration_minutes: number;
  location: string;
  rating: number;
}

const defaultForm: ActivityFormData = {
  title: '',
  description: '',
  category: '',
  mood: '',
  date: new Date().toISOString().split('T')[0],
  start_hour: new Date().getHours(),
  start_minute: 0,
  duration_minutes: 30,
  location: '',
  rating: 0,
};

const CATEGORY_OPTIONS = ['Work', 'Study', 'Exercise', 'Meals', 'Social', 'Rest', 'Personal', 'Other'];

const getWeekRange = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getDaysOfWeek = (startDate: Date) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
};

export default function TimelinePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { start: weekStart, end: weekEnd } = getWeekRange(currentDate);
  const daysOfWeek = getDaysOfWeek(weekStart);
  
  // SWR automatically handles caching & auto-fetching based on date range
  const { activities, isLoading, createActivity, updateActivity, deleteActivity } = useActivity(weekStart, weekEnd);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState<ActivityFormData>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Manual fetchActivities is no longer needed since SWR handles it automatically
  // Reactively fetches data when `selectedDate` changes.

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const openAddModal = useCallback((date?: Date) => {
    setEditingActivity(null);
    setForm({ 
      ...defaultForm, 
      date: (date || new Date()).toISOString().split('T')[0],
      start_hour: new Date().getHours() 
    });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((activity: Activity) => {
    const start = new Date(activity.start_time);
    const end = activity.end_time ? new Date(activity.end_time) : null;
    const durationMins = end
      ? Math.round((end.getTime() - start.getTime()) / 60000)
      : 30;

    setEditingActivity(activity);
    setForm({
      title: activity.title,
      description: activity.description || '',
      category: activity.category || '',
      mood: activity.mood || '',
      date: start.toISOString().split('T')[0],
      start_hour: start.getHours(),
      start_minute: start.getMinutes(),
      duration_minutes: durationMins,
      location: activity.location || '',
      rating: activity.rating || 0,
    });
    setIsModalOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) return;

    const startDate = new Date(form.date);
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

    // Validate before save
    const validation = validateActivity(payload);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    setFormErrors({});
    setError(null);

    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, payload);
      } else {
        await createActivity(payload);
      }
      setIsModalOpen(false);
      // SWR auto-mutates the data so you don't call fetchActivities()
    } catch (err) {
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this?')) return;
    await deleteActivity(id);
    // SWR auto-mutates
  };

  const changeWeek = (weeks: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + weeks * 7);
    setCurrentDate(d);
  };

  const isCurrentWeek = new Date() >= weekStart && new Date() <= weekEnd;

  const totalMinutes = activities.reduce((acc, a: Activity) => acc + (a.duration_minutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-2xl"><Loading text="Checking your session..." /></div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <Layout>
      <div className="space-y-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-md">
          <div className="space-y-sm">
            <h1 className="text-display font-serif text-gradient">Weekly Schedule</h1>
            <p className="text-subtext flex items-center gap-sm">
              <CalendarIcon size={14} className="text-primary" />
              Manage your daily activities across the week
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => openAddModal()} leftIcon={<Plus size={18} />}>
            Log Activity
          </Button>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center justify-between glass rounded-md px-xl py-lg">
          <button
            type="button"
            onClick={() => changeWeek(-1)}
            className="p-md text-primary hover:text-secondary hover:bg-white/5 rounded-md transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center group cursor-pointer">
            <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">
              {isCurrentWeek ? 'THIS WEEK' : `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </p>
            <p className="text-micro text-gray-light mt-1 flex items-center justify-center gap-sm">
              <CalendarIcon size={12} />
              Week View
            </p>
          </div>
          <button
            type="button"
            onClick={() => changeWeek(1)}
            className="p-md text-primary hover:text-secondary hover:bg-white/5 rounded-md transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Stats Grid */}
        {activities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
            <Card className="p-xl text-center group hover:bg-primary/5">
              <div className="mb-sm text-primary flex justify-center"><ActivityIcon size={20} /></div>
              <p className="text-micro text-gray-light mb-1">TOTAL LOGS</p>
              <p className="text-3xl font-bold text-gradient">{activities.length}</p>
            </Card>
            <Card className="p-xl text-center group hover:bg-secondary/5">
              <div className="mb-sm text-secondary flex justify-center"><Clock size={20} /></div>
              <p className="text-micro text-gray-light mb-1">TIME LOGGED</p>
              <p className="text-3xl font-bold text-white">
                {totalHours > 0 ? `${totalHours}h` : ''}{remMinutes > 0 ? ` ${remMinutes}m` : ''}
                {totalMinutes === 0 && '0m'}
              </p>
            </Card>
            <Card className="p-xl text-center group hover:bg-success/5">
              <div className="mb-sm text-success flex justify-center"><Tag size={20} /></div>
              <p className="text-micro text-gray-light mb-1">TOP FOCUS</p>
              <p className="text-xl font-bold text-white truncate">
                {(() => {
                  const freq: Record<string, number> = {};
                  activities.forEach((a: Activity) => { if (a.category) freq[a.category] = (freq[a.category] || 0) + 1; });
                  const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
                  return top ? top[0].toUpperCase() : 'NONE';
                })()}
              </p>
            </Card>
          </div>
        )}

        {/* Schedule Grid */}
        {isLoading ? (
          <div className="flex justify-center py-2xl"><Loading /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-md">
            {daysOfWeek.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayActivities = activities
                .filter(a => new Date(a.start_time).toDateString() === day.toDateString())
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

              return (
                <div key={idx} className={`flex flex-col gap-sm p-md rounded-lg ${isToday ? 'bg-primary/5 border border-primary/20' : 'bg-white/[0.02] border border-white/5'}`}>
                  <div className="text-center pb-sm border-b border-white/10 mb-sm relative">
                    {isToday && <div className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    <p className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-gray-light'}`}>
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-xl font-bold mt-1 ${isToday ? 'text-white' : 'text-soft-cream'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  
                  <div className="flex-1 space-y-sm overflow-y-auto max-h-[60vh] pr-1 scrollbar-hide">
                    {dayActivities.map(activity => (
                      <Card 
                        key={activity.id}
                        onClick={() => openEditModal(activity)}
                        className="p-sm cursor-pointer hover:border-primary/40 group/card relative overflow-hidden transition-all bg-gray-strong/50 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-[10px] font-bold text-gray-light font-mono">
                            {formatHour(new Date(activity.start_time).getHours())}
                          </p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDelete(activity.id); }}
                            className="text-gray-light hover:text-danger opacity-0 group-hover/card:opacity-100 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-soft-cream leading-tight mb-1 group-hover/card:text-primary transition-colors line-clamp-2">
                          {activity.title}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {activity.category && (
                            <Badge variant="activity" size="sm" className="text-[8px] px-1.5 py-0.5">
                              {activity.category}
                            </Badge>
                          )}
                          {getDurationLabel(activity) && (
                            <span className="text-[9px] text-gray-light opacity-60 flex items-center gap-0.5">
                              <Clock size={8} /> {getDurationLabel(activity)}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                    
                    <button 
                      onClick={() => openAddModal(day)}
                      className="w-full py-md border border-dashed border-white/10 rounded-md text-[10px] font-bold text-gray-light uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-colors mt-2"
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'EDIT LOG' : 'CAPTURE ACTIVITY'}
        footer={
          <div className="flex gap-md justify-end">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button variant="primary" size="md" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'SYNCING...' : 'SAVE JOURNAL'}
            </Button>
          </div>
        }
      >
        <div className="space-y-xl">
          <Input
            label="ACTIVITY TITLE"
            placeholder="Focusing on..."
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="text-lg font-serif"
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-md">
            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">DATE</label>
              <input 
                type="date" 
                value={form.date} 
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} 
                className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">START HOUR</label>
              <select value={form.start_hour} onChange={(e) => setForm(f => ({ ...f, start_hour: +e.target.value }))} className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary">
                {Array.from({ length: 24 }, (_, i) => i).map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">MIN</label>
              <select value={form.start_minute} onChange={(e) => setForm(f => ({ ...f, start_minute: +e.target.value }))} className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary">
                {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">MINUTES</label>
              <select value={form.duration_minutes} onChange={(e) => setForm(f => ({ ...f, duration_minutes: +e.target.value }))} className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary">
                {[15, 30, 45, 60, 90, 120, 180, 240].map(m => <option key={m} value={m}>{m}m</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">CATEGORY</label>
              <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary">
                <option value="">UNCATEGORIZED</option>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">MOOD</label>
              <select value={form.mood} onChange={(e) => setForm(f => ({ ...f, mood: e.target.value }))} className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary">
                <option value="">NONE</option>
                {MOOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-light mb-2 block">EXPERIENCE RATING</label>
            <div className="flex gap-md">
              {[1, 2, 3, 4, 5].map(s => (
                <button 
                  key={s} 
                  type="button"
                  onClick={() => setForm(f => ({ ...f, rating: f.rating === s ? 0 : s }))}
                  className={`text-2xl transition-all ${s <= form.rating ? 'text-primary scale-125' : 'text-gray-light opacity-20 hover:opacity-100 hover:text-primary'}`}
                >
                  <Star fill={s <= form.rating ? 'currentColor' : 'none'} size={24} />
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <MapPin size={16} className="absolute left-md top-1/2 -translate-y-1/2 text-primary" />
            <input 
              placeholder="LOCATION"
              value={form.location}
              onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full pl-xl pr-md py-md bg-gray-strong/40 border border-white/5 rounded-md text-xs font-bold focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="DEEP NOTES & THOUGHTS..."
            rows={4}
            className="w-full bg-gray-strong border border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
          />
        </div>
      </Modal>
      </Layout>
    </>
  );
}
