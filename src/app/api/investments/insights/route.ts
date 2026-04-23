import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const summary = body.summary || {};

    const observations: string[] = [];
    const totalChange = Number(summary.totalChangePercent || 0);
    const dailyChange = Number(summary.dailyChangePercent || 0);
    const allocations = summary.allocationByType || {};
    const topPerformer = summary.topPerformer;
    const riskiestBucket = summary.riskiestBucket;

    if (dailyChange !== 0) {
      observations.push(
        `Your portfolio ${dailyChange >= 0 ? 'increased' : 'declined'} by ${Math.abs(dailyChange).toFixed(2)}% today.`
      );
    } else {
      observations.push('Your portfolio is flat today, which can be useful during noisy market sessions.');
    }

    if (allocations.crypto > allocations.stock && allocations.crypto > allocations.gold) {
      observations.push('Crypto currently represents the largest share of the portfolio, so short-term swings may feel sharper than your stock positions.');
    } else if (allocations.stock > 0) {
      observations.push('Stocks remain the portfolio anchor, which helps balance the faster moves coming from crypto and manual gold pricing.');
    }

    if (topPerformer?.symbol) {
      observations.push(
        `${topPerformer.symbol.toUpperCase()} is your strongest position so far at ${Number(topPerformer.percentage_change || 0).toFixed(2)}% versus cost basis.`
      );
    }

    if (riskiestBucket) {
      observations.push(
        `${riskiestBucket.charAt(0).toUpperCase() + riskiestBucket.slice(1)} assets are currently the most volatile bucket in your portfolio mix.`
      );
    }

    const headline =
      totalChange >= 0
        ? `Portfolio resilience is holding with a ${Math.abs(totalChange).toFixed(2)}% gain against cost basis.`
        : `The portfolio is ${Math.abs(totalChange).toFixed(2)}% below cost basis, so this is a good moment to review allocation discipline.`;

    return NextResponse.json({
      headline,
      observations: observations.slice(0, 4),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to generate investment insights' },
      { status: 500 }
    );
  }
}
