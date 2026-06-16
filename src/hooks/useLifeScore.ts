'use client';

/**
 * useLifeScore — SWR hook that computes the Life Score
 * from all existing module hooks. Zero DB round-trips needed
 * beyond what's already being fetched for the dashboard.
 */

import { useMemo } from 'react';
import { useCareer } from '@/hooks/useCareer';
import { useTransaction } from '@/hooks/useTransaction';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useWeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { getDateRange } from '@/libs/date';
import {
  calculateFinanceScore,
  calculateProductivityScore,
  calculateHealthScore,
  calculateCareerScore,
  calculateLifeScore,
  LifeScoreResult,
} from '@/libs/analytics/lifeScore';
import { calculateCareerAnalytics } from '@/libs/analytics/careerAnalytics';

const now = new Date();
const { start, end } = getDateRange(now.getMonth(), now.getFullYear());

export function useLifeScore(): {
  lifeScore: LifeScoreResult | null;
  isLoading: boolean;
} {
  const { transactions, isLoading: txLoading } = useTransaction(start, end);
  const { tasks, completedCount, totalCount, isLoading: taskLoading } = useDailyTasks();
  const { applications, isLoading: careerLoading } = useCareer();
  const { summary: sportSummary, isLoading: sportLoading } = useWeeklySportSummary();

  const isLoading = txLoading || taskLoading || careerLoading || sportLoading;

  const lifeScore = useMemo(() => {
    if (isLoading) return null;

    // Finance metrics
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const hasCategories = transactions.some(t => t.category_id);

    const finance = calculateFinanceScore({
      totalIncome,
      totalExpense,
      transactionCount: transactions.length,
      hasCategories,
    });

    // Productivity metrics (streak from local data only for now)
    const streak = 0; // Will be populated by useStreak hook later
    const productivity = calculateProductivityScore({
      completedToday: completedCount,
      totalTasks: totalCount,
      streak,
    });

    // Health metrics
    const health = calculateHealthScore({
      sportSessionsThisWeek: sportSummary?.totalSessions ?? 0,
      sportTargetPerWeek: 3,
    });

    // Career metrics
    const careerAnalytics = calculateCareerAnalytics(applications);
    const career = calculateCareerScore({
      totalApplications: careerAnalytics.totalApplications,
      activeApplications: careerAnalytics.activeApplications,
      daysSinceLastApplication: careerAnalytics.daysSinceLastApplication,
      responseRate: careerAnalytics.responseRate / 100,
    });

    return calculateLifeScore({ finance, productivity, health, career });
  }, [isLoading, transactions, completedCount, totalCount, sportSummary, applications]);

  return { lifeScore, isLoading };
}
