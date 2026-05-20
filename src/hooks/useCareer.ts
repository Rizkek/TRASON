'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { careerQueries } from '@/services/careerQueries';
import { CareerApplication } from '@/types/database';
import { useAuthStore } from '@/store/authStore';
import { sanitizeError } from '@/libs/validation';

export type CareerStats = {
  applied: number;
  reviewing: number;
  interview: number;
  offer: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  total: number;
  active: number; // applied + reviewing + interview + offer
};

function computeStats(applications: CareerApplication[]): CareerStats {
  const counts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const applied = counts['applied'] ?? 0;
  const reviewing = counts['reviewing'] ?? 0;
  const interview = counts['interview'] ?? 0;
  const offer = counts['offer'] ?? 0;
  const accepted = counts['accepted'] ?? 0;
  const rejected = counts['rejected'] ?? 0;
  const withdrawn = counts['withdrawn'] ?? 0;

  return {
    applied,
    reviewing,
    interview,
    offer,
    accepted,
    rejected,
    withdrawn,
    total: applications.length,
    active: applied + reviewing + interview + offer,
  };
}

export const useCareer = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const {
    data: applications = [],
    isLoading,
    error,
    mutate,
  } = useSWR(
    userId ? ['career', userId] : null,
    async () => careerQueries.getApplications(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  const stats = computeStats(applications);

  // Next upcoming interview (client-side from already-fetched data)
  const nextInterview = applications
    .filter(
      (a) =>
        a.status === 'interview' &&
        a.interview_date &&
        new Date(a.interview_date) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.interview_date!).getTime() - new Date(b.interview_date!).getTime()
    )[0] ?? null;

  const createApplication = useCallback(
    async (input: Omit<CareerApplication, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const result = await careerQueries.createApplication(input);
      await mutate();
      return result;
    },
    [mutate]
  );

  const updateApplication = useCallback(
    async (id: string, updates: Partial<CareerApplication>) => {
      const result = await careerQueries.updateApplication(id, updates);
      await mutate();
      return result;
    },
    [mutate]
  );

  const deleteApplication = useCallback(
    async (id: string) => {
      await careerQueries.deleteApplication(id);
      await mutate();
    },
    [mutate]
  );

  return {
    applications,
    stats,
    nextInterview,
    isLoading,
    error: error ? sanitizeError(error) : null,
    createApplication,
    updateApplication,
    deleteApplication,
    mutate,
  };
};
