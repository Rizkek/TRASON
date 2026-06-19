/**
 * TRASON Analytics Engine — Life Score Calculator
 * 
 * Pure rule-based scoring system. Zero AI cost.
 * All calculations are deterministic and based on user's actual data.
 */

import { Transaction } from '@/types/database';

export interface LifeScoreDetail {
  score: number;
  points: { label: string; value: number; passed: boolean }[];
}

export interface LifeScoreResult {
  overall: number;
  finance: number;
  productivity: number;
  health: number;
  career: number;
  financeDetail: LifeScoreDetail;
  productivityDetail: LifeScoreDetail;
  healthDetail: LifeScoreDetail;
  careerDetail: LifeScoreDetail;
  insights: string[];
}

// ============================================================
// FINANCE SCORE (0-100)
// ============================================================
export function calculateFinanceScore(params: {
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  hasCategories: boolean;
}): LifeScoreDetail {
  const { totalIncome, totalExpense, transactionCount, hasCategories } = params;
  const savingRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
  const expenseRatio = totalIncome > 0 ? totalExpense / totalIncome : 1;

  const checks = [
    {
      label: 'Saving rate ≥ 20%',
      passed: savingRate >= 0.20,
      value: 30,
    },
    {
      label: 'Pengeluaran < 80% pendapatan',
      passed: expenseRatio < 0.80,
      value: 25,
    },
    {
      label: 'Tidak defisit bulan ini',
      passed: totalIncome >= totalExpense,
      value: 20,
    },
    {
      label: 'Transaksi tercatat minimal 5',
      passed: transactionCount >= 5,
      value: 15,
    },
    {
      label: 'Transaksi dikategorikan',
      passed: hasCategories,
      value: 10,
    },
  ];

  const score = checks.reduce((acc, c) => acc + (c.passed ? c.value : 0), 0);
  return { score: Math.min(100, score), points: checks };
}

// ============================================================
// PRODUCTIVITY SCORE (0-100)
// ============================================================
export function calculateProductivityScore(params: {
  completedLast7Days: number;
  totalTasksLast7Days: number;
  streak: number;
}): LifeScoreDetail {
  const { completedLast7Days, totalTasksLast7Days, streak } = params;
  const completionRate = totalTasksLast7Days > 0 ? completedLast7Days / totalTasksLast7Days : 0;

  const checks = [
    {
      label: 'Rata-rata task diselesaikan (7 hari) ≥ 80%',
      passed: completionRate >= 0.80,
      value: 35,
    },
    {
      label: 'Ada task dalam 7 hari terakhir',
      passed: totalTasksLast7Days > 0,
      value: 15,
    },
    {
      label: 'Streak ≥ 3 hari',
      passed: streak >= 3,
      value: 20,
    },
    {
      label: 'Streak ≥ 7 hari',
      passed: streak >= 7,
      value: 20,
    },
    {
      label: 'Streak ≥ 30 hari',
      passed: streak >= 30,
      value: 10,
    },
  ];

  const score = checks.reduce((acc, c) => acc + (c.passed ? c.value : 0), 0);
  return { score: Math.min(100, score), points: checks };
}

// ============================================================
// HEALTH SCORE (0-100)
// ============================================================
export function calculateHealthScore(params: {
  sportSessionsLast7Days: number;
  sportTargetPerWeek: number;
}): LifeScoreDetail {
  const { sportSessionsLast7Days, sportTargetPerWeek } = params;
  const target = sportTargetPerWeek || 3; // default target 3x/week
  const ratio = sportSessionsLast7Days / target;

  const checks = [
    {
      label: 'Olahraga minimal 1x (7 hari terakhir)',
      passed: sportSessionsLast7Days >= 1,
      value: 20,
    },
    {
      label: 'Olahraga minimal 2x (7 hari terakhir)',
      passed: sportSessionsLast7Days >= 2,
      value: 20,
    },
    {
      label: 'Olahraga minimal 3x (7 hari terakhir)',
      passed: sportSessionsLast7Days >= 3,
      value: 25,
    },
    {
      label: 'Target olahraga terpenuhi',
      passed: ratio >= 1.0,
      value: 25,
    },
    {
      label: 'Melebihi target olahraga',
      passed: ratio > 1.2,
      value: 10,
    },
  ];

  const score = checks.reduce((acc, c) => acc + (c.passed ? c.value : 0), 0);
  return { score: Math.min(100, score), points: checks };
}

// ============================================================
// CAREER SCORE (0-100)
// ============================================================
export function calculateCareerScore(params: {
  totalApplications: number;
  activeApplications: number;
  daysSinceLastApplication: number | null;
  responseRate: number; // 0-1
}): LifeScoreDetail {
  const { totalApplications, activeApplications, daysSinceLastApplication, responseRate } = params;
  const daysInactive = daysSinceLastApplication ?? 999;

  const checks = [
    {
      label: 'Ada lamaran aktif',
      passed: activeApplications > 0,
      value: 25,
    },
    {
      label: 'Aktif melamar (< 7 hari terakhir)',
      passed: daysInactive < 7,
      value: 25,
    },
    {
      label: 'Response rate ≥ 15%',
      passed: responseRate >= 0.15,
      value: 25,
    },
    {
      label: 'Total lamaran ≥ 5',
      passed: totalApplications >= 5,
      value: 15,
    },
    {
      label: 'Total lamaran ≥ 20',
      passed: totalApplications >= 20,
      value: 10,
    },
  ];

  const score = checks.reduce((acc, c) => acc + (c.passed ? c.value : 0), 0);
  return { score: Math.min(100, score), points: checks };
}

// ============================================================
// COMPOSITE LIFE SCORE
// ============================================================
export function calculateLifeScore(params: {
  finance: LifeScoreDetail;
  productivity: LifeScoreDetail;
  health: LifeScoreDetail;
  career: LifeScoreDetail;
}, t: (key: string) => string): LifeScoreResult {
  const { finance, productivity, health, career } = params;

  // Weighted average
  const overall = Math.round(
    finance.score * 0.30 +
    productivity.score * 0.25 +
    health.score * 0.25 +
    career.score * 0.20
  );

  // Generate rule-based insights (no AI needed)
  const insights: string[] = [];

  if (finance.score < 40) {
    insights.push(t('life_score.insights.finance_attention'));
  }
  if (productivity.score < 40) {
    insights.push(t('life_score.insights.productivity_momentum'));
  }
  if (health.score < 40) {
    insights.push(t('life_score.insights.health_start'));
  }
  if (career.score < 40) {
    insights.push(t('life_score.insights.career_activity'));
  }

  const lowestDimension = [
    { name: 'Finance', score: finance.score },
    { name: 'Productivity', score: productivity.score },
    { name: 'Health', score: health.score },
    { name: 'Career', score: career.score },
  ].sort((a, b) => a.score - b.score)[0];

  if (overall >= 70 && lowestDimension.score < 50) {
    const areaTrans = t(`life_score.dimensions.${lowestDimension.name.toLowerCase()}`);
    insights.push(t('life_score.insights.area_to_improve').replace('{area}', areaTrans));
  }
  if (overall >= 80) {
    insights.push(t('life_score.insights.excellent_score'));
  }

  return {
    overall,
    finance: finance.score,
    productivity: productivity.score,
    health: health.score,
    career: career.score,
    financeDetail: finance,
    productivityDetail: productivity,
    healthDetail: health,
    careerDetail: career,
    insights,
  };
}
