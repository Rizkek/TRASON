'use client';

import {
  supabase,
  User,
  Category,
  Transaction,
  Activity,
  Habit,
  Reminder,
  Insight,
  UserPreferences,
  getCurrentUser,
} from './supabaseClient';
import { handleQueryError, logError } from '@/libs/apiErrors';

type AuthUserLike = Awaited<ReturnType<typeof getCurrentUser>>;

type QueryError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const OPTIONAL_TABLE_ERROR_CODES = new Set(['42P01', 'PGRST205', 'PGRST204']);

const formatQueryError = (error: unknown) => {
  const err = error as QueryError;
  return [err.code, err.message, err.details, err.hint].filter(Boolean).join(' - ') || 'Unknown database error';
};

const isOptionalTableMissingError = (error: unknown, tableName: string) => {
  const err = error as QueryError;
  const text = formatQueryError(error).toLowerCase();

  return (
    (err.code ? OPTIONAL_TABLE_ERROR_CODES.has(err.code) : false) ||
    text.includes(tableName.toLowerCase()) ||
    text.includes('schema cache') ||
    text.includes('does not exist')
  );
};

const buildUserProfilePayload = (user: NonNullable<AuthUserLike>) => ({
  id: user.id,
  email: user.email ?? '',
  first_name: user.user_metadata?.first_name ?? undefined,
  last_name: user.user_metadata?.last_name ?? undefined,
  email_verified: !!user.email_confirmed_at,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

/**
 * ==================== USER QUERIES ====================
 */

export const userQueries = {
  async ensureUserProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .upsert([buildUserProfilePayload(user)], { onConflict: 'id' })
      .select(
        `
        id, email, first_name, last_name, avatar_url, email_verified, phone, bio,
        created_at, updated_at,
        user_preferences(theme, language, currency, timezone, notifications_enabled, 
                        push_notifications_enabled, email_digest_enabled, digest_frequency)
      `
      )
      .maybeSingle();

    if (error) {
      logError(error, 'userQueries.ensureUserProfile');
      throw handleQueryError(error);
    }
    return data;
  },

  // Fetch user with preferences
  // Uses maybeSingle() to safely return null (instead of throwing) when no row exists.
  async getUserWithPreferences() {
    try {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select(
          `
          id, email, first_name, last_name, avatar_url, email_verified, phone, bio,
          created_at, updated_at,
          user_preferences(theme, language, currency, timezone, notifications_enabled, 
                          push_notifications_enabled, email_digest_enabled, digest_frequency)
        `
        )
        .eq('id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;

      // Auto-create user row if it doesn't exist yet (e.g. first login after sign-up)
      if (!data) {
        return userQueries.ensureUserProfile();
      }

      return data;
    } catch (err) {
      logError(err, 'userQueries.getUserWithPreferences');
      throw handleQueryError(err);
    }
  },

  // Update user profile
  async updateUserProfile(
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'userQueries.updateUserProfile');
      throw handleQueryError(err);
    }
  },

  // Update user preferences
  async updateUserPreferences(updates: Partial<UserPreferences>) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          [{ user_id: user.id, ...updates, updated_at: new Date().toISOString() }],
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'userQueries.updateUserPreferences');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== CATEGORY QUERIES ====================
 */

export const categoryQueries = {
  // Fetch all categories
  async getCategories() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create category
  async createCategory(
    category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update category
  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>
  ) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete category
  async deleteCategory(id: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

/**
 * ==================== TRANSACTION QUERIES ====================
 */

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
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('transactions')
        .select(
          `
          id, user_id, category_id, title, description, amount, type, date, time,
          payment_method, tags, created_at, updated_at,
          categories:category_id(id, name, color, icon)
        `
        )
        .eq('user_id', user.id)
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
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'transactionQueries.updateTransaction');
      throw handleQueryError(err);
    }
  },

  // Delete transaction (soft delete)
  async deleteTransaction(id: string) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      logError(err, 'transactionQueries.deleteTransaction');
      throw handleQueryError(err);
    }
  },

  // Get transaction analytics
  async getAnalytics(startDate: Date, endDate: Date) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .rpc('get_transaction_analytics', {
        p_user_id: user.id,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0],
      });

    if (error) throw error;
    return data;
  },

  // Get transactions summary by category
  async getSummaryByCategory(startDate: Date, endDate: Date) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

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
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) throw error;

    // Group and aggregate on client side
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
  },
};

