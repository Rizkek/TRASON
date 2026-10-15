'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { transactionQueries } from '@/services/finance/transactionQueries';
import { Transaction } from '@/services/supabase/supabaseClient';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { executeMutation } from "@/libs/api/mutationBuilder";
import { getUserErrorMessage } from "@/libs/apiErrors";
import { formatDateOnly } from '@/libs/date';
import { invalidateKeys } from '@/libs/cacheInvalidation';

// One revalidation per write: it covers this hook's key, every other date range, and the dashboard.
const invalidateTransactions = () => invalidateKeys(INVALIDATION_PATTERNS.onTransactionChange(), 'transactions');

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

export const useTransaction = (startDate?: Date, endDate?: Date, type?: 'income' | 'expense', fallbackData?: Transaction[]): UseTransactionReturn => {
  // Generate stable cache key using CACHE_KEYS helper
  const key = startDate && endDate
    ? CACHE_KEYS.transactions.list(formatDateOnly(startDate), formatDateOnly(endDate))
    : CACHE_KEYS.transactions.all();

  // Append type filter to key if specified
  const swrKey = type && Array.isArray(key) ? [...key, type] : key;

  const { data, error, isLoading, mutate } = useSWR<Transaction[]>(
    swrKey,
    async () => {
      return await executeMutation(
          (async () => {
        const res = await transactionQueries.getTransactions(
                  startDate,
                  endDate,
                  type,
                );
        return res.data || [];
          })(),
          'useTransaction.fetch'
        );
    },
    { ...SWR_CONFIG_DASHBOARD, fallbackData }
  );

  const createTransaction = useCallback(
    async (newData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      return await executeMutation(
            (async () => {
          const optimisticTx: any = { ...newData, id: `temp-${Date.now()}`, created_at: new Date().toISOString() };
          await mutate(
                    (currentData: Transaction[] | undefined) => currentData ? [optimisticTx, ...currentData] : [optimisticTx],
                    { revalidate: false }
                  );
          const result = await transactionQueries.createTransaction(newData);
          // The refetch replaces the optimistic row, which lacks the joined category, with the DB row.
          await invalidateTransactions();
          return result;
            })(),
            'useTransaction.create', { onError: async (err) => { await mutate(); } }
          );
    },
    [mutate]
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
    ) => {
      return await executeMutation(
            (async () => {
          // Optimistic update: preserve existing categories join, but mark category_id change
          // If category_id changed, we clear the categories join so it shows blank until re-fetch
          await mutate(
                    (currentData: Transaction[] | undefined) => 
                      currentData ? currentData.map((t) => {
                        if (t.id !== id) return t;
                        const updated = { ...t, ...updates } as Transaction;
                        // If category_id changed, clear stale categories join
                        if (updates.category_id !== undefined && updates.category_id !== t.category_id) {
                          (updated as any).categories = null;
                        }
                        return updated;
                      }) : [],
                    { revalidate: false }
                  );
          const result = await transactionQueries.updateTransaction(id, updates);
          await invalidateTransactions();
          return result;
            })(),
            'useTransaction.update', { onError: async (err) => { await mutate(); } }
          );
    },
    [mutate]
  );

  const deleteTransaction = useCallback(async (id: string) => {
    return await executeMutation(
        (async () => {
      await mutate(
              (currentData: Transaction[] | undefined) => 
                currentData ? currentData.filter((t) => t.id !== id) : [],
              { revalidate: false }
            );
      await transactionQueries.deleteTransaction(id);
      await invalidateTransactions();
      return true;
        })(),
        'useTransaction.delete', { onError: async (err) => { await mutate(); } }
      );
  }, [mutate]);

  const getAnalytics = useCallback(
    async (start: Date, end: Date) => {
      return await executeMutation(
            (async () => {
          return await transactionQueries.getSummaryByCategory(start, end);
            })(),
            'useTransaction.analytics'
          );
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
