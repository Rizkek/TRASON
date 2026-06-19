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

export const habitQueries = {
  // Fetch all habits
  async getHabits() {
        return withAuthQuery(async (userId) => {
        const { data, error } = await supabase
              .from('habits')
              .select('*')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .order('preferred_hour', { ascending: true });
        if (error) throw error;
        return data;
        });
    },

  // Create habit
  async createHabit(
    habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('habits')
            .insert([{ ...habit, user_id: userId }])
            .select()
            .single();
      if (error) throw error;
      return data;
      });
  },

  // Update habit
  async updateHabit(
    id: string,
    updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('habits')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
      if (error) throw error;
      return data;
      });
  },

  // Delete habit
  async deleteHabit(id: string) {
      return withAuthQuery(async (userId) => {
      const { error } = await supabase
            .from('habits')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);
      if (error) throw error;
      });
  },

  // Toggle habit completion for today
  async toggleHabit(id: string, completed: boolean) {
    try {
  return await withAuthQuery(async (userId) => {
  const today = getTodayDateStr();
  if (completed) {
          await supabase.from('habit_logs').upsert([{
            user_id: userId,
            habit_id: id,
            completed_date: today,
          }], { onConflict: 'user_id, habit_id, completed_date' });
        } else {
          await supabase.from('habit_logs')
            .delete()
            .eq('user_id', userId)
            .eq('habit_id', id)
            .eq('completed_date', today);
        }
  });
  } catch (err) {
      logError(err, 'habitQueries.toggleHabit');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== BATCH OPERATIONS ====================
 */


const getTodayDateStr = () => { const d = new Date(); const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; };
