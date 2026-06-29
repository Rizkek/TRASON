'use client';

import useSWR, { mutate as globalMutate } from 'swr';
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

  const invalidateCategories = () => {
    // Invalidate all category cache keys globally
    globalMutate((k: any) => Array.isArray(k) && k[0] === 'categories');
    // Also invalidate transactions because they join with categories
    globalMutate((k: any) => Array.isArray(k) && k[0] === 'transactions');
  };

  const createCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    return await executeMutation(
      categoryQueries.createCategory(category),
      'useCategory.create',
      { onSuccess: invalidateCategories }
    );
  };

  const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'user_id' | 'created_at'>>) => {
    return await executeMutation(
      categoryQueries.updateCategory(id, updates),
      'useCategory.update',
      { onSuccess: invalidateCategories }
    );
  };

  const deleteCategory = async (id: string) => {
    return await executeMutation(
      categoryQueries.deleteCategory(id),
      'useCategory.delete',
      { onSuccess: invalidateCategories }
    );
  };

  return {
    categories: data || [],
    isLoading,
    error: error as Error | null,
    mutate,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
