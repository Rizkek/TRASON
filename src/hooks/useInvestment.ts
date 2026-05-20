'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { investmentQueries } from '@/services/investmentQueries';
import {
  buildInvestmentTimelineText,
  calculatePortfolioSummary,
  fetchInvestmentQuotes,
  generateInvestmentInsights,
} from '@/services/investmentService';
import { InvestmentPosition } from '@/services/supabaseClient';
import {
  InvestmentInsightResponse,
  InvestmentPortfolioSummary,
  CalculatedInvestmentPosition,
} from '@/services/investmentService';
import { activityQueries } from '@/services/queries';
import { SWR_CONFIG } from '@/config/swr';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { handleQueryError, getUserErrorMessage, logError } from '@/libs/apiErrors';

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
  // Use separate cache key for positions (stable data)
  const { data: positions, error: positionsError, isLoading: positionsLoading, mutate: mutatePositions } = useSWR(
    CACHE_KEYS.investments.positions(),
    async () => {
      try {
        return await investmentQueries.getPositions();
      } catch (err) {
        logError(err, 'useInvestment.getPositions');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG
  );

  // Derived data: calculated positions and summary
  const calculatedData = positions ? calculatePortfolioSummary(positions, {}) : null;

  // Use separate cache key for insights (calculated data)
  const { data: insights, error: insightsError, isLoading: insightsLoading } = useSWR<InvestmentInsightResponse | null>(
    positions && positions.length > 0 ? CACHE_KEYS.investments.insights : null,
    async () => {
      try {
        if (!calculatedData) return null;
        return await generateInvestmentInsights(calculatedData.summary, calculatedData.calculatedPositions);
      } catch (err) {
        logError(err, 'useInvestment.getInsights');
        // Insights failure should not block the whole hook
        return null;
      }
    },
    SWR_CONFIG
  );

  const refreshPortfolio = useCallback(async () => {
    try {
      // Force fetch latest external API data
      const pos = positions || await investmentQueries.getPositions();
      const quotes = await fetchInvestmentQuotes(pos);
      const { calculatedPositions: calcPos, summary: calcSummary } = calculatePortfolioSummary(pos, quotes);

      // Update latest values back to database
      await Promise.all(
        calcPos.map(async (position) => {
          const quote = quotes[position.id];
          if (!quote || quote.error) return;
          try {
            await investmentQueries.updatePositionMarketData(position.id, {
              last_price: quote.currentPrice,
              last_price_change_pct: quote.changePercent24h ?? 0,
              last_valued_at: quote.asOf,
            });
            await investmentQueries.upsertPriceSnapshot({
              position_id: position.id,
              snapshot_date: new Date().toISOString().split('T')[0],
              price: quote.currentPrice,
              change_percent: quote.changePercent24h ?? 0,
              source: quote.source,
              metadata: { symbol: quote.symbol, asset_type: quote.assetType, as_of: quote.asOf }
            });
          } catch (err) {
            logError(err, `useInvestment.refreshPortfolio.position.${position.id}`);
            // Continue even if one position update fails
          }
        })
      );

      // Revalidate positions cache
      await mutatePositions();
    } catch (err) {
      logError(err, 'useInvestment.refreshPortfolio');
      throw handleQueryError(err);
    }
  }, [positions, mutatePositions]);

  const createPosition = useCallback(
    async (
      dataToCreate: Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'last_price' | 'last_price_change_pct' | 'last_valued_at'>
    ) => {
    try {
      const position = await investmentQueries.createPosition(dataToCreate);

      // Removed automatic timeline logging per user request

      // Cascade invalidation
      const keysToInvalidate = INVALIDATION_PATTERNS.onInvestmentChange();
      await Promise.all(keysToInvalidate.map(k => {
        if (typeof k === 'string') {
          return globalMutate(k);
        }
        return globalMutate(
          (key) => Array.isArray(key) && key[0] === 'investments',
          undefined,
          { revalidate: true }
        );
      }));

      return position;
    } catch (err) {
      logError(err, 'useInvestment.createPosition');
      throw handleQueryError(err);
    }
  }, []);

  const updatePosition = useCallback(
    async (
      id: string,
      updates: Partial<Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
    ) => {
    try {
      const updated = await investmentQueries.updatePosition(id, updates);

      // Removed automatic timeline logging per user request

      // Cascade invalidation
      const keysToInvalidate = INVALIDATION_PATTERNS.onInvestmentChange();
      await Promise.all(keysToInvalidate.map(k => {
        if (typeof k === 'string') {
          return globalMutate(k);
        }
        return globalMutate(
          (key) => Array.isArray(key) && key[0] === 'investments',
          undefined,
          { revalidate: true }
        );
      }));

      return updated;
    } catch (err) {
      logError(err, 'useInvestment.updatePosition');
      throw handleQueryError(err);
    }
  }, []);

  const deletePosition = useCallback(async (id: string) => {
    try {
      // Get position before deleting for timeline logging
      const target = positions?.find(p => p.id === id);

      await investmentQueries.deletePosition(id);

      // Removed automatic timeline logging per user request

      // Cascade invalidation
      const keysToInvalidate = INVALIDATION_PATTERNS.onInvestmentChange();
      await Promise.all(keysToInvalidate.map(k => {
        if (typeof k === 'string') {
          return globalMutate(k);
        }
        return globalMutate(
          (key) => Array.isArray(key) && key[0] === 'investments',
          undefined,
          { revalidate: true }
        );
      }));

      return true;
    } catch (err) {
      logError(err, 'useInvestment.deletePosition');
      throw handleQueryError(err);
    }
  }, [positions]);

  // Combine loading states
  const isLoading = positionsLoading || insightsLoading;
  const isRefreshing = false; // Not tracking revalidation state separately

  // Combine errors
  const error = (positionsError || insightsError) as Error | null;

  // User-friendly error message
  const userErrorMessage = error ? getUserErrorMessage(error) : null;

  return {
    positions: positions || [],
    calculatedPositions: calculatedData?.calculatedPositions || [],
    summary: calculatedData?.summary || null,
    insights: insights || null,
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
