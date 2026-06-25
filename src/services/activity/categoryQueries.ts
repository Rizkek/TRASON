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

export const categoryQueries = {
  // Fetch all categories
  async getCategories() {
        return withAuthQuery(async (userId) => {
        const { data, error } = await supabase
              .from('categories')
              .select('*')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .order('sort_order', { ascending: true })
              .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
        });
    },

  // Create category
  async createCategory(
    category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('categories')
            .insert([{ ...category, user_id: userId }])
            .select()
            .single();
      if (error) throw error;
      return data;
      });
  },

  // Seed default categories
  async seedDefaultCategories(categories: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>[]) {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(categories.map(c => ({ ...c, user_id: userId })))
        .select();
      if (error) throw error;
      return data;
    });
  },

  // Update category
  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('categories')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
      if (error) throw error;
      return data;
      });
  },

  // Delete category
  async deleteCategory(id: string) {
      return withAuthQuery(async (userId) => {
      const { error } = await supabase
            .from('categories')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);
      if (error) throw error;
      });
  },
};

/**
 * ==================== TRANSACTION QUERIES ====================
 */

