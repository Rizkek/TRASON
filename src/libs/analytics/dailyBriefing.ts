import { LifeScoreResult } from './lifeScore';
import { StreakData } from './streakEngine';
import { FinancialHealthScore } from './financialHealth';
import { CareerAnalytics } from './careerAnalytics';
import { Reminder } from '@/types/database';

export interface DailyBriefing {
  greetingInsight: string;
  scoreDelta: number; // + or - from yesterday
  urgentReminders: number;
  tasksRemaining: number;
  highlightInsight: string;
}

export function generateDailyBriefing(params: {
  lifeScore: LifeScoreResult | null;
  yesterdayScore: number | null; // from DB
  streakData: StreakData | null;
  healthScore: FinancialHealthScore | null;
  careerStats: CareerAnalytics | null;
  reminders: Reminder[];
  tasksRemaining: number;
}): DailyBriefing {
  const {
    lifeScore,
    yesterdayScore,
    streakData,
    healthScore,
    careerStats,
    reminders,
    tasksRemaining,
  } = params;

  const scoreDelta = lifeScore && yesterdayScore ? lifeScore.overall - yesterdayScore : 0;
  
  // Urgent reminders: due today or overdue, not done
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentReminders = reminders.filter(r => r.status === 'pending' && r.due_date && r.due_date <= todayStr).length;

  let highlightInsight = '';
  if (healthScore && healthScore.score < 50) {
    highlightInsight = 'Perhatikan pengeluaran hari ini. Saving rate Anda perlu ditingkatkan.';
  } else if (streakData && streakData.currentStreak >= 3) {
    highlightInsight = `Pertahankan momentum! Anda sudah konsisten ${streakData.currentStreak} hari berturut-turut.`;
  } else if (careerStats && careerStats.daysSinceLastApplication !== null && careerStats.daysSinceLastApplication > 7) {
    highlightInsight = `Sudah ${careerStats.daysSinceLastApplication} hari tidak ada aktivitas lamaran kerja.`;
  } else if (tasksRemaining > 0) {
    highlightInsight = `Fokus selesaikan ${tasksRemaining} tugas utama hari ini.`;
  } else {
    highlightInsight = 'Semua metrik dalam kondisi baik. Pertahankan progres Anda!';
  }

  const hour = new Date().getHours();
  let greetingInsight = '';
  if (hour < 11) {
    greetingInsight = 'Selamat Pagi! Mari mulai hari ini dengan fokus.';
  } else if (hour < 15) {
    greetingInsight = 'Selamat Siang! Tetap produktif dan jaga momentum.';
  } else if (hour < 19) {
    greetingInsight = 'Selamat Sore! Waktunya menyelesaikan tugas tersisa.';
  } else {
    greetingInsight = 'Selamat Malam! Saatnya istirahat dan mengevaluasi hari.';
  }

  return {
    greetingInsight,
    scoreDelta,
    urgentReminders,
    tasksRemaining,
    highlightInsight,
  };
}
