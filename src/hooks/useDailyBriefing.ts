'use client';

import { useMemo, useEffect, useState } from 'react';
import { useLifeScore } from './useLifeScore';
import { useStreak } from './useStreak';
import { useFinancialHealth } from './useFinancialHealth';
import { useCareerAnalytics } from './useCareerAnalytics';
import { useReminder } from './useReminder';
import { useDailyTasks } from './useDailyTasks';
import { analyticsQueries } from '@/services/analytics/analyticsQueries';
import { generateDailyBriefing, DailyBriefing } from '@/libs/analytics/dailyBriefing';

export function useDailyBriefing(): {
  briefing: DailyBriefing | null;
  isLoading: boolean;
} {
  const { lifeScore, isLoading: lsLoading } = useLifeScore();
  const { streakData, isLoading: streakLoading } = useStreak();
  const { healthScore, isLoading: fhLoading } = useFinancialHealth();
  const { analytics: careerStats, isLoading: careerLoading } = useCareerAnalytics();
  const { reminders, isLoading: remindersLoading } = useReminder();
  const { tasks, completedCount, totalCount, isLoading: tasksLoading } = useDailyTasks();

  const [yesterdayScore, setYesterdayScore] = useState<number | null>(null);
  
  useEffect(() => {
    // Save today's score and get yesterday's score
    async function syncScores() {
      if (lifeScore) {
        await analyticsQueries.saveLifeScore({
          finance_score: lifeScore.finance,
          productivity_score: lifeScore.productivity,
          health_score: lifeScore.health,
          career_score: lifeScore.career,
          overall_score: lifeScore.overall,
        });
        
        const recent = await analyticsQueries.getRecentLifeScores();
        setYesterdayScore(recent.yesterday?.overall_score ?? null);
      }
    }
    syncScores();
  }, [lifeScore]);

  const isLoading =
    lsLoading || streakLoading || fhLoading || careerLoading || remindersLoading || tasksLoading;

  const briefing = useMemo(() => {
    if (isLoading) return null;
    return generateDailyBriefing({
      lifeScore,
      yesterdayScore,
      streakData,
      healthScore,
      careerStats,
      reminders,
      tasksRemaining: totalCount - completedCount,
    });
  }, [isLoading, lifeScore, yesterdayScore, streakData, healthScore, careerStats, reminders, totalCount, completedCount]);

  return { briefing, isLoading };
}
