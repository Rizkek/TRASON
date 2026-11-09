import { netBalance } from '@/libs/finance/balance';

describe('netBalance', () => {
  it('adds income and subtracts expenses', () => {
    expect(netBalance([{ type: 'income', amount: 100 }, { type: 'expense', amount: 30 }])).toBe(70);
  });

  it('can go negative', () => {
    expect(netBalance([{ type: 'expense', amount: 30 }])).toBe(-30);
  });

  it('is zero without rows', () => {
    expect(netBalance([])).toBe(0);
  });
});
