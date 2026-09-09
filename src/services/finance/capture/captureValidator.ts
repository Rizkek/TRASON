import { ExtractedReceipt } from '../../ai/receiptExtractor';

export interface ValidationResult {
  isValid: boolean;
  sum_of_items: number;
  mismatch_amount: number;
  status: 'verified' | 'needs_review' | 'failed';
}

export function validateReceiptDeterministic(data: ExtractedReceipt | null): ValidationResult {
  if (!data || !data.items || data.items.length === 0) {
    return {
      isValid: false,
      sum_of_items: 0,
      mismatch_amount: 0,
      status: 'failed',
    };
  }

  // Deterministic math check
  const sumOfItems = data.items.reduce((sum, item) => sum + item.total, 0);
  const statedTotal = data.total || 0;
  
  // Floating point safe comparison
  const mismatchAmount = Math.abs(statedTotal - sumOfItems);
  
  // If mismatch is less than 1 (to account for minor rounding), consider it verified
  // If it's a huge mismatch, needs review
  const isValid = mismatchAmount < 1.0;
  
  return {
    isValid,
    sum_of_items: sumOfItems,
    mismatch_amount: mismatchAmount,
    status: isValid ? 'verified' : 'needs_review',
  };
}
