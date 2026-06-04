'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Loading, Modal, Input, ErrorAlert, Calendar as CalendarUI } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useReminder } from '@/hooks/useReminder';
import { useScheduleNotifications } from '@/hooks/useScheduleNotifications';
import { validateReminder, sanitizeError } from '@/libs/validation';
import { Reminder } from '@/types/database';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  List,
  Calendar as CalendarIcon,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { getLocalISODate } from '@/libs/format';


export default function RemindersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const { reminders = [], isLoading: isRemindersLoading, createReminder, updateReminder, deleteReminder } = useReminder();
  const { t } = useTranslation();
  const { locale, timezone } = useUserPreferences();
  const { permission, isSupported, requestNotificationPermission } = useScheduleNotifications();

  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: getLocalISODate(),
    dueTime: '12:00',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notifyTimes: [60, 180, 360] as number[], // default: 1h, 3h, 6h sebelum
  });

  // Pilihan waktu notifikasi (dalam menit sebelum jatuh tempo)
  const NOTIFY_OPTIONS = [
    { value: 2880, label: t('reminders_page.form.notify_options.d2') },
    { value: 1440, label: t('reminders_page.form.notify_options.d1') },
    { value: 360,  label: t('reminders_page.form.notify_options.h6') },
    { value: 180,  label: t('reminders_page.form.notify_options.h3') },
    { value: 60,   label: t('reminders_page.form.notify_options.h1') },
  ];

  const toggleNotifyTime = (value: number) => {
    setForm(prev => ({
      ...prev,
      notifyTimes: prev.notifyTimes.includes(value)
        ? prev.notifyTimes.filter(t => t !== value)
        : [...prev.notifyTimes, value],
    }));
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setForm(prev => ({
      ...prev,
      dueDate: date.toISOString().split('T')[0]
    }));
  };

  const openAddModal = () => {
    setEditingReminder(null);
    setForm({
      title: '',
      description: '',
      dueDate: selectedDate.toISOString().split('T')[0],
      dueTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      priority: 'medium',
      notifyTimes: [60, 180, 360],
    });
    setIsModalOpen(true);
  };

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
      is_recurring: false,
      notify_times: form.notifyTimes.length > 0 ? form.notifyTimes : [0, 60, 180, 360],
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

  if (authLoading || isRemindersLoading) return (
    <Layout>
      <div className="flex justify-center py-2xl"><Loading text={t('dashboard.checking_session')} /></div>
    </Layout>
  );

  const selectedDateReminders = reminders.filter(r => {
    const eventDateStr = r.due_date || (r.due_datetime ? r.due_datetime.split('T')[0] : '');
    const selectedDateStr = selectedDate.getFullYear() + '-' + 
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(selectedDate.getDate()).padStart(2, '0');
    return eventDateStr === selectedDateStr;
  });

  return (
    <Layout>
      <div className="space-y-2xl animate-fade-in pb-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div className="space-y-xs">
            <h1 className="text-5xl font-serif">{t('reminders_page.title')} <span className="text-warm-gold italic">{t('reminders_page.title_highlight')}</span></h1>
            <p className="text-gray-light font-light">{t('reminders_page.desc')}</p>
          </div>
          <div className="flex items-center gap-md">
            <div className="flex bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
              <button 
                onClick={() => setView('calendar')}
                className={`p-2 rounded-full transition-all ${view === 'calendar' ? 'bg-warm-gold text-warm-black shadow-lg' : 'text-gray-light hover:text-soft-cream'}`}
              >
                <CalendarIcon size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-2 rounded-full transition-all ${view === 'list' ? 'bg-warm-gold text-warm-black shadow-lg' : 'text-gray-light hover:text-soft-cream'}`}
              >
                <List size={18} />
              </button>
            </div>
            <Button variant="primary" onClick={openAddModal} className="rounded-full px-xl">
              <Plus size={18} className="mr-2" />
              {t('reminders_page.new_reminder')}
            </Button>
          </div>
        </div>

        {/* Notification Status Banner */}
        {showNotifBanner && isSupported && (
          <div className={`flex items-center justify-between gap-md px-lg py-md rounded-xl border text-sm transition-all ${
            permission === 'granted'
              ? 'bg-income/5 border-income/20 text-income'
              : permission === 'denied'
              ? 'bg-expense/5 border-expense/20 text-expense'
              : 'bg-warm-gold/5 border-warm-gold/20 text-warm-gold'
          }`}>
            <div className="flex items-center gap-md">
              {permission === 'granted' ? (
                <Wifi size={16} className="flex-shrink-0" />
              ) : (
                <WifiOff size={16} className="flex-shrink-0" />
              )}
              <div>
                {permission === 'granted' ? (
                  <span className="font-medium">
                    Notifikasi aktif — bekerja selama browser terbuka.{' '}
                    <span className="opacity-70 font-normal text-xs">
                      Server push aktif untuk pengiriman saat browser baru dibuka.
                    </span>
                  </span>
                ) : permission === 'denied' ? (
                  <span className="font-medium">
                    Notifikasi diblokir — aktifkan di pengaturan browser untuk menerima pengingat.
                  </span>
                ) : (
                  <button
                    onClick={async () => {
                      await requestNotificationPermission();
                    }}
                    className="font-medium hover:underline text-left"
                  >
                    Klik untuk mengaktifkan notifikasi reminder →
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowNotifBanner(false)}
              className="text-current opacity-40 hover:opacity-100 transition-opacity flex-shrink-0 text-lg leading-none"
              aria-label="Tutup banner"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2xl">
          {/* Main View */}
          <div className="lg:col-span-8">
            {view === 'calendar' ? (
              <CalendarUI 
                selectedDate={selectedDate} 
                onDateSelect={handleDateSelect}
                events={reminders}
              />
            ) : (
              <div className="space-y-md">
                {reminders.length === 0 ? (
                  <div className="glass-card p-4xl text-center space-y-md">
                    <Bell size={48} className="mx-auto text-deep-sage opacity-20" />
                    <p className="text-gray-light font-light italic">{t('reminders_page.empty_reminders')}</p>
                  </div>
                ) : (
                  reminders.map(reminder => (
                    <div key={reminder.id} className="glass-card p-xl flex items-center justify-between group">
                      <div className="flex items-center gap-xl">
                        <button 
                          onClick={() => updateReminder(reminder.id, { status: reminder.status === 'completed' ? 'pending' : 'completed' })}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            reminder.status === 'completed' ? 'bg-income border-income text-warm-black' : 'border-gray-medium hover:border-warm-gold'
                          }`}
                        >
                          {reminder.status === 'completed' && <CheckCircle2 size={14} />}
                        </button>
                        <div>
                          <h4 className={`text-lg font-medium ${reminder.status === 'completed' ? 'line-through opacity-40' : ''}`}>{reminder.title}</h4>
                          <div className="flex items-center gap-md text-micro text-gray-light uppercase tracking-widest mt-1">
                            <Clock size={12} />
                            <span>{new Date(reminder.due_datetime || reminder.due_date || '').toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: timezone })}</span>
                            <span>•</span>
                            <span className={reminder.priority === 'high' ? 'text-expense font-bold' : ''}>{t(`career_page.form.options.${reminder.priority}`)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => deleteReminder(reminder.id)} className="text-gray-light hover:text-expense p-2">
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Side Panel: Selected Date Details */}
          <div className="lg:col-span-4 space-y-xl">
             <div className="glass-card p-xl border-warm-gold/10">
                <h3 className="font-serif text-xl mb-xl">
                  {selectedDate.toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric', timeZone: timezone })}
                </h3>
                
                <div className="space-y-md">
                  {selectedDateReminders.length === 0 ? (
                    <p className="text-sm text-gray-light font-light italic opacity-60">{t('reminders_page.empty_date')}</p>
                  ) : (
                    selectedDateReminders.map(r => (
                      <div key={r.id} className="p-md rounded-lg bg-white/[0.02] border border-white/[0.03] space-y-sm">
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold ${
                            r.priority === 'high' ? 'bg-expense/20 text-expense' : 'bg-deep-sage/20 text-deep-sage'
                          }`}>
                            {t(`career_page.form.options.${r.priority}`)}
                          </span>
                          <span className="text-micro text-gray-light">{r.due_time}</span>
                        </div>
                        <p className="text-sm font-medium">{r.title}</p>
                      </div>
                    ))
                  )}
                  
                  <button 
                    onClick={openAddModal}
                    className="w-full py-md mt-md border border-dashed border-white/10 rounded-lg text-micro uppercase tracking-widest text-gray-light hover:text-warm-gold hover:border-warm-gold/40 transition-all"
                  >
                    {t('reminders_page.add_to_day')}
                  </button>
                </div>
             </div>
             
             {/* Weekly Context - Small Summary */}
             <div className="glass-card p-xl bg-gradient-to-br from-gray-strong to-warm-black">
                <h4 className="text-micro uppercase tracking-[0.3em] text-deep-sage font-bold mb-md">{t('reminders_page.weekly_focus')}</h4>
                <p className="text-sm font-light text-gray-very-light leading-relaxed">
                  {t('reminders_page.weekly_focus_desc').split('{count}').map((part, i, arr) => 
                    i === arr.length - 1 ? part : <React.Fragment key={i}>{part}<span className="text-warm-gold font-bold">{reminders.filter(r => r.status === 'pending').length}</span></React.Fragment>
                  )}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingReminder ? t('reminders_page.edit_reminder') : t('reminders_page.new_reminder_modal')}
        footer={
          <div className="pt-xl border-t border-white/5 flex gap-md">
            <Button variant="ghost" fullWidth onClick={() => setIsModalOpen(false)} disabled={isSaving}>{t('investment_page.cancel_upper')}</Button>
            <Button variant="primary" fullWidth onClick={handleSave} isLoading={isSaving} disabled={isSaving}>{t('reminders_page.save_reminder')}</Button>
          </div>
        }
      >
        <div className="space-y-xl py-md">
          <Input 
            label={t('reminders_page.form.title_label')} 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})}
            placeholder={t('reminders_page.form.title_placeholder')}
            className="bg-white/[0.03]"
          />
          <div className="grid grid-cols-2 gap-md">
            <Input 
              label={t('reminders_page.form.date')} 
              type="date" 
              value={form.dueDate} 
              onChange={e => setForm({...form, dueDate: e.target.value})}
              className="bg-white/[0.03]"
            />
            <Input 
              label={t('reminders_page.form.time')} 
              type="time" 
              value={form.dueTime} 
              onChange={e => setForm({...form, dueTime: e.target.value})}
              className="bg-white/[0.03]"
            />
          </div>
          <div>
            <label className="text-micro uppercase tracking-widest text-gray-light mb-sm block">{t('reminders_page.form.priority')}</label>
            <div className="flex gap-md">
              {['low', 'medium', 'high'].map(p => (
                <button
                  key={p}
                  onClick={() => setForm({...form, priority: p as any})}
                  className={`flex-1 py-2 rounded-md text-xs uppercase tracking-widest font-bold border transition-all ${
                    form.priority === p ? 'bg-warm-gold text-warm-black border-warm-gold' : 'bg-white/[0.02] border-white/10 text-gray-light'
                  }`}
                >
                  {t(`career_page.form.options.${p}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan waktu notifikasi */}
          <div>
            <label className="text-micro uppercase tracking-widest text-gray-light mb-sm block">{t('reminders_page.form.notify_label')}</label>
            <div className="flex flex-wrap gap-sm">
              {NOTIFY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleNotifyTime(opt.value)}
                  className={`px-md py-sm rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    form.notifyTimes.includes(opt.value)
                      ? 'bg-warm-gold/20 text-warm-gold border-warm-gold/50'
                      : 'bg-white/[0.02] border-white/10 text-gray-light hover:border-white/30'
                  }`}
                >
                  {form.notifyTimes.includes(opt.value) ? '✓ ' : ''}{opt.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-light mt-sm opacity-60">{t('reminders_page.form.notify_help')}</p>
          </div>
          <div className="space-y-sm">
            <label className="text-[10px] font-bold text-gray-light tracking-widest uppercase">{t('reminders_page.form.notes_label')}</label>
            <textarea
              placeholder={t('reminders_page.form.notes_placeholder')}
              rows={4}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-strong/40 border border-white/5 rounded-md p-lg text-sm text-soft-cream focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
