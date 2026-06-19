'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { transactionQueries } from '@/services/finance/transactionQueries';
import { Transaction } from '@/services/supabaseClient';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { CACHE_KEYS, INVALIDATION_PATTERNS } from '@/libs/cacheKeys';
import { executeMutation } from "@/libs/api/mutationBuilder";
import { getUserErrorMessage } from "@/libs/apiErrors";

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
    SWR_CONFIG_DASHBOARD
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
          await mutate(
                    (currentData: Transaction[] | undefined) => 
                      currentData ? currentData.map((t) => (t.id === id ? { ...t, ...updates } as Transaction : t)) : [],
                    { revalidate: false }
                  );
          const result = await transactionQueries.updateTransaction(id, updates);
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
