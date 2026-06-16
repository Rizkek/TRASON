'use client';

import useSWR from 'swr';
import { categoryQueries } from '@/services/queries';
import { Category } from '@/types/database';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { logError, handleQueryError } from '@/libs/apiErrors';

export const useCategory = (type?: 'income' | 'expense') => {
  const key = type ? ['categories', type] : ['categories', 'all'];

  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    key,
    async () => {
      try {
        const allCategories = await categoryQueries.getCategories() || [];
        if (type) {
          return allCategories.filter(c => c.type === type);
        }
        return allCategories;
      } catch (err) {
        logError(err, 'useCategory.fetch');
        throw handleQueryError(err);
      }
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
