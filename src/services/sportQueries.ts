
import {
  supabase,
  getCurrentUser,
  SportLog,
} from './supabaseClient';

/**
 * ==================== SPORT QUERIES ====================
 */

export const sportQueries = {
  // Fetch sport log by activity_id
  async getSportLogByActivityId(activityId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sport_logs')
      .select('*')
      .eq('activity_id', activityId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Fetch multiple sport logs by activity_ids
  async getSportLogsByActivityIds(activityIds: string[]) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    if (activityIds.length === 0) return [];

    const { data, error } = await supabase
      .from('sport_logs')
      .select('*')
      .in('activity_id', activityIds)
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  },

  // Create sport log
  async createSportLog(
    sportLog: Omit<SportLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sport_logs')
      .insert([{ ...sportLog, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update sport log
  async updateSportLog(
    id: string,
    updates: Partial<Omit<SportLog, 'id' | 'user_id' | 'activity_id' | 'created_at'>>
  ) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sport_logs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Soft delete sport log (consistent with all other tables)
  async deleteSportLog(id: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('sport_logs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Fetch sport logs by date range (excludes soft-deleted)
  async getSportLogsByDateRange(startDate: Date, endDate: Date) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sport_logs')
      .select('*, activities!inner(id, title, start_time, duration_minutes, category)')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('activities.start_time', startDate.toISOString())
      .lte('activities.start_time', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
