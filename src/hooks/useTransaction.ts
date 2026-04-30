'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { transactionQueries } from '@/services/queries';
import { Transaction } from '@/services/supabaseClient';

export const useTransaction = (startDate?: Date, endDate?: Date, type?: 'income' | 'expense') => {
  // SWR menggunakan key unik (array) untuk mendeteksi caching. 
  // Jika startDate/endDate berubah, SWR otomatis mengambil data baru & melakukan caching memori.
  const key = startDate && endDate 
    ? ['transactions', startDate.toISOString(), endDate.toISOString(), type || 'all']
    : ['transactions', 'all'];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async ([, start, end, t]) => {
      const res = await transactionQueries.getTransactions(
        start === 'all' ? undefined : new Date(start), 
        end ? new Date(end) : undefined, 
        t === 'all' ? undefined : (t as 'income' | 'expense')
      );
      return res.data || [];
    },
    {
      revalidateOnFocus: true, // Auto-update jika user kembali ke tab ini
      dedupingInterval: 5000,  // Tahan api call ganda dalam 5 detik
    }
  );

  const createTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      const result = await transactionQueries.createTransaction(data);
      // Memerintahkan SWR untuk me-refresh data transaksi global di semua halaman
      await mutate();
      return result;
    },
    [mutate]
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      data: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
    ) => {
      const result = await transactionQueries.updateTransaction(id, data);
      await mutate();
      return result;
    },
    [mutate]
  );

  const deleteTransaction = useCallback(async (id: string) => {
    await transactionQueries.deleteTransaction(id);
    await mutate();
  }, [mutate]);

  const getAnalytics = useCallback(
    async (start: Date, end: Date) => {
      return await transactionQueries.getSummaryByCategory(start, end);
    },
    []
  );

  return {
    transactions: data || [],
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getAnalytics,
    mutate // Diekspor buat jaga-jaga kalau ada yang mau refresh manual
  };
};
