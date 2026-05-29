import { calculateInvestmentPosition, calculatePortfolioSummary } from '../investmentService';
import { InvestmentPosition } from '@/services/supabaseClient';

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
});
