'use client';

import { useCallback } from 'react';
import { investmentQueries } from '@/services/investmentQueries';
import {
  buildInvestmentTimelineText,
  calculatePortfolioSummary,
  fetchInvestmentQuotes,
  generateInvestmentInsights,
} from '@/services/investmentService';
import { InvestmentPosition } from '@/services/supabaseClient';
import { useInvestmentStore } from '@/store/investmentStore';
import { activityQueries } from '@/services/queries';

const buildTimelinePayload = (title: string, description: string) => ({
  title,
  description,
  category: 'Investment',
  start_time: new Date().toISOString(),
  duration_minutes: 10,
  metadata: { module: 'investment-analyst' },
});

export const useInvestment = () => {
  const store = useInvestmentStore();

  const syncDerivedState = useCallback(
    async (positions: InvestmentPosition[], refreshPrices = false) => {
      const quotes = refreshPrices ? await fetchInvestmentQuotes(positions) : {};
      const { calculatedPositions, summary } = calculatePortfolioSummary(positions, quotes);

      store.setCalculatedPositions(calculatedPositions);
      store.setSummary(summary);

      if (refreshPrices) {
        await Promise.all(
          calculatedPositions.map(async (position) => {
            const quote = quotes[position.id];
            if (!quote || quote.error) return;

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
              metadata: {
                symbol: quote.symbol,
                asset_type: quote.assetType,
                as_of: quote.asOf,
              },
            });
          })
        );

        store.setPositions(
          positions.map((position) => {
            const quote = quotes[position.id];
            return quote && !quote.error
              ? {
                  ...position,
                  last_price: quote.currentPrice,
                  last_price_change_pct: quote.changePercent24h ?? 0,
                  last_valued_at: quote.asOf,
                }
              : position;
          })
        );
      }

      if (positions.length > 0) {
        store.setInsights(await generateInvestmentInsights(summary, calculatedPositions));
      } else {
        store.setInsights(null);
      }

      return { calculatedPositions, summary };
    },
    [store]
  );

  const fetchPositions = useCallback(
    async (options?: { refreshPrices?: boolean }) => {
      store.setLoading(true);
      store.setError(null);
      try {
        const positions = await investmentQueries.getPositions();
        store.setPositions(positions);
        await syncDerivedState(positions, options?.refreshPrices ?? false);
        return positions;
      } catch (error) {
        store.setError(error instanceof Error ? error.message : 'Failed to load portfolio');
        throw error;
      } finally {
        store.setLoading(false);
      }
    },
    [store, syncDerivedState]
  );

  const refreshPortfolio = useCallback(async () => {
    store.setRefreshing(true);
    store.setError(null);
    try {
      const positions = store.positions.length ? store.positions : await investmentQueries.getPositions();
      if (!store.positions.length) {
        store.setPositions(positions);
      }
      return await syncDerivedState(positions, true);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to refresh portfolio');
      throw error;
    } finally {
      store.setRefreshing(false);
    }
  }, [store, syncDerivedState]);

  const createPosition = useCallback(
    async (
      data: Omit<
        InvestmentPosition,
        | 'id'
        | 'user_id'
        | 'created_at'
        | 'updated_at'
        | 'deleted_at'
        | 'last_price'
        | 'last_price_change_pct'
        | 'last_valued_at'
      >
    ) => {
      store.setError(null);
      const position = await investmentQueries.createPosition(data);
      const nextPositions = [position, ...store.positions];
      store.addPosition(position);
      await activityQueries.createActivity(
        buildTimelinePayload(
          buildInvestmentTimelineText(position, 'created'),
          `Tracked ${position.amount} units of ${position.symbol.toUpperCase()} at ${position.buy_price.toFixed(2)}.`
        )
      );
      await syncDerivedState(nextPositions, true);
      return position;
    },
    [store, syncDerivedState]
  );

  const updatePosition = useCallback(
    async (
      id: string,
      updates: Partial<
        Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
      >
    ) => {
      store.setError(null);
      const updated = await investmentQueries.updatePosition(id, updates);
      const nextPositions = store.positions.map((position) =>
        position.id === id ? updated : position
      );
      store.updatePosition(id, updated);
      await activityQueries.createActivity(
        buildTimelinePayload(
          buildInvestmentTimelineText(updated, 'updated'),
          `Adjusted ${updated.symbol.toUpperCase()} holding details in Investment Analyst.`
        )
      );
      await syncDerivedState(nextPositions, true);
      return updated;
    },
    [store, syncDerivedState]
  );

  const deletePosition = useCallback(
    async (id: string) => {
      store.setError(null);
      const target = store.positions.find((position) => position.id === id);
      await investmentQueries.deletePosition(id);
      const nextPositions = store.positions.filter((position) => position.id !== id);
      store.deletePosition(id);
      if (target) {
        await activityQueries.createActivity(
          buildTimelinePayload(
            buildInvestmentTimelineText(target, 'deleted'),
            `Removed ${target.symbol.toUpperCase()} from the active portfolio view.`
          )
        );
      }
      await syncDerivedState(nextPositions, false);
    },
    [store, syncDerivedState]
  );

  return {
    positions: store.positions,
    calculatedPositions: store.calculatedPositions,
    summary: store.summary,
    insights: store.insights,
    isLoading: store.isLoading,
    isRefreshing: store.isRefreshing,
    error: store.error,
    fetchPositions,
    refreshPortfolio,
    createPosition,
    updatePosition,
    deletePosition,
  };
};
