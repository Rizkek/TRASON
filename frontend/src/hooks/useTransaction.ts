'use client';

import { useCallback } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { apiClient } from '@/services/apiClient';
import { Transaction } from '@/types';
import { useFetch } from './useFetch';

export const useTransaction = () => {
  const store = useTransactionStore();
  const { execute } = useFetch<Transaction[]>();

  const fetchTransactions = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      return execute(
        apiClient.get('/transactions', {
          params: {
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          },
        })
      );
    },
    [execute]
  );

  const createTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      return execute(apiClient.post('/transactions', data));
    },
    [execute]
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
    ) => {
      return execute(apiClient.put(`/transactions/${id}`, data));
    },
    [execute]
  );

  const deleteTransaction = useCallback(async (id: string) => {
    return execute(apiClient.delete(`/transactions/${id}`));
  }, [execute]);

  const getAnalytics = useCallback(
    async (startDate: Date, endDate: Date) => {
      return execute(
        apiClient.get('/transactions/analytics', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        })
      );
    },
    [execute]
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
