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
import { ApiError, handleQueryError, logError } from '@/libs/apiErrors';
import { hasDueTimePassed } from '@/libs/notificationLogic';
import { REMINDER_PAST_DUE_ERROR } from '@/libs/validation';
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
            .is('deleted_at', null)
            .order('due_datetime', { ascending: true })
            .limit(1000);
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
    // Every creation path (form, Smart Input, career sync) goes through here, so the rule lives here too.
    const dueAt = reminder.due_datetime ?? (reminder.due_date ? `${reminder.due_date}T${reminder.due_time || '23:59'}` : null);
    if (dueAt && hasDueTimePassed(dueAt)) {
      throw new ApiError(400, 'REMINDER_PAST_DUE', REMINDER_PAST_DUE_ERROR);
    }

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

