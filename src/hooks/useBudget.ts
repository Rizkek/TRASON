'use client';

import useSWR from 'swr';
import { budgetQueries } from '@/services/finance/budgetQueries';
import { Budget } from '@/types/database';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { executeMutation } from "@/libs/api/mutationBuilder";

export const useBudget = () => {
  const { data, error, isLoading, mutate } = useSWR<Budget[]>(
    ['budgets'],
    async () => {
      return await executeMutation(
        (async () => {
          return await budgetQueries.getBudgets() || [];
        })(),
        'useBudget.fetch'
      );
    },
    SWR_CONFIG_DASHBOARD
  );

  const getGlobalBudget = () => {
    if (!data) return null;
    return data.find(b => b.category_id === null) || null;
  };

  const upsertBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }) => {
    return await executeMutation(
      budgetQueries.upsertBudget(budget),
      'useBudget.upsert',
      { onSuccess: () => mutate() }
    );
  };

  const deleteBudget = async (id: string) => {
    return await executeMutation(
      budgetQueries.deleteBudget(id),
      'useBudget.delete',
      { onSuccess: () => mutate() }
    );
  };

  return {
    budgets: data || [],
    globalBudget: getGlobalBudget(),
    isLoading,
    error: error as Error | null,
    mutate,
    upsertBudget,
    deleteBudget,
  };
};
