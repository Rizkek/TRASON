import { supabase } from '../supabase/supabaseClient';
import { Subscription } from '@/types/database';
import { withAuthQuery } from "@/services/supabase/queryBuilder";

export const subscriptionQueries = {
  // Fetch all subscriptions
  async getSubscriptions() {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          categories:category_id (id, name, color, icon)
        `)
        .eq('user_id', userId)
        .order('next_billing_date', { ascending: true });
      if (error) throw error;
      return data;
    });
  },

  // Create subscription
  async createSubscription(
    subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...subscription, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  // Update subscription
  async updateSubscription(
    id: string,
    updates: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>
  ) {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  // Delete subscription
  async deleteSubscription(id: string) {
    return withAuthQuery(async (userId) => {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    });
  },
};
