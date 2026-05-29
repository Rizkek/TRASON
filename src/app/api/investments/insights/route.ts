import { NextRequest, NextResponse } from 'next/server';

const safePercent = (numerator: number, denominator: number) => {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
};

const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

const capitalized = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const summary = body.summary || {};
    const positions = Array.isArray(body.positions) ? body.positions : [];

    const totalChange = Number(summary.totalChangePercent || 0);
    const dailyChange = Number(summary.dailyChangePercent || 0);
    const totalValue = Number(summary.totalValue || 0);
    const totalCost = Number(summary.totalCost || 0);
    const allocationByType = summary.allocationByType || { stock: 0, crypto: 0, gold: 0 };
    const topPerformer = summary.topPerformer;
    const riskiestBucket = summary.riskiestBucket;

    const observations: string[] = [];
    const percentages = {
      stock: safePercent(allocationByType.stock, totalValue),
      crypto: safePercent(allocationByType.crypto, totalValue),
      gold: safePercent(allocationByType.gold, totalValue),
    };

    const averageDailyVolatility = positions.length
      ? positions.reduce((sum: number, pos: any) => sum + Math.abs(Number(pos.day_change_percent || 0)), 0) / positions.length
      : 0;

    const scenario =
      totalChange >= 5
        ? 'bullish'
        : totalChange <= -3
        ? 'bearish'
        : 'neutral';

    const confidence = averageDailyVolatility >= 4
      ? 'low'
      : averageDailyVolatility >= 2
      ? 'moderate'
      : 'high';

    if (dailyChange !== 0) {
      observations.push(
        `Your portfolio ${dailyChange >= 0 ? 'rose' : 'fell'} by ${Math.abs(dailyChange).toFixed(2)}% today, reflecting current short-term momentum.`
      );
    } else {
      observations.push('Today is flat, which can be a good moment to review your allocation without short-term noise.');
    }

    observations.push(
      `Current allocation is ${percentages.stock.toFixed(0)}% stocks, ${percentages.crypto.toFixed(0)}% crypto, and ${percentages.gold.toFixed(0)}% gold.`
    );

    if (percentages.crypto >= 50) {
      observations.push('Crypto is more than half your portfolio, so expect higher short-term swings and review position sizing carefully.');
    }

    if (percentages.stock >= 50) {
      observations.push('Stocks are the anchor of this portfolio, which can help smooth returns compared to a crypto-heavy mix.');
    }

    if (topPerformer?.symbol) {
      observations.push(
        `${topPerformer.symbol.toUpperCase()} is your strongest position with ${formatPercent(Number(topPerformer.percentage_change || 0))} gain relative to cost basis.`
      );
    }

    if (riskiestBucket) {
      observations.push(
        `${capitalized(riskiestBucket)} assets show the most daily volatility in your current mix.`
      );
    }

    if (totalChange < 0) {
      observations.push(
        `Your portfolio is ${Math.abs(totalChange).toFixed(2)}% below cost basis, so focus on discipline and avoid chasing recovery trades.`
      );
    } else {
      observations.push(
        `The portfolio is ${formatPercent(totalChange)} above cost basis, which is a good signal to revisit allocation and lock in gains selectively.`
      );
    }

    const riskWarning =
      percentages.crypto >= 50
        ? 'High crypto exposure means the portfolio may move sharply. Keep an eye on position sizes and avoid overconcentration.'
        : averageDailyVolatility >= 4
        ? 'Volatility is elevated, so short-term price swings are likely larger than normal.'
        : undefined;

    const recommendation =
      percentages.crypto >= 60
        ? 'Consider trimming crypto exposure to reduce portfolio volatility and free capacity for more balanced allocation.'
        : percentages.stock >= 70
        ? 'Your portfolio is heavily stock-weighted. Review diversification opportunities if you want smoother returns.'
        : percentages.gold >= 30
        ? 'Gold is a meaningful portion of the portfolio, which can help cushion downside but may limit short-term upside.'
        : 'Allocation is reasonably diversified. Keep monitoring positions and avoid adding to a single bucket in isolation.';

    const headline =
      scenario === 'bullish'
        ? `Portfolio momentum is constructive with ${formatPercent(totalChange)} gain versus cost basis.`
        : scenario === 'bearish'
        ? `Portfolio is under pressure with ${formatPercent(totalChange)} performance versus cost basis.`
        : `Portfolio remains range-bound with ${formatPercent(totalChange)} net movement versus cost basis.`;

    return NextResponse.json({
      headline,
      observations: observations.slice(0, 5),
      scenario,
      confidence,
      riskWarning,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to generate investment insights' },
      { status: 500 }
    );
  }
}
