import { convertCurrency } from '@/libs/exchange';

describe('convertCurrency', () => {
  const rates = { USD: 1, IDR: 16000, EUR: 0.5 };

  it('returns the amount unchanged for the same currency, even without rates', () => {
    expect(convertCurrency(150, 'USD', 'USD', null)).toBe(150);
  });

  it('converts from the base currency', () => {
    expect(convertCurrency(150, 'USD', 'IDR', rates)).toBe(2_400_000);
  });

  it('converts to the base currency', () => {
    expect(convertCurrency(16000, 'IDR', 'USD', rates)).toBe(1);
  });

  it('converts between two non-base currencies', () => {
    expect(convertCurrency(10, 'EUR', 'IDR', rates)).toBe(320_000);
  });

  it('returns null when rates are unavailable or a currency is unknown', () => {
    expect(convertCurrency(150, 'USD', 'IDR', null)).toBeNull();
    expect(convertCurrency(150, 'USD', 'XYZ', rates)).toBeNull();
    expect(convertCurrency(150, 'XYZ', 'USD', rates)).toBeNull();
  });
});
