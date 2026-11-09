import {
  calculateInvestmentPosition,
  calculatePortfolioInCurrency,
  calculatePortfolioSummary,
  convertPositionToCurrency,
  getPositionCurrency,
} from '../finance/investmentService';
import { InvestmentPosition } from '@/services/supabase/supabaseClient';

describe('InvestmentService', () => {
  const mockPosition: InvestmentPosition = {
    id: '1',
    user_id: 'user1',
    symbol: 'AAPL',
    asset_type: 'stock',
    amount: 10,
    buy_price: 150,
    buy_date: '2026-05-01',
    quote_currency: 'USD',
    price_source: 'manual',
    is_active: true,
    created_at: '',
    updated_at: '',
  };

  describe('calculateInvestmentPosition', () => {
    it('should calculate correct values with a quote', () => {
      const mockQuote = {
        symbol: 'AAPL',
        assetType: 'stock' as const,
        currentPrice: 200,
        changePercent24h: 5,
        source: 'alphavantage' as const,
        asOf: '',
      };

      const result = calculateInvestmentPosition(mockPosition, mockQuote);

      expect(result.current_price).toBe(200);
      expect(result.cost_basis).toBe(1500); // 10 * 150
      expect(result.current_value).toBe(2000); // 10 * 200
      expect(result.profit_loss).toBe(500);
      expect(result.percentage_change).toBeCloseTo(33.3333, 4);
    });

    it('should fallback to buy_price if no quote or manual price is available', () => {
      const result = calculateInvestmentPosition(mockPosition);
      expect(result.current_price).toBe(150);
      expect(result.current_value).toBe(1500);
      expect(result.profit_loss).toBe(0);
    });
  });

  describe('calculatePortfolioSummary', () => {
    it('should compute risk metadata for each position', () => {
      const positions = [mockPosition];
      const quotes = {
        '1': {
          symbol: 'AAPL',
          assetType: 'stock' as const,
          currentPrice: 180,
          changePercent24h: 2,
          source: 'alphavantage' as const,
          asOf: '',
        },
      };

      const { calculatedPositions, summary } = calculatePortfolioSummary(positions, quotes);
      expect(calculatedPositions[0].portfolio_weight_pct).toBeGreaterThan(0);
      expect(calculatedPositions[0].bucket_weight_pct).toBe(100);
      expect(calculatedPositions[0].risk_score).toBeGreaterThanOrEqual(0);
      expect(calculatedPositions[0].risk_category).toBeDefined();
      expect(calculatedPositions[0].risk_status).toBe('overweight');
      expect(summary.totalValue).toBe(1800);
    });
  });

  describe('currency handling', () => {
    const rates = { USD: 1, IDR: 16000 };
    const market: InvestmentPosition = { ...mockPosition, price_source: 'alphavantage', buy_price: 150, last_price: 200 };
    const legacyManual: InvestmentPosition = {
      ...mockPosition,
      id: '2',
      asset_type: 'property',
      amount: 1,
      buy_price: 500_000_000,
      manual_current_price: 600_000_000,
      last_price: 600_000_000,
    };
    const idrGold: InvestmentPosition = { ...market, id: '3', symbol: 'XAU.IDR', asset_type: 'gold', buy_price: 1_000_000, last_price: 1_200_000 };

    it('reads market prices as USD whatever the profile currency is', () => {
      expect(getPositionCurrency(market, 'IDR')).toBe('USD');
    });

    it('reads XAU.IDR as IDR', () => {
      expect(getPositionCurrency(idrGold, 'USD')).toBe('IDR');
    });

    it('reads a manual position saved as USD in the profile currency, as it was entered and shown', () => {
      expect(getPositionCurrency(legacyManual, 'IDR')).toBe('IDR');
    });

    it('keeps the currency a manual position was explicitly saved in', () => {
      expect(getPositionCurrency({ ...legacyManual, quote_currency: 'IDR' }, 'USD')).toBe('IDR');
    });

    it('converts a USD market position into the profile currency', () => {
      const converted = convertPositionToCurrency(market, 'IDR', rates);
      expect(converted?.buy_price).toBe(2_400_000);
      expect(converted?.last_price).toBe(3_200_000);
    });

    it('leaves a legacy manual value untouched, so a Rupiah property is not multiplied by the rate', () => {
      expect(convertPositionToCurrency(legacyManual, 'IDR', rates)).toBe(legacyManual);
    });

    it('returns null without a rate', () => {
      expect(convertPositionToCurrency(market, 'IDR', null)).toBeNull();
    });

    it('adds market, manual and IDR gold positions in one currency', () => {
      const { summary, unconvertedCount } = calculatePortfolioInCurrency([market, legacyManual, idrGold], 'IDR', rates);
      // 10 * 200 USD * 16000, 1 * 600,000,000 IDR, 10 * 1,200,000 IDR
      expect(summary.totalValue).toBe(32_000_000 + 600_000_000 + 12_000_000);
      expect(unconvertedCount).toBe(0);
    });

    it('lists a position without a rate in its own currency and leaves it out of the totals', () => {
      const { calculatedPositions, summary, unconvertedCount } = calculatePortfolioInCurrency([market, legacyManual], 'IDR', null);
      expect(unconvertedCount).toBe(1);
      expect(summary.totalValue).toBe(600_000_000);
      const row = calculatedPositions.find((p) => p.id === market.id);
      expect(row?.display_currency).toBe('USD');
      expect(row?.current_value).toBe(2000);
    });
  });
});
