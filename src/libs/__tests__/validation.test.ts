import { validateTransaction, validateEmail, validateReminder, REMINDER_PAST_DUE_ERROR } from '../validation';

describe('validateReminder past due handling', () => {
  const now = new Date('2026-10-15T10:30:45.000Z');
  const base = { title: 'Call dentist', priority: 'medium' as const };

  it('rejects a past due time when rejectPastDue is set', () => {
    const result = validateReminder(
      { ...base, due_datetime: '2026-10-15T09:00:00.000Z' },
      { rejectPastDue: true, now }
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.due_datetime).toBe(REMINDER_PAST_DUE_ERROR);
  });

  it('accepts a future due time', () => {
    const result = validateReminder(
      { ...base, due_datetime: '2026-10-15T12:00:00.000Z' },
      { rejectPastDue: true, now }
    );
    expect(result.isValid).toBe(true);
  });

  it('accepts a due time in the current minute', () => {
    const result = validateReminder(
      { ...base, due_datetime: '2026-10-15T10:30:00.000Z' },
      { rejectPastDue: true, now }
    );
    expect(result.isValid).toBe(true);
  });

  it('allows past due times when the option is off, for editing overdue reminders', () => {
    const result = validateReminder({ ...base, due_datetime: '2026-10-14T09:00:00.000Z' }, { now });
    expect(result.isValid).toBe(true);
  });

  it('checks date-only reminders against end of that day', () => {
    expect(validateReminder({ ...base, due_date: '2026-10-14' }, { rejectPastDue: true, now }).isValid).toBe(false);
    expect(validateReminder({ ...base, due_date: '2026-10-15', due_time: '23:59' }, { rejectPastDue: true, now }).isValid).toBe(true);
  });
});

describe('Validation Library', () => {
  describe('validateTransaction', () => {
    it('should return invalid for empty title', () => {
      const result = validateTransaction({
        title: '',
        amount: '100',
        type: 'expense',
        date: '2024-01-01',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeDefined();
    });

    it('should return invalid for negative amount', () => {
      const result = validateTransaction({
        title: 'Lunch',
        amount: '-10',
        type: 'expense',
        date: '2024-01-01',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toContain('greater than 0');
    });

    it('should return valid for correct data', () => {
      const result = validateTransaction({
        title: 'Salary',
        amount: '5000',
        type: 'income',
        date: '2024-05-01',
      });
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });

  describe('validateEmail', () => {
    it('should return error for invalid email', () => {
      expect(validateEmail('invalid-email')).toBe('Invalid email format');
    });

    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });
  });
});
