import { supabase } from '../supabase/supabaseClient';
import { handleQueryError, logError } from '@/libs/apiErrors';
import { withAuthQuery } from "@/services/supabase/queryBuilder";

export const analyticsQueries = {
  // Get task logs for the last 30 days
  async getTaskLogs30Days() {
    try {
    return await withAuthQuery(async (userId) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];
    const { data, error } = await supabase
            .from('daily_task_logs')
            .select('completed_date, task_id')
            .eq('user_id', userId)
            .gte('completed_date', dateStr);
    if (error) throw error;
    return data || [];
    });
    } catch (err) {
      logError(err, 'analyticsQueries.getTaskLogs30Days');
      throw handleQueryError(err);
    }
  },

  // Save the calculated Life Score (upsert for today)
  async saveLifeScore(scoreData: {
    finance_score: number;
    productivity_score: number;
    health_score: number;
    career_score: number;
    overall_score: number;
  }) {
    try {
  return await withAuthQuery(async (userId) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const { error } = await supabase
          .from('life_scores')
          .upsert({
            user_id: userId,
            calculated_at: todayStr,
            ...scoreData,
          }, {
            onConflict: 'user_id, calculated_at'
          });
  if (error) throw error;
  });
  } catch (err) {
      logError(err, 'analyticsQueries.saveLifeScore');
      throw handleQueryError(err);
    }
  },

  // Get today's Life Score and yesterday's for delta
  async getRecentLifeScores() {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('life_scores')
          .select('*')
          .eq('user_id', userId)
          .order('calculated_at', { ascending: false })
          .limit(2);
  if (error) throw error;
  return {
          today: data?.[0] || null,
          yesterday: data?.[1] || null,
        };
  });
  } catch (err) {
      logError(err, 'analyticsQueries.getRecentLifeScores');
      throw handleQueryError(err);
    }
  }
};
