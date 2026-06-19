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

export const transactionQueries = {
  // Fetch transactions with filters
  async getTransactions(
    startDate?: Date,
    endDate?: Date,
    type?: 'income' | 'expense',
    limit: number = 50,
    offset: number = 0
  ) {
    try {
    return await withAuthQuery(async (userId) => {
    let query = supabase
            .from('transactions')
            .select(
              `
          id, user_id, category_id, title, description, amount, type, date, time,
          payment_method, tags, created_at, updated_at,
          categories:category_id(id, name, color, icon)
        `
            )
            .eq('user_id', userId)
            .is('deleted_at', null);
    if (startDate) {
            query = query.gte('date', startDate.toISOString().split('T')[0]);
          }
    if (endDate) {
            query = query.lte('date', endDate.toISOString().split('T')[0]);
          }
    if (type) {
            query = query.eq('type', type);
          }
    const { data, error, count } = await query
            .order('date', { ascending: false })
            .order('time', { ascending: false })
            .range(offset, offset + limit - 1);
    if (error) throw error;
    return { data, count };
    });
    } catch (err) {
      logError(err, 'transactionQueries.getTransactions');
      throw handleQueryError(err);
    }
  },

  // Create transaction
  async createTransaction(
    transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('transactions')
          .insert([{ ...transaction, user_id: userId }])
          .select()
          .single();
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'transactionQueries.createTransaction');
      throw handleQueryError(err);
    }
  },

  // Update transaction
  async updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>
  ) {
    try {
  return await withAuthQuery(async (userId) => {
  const { data, error } = await supabase
          .from('transactions')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
  if (error) throw error;
  return data;
  });
  } catch (err) {
      logError(err, 'transactionQueries.updateTransaction');
      throw handleQueryError(err);
    }
  },

  // Delete transaction (soft delete)
  async deleteTransaction(id: string) {
    try {
  return await withAuthQuery(async (userId) => {
  const { error } = await supabase
          .from('transactions')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId);
  if (error) throw error;
  });
  } catch (err) {
      logError(err, 'transactionQueries.deleteTransaction');
      throw handleQueryError(err);
    }
  },

  // Get transaction analytics
  async getAnalytics(startDate: Date, endDate: Date) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .rpc('get_transaction_analytics', {
              p_user_id: userId,
              p_start_date: startDate.toISOString().split('T')[0],
              p_end_date: endDate.toISOString().split('T')[0],
            });
      if (error) throw error;
      return data;
      });
  },

  // Get transactions summary by category
  async getSummaryByCategory(startDate: Date, endDate: Date) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('transactions')
            .select(
              `
        type,
        category_id,
        amount,
        categories:category_id(name, color, icon)
      `
            )
            .eq('user_id', userId)
            .is('deleted_at', null)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0]);
      if (error) throw error;
      interface TransactionSummaryRow {
            type: string;
            category: unknown;
            total: number;
            count: number;
          }
      const summary = data?.reduce(
            (acc: Record<string, TransactionSummaryRow>, trans) => {
              const key = `${trans.type}-${trans.category_id}`;
              if (!acc[key]) {
                acc[key] = {
                  type: trans.type,
                  category: trans.categories,
                  total: 0,
                  count: 0,
                };
              }
              acc[key].total += trans.amount;
              acc[key].count += 1;
              return acc;
            },
            {}
          );
      return Object.values(summary || {});
      });
  },
};

/**
 * ==================== ACTIVITY QUERIES ====================
 */

