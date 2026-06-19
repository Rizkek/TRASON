import {
  supabase,
  User,
  Category,
  Transaction,
  Activity,
  Habit,
  Reminder,
  Insight,
  UserPreferences
} from '../supabase/supabaseClient';
import { handleQueryError, logError } from '@/libs/apiErrors';
import type { DailyTask } from '@/types/database';
import { withAuthQuery } from "@/services/supabase/queryBuilder";

export const reminderQueries = {
  // Fetch pending reminders
  async getPendingReminders() {
    try {
    return await withAuthQuery(async (userId) => {
    const { data, error } = await supabase
            .from('reminders')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .is('deleted_at', null)
            .or('due_datetime.is.null,due_datetime.gte.now()')
            .order('due_datetime', { ascending: true });
    if (error) throw error;
    return data;
    });
    } catch (err) {
      logError(err, 'reminderQueries.getPendingReminders');
      throw handleQueryError(err);
    }
  },

  // Fetch reminders by date range
  async getReminders(startDate: Date, endDate: Date) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .gte('due_date', startDate.toISOString().split('T')[0])
          .lte('due_date', endDate.toISOString().split('T')[0])
          .order('due_date', { ascending: true });
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'reminderQueries.getReminders');
      throw handleQueryError(err);
    }
  },

  // Create reminder
  async createReminder(
    reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('reminders')
          .insert([{ ...reminder, user_id: userId }])
          .select()
          .single();
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'reminderQueries.createReminder');
      throw handleQueryError(err);
    }
  },

  // Update reminder
  async updateReminder(
    id: string,
    updates: Partial<Omit<Reminder, 'id' | 'user_id' | 'created_at'>>
  ) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('reminders')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'reminderQueries.updateReminder');
      throw handleQueryError(err);
    }
  },

  // Complete reminder
  async completeReminder(id: string) {
    try {
  return await withAuthQuery(async (userId) => {
  const data = await reminderQueries.updateReminder(id, { status: 'completed' });
  await supabase.from('reminder_logs').insert([{
          user_id: userId,
          reminder_id: id,
        }]);
  return data;
  });
  } catch (err) {
      logError(err, 'reminderQueries.completeReminder');
      throw handleQueryError(err);
    }
  },

  // Uncomplete reminder
  async uncompleteReminder(id: string) {
    try {
  return await withAuthQuery(async (userId) => {
  const data = await reminderQueries.updateReminder(id, { status: 'pending' });
  const { data: latestLog } = await supabase.from('reminder_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('reminder_id', id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();
  if (latestLog) {
          await supabase.from('reminder_logs').delete().eq('id', latestLog.id);
        }
  return data;
  });
  } catch (err) {
      logError(err, 'reminderQueries.uncompleteReminder');
      throw handleQueryError(err);
    }
  },

  // Delete reminder
  async deleteReminder(id: string) {
    try {
  return await withAuthQuery(async (userId) => {
  const { error } = await supabase
          .from('reminders')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId);
  if (error) throw error;
  });
  } catch (err) {
      logError(err, 'reminderQueries.deleteReminder');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== INSIGHT QUERIES ====================
 */

