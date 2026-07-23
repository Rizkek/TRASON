import { supabase } from '../supabase/supabaseClient';
import { Budget } from '@/types/database';
import { handleQueryError, logError } from '@/libs/apiErrors';
import { withAuthQuery } from "@/services/supabase/queryBuilder";

export const budgetQueries = {
  async getBudgets() {
    try {
      return await withAuthQuery(async (userId) => {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;
        return data as Budget[];
      });
    } catch (err) {
      logError(err, 'budgetQueries.getBudgets');
      throw handleQueryError(err);
    }
  },

  async upsertBudget(budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }) {
    try {
      return await withAuthQuery(async (userId) => {
        const { data, error } = await supabase
          .from('budgets')
          .upsert({ 
            ...budget, 
            user_id: userId,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        return data as Budget;
      });
    } catch (err) {
      logError(err, 'budgetQueries.upsertBudget');
      throw handleQueryError(err);
    }
  },

  async deleteBudget(id: string) {
    try {
      return await withAuthQuery(async (userId) => {
        const { error } = await supabase
          .from('budgets')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        
        if (error) throw error;
        return true;
      });
    } catch (err) {
      logError(err, 'budgetQueries.deleteBudget');
      throw handleQueryError(err);
    }
  }
};
