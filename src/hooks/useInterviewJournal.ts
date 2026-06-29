'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { interviewJournalQueries } from '@/services/analytics/interviewJournalQueries';
import { InterviewJournal } from '@/types/database';
import { useAuthStore } from '@/store/authStore';
import { sanitizeError } from '@/libs/validation';

export const useInterviewJournal = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const {
    data: journals = [],
    isLoading,
    error,
    mutate,
  } = useSWR(
    userId ? ['interview_journal', userId] : null,
    async () => interviewJournalQueries.getJournals(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  const createJournal = useCallback(
    async (input: Omit<InterviewJournal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const result = await interviewJournalQueries.createJournal(input);
      await mutate();
      return result;
    },
    [mutate]
  );

  const updateJournal = useCallback(
    async (id: string, updates: Partial<InterviewJournal>) => {
      const result = await interviewJournalQueries.updateJournal(id, updates);
      await mutate();
      return result;
    },
    [mutate]
  );

  const deleteJournal = useCallback(
    async (id: string) => {
      await interviewJournalQueries.deleteJournal(id);
      await mutate();
    },
    [mutate]
  );

  return {
    journals,
    isLoading,
    error: error ? sanitizeError(error) : null,
    createJournal,
    updateJournal,
    deleteJournal,
    mutate,
  };
};
