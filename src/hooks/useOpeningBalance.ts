'use client';

import useSWR from 'swr';
import { transactionQueries } from '@/services/finance/transactionQueries';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { formatDateOnly } from '@/libs/date';

/** Balance carried into the period starting at `start`. The key starts with 'transactions', so any transaction change refreshes it. */
export function useOpeningBalance(start: Date) {
  const { data, isLoading } = useSWR(
    CACHE_KEYS.transactions.balanceBefore(formatDateOnly(start)),
    () => transactionQueries.getNetBalanceBefore(start),
    SWR_CONFIG_DASHBOARD
  );
  return { openingBalance: data ?? 0, isLoading };
}
