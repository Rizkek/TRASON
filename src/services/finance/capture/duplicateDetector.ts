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
  const dateObj = new Date(`${dateStr.split('T')[0]}T00:00:00Z`);
  const type = 'type' in newEntry ? newEntry.type : undefined;
  
  if (!amount || amount === 0 || Number.isNaN(dateObj.getTime())) return matches;

  for (const t of existingTransactions) {
    // Compare calendar dates in UTC so local daylight-saving changes cannot shift the result.
    const tDate = new Date(`${t.date.split('T')[0]}T00:00:00Z`);
    if (Number.isNaN(tDate.getTime())) continue;

    const timeDiff = Math.abs(dateObj.getTime() - tDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    if (daysDiff > 1) continue;

    if (type && t.type !== type) continue;

    // 1. Amount alone is common; require a similar merchant name as well.
    const isAmountExact = t.amount === amount || t.original_amount === amount;
    const tTitleNormalized = t.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newTitleNormalized = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const shorterTitleLength = Math.min(tTitleNormalized.length, newTitleNormalized.length);
    const isNameSimilar = Boolean(tTitleNormalized && newTitleNormalized) && (
      tTitleNormalized === newTitleNormalized ||
      (shorterTitleLength >= 4 && (
        tTitleNormalized.includes(newTitleNormalized) ||
        newTitleNormalized.includes(tTitleNormalized)
      ))
    );

    if (isAmountExact && isNameSimilar && daysDiff === 0) {
      matches.push({
        transaction: t,
        confidence: 'high',
        reason: 'Exact same amount, date, and similar merchant name.',
      });
    } else if (isAmountExact && isNameSimilar) {
      matches.push({
        transaction: t,
        confidence: 'medium',
        reason: 'Same amount and similar merchant name on an adjacent day.',
      });
    }
  }

  // Return highest confidence first
  return matches.sort((a, b) => {
    if (a.confidence === b.confidence) return 0;
    return a.confidence === 'high' ? -1 : 1;
  });
}
