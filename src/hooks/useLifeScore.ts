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
import { useActivity } from '@/hooks/useActivity';
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
const { start: monthStart, end: monthEnd } = getDateRange(now.getMonth(), now.getFullYear());

const rollingStart = new Date(now);
rollingStart.setDate(now.getDate() - 7);
rollingStart.setHours(0, 0, 0, 0);

const rollingEnd = new Date(now);
rollingEnd.setHours(23, 59, 59, 999);

export function useLifeScore(): {
  lifeScore: LifeScoreResult | null;
  isLoading: boolean;
} {
  const { transactions, isLoading: txLoading } = useTransaction(monthStart, monthEnd);
  const { totalCount, isLoading: taskLoading } = useDailyTasks();
  const { applications, isLoading: careerLoading } = useCareer();
  const { activities, isLoading: actLoading } = useActivity(rollingStart, rollingEnd);

  const isLoading = txLoading || taskLoading || careerLoading || actLoading;

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

    // Productivity metrics (7-day rolling)
    const streak = 0; // Will be populated by useStreak hook later
    
    // Estimate total tasks in 7 days (current active tasks * 7)
    const totalTasksLast7Days = totalCount * 7;
    
    // Count completed tasks from timeline activities
    const completedLast7Days = activities
      .filter(a => a.category === 'daily_tasks')
      .reduce((sum, a) => {
        const match = a.title.match(/^(\d+)\s+Daily Task/);
        // If exact match fails, fallback to counting 1
        return sum + (match ? parseInt(match[1]) : 1);
      }, 0);

    const productivity = calculateProductivityScore({
      completedLast7Days,
      totalTasksLast7Days,
      streak,
    });

    // Health metrics (7-day rolling)
    const SPORT_CATEGORIES = ['sport', 'exercise'];
    const sportSessionsLast7Days = activities.filter(
      a => a.category && SPORT_CATEGORIES.includes(a.category.toLowerCase())
    ).length;

    const health = calculateHealthScore({
      sportSessionsLast7Days,
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
  }, [isLoading, transactions, totalCount, activities, applications]);

  return { lifeScore, isLoading };
}
