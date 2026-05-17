'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { transactionQueries } from '@/services/queries';
import { Transaction } from '@/services/supabaseClient';
import { SWR_CONFIG } from '@/config/swr';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { handleQueryError, getUserErrorMessage, logError } from '@/libs/apiErrors';

export interface UseTransactionReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  userErrorMessage: string | null;
  createTransaction: (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<Transaction | null>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  getAnalytics: (start: Date, end: Date) => Promise<unknown>;
  mutate: () => Promise<Transaction[] | undefined>;
  refresh: () => Promise<Transaction[] | undefined>;
}

export const useTransaction = (startDate?: Date, endDate?: Date, type?: 'income' | 'expense'): UseTransactionReturn => {
  // Generate stable cache key using CACHE_KEYS helper
  const key = startDate && endDate
    ? CACHE_KEYS.transactions.list(startDate.toISOString(), endDate.toISOString())
    : CACHE_KEYS.transactions.all();

  // Append type filter to key if specified
  const swrKey = type && Array.isArray(key) ? [...key, type] : key;

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    async () => {
      try {
        const res = await transactionQueries.getTransactions(
          startDate,
          endDate,
          type,
        );
        return res.data || [];
      } catch (err) {
        logError(err, 'useTransaction.fetch');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG
  );

  const createTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      try {
        const result = await transactionQueries.createTransaction(data);

        // Cascade invalidation: invalidate all related caches
        const keysToInvalidate = INVALIDATION_PATTERNS.onTransactionChange();
        await Promise.all(keysToInvalidate.map(k => {
          if (typeof k === 'string') {
            return globalMutate(k);
          }
          // Invalidate wildcard patterns
          return globalMutate(
            (key) => Array.isArray(key) && key[0] === 'transactions',
            undefined,
            { revalidate: true }
          );
        }));

        return result;
      } catch (err) {
        logError(err, 'useTransaction.create');
        throw handleQueryError(err);
      }
    },
    []
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
    ) => {
      try {
        const result = await transactionQueries.updateTransaction(id, data);

        // Cascade invalidation
        const keysToInvalidate = INVALIDATION_PATTERNS.onTransactionChange();
        await Promise.all(keysToInvalidate.map(k => {
          if (typeof k === 'string') {
            return globalMutate(k);
          }
          return globalMutate(
            (key) => Array.isArray(key) && key[0] === 'transactions',
            undefined,
            { revalidate: true }
          );
        }));

        return result;
      } catch (err) {
        logError(err, 'useTransaction.update');
        throw handleQueryError(err);
      }
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await transactionQueries.deleteTransaction(id);

      // Cascade invalidation
      const keysToInvalidate = INVALIDATION_PATTERNS.onTransactionChange();
      await Promise.all(keysToInvalidate.map(k => {
        if (typeof k === 'string') {
          return globalMutate(k);
        }
        return globalMutate(
          (key) => Array.isArray(key) && key[0] === 'transactions',
          undefined,
          { revalidate: true }
        );
      }));

      return true;
    } catch (err) {
      logError(err, 'useTransaction.delete');
      throw handleQueryError(err);
    }
  }, []);

  const getAnalytics = useCallback(
    async (start: Date, end: Date) => {
      try {
        return await transactionQueries.getSummaryByCategory(start, end);
      } catch (err) {
        logError(err, 'useTransaction.analytics');
        throw handleQueryError(err);
      }
    },
    []
  );

  // User-friendly error message
  const userErrorMessage = error ? getUserErrorMessage(error) : null;

  return {
    transactions: data || [],
    isLoading,
    error: error as Error | null,
    userErrorMessage,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getAnalytics,
    mutate,
    refresh: mutate
  };
};
