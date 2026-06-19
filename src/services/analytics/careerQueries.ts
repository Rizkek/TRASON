'use client';

import { supabase } from '../supabase/supabaseClient';
import { CareerApplication } from '@/types/database';
import { withAuthQuery } from "@/services/supabase/queryBuilder";

type CreateCareerInput = Omit<CareerApplication, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>;
type UpdateCareerInput = Partial<Omit<CareerApplication, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/**
 * Detect Supabase 404 = table not found (migration not yet applied).
 * Instead of crashing, return empty results and log a warning.
 */
function isTableNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; status?: number; details?: string };
  return (
    e.status === 404 ||
    e.code === 'PGRST200' ||
    (typeof e.message === 'string' &&
      (e.message.includes('relation') || e.message.includes('career_applications')) &&
      e.message.includes('does not exist'))
  );
}

export const careerQueries = {
  /** Fetch all non-deleted applications for the current user */
  async getApplications(): Promise<CareerApplication[]> {
        return withAuthQuery(async (userId) => {
        const { data, error } = await supabase
              .from('career_applications')
              .select('*')
              .eq('user_id', userId)
              .is('deleted_at', null)
              .order('applied_date', { ascending: false });
        if (error) {
              if (isTableNotFound(error)) {
                console.warn('[careerQueries] career_applications table not found. Run migration 004_career_applications.sql in Supabase Dashboard.');
                return [];
              }
              throw error;
            }
        return data ?? [];
        });
    },

  /** Create a new application */
  async createApplication(input: CreateCareerInput): Promise<CareerApplication> {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('career_applications')
            .insert([{ ...input, user_id: userId }])
            .select()
            .single();
      if (error) throw error;
      return data;
      });
  },

  /** Update an existing application */
  async updateApplication(id: string, updates: UpdateCareerInput): Promise<CareerApplication> {
      return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
            .from('career_applications')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
      if (error) throw error;
      return data;
      });
  },

  /** Soft delete an application */
  async deleteApplication(id: string): Promise<void> {
      return withAuthQuery(async (userId) => {
      const { error } = await supabase
            .from('career_applications')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);
      if (error) throw error;
      });
  },
};
