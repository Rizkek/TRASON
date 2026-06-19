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

export const insightQueries = {
  // Fetch insights by date range
  async getInsights(startDate: Date, endDate: Date, type?: string) {
    try {
    return await withAuthQuery(async (userId) => {
    let query = supabase
            .from('insights')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0]);
    if (type) {
            query = query.eq('type', type);
          }
    const { data, error } = await query.order('date', { ascending: false });
    if (error) {
            if (isOptionalTableMissingError(error, 'insights')) return [];
            throw error;
          }
    return data;
    });
    } catch (err) {
      logError(err, 'insightQueries.getInsights');
      throw handleQueryError(err);
    }
  },

  // Create insight (typically done by backend service)
  async createInsight(
    insight: Omit<Insight, 'id' | 'created_at' | 'updated_at'>
  ) {
    try {
      const { data, error } = await supabase
        .from('insights')
        .insert([insight])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'insightQueries.createInsight');
      throw handleQueryError(err);
    }
  },

  // Delete insight
  async deleteInsight(id: string) {
    try {
  return await withAuthQuery(async (userId) => {
  const { error } = await supabase
          .from('insights')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
  if (error) throw error;
  });
  } catch (err) {
      logError(err, 'insightQueries.deleteInsight');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== HABIT QUERIES ====================
 */


const OPTIONAL_TABLE_ERROR_CODES = new Set(['42P01', 'PGRST205', 'PGRST204']);
const formatQueryError = (error: any) => { const err = error as any; return [err.code, err.message, err.details, err.hint].filter(Boolean).join(' - ') || 'Unknown database error'; };
const isOptionalTableMissingError = (error: any, tableName: string) => { const err = error as any; const text = formatQueryError(error).toLowerCase(); return (err.code ? OPTIONAL_TABLE_ERROR_CODES.has(err.code) : false) || text.includes(tableName.toLowerCase()) || text.includes('schema cache') || text.includes('does not exist'); };
