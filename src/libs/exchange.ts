export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  try {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: ExchangeRates = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          return parsed;
        }
      }
    }

    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('Failed to fetch exchange rates');
    
    const data = await res.json();
    const ratesData: ExchangeRates = {
      base: data.base_code,
      rates: data.rates,
      timestamp: Date.now(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(ratesData));
    }

    return ratesData;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}
