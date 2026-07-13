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

  const manualPositions = positions.filter(p => p.manual_current_price != null);
  const apiPositions = positions.filter(p => p.manual_current_price == null);

  const results: Record<string, any> = {};

  for (const pos of manualPositions) {
    results[pos.id] = {
      symbol: pos.symbol.toUpperCase(),
      assetType: 'crypto',
      currentPrice: pos.manual_current_price,
      changePercent24h: 0,
      source: 'manual',
      asOf: new Date().toISOString(),
    };
  }

  if (apiPositions.length === 0) return results;

  const ids = apiPositions.map((position) => {
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

  const apiResults = apiPositions.reduce<Record<string, any>>((acc, position) => {
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

  return { ...results, ...apiResults };
};

const fetchYahooFinanceQuote = async (symbol: string) => {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.error(`Yahoo Finance API failed for ${symbol}: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    
    const price = result.meta.regularMarketPrice;
    const prevClose = result.meta.chartPreviousClose || result.meta.previousClose;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      assetType: 'stock',
      currentPrice: price,
      changePercent24h: changePct,
      source: 'yahoofinance',
      asOf: new Date(result.meta.regularMarketTime * 1000).toISOString(),
    };
  } catch (err) {
    return null;
  }
};

const fetchStockQuote = async (position: PriceRequestPosition) => {
  if (position.manual_current_price != null) {
    return {
      symbol: position.symbol.toUpperCase(),
      assetType: 'stock',
      currentPrice: position.manual_current_price,
      changePercent24h: 0,
      source: 'manual',
      asOf: new Date().toISOString(),
    };
  }

  // Khusus saham Indonesia (.JK), prioritas pakai Yahoo Finance karena lebih lengkap
  if (position.symbol.toUpperCase().endsWith('.JK')) {
    const yfQuote = await fetchYahooFinanceQuote(position.symbol);
    if (yfQuote) return yfQuote;
  }

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
    // Fallback ke Yahoo Finance jika AlphaVantage gagal/limit
    const yfQuote = await fetchYahooFinanceQuote(position.symbol);
    if (yfQuote) return yfQuote;

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

const fetchIdrGoldPrice = async (): Promise<number | null> => {
  try {
    const fetchYF = async (sym: string) => {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d`, {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.chart?.result?.[0]?.meta?.regularMarketPrice || null;
    };
    const [goldUSD, usdIdr] = await Promise.all([fetchYF('GC=F'), fetchYF('IDR=X')]);
    if (goldUSD && usdIdr) {
      return (goldUSD / 31.1034768) * usdIdr; // Convert Oz to Gram, then USD to IDR
    }
  } catch (err) {
    console.error('Failed to fetch IDR gold price:', err);
  }
  return null;
};

const fetchGoldQuote = async (positions: PriceRequestPosition[]) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  let marketPrice: number | null = null;
  let idrMarketPrice: number | null = null;

  // Jika ada aset XAU.IDR, fetch harga spot gram dalam IDR otomatis
  const needsIdr = positions.some(p => p.symbol.toUpperCase() === 'XAU.IDR' && p.manual_current_price == null);
  if (needsIdr) {
    idrMarketPrice = await fetchIdrGoldPrice();
  }

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
    const isIdr = position.symbol.toUpperCase() === 'XAU.IDR';
    const autoPrice = isIdr ? idrMarketPrice : marketPrice;
    const currentPrice = position.manual_current_price ?? autoPrice ?? 0;
    
    acc[position.id] = {
      symbol: position.symbol.toUpperCase(),
      assetType: 'gold',
      currentPrice: Number(currentPrice),
      changePercent24h: 0,
      source: position.manual_current_price ? 'manual' : (isIdr ? 'yahoofinance' : 'alphavantage'),
      asOf: new Date().toISOString(),
      error: (!position.manual_current_price && !autoPrice) ? 'Provide a manual gold price or configure an API key' : undefined,
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
