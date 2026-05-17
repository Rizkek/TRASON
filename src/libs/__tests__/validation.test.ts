import { validateTransaction, validateEmail } from '../validation';

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
