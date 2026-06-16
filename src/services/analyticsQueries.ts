import { supabase, getCurrentUser } from './supabaseClient';
import { handleQueryError, logError } from '@/libs/apiErrors';

export const analyticsQueries = {
  // Get task logs for the last 30 days
  async getTaskLogs30Days() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_task_logs')
        .select('completed_date, task_id')
        .eq('user_id', user.id)
        .gte('completed_date', dateStr);

      if (error) throw error;
      return data || [];
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
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const todayStr = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('life_scores')
        .upsert({
          user_id: user.id,
          calculated_at: todayStr,
          ...scoreData,
        }, {
          onConflict: 'user_id, calculated_at'
        });

      if (error) throw error;
    } catch (err) {
      logError(err, 'analyticsQueries.saveLifeScore');
      throw handleQueryError(err);
    }
  },

  // Get today's Life Score and yesterday's for delta
  async getRecentLifeScores() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('life_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(2);

      if (error) throw error;
      return {
        today: data?.[0] || null,
        yesterday: data?.[1] || null,
      };
    } catch (err) {
      logError(err, 'analyticsQueries.getRecentLifeScores');
      throw handleQueryError(err);
    }
  }
};
