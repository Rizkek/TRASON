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

export const dailyTaskQueries = {
  // Fetch all tasks and lazily reset if today is a new day
  async getTodaysTasks(): Promise<DailyTask[]> {
    try {
    return await withAuthQuery(async (userId) => {
    const today = getTodayDateStr();
    const { data, error } = await supabase
            .from('daily_tasks')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });
    if (error) {
            // Table might not exist yet — return empty list gracefully
            if (
              error.code === '42P01' ||
              error.message?.includes('does not exist') ||
              error.message?.includes('relation')
            ) {
              return [];
            }
            throw error;
          }
    if (!data || data.length === 0) return [];
    const stale = data.filter((t) => t.last_reset_date !== today && t.completed_today);
    if (stale.length > 0) {
            const staleIds = stale.map((t) => t.id);
            await supabase
              .from('daily_tasks')
              .update({
                completed_today: false,
                last_reset_date: today,
                updated_at: new Date().toISOString(),
              })
              .in('id', staleIds)
              .eq('user_id', userId);

            // Return with reset applied locally (avoid a second fetch)
            return data.map((t) =>
              staleIds.includes(t.id)
                ? { ...t, completed_today: false, last_reset_date: today }
                : t
            );
          }
    return data;
    });
    } catch (err) {
      logError(err, 'dailyTaskQueries.getTodaysTasks');
      throw handleQueryError(err);
    }
  },

  // Create a new daily task template
  async createTask(
    task: Pick<DailyTask, 'title' | 'description' | 'category' | 'sort_order'>
  ): Promise<DailyTask> {
    try {
  return await withAuthQuery(async (userId) => {
  const today = getTodayDateStr();
  const { data, error } = await supabase
          .from('daily_tasks')
          .insert([
            {
              ...task,
              user_id: userId,
              completed_today: false,
              last_reset_date: today,
            },
          ])
          .select()
          .single();
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'dailyTaskQueries.createTask');
      throw handleQueryError(err);
    }
  },

  // Toggle today's completion status
  async toggleTask(id: string, completed: boolean): Promise<DailyTask> {
    try {
  return await withAuthQuery(async (userId) => {
  const today = getTodayDateStr();
  const { data, error } = await supabase
          .from('daily_tasks')
          .update({
            completed_today: completed,
            last_reset_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
  if (error) throw error;
  if (completed) {
          await supabase.from('daily_task_logs').upsert([{
            user_id: userId,
            task_id: id,
            completed_date: today,
          }], { onConflict: 'user_id, task_id, completed_date' });
        } else {
          await supabase.from('daily_task_logs')
            .delete()
            .eq('user_id', userId)
            .eq('task_id', id)
            .eq('completed_date', today);
        }
  try {
          const { count } = await supabase
            .from('daily_task_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('completed_date', today);

          const completedCount = count || 0;
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);

          const { data: existingActivity } = await supabase
            .from('activities')
            .select('id')
            .eq('user_id', userId)
            .eq('category', 'daily_tasks')
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString())
            .maybeSingle();

          if (completedCount > 0) {
            const title = `${completedCount} Daily Task${completedCount > 1 ? 's' : ''} Completed`;
            if (existingActivity) {
              await supabase.from('activities').update({ title, updated_at: new Date().toISOString() }).eq('id', existingActivity.id);
            } else {
              await supabase.from('activities').insert([{
                user_id: userId,
                title,
                category: 'daily_tasks',
                start_time: new Date().toISOString(),
                duration_minutes: 0,
              }]);
            }
          } else if (existingActivity) {
            await supabase.from('activities').delete().eq('id', existingActivity.id);
          }
        } catch (syncErr) {
          console.error('Failed to sync timeline:', syncErr);
        }
  return data;
  });
  } catch (err) {
      logError(err, 'dailyTaskQueries.toggleTask');
      throw handleQueryError(err);
    }
  },

  // Update task title/description
  async updateTask(
    id: string,
    updates: Partial<Pick<DailyTask, 'title' | 'description' | 'category' | 'sort_order'>>
  ): Promise<DailyTask> {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('daily_tasks')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'dailyTaskQueries.updateTask');
      throw handleQueryError(err);
    }
  },

  // Soft delete a task
  async deleteTask(id: string): Promise<void> {
    try {
  return await withAuthQuery(async (userId) => {
  const { error } = await supabase
          .from('daily_tasks')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId);
  if (error) throw error;
  });
  } catch (err) {
      logError(err, 'dailyTaskQueries.deleteTask');
      throw handleQueryError(err);
    }
  },
};


const getTodayDateStr = () => { const d = new Date(); const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; };
