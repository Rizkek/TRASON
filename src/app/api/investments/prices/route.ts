import { NextRequest, NextResponse } from 'next/server';

type AssetType = 'stock' | 'crypto' | 'gold';

interface PriceRequestPosition {
  id: string;
  asset_type: AssetType;
  symbol: string;
  external_id?: string;
  manual_current_price?: number | null;
}

const COIN_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  xrp: 'ripple',
  ada: 'cardano',
  doge: 'dogecoin',
  bnb: 'binancecoin',
};

const coingeckoHeaders = () => {
  const apiKey = process.env.COINGECKO_DEMO_API_KEY;
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['x-cg-demo-api-key'] = apiKey;
  }
  return headers;
};

const fetchCryptoQuotes = async (positions: PriceRequestPosition[]) => {
  if (positions.length === 0) return {};

  const ids = positions.map((position) => {
    const normalized =
      position.external_id ||
      COIN_MAP[position.symbol.toLowerCase()] ||
      position.symbol.toLowerCase();
    return normalized;
  });

  const url = new URL('https://api.coingecko.com/api/v3/simple/price');
  url.searchParams.set('ids', ids.join(','));
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_24hr_change', 'true');
  url.searchParams.set('include_last_updated_at', 'true');

  const response = await fetch(url.toString(), {
    headers: coingeckoHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('CoinGecko price lookup failed');
  }

  const data = await response.json();

  return positions.reduce<Record<string, any>>((acc, position) => {
    const id =
      position.external_id ||
      COIN_MAP[position.symbol.toLowerCase()] ||
      position.symbol.toLowerCase();
    const quote = data[id];

    if (quote?.usd) {
      acc[position.id] = {
        symbol: position.symbol.toUpperCase(),
        assetType: 'crypto',
        currentPrice: Number(quote.usd),
        changePercent24h: Number(quote.usd_24h_change || 0),
        source: 'coingecko',
        asOf: new Date((quote.last_updated_at || Date.now() / 1000) * 1000).toISOString(),
      };
    }

    return acc;
  }, {});
};

const fetchStockQuote = async (position: PriceRequestPosition) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return {
      symbol: position.symbol.toUpperCase(),
      assetType: 'stock',
      currentPrice: 0,
      source: 'alphavantage',
      asOf: new Date().toISOString(),
      error: 'Missing ALPHA_VANTAGE_API_KEY',
    };
  }

  const url = new URL('https://www.alphavantage.co/query');
  url.searchParams.set('function', 'GLOBAL_QUOTE');
  url.searchParams.set('symbol', position.symbol.toUpperCase());
  url.searchParams.set('apikey', apiKey);

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Stock lookup failed for ${position.symbol}`);
  }

  const data = await response.json();
  const quote = data['Global Quote'];

  if (!quote || !quote['05. price']) {
    return {
      symbol: position.symbol.toUpperCase(),
      assetType: 'stock',
      currentPrice: 0,
      source: 'alphavantage',
      asOf: new Date().toISOString(),
      error: data.Note || data.Information || `No quote available for ${position.symbol}`,
    };
  }

  return {
    symbol: position.symbol.toUpperCase(),
    assetType: 'stock',
    currentPrice: Number(quote['05. price']),
    changePercent24h: Number(quote['10. change percent']?.replace('%', '') || 0),
    source: 'alphavantage',
    asOf: new Date().toISOString(),
  };
};

const fetchGoldQuote = async (positions: PriceRequestPosition[]) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  let marketPrice: number | null = null;

  if (apiKey) {
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'GOLD_SILVER_HISTORY');
    url.searchParams.set('symbol', 'XAU');
    url.searchParams.set('apikey', apiKey);

    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      const firstKey = Object.keys(data || {}).find((key) => /^\d{4}-\d{2}-\d{2}$/.test(key));
      if (firstKey && data[firstKey]?.price) {
        marketPrice = Number(data[firstKey].price);
      }
    }
  }

  return positions.reduce<Record<string, any>>((acc, position) => {
    const currentPrice = position.manual_current_price ?? marketPrice ?? 0;
    acc[position.id] = {
      symbol: position.symbol.toUpperCase(),
      assetType: 'gold',
      currentPrice: Number(currentPrice),
      changePercent24h: 0,
      source: position.manual_current_price ? 'manual' : 'alphavantage',
      asOf: new Date().toISOString(),
      error: !currentPrice ? 'Provide a manual gold price or configure Alpha Vantage.' : undefined,
    };
    return acc;
  }, {});
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { positions?: PriceRequestPosition[] };
    const positions = body.positions || [];

    const cryptoPositions = positions.filter((position) => position.asset_type === 'crypto');
    const stockPositions = positions.filter((position) => position.asset_type === 'stock');
    const goldPositions = positions.filter((position) => position.asset_type === 'gold');

    const [cryptoQuotes, stockQuotes, goldQuotes] = await Promise.all([
      fetchCryptoQuotes(cryptoPositions),
      Promise.all(stockPositions.map(async (position) => [position.id, await fetchStockQuote(position)] as const)),
      fetchGoldQuote(goldPositions),
    ]);

    return NextResponse.json({
      quotes: {
        ...cryptoQuotes,
        ...Object.fromEntries(stockQuotes),
        ...goldQuotes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to fetch investment prices' },
      { status: 500 }
    );
  }
}
