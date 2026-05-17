'use client';

import { formatCurrency } from '@/libs/format';
import { InvestmentPosition } from '@/services/supabaseClient';

export type InvestmentAssetType = 'stock' | 'crypto' | 'gold';

export interface InvestmentQuote {
  symbol: string;
  assetType: InvestmentAssetType;
  currentPrice: number;
  changePercent24h?: number;
  source: 'alphavantage' | 'coingecko' | 'manual';
  asOf: string;
  error?: string;
}

export interface CalculatedInvestmentPosition extends InvestmentPosition {
  current_price: number;
  current_value: number;
  cost_basis: number;
  profit_loss: number;
  percentage_change: number;
  day_change_value: number;
  day_change_percent: number;
}

export interface InvestmentPortfolioSummary {
  totalCost: number;
  totalValue: number;
  totalProfitLoss: number;
  totalChangePercent: number;
  dailyChangeValue: number;
  dailyChangePercent: number;
  positionsCount: number;
  allocationByType: Record<InvestmentAssetType, number>;
  topPerformer?: CalculatedInvestmentPosition;
  riskiestBucket?: InvestmentAssetType;
}

export interface InvestmentInsightResponse {
  headline: string;
  observations: string[];
}

const safePercent = (numerator: number, denominator: number) => {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
};

export const calculateInvestmentPosition = (
  position: InvestmentPosition,
  quote?: InvestmentQuote
): CalculatedInvestmentPosition => {
  const usableQuote = quote && !quote.error ? quote : undefined;
  const currentPrice =
    usableQuote?.currentPrice ??
    position.last_price ??
    position.manual_current_price ??
    position.buy_price;

  const costBasis = position.amount * position.buy_price;
  const currentValue = position.amount * currentPrice;
  const profitLoss = currentValue - costBasis;
  const percentageChange = safePercent(profitLoss, costBasis);
  const dayChangePercent = usableQuote?.changePercent24h ?? position.last_price_change_pct ?? 0;
  const dayChangeValue = currentValue * (dayChangePercent / 100);

  return {
    ...position,
    current_price: currentPrice,
    current_value: currentValue,
    cost_basis: costBasis,
    profit_loss: profitLoss,
    percentage_change: percentageChange,
    day_change_value: dayChangeValue,
    day_change_percent: dayChangePercent,
  };
};

export const calculatePortfolioSummary = (
  positions: InvestmentPosition[],
  quotes: Record<string, InvestmentQuote> = {}
) => {
  const calculatedPositions = positions.map((position) =>
    calculateInvestmentPosition(position, quotes[position.id])
  );

  const totalCost = calculatedPositions.reduce((sum, item) => sum + item.cost_basis, 0);
  const totalValue = calculatedPositions.reduce((sum, item) => sum + item.current_value, 0);
  const totalProfitLoss = totalValue - totalCost;
  const totalChangePercent = safePercent(totalProfitLoss, totalCost);
  const dailyChangeValue = calculatedPositions.reduce((sum, item) => sum + item.day_change_value, 0);
  const previousValue = totalValue - dailyChangeValue;
  const dailyChangePercent = safePercent(dailyChangeValue, previousValue);

  const allocationByType = calculatedPositions.reduce(
    (acc, item) => {
      acc[item.asset_type] += item.current_value;
      return acc;
    },
    { stock: 0, crypto: 0, gold: 0 } as Record<InvestmentAssetType, number>
  );

  const topPerformer = [...calculatedPositions].sort(
    (a, b) => b.percentage_change - a.percentage_change
  )[0];

  const volatilityByType = calculatedPositions.reduce(
    (acc, item) => {
      acc[item.asset_type].total += Math.abs(item.day_change_percent);
      acc[item.asset_type].count += 1;
      return acc;
    },
    {
      stock: { total: 0, count: 0 },
      crypto: { total: 0, count: 0 },
      gold: { total: 0, count: 0 },
    } as Record<InvestmentAssetType, { total: number; count: number }>
  );

  const riskiestBucket = (Object.entries(volatilityByType) as Array<
    [InvestmentAssetType, { total: number; count: number }]
  >)
    .map(([type, value]) => ({
      type,
      average: value.count ? value.total / value.count : 0,
    }))
    .sort((a, b) => b.average - a.average)[0]?.type;

  return {
    calculatedPositions,
    summary: {
      totalCost,
      totalValue,
      totalProfitLoss,
      totalChangePercent,
      dailyChangeValue,
      dailyChangePercent,
      positionsCount: calculatedPositions.length,
      allocationByType,
      topPerformer,
      riskiestBucket,
    } satisfies InvestmentPortfolioSummary,
  };
};

export const fetchInvestmentQuotes = async (positions: InvestmentPosition[]) => {
  if (positions.length === 0) {
    return {} as Record<string, InvestmentQuote>;
  }

  const response = await fetch('/api/investments/prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      positions: positions.map((position) => ({
        id: position.id,
        asset_type: position.asset_type,
        symbol: position.symbol,
        external_id: position.external_id,
        manual_current_price: position.manual_current_price,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch investment prices');
  }

  const payload = await response.json();
  return payload.quotes as Record<string, InvestmentQuote>;
};

export const generateInvestmentInsights = async (
  summary: InvestmentPortfolioSummary,
  positions: CalculatedInvestmentPosition[]
) => {
  const response = await fetch('/api/investments/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary, positions }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate investment insights');
  }

  return (await response.json()) as InvestmentInsightResponse;
};

export const getAllocationLabel = (
  summary: InvestmentPortfolioSummary,
  type: InvestmentAssetType
) => {
  const value = summary.allocationByType[type];
  return summary.totalValue ? safePercent(value, summary.totalValue) : 0;
};

export const buildInvestmentTimelineText = (position: InvestmentPosition, action: string) => {
  const label = `${position.symbol.toUpperCase()} ${position.asset_type}`;
  if (action === 'created') return `Added ${label} to your investment portfolio`;
  if (action === 'updated') return `Updated ${label} position details`;
  return `Archived ${label} from your investment portfolio`;
};

export const formatSignedPercent = (value: number) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

export const formatSignedCurrency = (value: number, currency = 'USD', locale = 'en-US') =>
  `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value), currency, locale)}`;
