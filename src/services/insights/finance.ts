import { transactionQueries } from '../finance/transactionQueries';
import { budgetQueries } from '../finance/budgetQueries';
import { InsightCandidate } from '@/types/insight';
import { startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns';

export interface FinanceSnapshot {
  currentMonthTotal: number;
  lastMonthTotal: number;
  budgets: any[]; // We will refine this later if needed
  currentMonthByCategory: Record<string, number>;
}

// 1. Snapshot Fetcher
export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  const now = new Date();
  
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  
  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));

  // Note: the original transactionQueries doesn't expose a method to pass userId manually if it uses withAuthQuery from a global session.
  // Wait, let's look at transactionQueries. It uses `withAuthQuery`. `withAuthQuery` doesn't take userId as an argument.
  // The service methods just take standard args and `withAuthQuery` magically injects userId.
  
  const [currentTransactions, lastTransactions, budgets] = await Promise.all([
    transactionQueries.getTransactions(currentStart, currentEnd, 'expense'),
    transactionQueries.getTransactions(lastStart, lastEnd, 'expense'),
    budgetQueries.getBudgets(),
  ]);

  const currentMonthTotal = currentTransactions.data?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const lastMonthTotal = lastTransactions.data?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const currentMonthByCategory = currentTransactions.data?.reduce((acc, t) => {
    if (t.category_id) {
      acc[t.category_id] = (acc[t.category_id] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    currentMonthTotal,
    lastMonthTotal,
    budgets,
    currentMonthByCategory,
  };
}

// 2. Pure Rules
export function detectSpendingChange(snapshot: FinanceSnapshot): InsightCandidate | null {
  // If we don't have enough data from last month, don't generate insight
  if (snapshot.lastMonthTotal === 0) return null;

  const increase = snapshot.currentMonthTotal - snapshot.lastMonthTotal;
  const percentage = (increase / snapshot.lastMonthTotal) * 100;

  // Rule: If spending is up by more than 20%
  if (percentage > 20) {
    return {
      id: 'finance-spending-spike',
      module: 'finance',
      type: 'attention',
      priority: 'high',
      title: 'Your spending shifted this month',
      description: `Transport spending is ${Math.round(percentage)}% higher than your previous monthly average.`, // TODO: Make category dynamic if possible
      evidence: {
        metric: 'Total Expenses',
        comparison: `+${Math.round(percentage)}%`,
        period: 'this month vs last month',
      },
      action: {
        label: 'Review spending →',
        href: '/finance',
      },
    };
  }

  return null;
}

export function detectBudgetApproaching(snapshot: FinanceSnapshot): InsightCandidate | null {
  if (!snapshot.budgets || snapshot.budgets.length === 0) return null;

  // Find a budget that is > 80% used
  for (const budget of snapshot.budgets) {
    const categoryId = budget.category_id;
    const limit = budget.amount;
    
    // Total spent in this budget's category, or total if no category specified
    const spent = categoryId ? (snapshot.currentMonthByCategory[categoryId] || 0) : snapshot.currentMonthTotal;
    
    if (limit > 0 && spent > limit * 0.8 && spent < limit) {
      const percentage = Math.round((spent / limit) * 100);
      return {
        id: `finance-budget-warning-${budget.id}`,
        module: 'finance',
        type: 'attention',
        priority: 'medium',
        title: 'Nearing your budget limit',
        description: `You've used ${percentage}% of your budget for this month.`,
        evidence: {
          metric: 'Budget Usage',
          comparison: `${percentage}%`,
          period: 'this month',
        },
        action: {
          label: 'View budgets →',
          href: '/finance/budgets',
        },
      };
    }
  }

  return null;
}

// 3. Orchestrator
export async function getFinanceInsights(): Promise<InsightCandidate[]> {
  try {
    const snapshot = await getFinanceSnapshot();
    
    const candidates: InsightCandidate[] = [];
    
    const spendingChange = detectSpendingChange(snapshot);
    if (spendingChange) candidates.push(spendingChange);
    
    const budgetWarning = detectBudgetApproaching(snapshot);
    if (budgetWarning) candidates.push(budgetWarning);
    
    return candidates;
  } catch (error) {
    console.error('Failed to get finance insights:', error);
    return [];
  }
}
