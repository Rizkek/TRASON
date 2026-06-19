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

export const activityQueries = {
  // Fetch activities by date
  async getActivitiesByDate(date: Date) {
    try {
    return await withAuthQuery(async (userId) => {
    const dateStr = date.toISOString().split('T')[0];
    const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .gte('start_time', `${dateStr}T00:00:00`)
            .lte('start_time', `${dateStr}T23:59:59`)
            .order('start_time', { ascending: false });
    if (error) throw error;
    return data;
    });
    } catch (err) {
      logError(err, 'activityQueries.getActivitiesByDate');
      throw handleQueryError(err);
    }
  },

  // Fetch activities by date range
  async getActivities(startDate: Date, endDate: Date, limit: number = 50, offset: number = 0) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error, count } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
          .order('start_time', { ascending: false })
          .range(offset, offset + limit - 1);
  if (error) throw error;
  return { data, count };
  });
  } catch (err) {
      logError(err, 'activityQueries.getActivities');
      throw handleQueryError(err);
    }
  },

  // Create activity
  async createActivity(
    activity: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('activities')
          .insert([{ ...activity, user_id: userId }])
          .select()
          .single();
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'activityQueries.createActivity');
      throw handleQueryError(err);
    }
  },

  // Update activity
  async updateActivity(
    id: string,
    updates: Partial<Omit<Activity, 'id' | 'user_id' | 'created_at'>>
  ) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('activities')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'activityQueries.updateActivity');
      throw handleQueryError(err);
    }
  },

  // Delete activity
  async deleteActivity(id: string) {
    try {
  return await withAuthQuery(async (userId) => {
  const { error } = await supabase
          .from('activities')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId);
  if (error) throw error;
  });
  } catch (err) {
      logError(err, 'activityQueries.deleteActivity');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== REMINDER QUERIES ====================
 */

