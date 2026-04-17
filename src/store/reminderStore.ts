import { create } from 'zustand';
import { Reminder } from '@/services/supabaseClient';

interface ReminderState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;

  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
  reminders: [],
  isLoading: false,
  error: null,

  setReminders: (reminders) => set({ reminders }),

  addReminder: (reminder) =>
    set((state) => ({
      reminders: [reminder, ...state.reminders].sort((a, b) => {
        const dateA = a.due_datetime || a.due_date || '';
        const dateB = b.due_datetime || b.due_date || '';
        return dateA.localeCompare(dateB);
      }),
    })),

  updateReminder: (id, updates) =>
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  deleteReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
