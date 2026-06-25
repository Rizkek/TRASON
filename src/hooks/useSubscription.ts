'use client';

import useSWR from 'swr';
import { subscriptionQueries } from '@/services/activity/subscriptionQueries';
import { Subscription } from '@/types/database';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { executeMutation } from "@/libs/api/mutationBuilder";

export const useSubscription = () => {
  const { data, error, isLoading, mutate } = useSWR<Subscription[]>(
    ['subscriptions'],
    async () => {
      return await executeMutation(
        (async () => {
          return await subscriptionQueries.getSubscriptions() || [];
        })(),
        'useSubscription.fetch'
      );
    },
    SWR_CONFIG_DASHBOARD
  );

  const createSubscription = async (subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    return await executeMutation(
      subscriptionQueries.createSubscription(subscription),
      'useSubscription.create',
      { onSuccess: () => mutate() }
    );
  };

  const updateSubscription = async (id: string, updates: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>) => {
    return await executeMutation(
      subscriptionQueries.updateSubscription(id, updates),
      'useSubscription.update',
      { onSuccess: () => mutate() }
    );
  };

  const deleteSubscription = async (id: string) => {
    return await executeMutation(
      subscriptionQueries.deleteSubscription(id),
      'useSubscription.delete',
      { onSuccess: () => mutate() }
    );
  };

  return {
    subscriptions: data || [],
    isLoading,
    error: error as Error | null,
    mutate,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  };
};
