'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useExchangeRates } from './useExchangeRates';
import { useUserPreferences } from './useUserPreferences';
import { investmentQueries } from '@/services/finance/investmentQueries';
import {
  buildInvestmentTimelineText,
  calculatePortfolioInCurrency,
  calculatePortfolioSummary,
  fetchInvestmentQuotes,
  generateInvestmentInsights,
} from '@/services/finance/investmentService';
import { InvestmentPosition } from '@/services/supabase/supabaseClient';
import {
  InvestmentInsightResponse,
  InvestmentPortfolioSummary,
  CalculatedInvestmentPosition,
} from '@/services/finance/investmentService';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { getProfileToday } from '@/libs/profileDate';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { getUserErrorMessage} from '@/libs/apiErrors';
import { executeMutation } from "@/libs/api/mutationBuilder";
import { invalidateKeys } from '@/libs/cacheInvalidation';

const invalidateInvestments = () => invalidateKeys(INVALIDATION_PATTERNS.onInvestmentChange(), 'investments');

const buildTimelinePayload = (title: string, description: string) => ({
  title,
  description,
  category: 'Investment',
  start_time: new Date().toISOString(),
  duration_minutes: 10,
  metadata: { module: 'investment-analyst' },
});

export interface UseInvestmentReturn {
  positions: InvestmentPosition[];
  calculatedPositions: CalculatedInvestmentPosition[];
  summary: InvestmentPortfolioSummary | null;
  insights: InvestmentInsightResponse | null;
  /** Positions left out of `summary` because no exchange rate was available for them. */
  unconvertedCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  userErrorMessage: string | null;
  refreshPortfolio: () => Promise<void>;
  createPosition: (data: Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'last_price' | 'last_price_change_pct' | 'last_valued_at'>) => Promise<InvestmentPosition | null>;
  updatePosition: (id: string, updates: Partial<Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>) => Promise<InvestmentPosition | null>;
  deletePosition: (id: string) => Promise<boolean>;
  refresh: () => Promise<InvestmentPosition[] | undefined>;
}

export const useInvestment = (): UseInvestmentReturn => {
  const { currency } = useUserPreferences();
  const { rates, isLoading: ratesLoading } = useExchangeRates();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use separate cache key for positions (stable data)
  const { data: positions, error: positionsError, isLoading: positionsLoading, mutate: mutatePositions } = useSWR(
    CACHE_KEYS.investments.positions(),
    async () => {
      return await executeMutation(
          (async () => {
        return await investmentQueries.getPositions();
          })(),
          'useInvestment.getPositions'
        );
    },
    SWR_CONFIG_DASHBOARD
  );

  // Derived data: calculated positions and summary. Waits for the rates, otherwise every USD position
  // briefly counts as unconverted.
  const calculatedData = useMemo(
    () => (positions && !ratesLoading ? calculatePortfolioInCurrency(positions, currency, rates) : null),
    [positions, currency, rates, ratesLoading]
  );

  // Use separate cache key for insights (calculated data)
  const { data: insights, error: insightsError, isLoading: insightsLoading } = useSWR<InvestmentInsightResponse | null>(
    calculatedData && calculatedData.calculatedPositions.length > 0 ? CACHE_KEYS.investments.insights : null,
    async () => {
      return await executeMutation(
        (async () => {
          if (!calculatedData) return null;
          return await generateInvestmentInsights(calculatedData.summary, calculatedData.calculatedPositions);
        })(),
        'useInvestment.getInsights',
        { throwOnError: false }
      );
    },
    SWR_CONFIG_DASHBOARD
  );

  const refreshPortfolio = useCallback(async () => {
    setIsRefreshing(true);
    return await executeMutation(
        (async () => {
      const pos = positions || await investmentQueries.getPositions();
      const quotes = await fetchInvestmentQuotes(pos);
      const { calculatedPositions: calcPos, summary: calcSummary } = calculatePortfolioSummary(pos, quotes);
      
      await Promise.all(
        calcPos.map(async (position) => {
          const quote = quotes[position.id];
          if (!quote || quote.error) return;
          // Update harga terkini di posisi (wajib)
          await investmentQueries.updatePositionMarketData(position.id, {
            last_price: quote.currentPrice,
            last_price_change_pct: quote.changePercent24h ?? 0,
            last_valued_at: quote.asOf,
          });
          // Simpan snapshot harga (opsional — skip kalau tabelnya belum ada)
          try {
            await investmentQueries.upsertPriceSnapshot({
              position_id: position.id,
              snapshot_date: getProfileToday(),
              price: quote.currentPrice,
              change_percent: quote.changePercent24h ?? 0,
              source: quote.source,
            });
          } catch {
            // Tabel investment_price_snapshots belum dibuat, skip saja
          }
        })
      );
      await mutatePositions();
        })(),
        'useInvestment.refreshPortfolio'
      ).finally(() => setIsRefreshing(false));
  }, [positions, mutatePositions]);

  const createPosition = useCallback(
    async (
      dataToCreate: Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'last_price' | 'last_price_change_pct' | 'last_valued_at'>
    ) => {
    return await executeMutation(
            (async () => {
          const position = await investmentQueries.createPosition(dataToCreate);
          await invalidateInvestments();
          return position;
            })(),
            'useInvestment.createPosition'
          );
  }, []);

  const updatePosition = useCallback(
    async (
      id: string,
      updates: Partial<Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
    ) => {
    return await executeMutation(
            (async () => {
          const updated = await investmentQueries.updatePosition(id, updates);
          await invalidateInvestments();
          return updated;
            })(),
            'useInvestment.updatePosition'
          );
  }, []);

  const deletePosition = useCallback(async (id: string) => {
    return await executeMutation(
        (async () => {
      await investmentQueries.deletePosition(id);
      await invalidateInvestments();
      return true;
        })(),
        'useInvestment.deletePosition'
      );
  }, []);

  // Combine loading states
  const isLoading = positionsLoading || insightsLoading || ratesLoading;

  // Combine errors
  const error = (positionsError || insightsError) as Error | null;

  // User-friendly error message
  const userErrorMessage = error ? getUserErrorMessage(error) : null;

  return {
    positions: positions || [],
    calculatedPositions: calculatedData?.calculatedPositions || [],
    summary: calculatedData?.summary || null,
    insights: insights || null,
    unconvertedCount: calculatedData?.unconvertedCount ?? 0,
    isLoading,
    isRefreshing,
    error,
    userErrorMessage,
    refreshPortfolio,
    createPosition,
    updatePosition,
    deletePosition,
    refresh: mutatePositions,
  };
};
