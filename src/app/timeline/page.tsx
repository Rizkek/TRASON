'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useActivity } from '@/hooks/useActivity';
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
  start_hour: new Date().getHours(),
  start_minute: 0,
  duration_minutes: 30,
  location: '',
  rating: 0,
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CATEGORY_OPTIONS = ['Work', 'Study', 'Exercise', 'Meals', 'Social', 'Rest', 'Personal', 'Other'];

export default function TimelinePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { activities, isLoading, fetchActivities, createActivity, updateActivity, deleteActivity } = useActivity();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [form, setForm] = useState<ActivityFormData>(defaultForm);
  const [isSaving, setIsSaving] = useState(false);
  const [currentHour] = useState(new Date().getHours());

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchActivities(selectedDate);
  }, [authLoading, isAuthenticated, selectedDate, fetchActivities]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const openAddModal = useCallback((hour?: number) => {
    setEditingActivity(null);
    setForm({ ...defaultForm, start_hour: hour ?? new Date().getHours() });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((activity: any) => {
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
    setIsSaving(true);

    const startDate = new Date(selectedDate);
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

    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, payload);
      } else {
        await createActivity(payload);
      }
      setIsModalOpen(false);
      fetchActivities(selectedDate);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this?')) return;
    await deleteActivity(id);
    fetchActivities(selectedDate);
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const activitiesByHour = HOURS.reduce<Record<number, any[]>>((acc, h) => {
    acc[h] = activities.filter((a: any) => new Date(a.start_time).getHours() === h);
    return acc;
  }, {});

  const totalMinutes = activities.reduce((acc, a: any) => acc + (a.duration_minutes || 0), 0);
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
    <Layout>
      <div className="space-y-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-md">
          <div className="space-y-sm">
            <h1 className="text-display font-serif text-gradient">Daily Timeline</h1>
            <p className="text-subtext flex items-center gap-sm">
              <Clock size={14} className="text-primary" />
              Visualize your day, one hour at a time
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => openAddModal()} leftIcon={<Plus size={18} />}>
            Log Activity
          </Button>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-between glass rounded-md px-xl py-lg">
          <button
            type="button"
            onClick={() => changeDate(-1)}
            className="p-md text-primary hover:text-secondary hover:bg-white/5 rounded-md transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center group cursor-pointer">
            <p className="text-lg font-bold text-white group-hover:text-primary transition-colors">
              {isToday ? 'TODAY' : selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
            </p>
            <p className="text-micro text-gray-light mt-1 flex items-center justify-center gap-sm">
              <CalendarIcon size={12} />
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => changeDate(1)}
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
                  const freq: any = {};
                  activities.forEach((a: any) => { if (a.category) freq[a.category] = (freq[a.category] || 0) + 1; });
                  const top = Object.entries(freq).sort((a: any, b: any) => b[1] - a[1])[0];
                  return top ? top[0].toUpperCase() : 'NONE';
                })()}
              </p>
            </Card>
          </div>
        )}

        {/* Timeline */}
        {isLoading ? (
          <div className="flex justify-center py-2xl"><Loading /></div>
        ) : (
          <div className="space-y-2 relative">
            {/* Timeline Line Vertical */}
            <div className="absolute left-[72px] top-0 bottom-0 w-px bg-white/5 hidden sm:block" />

            {HOURS.map((hour) => {
              const hourActivities = activitiesByHour[hour];
              const isCurrent = isToday && hour === currentHour;

              return (
                <div key={hour} className="flex gap-lg group min-h-[64px]">
                  {/* Hour Marker */}
                  <div className={`w-16 flex-shrink-0 text-right py-md pr-md text-[10px] font-bold tracking-tighter ${
                    isCurrent ? 'text-primary' : 'text-gray-light opacity-60'
                  }`}>
                    {formatHour(hour)}
                  </div>

                  {/* Activity List for this hour */}
                  <div className="flex-1 space-y-md pb-md">
                    {hourActivities.length > 0 ? (
                      hourActivities.map((activity) => (
                        <Card 
                          key={activity.id} 
                          className="p-md cursor-pointer hover:border-primary/40 group/card relative overflow-hidden"
                          onClick={() => openEditModal(activity)}
                        >
                          {isCurrent && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 min-w-0">
                              <h4 className="text-sm font-bold text-soft-cream truncate group-hover/card:text-primary transition-colors">
                                {activity.title}
                              </h4>
                              <div className="flex items-center gap-md flex-wrap">
                                {activity.category && (
                                  <span className="flex items-center gap-1 text-[10px] text-secondary font-bold uppercase tracking-widest">
                                    <Tag size={10} /> {activity.category}
                                  </span>
                                )}
                                {activity.mood && (
                                  <span className="flex items-center gap-1 text-[10px] text-gray-light uppercase">
                                    <Smile size={10} /> {activity.mood}
                                  </span>
                                )}
                                {getDurationLabel(activity) && (
                                  <span className="text-[10px] text-gray-light opacity-60 flex items-center gap-1">
                                    <Clock size={10} /> {getDurationLabel(activity)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDelete(activity.id); }}
                              className="p-sm text-gray-light hover:text-danger opacity-0 group-hover/card:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div 
                        onClick={() => openAddModal(hour)}
                        className="h-12 border border-dashed border-white/5 rounded-md flex items-center px-lg text-micro text-gray-light opacity-30 hover:opacity-100 hover:border-primary/20 hover:text-primary transition-all cursor-pointer"
                      >
                        + Add activity at {formatHour(hour)}
                      </div>
                    )}
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
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div>
              <label className="text-[10px] font-bold text-gray-light mb-1 block">START</label>
              <select value={form.start_hour} onChange={(e) => setForm(f => ({ ...f, start_hour: +e.target.value }))} className="w-full h-10 bg-gray-strong border border-white/5 rounded-sm text-sm px-sm text-white focus:border-primary">
                {HOURS.map(h => <option key={h} value={h}>{formatHour(h)}</option>)}
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
              className="w-full pl-xl pr-md py-md bg-gray-strong bg-opacity-40 border border-white/5 rounded-md text-xs font-bold focus:border-primary focus:outline-none transition-all"
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
  );
}
