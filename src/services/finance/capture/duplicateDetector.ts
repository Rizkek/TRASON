import { Transaction } from '@/types/database';
import { ParsedTransaction } from './textParser';
import { ExtractedReceipt } from '../../ai/receiptExtractor';

export interface DuplicateMatch {
  transaction: Transaction;
  confidence: 'high' | 'medium';
  reason: string;
}

/**
 * Checks if a newly captured transaction (from text or receipt)
 * is likely a duplicate of an existing transaction.
 */
export function detectDuplicates(
  newEntry: ParsedTransaction | ExtractedReceipt,
  existingTransactions: Transaction[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  
  // Extract amount and title based on entry type
  const amount = 'amount' in newEntry ? newEntry.amount : newEntry.total;
  const title = 'title' in newEntry ? newEntry.title : (newEntry.merchant || 'Unknown');
  const dateStr = newEntry.date || new Date().toISOString().split('T')[0];
  const dateObj = new Date(dateStr);
  
  if (!amount || amount === 0) return matches;

  for (const t of existingTransactions) {
    // 1. Check date proximity (within 3 days)
    const tDate = new Date(t.date);
    const timeDiff = Math.abs(dateObj.getTime() - tDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff > 3) continue;

    // 2. Check amount exact match
    const isAmountExact = t.amount === amount || t.original_amount === amount;
    
    // 3. Check name similarity (simple inclusion/lowercase check for now)
    const tTitleLower = t.title.toLowerCase();
    const newTitleLower = title.toLowerCase();
    
    const isNameSimilar = 
      tTitleLower.includes(newTitleLower) || 
      newTitleLower.includes(tTitleLower);

    if (isAmountExact && daysDiff === 0 && isNameSimilar) {
      matches.push({
        transaction: t,
        confidence: 'high',
        reason: 'Exact same amount, date, and similar merchant name.',
      });
    } else if (isAmountExact && daysDiff <= 1) {
      matches.push({
        transaction: t,
        confidence: 'medium',
        reason: 'Same amount on the same or adjacent day.',
      });
    }
  }

  // Return highest confidence first
  return matches.sort((a, b) => (a.confidence === 'high' ? -1 : 1));
}
