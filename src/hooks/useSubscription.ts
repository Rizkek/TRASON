'use client';

import useSWR from 'swr';
import { subscriptionQueries } from '@/services/activity/subscriptionQueries';
import { Subscription } from '@/types/database';
import { SWR_CONFIG_DASHBOARD } from '@/config/swr';
import { executeMutation } from "@/libs/api/mutationBuilder";
import { transactionQueries } from '@/services/finance/transactionQueries';
import { addBillingCycle } from '@/libs/date';
import { getProfileToday } from '@/libs/profileDate';

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

  const cancelSubscription = async (id: string) => {
    return await updateSubscription(id, { is_active: false });
  };

  const markAsPaid = async (subscription: Subscription) => {
    return await executeMutation((async () => {
      // 1. Create a transaction
      const now = new Date();
      await transactionQueries.createTransaction({
        title: `Subscription: ${subscription.name}`,
        amount: subscription.amount,
        type: 'expense',
        date: getProfileToday(now),
        time: now.toTimeString().substring(0, 5),
        category_id: subscription.category_id || null,
        metadata: { is_subscription_auto: true, subscription_id: subscription.id },
      });

      // 2. Advance next billing date
      await subscriptionQueries.updateSubscription(subscription.id, {
        next_billing_date: addBillingCycle(subscription.next_billing_date, subscription.billing_cycle),
      });
      await mutate();
    })(), 'useSubscription.markAsPaid');
  };

  return {
    subscriptions: data || [],
    isLoading,
    error: error as Error | null,
    mutate,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    markAsPaid,
  };
};
