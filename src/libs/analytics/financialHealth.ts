/**
 * TRASON Analytics Engine — Financial Health Score
 * 
 * Detects subscriptions, spending leaks, and calculates financial health.
 * Zero AI cost — all pure TypeScript calculations.
 */

import { Transaction } from '@/types/database';

export interface FinancialHealthScore {
  score: number; // 0-100
  label: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';
  savingRate: number;
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  checks: { label: string; passed: boolean; value: number }[];
}

export interface SubscriptionItem {
  title: string;
  amount: number;
  currency: string;
  occurrences: number;
  lastDate: string;
}

export interface SpendingLeak {
  category: string;
  thisMonth: number;
  lastMonth: number;
  changePercent: number;
  isLeak: boolean; // true if >20% increase
}

// ============================================================
// FINANCIAL HEALTH SCORE
// ============================================================
export function calculateFinancialHealth(transactions: Transaction[]): FinancialHealthScore {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? netFlow / totalIncome : 0;

  const checks = [
    {
      label: 'Saving rate ≥ 20% (target sehat)',
      passed: savingRate >= 0.20,
      value: 30,
    },
    {
      label: 'Pengeluaran < 80% pendapatan',
      passed: totalIncome > 0 && totalExpense / totalIncome < 0.80,
      value: 25,
    },
    {
      label: 'Tidak defisit (income ≥ expense)',
      passed: netFlow >= 0,
      value: 20,
    },
    {
      label: 'Ada pemasukan tercatat',
      passed: totalIncome > 0,
      value: 15,
    },
    {
      label: 'Saving rate ≥ 30% (ideal)',
      passed: savingRate >= 0.30,
      value: 10,
    },
  ];

  const score = Math.min(100, checks.reduce((acc, c) => acc + (c.passed ? c.value : 0), 0));

  const label: FinancialHealthScore['label'] =
    score >= 85 ? 'Excellent' :
    score >= 70 ? 'Good' :
    score >= 50 ? 'Fair' :
    score >= 30 ? 'Poor' : 'Critical';

  return { score, label, savingRate, totalIncome, totalExpense, netFlow, checks };
}

// ============================================================
// SUBSCRIPTION DETECTION
// Detects recurring transactions with same title pattern
// ============================================================
export function detectSubscriptions(transactions: Transaction[]): SubscriptionItem[] {
  const expenseMap: Record<string, Transaction[]> = {};

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const key = normalizeTitle(t.title);
      if (!expenseMap[key]) expenseMap[key] = [];
      expenseMap[key].push(t);
    });

  return Object.entries(expenseMap)
    .filter(([, txs]) => txs.length >= 2)
    .map(([, txs]) => {
      const sorted = [...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return {
        title: sorted[0].title,
        amount: sorted[0].amount,
        currency: sorted[0].original_currency || 'USD',
        occurrences: txs.length,
        lastDate: sorted[0].date,
      };
    })
    .filter(item => item.occurrences >= 2)
    .sort((a, b) => b.amount - a.amount);
}

function normalizeTitle(title: string): string {
  return title.toLowerCase()
    .replace(/\d+/g, '') // remove numbers
    .replace(/[^a-z\s]/g, '') // keep only letters
    .trim()
    .split(/\s+/)
    .slice(0, 3) // take first 3 words
    .join(' ');
}

// ============================================================
// SPENDING LEAK DETECTION
// Compares this month vs last month spending by category
// ============================================================
export function detectSpendingLeaks(
  thisMonthTransactions: Transaction[],
  lastMonthTransactions: Transaction[]
): SpendingLeak[] {
  const thisMonthByCategory = groupByCategory(thisMonthTransactions);
  const lastMonthByCategory = groupByCategory(lastMonthTransactions);

  const allCategories = new Set([
    ...Object.keys(thisMonthByCategory),
    ...Object.keys(lastMonthByCategory),
  ]);

  return Array.from(allCategories)
    .map(cat => {
      const thisMonth = thisMonthByCategory[cat] || 0;
      const lastMonth = lastMonthByCategory[cat] || 0;
      const changePercent = lastMonth > 0
        ? ((thisMonth - lastMonth) / lastMonth) * 100
        : thisMonth > 0 ? 100 : 0;

      return {
        category: cat,
        thisMonth,
        lastMonth,
        changePercent: Math.round(changePercent),
        isLeak: changePercent > 20 && thisMonth > 0,
      };
    })
    .filter(l => l.thisMonth > 0 || l.lastMonth > 0)
    .sort((a, b) => b.changePercent - a.changePercent);
}

function groupByCategory(transactions: Transaction[]): Record<string, number> {
  const result: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const key = (t as any).category?.name || t.category_id || 'Lainnya';
      result[key] = (result[key] || 0) + t.amount;
    });
  return result;
}
