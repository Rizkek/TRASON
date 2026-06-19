'use client';

import {
  supabase,
  InvestmentPosition,
  InvestmentPriceSnapshot
} from '../supabase/supabaseClient';
import { withAuthQuery } from "@/services/supabase/queryBuilder";

export const investmentQueries = {
  async getPositions() {
        return withAuthQuery(async (userId) => {
        const { data, error } = await supabase
              .from('investment_positions')
              .select('*')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []) as InvestmentPosition[];
        });
    },

  async createPosition(
    position: Omit<
      InvestmentPosition,
      | 'id'
      | 'user_id'
      | 'created_at'
      | 'updated_at'
      | 'deleted_at'
      | 'last_price'
      | 'last_price_change_pct'
      | 'last_valued_at'
    >
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('investment_positions')
            .insert([{ ...position, user_id: userId }])
            .select()
            .single();
      if (error) throw error;
      return data as InvestmentPosition;
      });
  },

  async updatePosition(
    id: string,
    updates: Partial<
      Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
    >
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('investment_positions')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
      if (error) throw error;
      return data as InvestmentPosition;
      });
  },

  async updatePositionMarketData(
    id: string,
    marketData: Pick<InvestmentPosition, 'last_price' | 'last_price_change_pct' | 'last_valued_at'>
  ) {
    return investmentQueries.updatePosition(id, marketData);
  },

  async deletePosition(id: string) {
      return withAuthQuery(async (userId) => {
      const { error } = await supabase
            .from('investment_positions')
            .update({
              deleted_at: new Date().toISOString(),
              is_active: false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId);
      if (error) throw error;
      });
  },

  async upsertPriceSnapshot(
    snapshot: Omit<InvestmentPriceSnapshot, 'id' | 'created_at' | 'user_id'>
  ) {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('investment_price_snapshots')
            .upsert([{ ...snapshot, user_id: userId }], {
              onConflict: 'position_id,snapshot_date',
            })
            .select()
            .single();
      if (error) throw error;
      return data as InvestmentPriceSnapshot;
      });
  },
};
