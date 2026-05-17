'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, Badge, Loading, Modal, Input, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useReminder } from '@/hooks/useReminder';
import { validateReminder, sanitizeError } from '@/libs/validation';
import { Reminder } from '@/types/database';
import { 
  Plus, 
  Bell, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Trash2, 
  AlertCircle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { formatDate } from '@/libs/format';

export default function RemindersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { reminders, isLoading: isRemindersLoading, createReminder, updateReminder, deleteReminder } = useReminder();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '12:00',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // SWR automatically handles fetching and background tracking! No manual loadData needed.

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSave = async () => {
    if (!form.title) return;
    
    setIsSaving(true);
    const dueDate = new Date(`${form.dueDate}T${form.dueTime}:00`);
    
    const payload = {
      title: form.title,
      description: form.description,
      due_date: form.dueDate,
      due_time: form.dueTime,
      due_datetime: dueDate.toISOString(),
      priority: form.priority,
      status: editingReminder ? editingReminder.status : 'pending',
      is_recurring: editingReminder?.is_recurring ?? false,
    };

    // Validate
    const validation = validateReminder({
      ...form,
      due_datetime: form.dueDate && form.dueTime ? `${form.dueDate}T${form.dueTime}` : undefined,
      status: editingReminder?.status || 'pending',
    });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setIsSaving(false);
      return;
    }

    setFormErrors({});
    setError(null);

    try {
      if (editingReminder) {
        await updateReminder(editingReminder.id, payload);
      } else {
        await createReminder(payload);
      }
      setIsModalOpen(false);
      // SWR automatically mutates data via hook
    } catch (err) {
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
      console.error('Failed to save reminder:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (reminder: Reminder) => {
    try {
      setIsSaving(true);
      const newStatus = reminder.status === 'completed' ? 'pending' : 'completed';
      await updateReminder(reminder.id, { status: newStatus });
    } catch (err) {
      setError(sanitizeError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingReminder(null);
    setForm({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '12:00',
      priority: 'medium',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (r: Reminder) => {
    const dueAt = r.due_datetime || r.due_date;
    const date = dueAt ? new Date(dueAt) : new Date();
    setEditingReminder(r);
    setForm({
      title: r.title,
      description: r.description || '',
      dueDate: date.toISOString().split('T')[0],
      dueTime: date.toTimeString().split(' ')[0].substring(0, 5),
      priority: r.priority || 'medium',
    });
    setIsModalOpen(true);
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    const aDue = a.due_datetime || a.due_date;
    const bDue = b.due_datetime || b.due_date;
    return new Date(aDue || 0).getTime() - new Date(bDue || 0).getTime();
  });

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
            <h1 className="text-display font-serif text-gradient">System Alerts</h1>
            <p className="text-subtext flex items-center gap-sm">
              <Bell size={14} className="text-primary" />
              Maintain operational focus and critical milestones
            </p>
          </div>
          <Button variant="primary" size="md" onClick={openAddModal} leftIcon={<Plus size={18} />}>
            New Reminder
          </Button>
        </div>

        {/* Stats & Filters */}
        <div className="flex flex-col md:flex-row gap-lg items-center justify-between">
          <div className="flex gap-md overflow-x-auto pb-1 no-scrollbar">
            {(['pending', 'completed', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-md px-xl py-md text-[10px] font-bold rounded-md border transition-all uppercase tracking-[0.2em] ${
                  filter === f
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-white/[0.02] text-gray-light border-white/[0.05] hover:text-soft-cream'
                }`}
              >
                {filter === f && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                {f}
              </button>
            ))}
          </div>

          <Card className="px-lg py-md flex items-center gap-xl border-none glass">
             <div className="text-center">
                <p className="text-[10px] text-gray-light font-bold">ALERTS</p>
                <p className="text-lg font-bold text-white">{reminders.filter(r => r.status === 'pending').length}</p>
             </div>
             <div className="w-px h-8 bg-white opacity-[0.05]" />
             <div className="text-center">
                <p className="text-[10px] text-gray-light font-bold">COMPLETED</p>
                <p className="text-lg font-bold text-success">{reminders.filter(r => r.status === 'completed').length}</p>
             </div>
          </Card>
        </div>

        {/* Reminders List */}
        <div className="grid grid-cols-1 gap-md">
          {isRemindersLoading ? (
            <div className="flex justify-center py-2xl"><Loading /></div>
          ) : sortedReminders.length > 0 ? (
            sortedReminders.map((reminder) => (
              <Card 
                key={reminder.id} 
                className={`group flex items-start gap-lg p-xl transition-all border-none relative overflow-hidden ${
                  reminder.status === 'completed' ? 'opacity-50' : ''
                }`}
              >
                {/* Priority Glow */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                  reminder.priority === 'high' ? 'bg-danger shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 
                  reminder.priority === 'medium' ? 'bg-primary shadow-[0_0_15px_rgba(78,79,235,0.5)]' : 
                  'bg-secondary shadow-[0_0_15px_rgba(6,143,255,0.5)]'
                }`} />

                <button 
                  onClick={() => toggleStatus(reminder)}
                  disabled={isSaving}
                  className={`mt-1 shrink-0 transition-all ${
                    reminder.status === 'completed' ? 'text-success scale-110' : 'text-gray-light hover:text-primary'
                  } ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {reminder.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div className="flex-1 min-w-0" onClick={() => openEditModal(reminder)}>
                  <div className="flex items-center gap-md mb-xs flex-wrap">
                    <h3 className={`text-lg font-bold group-hover:text-primary transition-colors ${
                      reminder.status === 'completed' ? 'line-through' : 'text-soft-cream'
                    }`}>
                      {reminder.title}
                    </h3>
                    <Badge variant={reminder.priority === 'high' ? 'danger' : reminder.priority === 'medium' ? 'activity' : 'insight'} size="sm">
                      {reminder.priority}
                    </Badge>
                  </div>
                  {reminder.description && (
                    <p className="text-sm text-gray-light line-clamp-2 mt-1 italic opacity-80">{reminder.description}</p>
                  )}
                  
                  <div className="flex items-center gap-xl mt-md">
                    {(() => {
                      const dueAt = reminder.due_datetime || reminder.due_date;
                      return (
                    <div className="flex items-center gap-sm text-[10px] font-bold text-gray-light uppercase tracking-widest">
                      <Calendar size={12} className="text-primary" />
                      {dueAt ? formatDate(dueAt) : 'No due date'}
                    </div>
                      );
                    })()}
                    {(() => {
                      const dueAt = reminder.due_datetime || reminder.due_date;
                      return (
                    <div className="flex items-center gap-sm text-[10px] font-bold text-gray-light uppercase tracking-widest">
                      <Clock size={12} className="text-secondary" />
                      {dueAt ? new Date(dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex flex-col gap-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(reminder); }}
                    className="p-sm hover:bg-white/5 rounded-md text-gray-light hover:text-primary"
                  >
                    <MoreVertical size={18} />
                  </button>
                  <button 
                    onClick={async (e) => { 
                      e.stopPropagation(); 
                      if(confirm('Delete this milestone?')) {
                        await deleteReminder(reminder.id);
                        // SWR mutates automatically
                      }
                    }}
                    className="p-sm hover:bg-danger/10 rounded-md text-gray-light hover:text-danger"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="py-2xl text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-lg text-gray-light">
                <AlertCircle size={32} />
              </div>
              <p className="text-gray-light text-sm italic">System scan complete. No pending alerts found.</p>
              <Button variant="ghost" className="mt-xl" onClick={openAddModal}>MANUALLY OVERRIDE</Button>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReminder ? 'RECONFIGURE ALERT' : 'INITIATE NEW ALERT'}
        footer={
          <div className="flex gap-md justify-end">
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)} disabled={isSaving}>HALT</Button>
            <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} disabled={isSaving}>
              {editingReminder ? 'SYNCHRONIZE' : 'DEPLOY ALERT'}
            </Button>
          </div>
        }
      >
        <div className="space-y-xl">
          <Input 
            label="MISSION OBJECTIVE"
            placeholder="Focus on..."
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            className="text-lg font-bold"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
             <div className="space-y-sm">
                <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">DEADLINE DATE</label>
                <div className="relative">
                   <Calendar size={14} className="absolute left-md top-1/2 -translate-y-1/2 text-primary" />
                   <input 
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full h-12 bg-gray-strong border border-white/5 rounded-md pl-xl pr-md text-sm text-soft-cream focus:border-primary"
                   />
                </div>
             </div>
             <div className="space-y-sm">
                <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">PRECISION TIME</label>
                <div className="relative">
                   <Clock size={14} className="absolute left-md top-1/2 -translate-y-1/2 text-secondary" />
                   <input 
                    type="time"
                    value={form.dueTime}
                    onChange={(e) => setForm(f => ({ ...f, dueTime: e.target.value }))}
                    className="w-full h-12 bg-gray-strong border border-white/5 rounded-md pl-xl pr-md text-sm text-soft-cream focus:border-primary"
                   />
                </div>
             </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">PRIORITY LEVEL</label>
            <div className="flex gap-md">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`flex-1 py-md rounded-md border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    form.priority === p
                      ? p === 'high' ? 'bg-danger text-white border-danger shadow-lg shadow-danger/20' : 
                        p === 'medium' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 
                        'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20'
                      : 'bg-transparent text-gray-light border-white/5 hover:text-soft-cream'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">TACTICAL NOTES</label>
            <textarea
              placeholder="Operational details..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-strong/40 border border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </div>
      </Modal>
      </Layout>
    </>
  );
}
