import { supabase } from '../supabase/supabaseClient';
import { withAuthQuery } from '../supabase/queryBuilder';
import type { PersonalRecord } from '@/types/database';

export const personalRecordQueries = {
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .order('record_date', { ascending: false });
      if (error) throw error;
      return (data as PersonalRecord[]) || [];
    });
  },

  async checkAndSavePR(
    exerciseName: string,
    sportType: PersonalRecord['sport_type'],
    metricType: PersonalRecord['metric_type'],
    metricValue: number,
    metricUnit: string,
    sessionId?: string
  ): Promise<PersonalRecord | null> {
    return withAuthQuery(async (userId) => {
      const { data: existing } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .eq('metric_type', metricType)
        .order('metric_value', { ascending: false })
        .limit(1)
        .maybeSingle();

      const isBetter = !existing
        ? true
        : metricType === 'pace'
          ? metricValue < existing.metric_value
          : metricValue > existing.metric_value;

      if (!isBetter) return null;

      const { data, error } = await supabase
        .from('personal_records')
        .insert([{
          user_id: userId,
          workout_session_id: sessionId,
          exercise_name: exerciseName,
          sport_type: sportType,
          metric_type: metricType,
          metric_value: metricValue,
          metric_unit: metricUnit,
          record_date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;
      return data as PersonalRecord;
    });
  },

  async getPRBoard(): Promise<PersonalRecord[]> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('user_id', userId)
        .order('metric_value', { ascending: false });
      if (error) throw error;

      const best = new Map<string, PersonalRecord>();
      for (const pr of (data as PersonalRecord[])) {
        const key = `${pr.exercise_name}::${pr.metric_type}`;
        if (!best.has(key)) {
          best.set(key, pr);
        }
      }
      return Array.from(best.values());
    });
  },
};
