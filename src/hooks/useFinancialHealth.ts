'use client';

import { useMemo } from 'react';
import { useTransaction } from '@/hooks/useTransaction';
import { getDateRange } from '@/libs/date';
import {
  calculateFinancialHealth,
  detectSubscriptions,
  detectSpendingLeaks,
  FinancialHealthScore,
  SubscriptionItem,
  SpendingLeak,
} from '@/libs/analytics/financialHealth';
import { Transaction } from '@/types/database';

const now = new Date();
const { start: thisStart, end: thisEnd } = getDateRange(now.getMonth(), now.getFullYear());
const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
const { start: prevStart, end: prevEnd } = getDateRange(prevMonth, prevYear);

export function useFinancialHealth(): {
  healthScore: FinancialHealthScore | null;
  subscriptions: SubscriptionItem[];
  spendingLeaks: SpendingLeak[];
  isLoading: boolean;
} {
  const { transactions: thisMonthTx, isLoading: thisLoading } = useTransaction(thisStart, thisEnd);
  const { transactions: lastMonthTx, isLoading: lastLoading } = useTransaction(prevStart, prevEnd);

  const isLoading = thisLoading || lastLoading;

  const healthScore = useMemo(() => {
    if (isLoading || !thisMonthTx.length) return null;
    return calculateFinancialHealth(thisMonthTx);
  }, [isLoading, thisMonthTx]);

  const subscriptions = useMemo(() => {
    if (isLoading) return [];
    const combined = [...thisMonthTx, ...lastMonthTx];
    return detectSubscriptions(combined);
  }, [isLoading, thisMonthTx, lastMonthTx]);

  const spendingLeaks = useMemo(() => {
    if (isLoading) return [];
    return detectSpendingLeaks(thisMonthTx, lastMonthTx);
  }, [isLoading, thisMonthTx, lastMonthTx]);

  return { healthScore, subscriptions, spendingLeaks, isLoading };
}
