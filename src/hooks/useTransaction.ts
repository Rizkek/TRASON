'use client';

import { useCallback } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { transactionQueries } from '@/services/queries';
import { Transaction } from '@/services/supabaseClient';
import { useFetch } from './useFetch';

export const useTransaction = () => {
  const store = useTransactionStore();
  const { execute } = useFetch<Transaction[]>();

  const fetchTransactions = useCallback(
    async (startDate?: Date, endDate?: Date, type?: 'income' | 'expense') => {
      try {
        store.setLoading(true);
        const result = await transactionQueries.getTransactions(
          startDate,
          endDate,
          type
        );
        store.setTransactions(result.data || []);
        return result.data;
      } catch (error) {
        store.setError(error instanceof Error ? error.message : 'Failed to fetch');
        throw error;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  const createTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      try {
        return await transactionQueries.createTransaction(data);
      } catch (error) {
        throw error;
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
        return await transactionQueries.updateTransaction(id, data);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await transactionQueries.deleteTransaction(id);
    } catch (error) {
      throw error;
    }
  }, []);

  const getAnalytics = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        return await transactionQueries.getSummaryByCategory(startDate, endDate);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return {
    transactions: store.transactions,
    isLoading: store.isLoading,
    error: store.error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getAnalytics,
  };
};
