'use client';

import useSWR from 'swr';
import { categoryQueries } from '@/services/activity/categoryQueries';
import { Category } from '@/types/database';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { executeMutation } from "@/libs/api/mutationBuilder";

export const useCategory = (type?: 'income' | 'expense') => {
  const key = type ? ['categories', type] : ['categories', 'all'];

  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    key,
    async () => {
      return await executeMutation(
          (async () => {
        const allCategories = await categoryQueries.getCategories() || [];
        if (type) {
                  return allCategories.filter(c => c.type === type);
                }
        return allCategories;
          })(),
          'useCategory.fetch'
        );
    },
    SWR_CONFIG_DASHBOARD
  );

  return {
    categories: data || [],
    isLoading,
    error: error as Error | null,
    mutate,
  };
};
