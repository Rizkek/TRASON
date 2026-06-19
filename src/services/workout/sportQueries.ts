
import {
  supabase,
  SportLog,
} from '../supabase/supabaseClient';
import { withAuthQuery } from "@/services/supabase/queryBuilder";

/**
 * ==================== SPORT QUERIES ====================
 */

export const sportQueries = {
  // Fetch sport log by activity_id
  async getSportLogByActivityId(activityId: string) {
        return withAuthQuery(async (userId) => {
        const { data, error } = await supabase
              .from('sport_logs')
              .select('*')
              .eq('activity_id', activityId)
              .eq('user_id', userId)
              .maybeSingle();
        if (error) throw error;
        return data;
        });
    },

  // Fetch multiple sport logs by activity_ids
  async getSportLogsByActivityIds(activityIds: string[]) {
      return withAuthQuery(async (userId) => {
      if (activityIds.length === 0) return [];
      const { data, error } = await supabase
            .from('sport_logs')
            .select('*')
            .in('activity_id', activityIds)
            .eq('user_id', userId);
      if (error) throw error;
      return data;
      });
  },

  // Create sport log
  async createSportLog(
    sportLog: Omit<SportLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('sport_logs')
            .insert([{ ...sportLog, user_id: userId }])
            .select()
            .single();
      if (error) throw error;
      return data;
      });
  },

  // Update sport log
  async updateSportLog(
    id: string,
    updates: Partial<Omit<SportLog, 'id' | 'user_id' | 'activity_id' | 'created_at'>>
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('sport_logs')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
      if (error) throw error;
      return data;
      });
  },

  // Soft delete sport log (consistent with all other tables)
  async deleteSportLog(id: string) {
      return withAuthQuery(async (userId) => {
      const { error } = await supabase
            .from('sport_logs')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);
      if (error) throw error;
      });
  },

  // Fetch sport logs by date range (excludes soft-deleted)
  async getSportLogsByDateRange(startDate: Date, endDate: Date) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('sport_logs')
            .select('*, activities!inner(id, title, start_time, duration_minutes, category)')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .gte('activities.start_time', startDate.toISOString())
            .lte('activities.start_time', endDate.toISOString())
            .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
      });
  },
};