/**
 * ==================== ACTIVITY QUERIES ====================
 */

export const activityQueries = {
  // Fetch activities by date
  async getActivitiesByDate(date: Date) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const dateStr = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lt('start_time', `${dateStr}T23:59:59`)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'activityQueries.getActivitiesByDate');
      throw handleQueryError(err);
    }
  },

  // Fetch activities by date range
  async getActivities(startDate: Date, endDate: Date, limit: number = 50, offset: number = 0) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error, count } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, count };
    } catch (err) {
      logError(err, 'activityQueries.getActivities');
      throw handleQueryError(err);
    }
  },

  // Create activity
  async createActivity(
    activity: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('activities')
        .insert([{ ...activity, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'activityQueries.createActivity');
      throw handleQueryError(err);
    }
  },

  // Update activity
  async updateActivity(
    id: string,
    updates: Partial<Omit<Activity, 'id' | 'user_id' | 'created_at'>>
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('activities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'activityQueries.updateActivity');
      throw handleQueryError(err);
    }
  },

  // Delete activity
  async deleteActivity(id: string) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('activities')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      logError(err, 'activityQueries.deleteActivity');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== REMINDER QUERIES ====================
 */

export const reminderQueries = {
  // Fetch pending reminders
  async getPendingReminders() {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .is('deleted_at', null)
        .or('due_datetime.is.null,due_datetime.gte.now()')
        .order('due_datetime', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'reminderQueries.getPendingReminders');
      throw handleQueryError(err);
    }
  },

  // Fetch reminders by date range
  async getReminders(startDate: Date, endDate: Date) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .gte('due_date', startDate.toISOString().split('T')[0])
        .lte('due_date', endDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'reminderQueries.getReminders');
      throw handleQueryError(err);
    }
  },

  // Create reminder
  async createReminder(
    reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert([{ ...reminder, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'reminderQueries.createReminder');
      throw handleQueryError(err);
    }
  },

  // Update reminder
  async updateReminder(
    id: string,
    updates: Partial<Omit<Reminder, 'id' | 'user_id' | 'created_at'>>
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'reminderQueries.updateReminder');
      throw handleQueryError(err);
    }
  },

  // Complete reminder
  async completeReminder(id: string) {
    try {
      return await reminderQueries.updateReminder(id, { status: 'completed' });
    } catch (err) {
      logError(err, 'reminderQueries.completeReminder');
      throw handleQueryError(err);
    }
  },

  // Delete reminder
  async deleteReminder(id: string) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reminders')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      logError(err, 'reminderQueries.deleteReminder');
      throw handleQueryError(err);
    }
  },
};

/**
 * ==================== INSIGHT QUERIES ====================
 */

export const insightQueries = {
  // Fetch insights by date range
  async getInsights(startDate: Date, endDate: Date, type?: string) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
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
};

/**
 * ==================== HABIT QUERIES ====================
 */

export const habitQueries = {
  // Fetch all habits
  async getHabits() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('preferred_hour', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create habit
  async createHabit(
    habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .insert([{ ...habit, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update habit
  async updateHabit(
    id: string,
    updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>
  ) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('habits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete habit
  async deleteHabit(id: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('habits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

/**
 * ==================== BATCH OPERATIONS ====================
 */

export const batchQueries = {
  // Delete multiple transactions
  async deleteTransactions(ids: string[]) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', ids)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      logError(err, 'batchQueries.deleteTransactions');
      throw handleQueryError(err);
    }
  },

  // Archive old transactions (soft delete)
  async archiveOldTransactions(beforeDate: Date) {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .lt('date', beforeDate.toISOString().split('T')[0]);

      if (error) throw error;
      return data;
    } catch (err) {
      logError(err, 'batchQueries.archiveOldTransactions');
      throw handleQueryError(err);
    }
  },
};
