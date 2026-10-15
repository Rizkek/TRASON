/**
 * Mutation helpers that create/update a record and then invalidate the SWR caches
 * that depend on it. Hooks with their own optimistic updates do not go through here.
 */

import { transactionQueries } from '@/services/finance/transactionQueries';
import { activityQueries } from '@/services/activity/activityQueries';
import { reminderQueries } from '@/services/core/reminderQueries';
import { Transaction, Activity, Reminder } from '@/services/supabase/supabaseClient';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { handleQueryError, logError } from '@/libs/apiErrors';
import { invalidateKeys } from '@/libs/cacheInvalidation';

type CreateInput<T> = Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>;

export async function createTransactionWithInvalidation(data: CreateInput<Transaction>) {
  try {
    const result = await transactionQueries.createTransaction(data);
    await invalidateTransactionCaches();
    return result;
  } catch (err) {
    logError(err, 'mutations.createTransactionWithInvalidation');
    throw handleQueryError(err);
  }
}

export async function updateTransactionWithInvalidation(
  id: string,
  data: Partial<CreateInput<Transaction>>
) {
  try {
    const result = await transactionQueries.updateTransaction(id, data);
    await invalidateTransactionCaches();
    return result;
  } catch (err) {
    logError(err, 'mutations.updateTransactionWithInvalidation');
    throw handleQueryError(err);
  }
}

export async function createActivityWithInvalidation(data: CreateInput<Activity>, date?: string) {
  try {
    const result = await activityQueries.createActivity(data);
    await invalidateActivityCaches(date);
    return result;
  } catch (err) {
    logError(err, 'mutations.createActivityWithInvalidation');
    throw handleQueryError(err);
  }
}

export async function createReminderWithInvalidation(data: CreateInput<Reminder>) {
  try {
    const result = await reminderQueries.createReminder(data);
    await invalidateReminderCaches();
    return result;
  } catch (err) {
    logError(err, 'mutations.createReminderWithInvalidation');
    throw handleQueryError(err);
  }
}

const invalidateTransactionCaches = () =>
  invalidateKeys(INVALIDATION_PATTERNS.onTransactionChange(), 'transactions');

const invalidateActivityCaches = (date?: string) =>
  invalidateKeys(
    date ? INVALIDATION_PATTERNS.onActivityChange(date) : [CACHE_KEYS.activities.all(), CACHE_KEYS.dashboard.overview],
    'activities'
  );

const invalidateReminderCaches = () =>
  invalidateKeys(INVALIDATION_PATTERNS.onReminderChange(), 'reminders');
