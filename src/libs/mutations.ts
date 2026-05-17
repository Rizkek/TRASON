/**
 * Centralized Mutation Operations with Cascade Invalidation
 * 
 * This module provides mutation helpers that automatically handle
 * cache invalidation for related data when mutations occur.
 * 
 * Usage:
 * ```typescript
 * import { createTransactionWithInvalidation } from '@/libs/mutations';
 * 
 * const result = await createTransactionWithInvalidation(data);
 * ```
 */

import { mutate as globalMutate } from 'swr';
import { transactionQueries, activityQueries, reminderQueries } from '@/services/queries';
import { investmentQueries } from '@/services/investmentQueries';
import { Transaction, Activity, Reminder, InvestmentPosition } from '@/services/supabaseClient';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { handleQueryError, logError } from '@/libs/apiErrors';

// ============================================
// TRANSACTION MUTATIONS
// ============================================

/**
 * Create a transaction and invalidate related caches
 */
export async function createTransactionWithInvalidation(
  data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
) {
  try {
    const result = await transactionQueries.createTransaction(data);

    // Invalidate related caches
    await invalidateTransactionCaches();

    return result;
  } catch (err) {
    logError(err, 'mutations.createTransactionWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Update a transaction and invalidate related caches
 */
export async function updateTransactionWithInvalidation(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
) {
  try {
    const result = await transactionQueries.updateTransaction(id, data);

    // Invalidate related caches
    await invalidateTransactionCaches();

    return result;
  } catch (err) {
    logError(err, 'mutations.updateTransactionWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Delete a transaction and invalidate related caches
 */
export async function deleteTransactionWithInvalidation(id: string) {
  try {
    await transactionQueries.deleteTransaction(id);

    // Invalidate related caches
    await invalidateTransactionCaches();

    return true;
  } catch (err) {
    logError(err, 'mutations.deleteTransactionWithInvalidation');
    throw handleQueryError(err);
  }
}

// ============================================
// ACTIVITY MUTATIONS
// ============================================

/**
 * Create an activity and invalidate related caches
 */
export async function createActivityWithInvalidation(
  data: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  date?: string
) {
  try {
    const result = await activityQueries.createActivity(data);

    // Invalidate related caches
    await invalidateActivityCaches(date);

    return result;
  } catch (err) {
    logError(err, 'mutations.createActivityWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Update an activity and invalidate related caches
 */
export async function updateActivityWithInvalidation(
  id: string,
  data: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>,
  date?: string
) {
  try {
    const result = await activityQueries.updateActivity(id, data);

    // Invalidate related caches
    await invalidateActivityCaches(date);

    return result;
  } catch (err) {
    logError(err, 'mutations.updateActivityWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Delete an activity and invalidate related caches
 */
export async function deleteActivityWithInvalidation(id: string, date?: string) {
  try {
    await activityQueries.deleteActivity(id);

    // Invalidate related caches
    await invalidateActivityCaches(date);

    return true;
  } catch (err) {
    logError(err, 'mutations.deleteActivityWithInvalidation');
    throw handleQueryError(err);
  }
}

// ============================================
// REMINDER MUTATIONS
// ============================================

/**
 * Create a reminder and invalidate related caches
 */
export async function createReminderWithInvalidation(
  data: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
) {
  try {
    const result = await reminderQueries.createReminder(data);

    // Invalidate related caches
    await invalidateReminderCaches();

    return result;
  } catch (err) {
    logError(err, 'mutations.createReminderWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Update a reminder and invalidate related caches
 */
export async function updateReminderWithInvalidation(
  id: string,
  data: Partial<Omit<Reminder, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    const result = await reminderQueries.updateReminder(id, data);

    // Invalidate related caches
    await invalidateReminderCaches();

    return result;
  } catch (err) {
    logError(err, 'mutations.updateReminderWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Complete a reminder and invalidate related caches
 */
export async function completeReminderWithInvalidation(id: string) {
  try {
    const result = await reminderQueries.completeReminder(id);

    // Invalidate related caches
    await invalidateReminderCaches();

    return result;
  } catch (err) {
    logError(err, 'mutations.completeReminderWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Delete a reminder and invalidate related caches
 */
export async function deleteReminderWithInvalidation(id: string) {
  try {
    await reminderQueries.deleteReminder(id);

    // Invalidate related caches
    await invalidateReminderCaches();

    return true;
  } catch (err) {
    logError(err, 'mutations.deleteReminderWithInvalidation');
    throw handleQueryError(err);
  }
}

// ============================================
// INVESTMENT MUTATIONS
// ============================================

/**
 * Create an investment position and invalidate related caches
 */
export async function createInvestmentWithInvalidation(
  data: Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'last_price' | 'last_price_change_pct' | 'last_valued_at'>
) {
  try {
    const result = await investmentQueries.createPosition(data);

    // Invalidate related caches
    await invalidateInvestmentCaches();

    return result;
  } catch (err) {
    logError(err, 'mutations.createInvestmentWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Update an investment position and invalidate related caches
 */
export async function updateInvestmentWithInvalidation(
  id: string,
  data: Partial<Omit<InvestmentPosition, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
) {
  try {
    const result = await investmentQueries.updatePosition(id, data);

    // Invalidate related caches
    await invalidateInvestmentCaches();

    return result;
  } catch (err) {
    logError(err, 'mutations.updateInvestmentWithInvalidation');
    throw handleQueryError(err);
  }
}

/**
 * Delete an investment position and invalidate related caches
 */
export async function deleteInvestmentWithInvalidation(id: string) {
  try {
    await investmentQueries.deletePosition(id);

    // Invalidate related caches
    await invalidateInvestmentCaches();

    return true;
  } catch (err) {
    logError(err, 'mutations.deleteInvestmentWithInvalidation');
    throw handleQueryError(err);
  }
}

// ============================================
// CACHE INVALIDATION HELPERS
// ============================================

/**
 * Invalidate all transaction-related caches
 */
async function invalidateTransactionCaches() {
  const keysToInvalidate = INVALIDATION_PATTERNS.onTransactionChange();
  await Promise.all(
    keysToInvalidate.map((k) => {
      if (typeof k === 'string') {
        return globalMutate(k);
      }
      // Invalidate all transaction list keys
      return globalMutate(
        (key) => Array.isArray(key) && key[0] === 'transactions',
        undefined,
        { revalidate: true }
      );
    })
  );
}

/**
 * Invalidate all activity-related caches
 */
async function invalidateActivityCaches(date?: string) {
  const keysToInvalidate = date
    ? INVALIDATION_PATTERNS.onActivityChange(date)
    : [CACHE_KEYS.activities.all(), CACHE_KEYS.dashboard.overview];

  await Promise.all(
    keysToInvalidate.map((k) => {
      if (typeof k === 'string') {
        return globalMutate(k);
      }
      return globalMutate(
        (key) => Array.isArray(key) && key[0] === 'activities',
        undefined,
        { revalidate: true }
      );
    })
  );
}

/**
 * Invalidate all reminder-related caches
 */
async function invalidateReminderCaches() {
  const keysToInvalidate = INVALIDATION_PATTERNS.onReminderChange();
  await Promise.all(
    keysToInvalidate.map((k) => {
      if (typeof k === 'string') {
        return globalMutate(k);
      }
      return globalMutate(
        (key) => Array.isArray(key) && key[0] === 'reminders',
        undefined,
        { revalidate: true }
      );
    })
  );
}

/**
 * Invalidate all investment-related caches
 */
async function invalidateInvestmentCaches() {
  const keysToInvalidate = INVALIDATION_PATTERNS.onInvestmentChange();
  await Promise.all(
    keysToInvalidate.map((k) => {
      if (typeof k === 'string') {
        return globalMutate(k);
      }
      return globalMutate(
        (key) => Array.isArray(key) && key[0] === 'investments',
        undefined,
        { revalidate: true }
      );
    })
  );
}

// ============================================
// WILDCARD MATCHING UTILITY
// ============================================

/**
 * Check if a cache key matches a pattern (with wildcard support)
 * Example: matchesPattern(['transactions', '2025-01', '2025-02'], ['transactions', '*'])
 */
export function matchesPattern(key: unknown, pattern: unknown[]): boolean {
  if (!Array.isArray(key)) return false;
  if (key.length !== pattern.length) return false;

  return key.every((k, i) => {
    const p = pattern[i];
    return p === '*' || p === k;
  });
}
