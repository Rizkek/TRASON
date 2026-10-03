import { Transaction } from '@/types/database';
import { detectDuplicates } from '../duplicateDetector';
import { ParsedTransaction } from '../textParser';

const existingTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'existing-1',
  user_id: 'user-1',
  category_id: null,
  title: 'Geprek',
  amount: 10000,
  type: 'expense',
  date: '2026-10-03',
  created_at: '2026-10-03T10:00:00.000Z',
  updated_at: '2026-10-03T10:00:00.000Z',
  ...overrides,
});

const newEntry = (overrides: Partial<ParsedTransaction> = {}): ParsedTransaction => ({
  title: 'Geprek',
  amount: 10000,
  type: 'expense',
  date: '2026-10-03',
  source: 'text',
  ...overrides,
});

describe('detectDuplicates', () => {
  it('flags matching amount, merchant, type, and date', () => {
    const matches = detectDuplicates(newEntry(), [existingTransaction()]);

    expect(matches).toHaveLength(1);
    expect(matches[0].confidence).toBe('high');
  });

  it('does not flag the same amount for a different merchant', () => {
    const matches = detectDuplicates(newEntry({ title: 'Bakso' }), [existingTransaction()]);

    expect(matches).toHaveLength(0);
  });

  it('does not flag a matching merchant and amount with a different transaction type', () => {
    const matches = detectDuplicates(
      newEntry({ type: 'income' }),
      [existingTransaction()]
    );

    expect(matches).toHaveLength(0);
  });

  it('flags a matching merchant and amount on an adjacent day with lower confidence', () => {
    const matches = detectDuplicates(
      newEntry({ date: '2026-10-04' }),
      [existingTransaction()]
    );

    expect(matches).toHaveLength(1);
    expect(matches[0].confidence).toBe('medium');
  });
});