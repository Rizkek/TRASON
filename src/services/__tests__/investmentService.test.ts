import { calculateInvestmentPosition } from '../investmentService';
import { InvestmentPosition } from '@/services/supabaseClient';

describe('InvestmentService', () => {
  const mockPosition: InvestmentPosition = {
    id: '1',
    user_id: 'user1',
    symbol: 'AAPL',
    asset_type: 'stock',
    amount: 10,
    buy_price: 150,
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
});
