import { supabase } from '../supabase/supabaseClient';
import { withAuthQuery } from '../supabase/queryBuilder';
import type { WorkoutSession } from '@/types/database';

export const workoutSessionQueries = {
  async getSessions(startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .gte('session_date', startDate.toISOString().split('T')[0])
        .lte('session_date', endDate.toISOString().split('T')[0])
        .order('session_date', { ascending: false });
      if (error) throw error;
      return (data as WorkoutSession[]) || [];
    });
  },

  async getRecentSessions(limit = 10): Promise<WorkoutSession[]> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('session_date', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as WorkoutSession[]) || [];
    });
  },

  async logSession(session: Omit<WorkoutSession, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<WorkoutSession> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert([{ ...session, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data as WorkoutSession;
    });
  },

  async updateSession(sessionId: string, updates: Partial<Omit<WorkoutSession, 'id' | 'user_id' | 'created_at'>>): Promise<WorkoutSession> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data as WorkoutSession;
    });
  },

  async deleteSession(sessionId: string): Promise<void> {
    return withAuthQuery(async (userId) => {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', userId);
      if (error) throw error;
    });
  },
};
