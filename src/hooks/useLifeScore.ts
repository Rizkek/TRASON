'use client';

/**
 * useLifeScore — SWR hook that computes the Life Score
 * from all existing module hooks. Zero DB round-trips needed
 * beyond what's already being fetched for the dashboard.
 */

import useSWR from 'swr';
import { LifeScoreResult } from '@/libs/analytics/lifeScore';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';

export function useLifeScore(): {
  lifeScore: LifeScoreResult | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, error, isLoading } = useSWR<{ lifeScore: LifeScoreResult }>(
    '/api/analytics/life-score',
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch life score');
      return res.json();
    },
    {
      ...SWR_CONFIG_DASHBOARD,
      refreshInterval: 300000, // 5 minutes
      dedupingInterval: 300000,
    }
  );

  return {
    lifeScore: data?.lifeScore || null,
    isLoading,
    error: error as Error | null,
  };
}
