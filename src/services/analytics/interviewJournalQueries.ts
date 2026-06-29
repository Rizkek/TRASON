'use client';

import { supabase } from '../supabase/supabaseClient';
import { InterviewJournal } from '@/types/database';
import { withAuthQuery } from "@/services/supabase/queryBuilder";

type CreateJournalInput = Omit<InterviewJournal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>;
type UpdateJournalInput = Partial<Omit<InterviewJournal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

function isTableNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; status?: number; details?: string };
  return (
    e.status === 404 ||
    e.code === 'PGRST200' ||
    (typeof e.message === 'string' &&
      (e.message.includes('relation') || e.message.includes('interview_journal')) &&
      e.message.includes('does not exist'))
  );
}

export const interviewJournalQueries = {
  async getJournals(): Promise<InterviewJournal[]> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('interview_journal')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('interview_date', { ascending: false });
        
      if (error) {
        if (isTableNotFound(error)) {
          console.warn('[interviewJournalQueries] interview_journal table not found. Please apply the migration.');
          return [];
        }
        throw error;
      }
      return data ?? [];
    });
  },

  async createJournal(input: CreateJournalInput): Promise<InterviewJournal> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('interview_journal')
        .insert([{ ...input, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  async updateJournal(id: string, updates: UpdateJournalInput): Promise<InterviewJournal> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('interview_journal')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  async deleteJournal(id: string): Promise<void> {
    return withAuthQuery(async (userId) => {
      const { error } = await supabase
        .from('interview_journal')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    });
  },
};
