/**
 * TRASON Analytics Engine — Streak Calculator
 * Computes daily task streaks from daily_task_logs.
 * Zero AI cost.
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  completionHistory: { date: string; completed: boolean }[];
}

/**
 * Calculates streak from an array of dates on which tasks were completed.
 * @param completedDates - Array of date strings ('YYYY-MM-DD') where user completed tasks
 * @param threshold - Min completion percentage for a day to count as "done" (default: 0.8 = 80%)
 */
export function calculateStreak(
  logs: { completed_date: string; task_id: string }[],
  totalTasks: number,
  threshold = 0.8
): StreakData {
  if (logs.length === 0 || totalTasks === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      completionHistory: [],
    };
  }

  // Group logs by date and count completions
  const byDate: Record<string, number> = {};
  logs.forEach(log => {
    byDate[log.completed_date] = (byDate[log.completed_date] || 0) + 1;
  });

  // Determine which dates were "successful" (>= threshold% complete)
  const minRequired = Math.ceil(totalTasks * threshold);
  const successDates = new Set(
    Object.entries(byDate)
      .filter(([, count]) => count >= minRequired)
      .map(([date]) => date)
  );

  // Build 30-day history
  const today = new Date();
  const history: { date: string; completed: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    history.push({ date: dateStr, completed: successDates.has(dateStr) });
  }

  // Calculate current streak (counting backwards from today)
  let currentStreak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  history.forEach(day => {
    if (day.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  // Last completed date
  const completedDays = history.filter(h => h.completed);
  const lastCompletedDate = completedDays.length > 0
    ? completedDays[completedDays.length - 1].date
    : null;

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate,
    completionHistory: history,
  };
}

export function getStreakEmoji(streak: number): string {
  if (streak === 0) return '😴';
  if (streak < 3) return '🌱';
  if (streak < 7) return '🔥';
  if (streak < 14) return '⚡';
  if (streak < 30) return '🚀';
  return '💎';
}

export function getStreakLabel(streak: number): string {
  if (streak === 0) return 'Mulai hari ini!';
  if (streak === 1) return '1 hari';
  if (streak < 7) return `${streak} hari`;
  if (streak === 7) return '1 minggu penuh! 🎉';
  if (streak < 30) return `${streak} hari berturut-turut`;
  return `${streak} hari — Luar biasa! 🏆`;
}
