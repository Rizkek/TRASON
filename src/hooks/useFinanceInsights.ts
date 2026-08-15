'use client';

import useSWR from 'swr';
import { getFinanceInsights } from '@/services/insights/finance';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';

export function useFinanceInsights() {
  const { data, isLoading, error } = useSWR(
    ['finance-insights'],
    async () => {
      return await getFinanceInsights();
    },
    { ...SWR_CONFIG_DASHBOARD, revalidateOnFocus: false }
  );

  return {
    insights: data || [],
    isLoading,
    error
  };
}
