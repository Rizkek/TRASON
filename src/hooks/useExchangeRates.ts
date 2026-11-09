'use client';

import useSWR from 'swr';
import { SWR_CONFIG_STABLE } from '@/config/swr';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { fetchExchangeRates } from '@/libs/exchange';

export function useExchangeRates() {
  const { data, isLoading } = useSWR(CACHE_KEYS.exchangeRates, fetchExchangeRates, SWR_CONFIG_STABLE);
  return { rates: data?.rates ?? null, isLoading };
}
