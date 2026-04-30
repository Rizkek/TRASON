import { useCallback } from 'react';
import useSWR from 'swr';
import { investmentQueries } from '@/services/investmentQueries';
import {
  buildInvestmentTimelineText,
  calculatePortfolioSummary,
  fetchInvestmentQuotes,
  generateInvestmentInsights,
} from '@/services/investmentService';
import { InvestmentPosition } from '@/services/supabaseClient';
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
  const { data, error, isLoading, mutate, isValidating: isRefreshing } = useSWR(
    'investments',
    async () => {
      const pos = await investmentQueries.getPositions();
      // Saat fetch standar (tanpa perintah paksa), kita hitung summary dengan nilai harga 
      // yang tersimpan terakhir di Database sehingga ringan di memori
      const { calculatedPositions: calcPos, summary: calcSummary } = calculatePortfolioSummary(pos, {});
      const insights = pos.length > 0 ? await generateInvestmentInsights(calcSummary, calcPos) : null;
      
      return { positions: pos, calculatedPositions: calcPos, summary: calcSummary, insights };
    },
    { 
      revalidateOnFocus: true,
      dedupingInterval: 10000 // Beri jeda 10 detik agar tidak nge-spam portofolio
    }
  );

  const refreshPortfolio = useCallback(async () => {
      // Force mengambil data teranyar ke API Eksternal
      const pos = await investmentQueries.getPositions();
      const quotes = await fetchInvestmentQuotes(pos);
      const { calculatedPositions: calcPos, summary: calcSummary } = calculatePortfolioSummary(pos, quotes);
      
      // Update nilai terbaru kembali ke database
      await Promise.all(
          calcPos.map(async (position) => {
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
                metadata: { symbol: quote.symbol, asset_type: quote.assetType, as_of: quote.asOf }
             });
          })
      );
      
      const insights = pos.length > 0 ? await generateInvestmentInsights(calcSummary, calcPos) : null;
      // Beritahu global states bahwa harga baru tercetak!
      await mutate({ positions: pos, calculatedPositions: calcPos, summary: calcSummary, insights }, true);
  }, [mutate]);

  const createPosition = useCallback(
    async (
      dataToCreate: Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'last_price' | 'last_price_change_pct' | 'last_valued_at'>
    ) => {
    const position = await investmentQueries.createPosition(dataToCreate);
    await activityQueries.createActivity(
      buildTimelinePayload(
        buildInvestmentTimelineText(position as any, 'created'),
        `Tracked ${position.amount} units of ${position.symbol.toUpperCase()} at ${position.buy_price.toFixed(2)}.`
      )
    );
    await mutate();
    return position;
  }, [mutate]);

  const updatePosition = useCallback(
    async (
      id: string, 
      updates: Partial<Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
    ) => {
    const updated = await investmentQueries.updatePosition(id, updates);
    await activityQueries.createActivity(
      buildTimelinePayload(
        buildInvestmentTimelineText(updated as any, 'updated'),
        `Adjusted ${updated.symbol.toUpperCase()} holding details in Investment Analyst.`
      )
    );
    await mutate();
    return updated;
  }, [mutate]);

  const deletePosition = useCallback(async (id: string) => {
    const target = data?.positions?.find(p => p.id === id);
    await investmentQueries.deletePosition(id);
    if (target) {
      await activityQueries.createActivity(
        buildTimelinePayload(
          buildInvestmentTimelineText(target as any, 'deleted'),
          `Removed ${target.symbol.toUpperCase()} from the active portfolio view.`
        )
      );
    }
    await mutate();
  }, [data, mutate]);

  return {
    positions: data?.positions || [],
    calculatedPositions: data?.calculatedPositions || [],
    summary: data?.summary || null,
    insights: data?.insights || null,
    isLoading,
    isRefreshing,
    error,
    refreshPortfolio,
    createPosition,
    updatePosition,
    deletePosition,
  };
};
