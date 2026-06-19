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

export const batchQueries = {
  // Delete multiple transactions
  async deleteTransactions(ids: string[]) {
    try {
    return await withAuthQuery(async (userId) => {
    const { error } = await supabase
            .from('transactions')
            .update({ deleted_at: new Date().toISOString() })
            .in('id', ids)
            .eq('user_id', userId);
    if (error) throw error;
    });
    } catch (err) {
      logError(err, 'batchQueries.deleteTransactions');
      throw handleQueryError(err);
    }
  },

  // Archive old transactions (soft delete)
  async archiveOldTransactions(beforeDate: Date) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('transactions')
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', userId)
          .is('deleted_at', null)
          .lt('date', beforeDate.toISOString().split('T')[0]);
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'batchQueries.archiveOldTransactions');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== DAILY TASK QUERIES ====================
 * Daily reset checklist — tasks are permanent templates, only
 * completed_today resets each day (lazy reset on first fetch).
 */

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

