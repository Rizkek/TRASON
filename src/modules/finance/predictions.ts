import { Transaction } from '@/types/database';

export function calculateRunRate(transactions: Transaction[], daysInMonth: number): number {
  const currentDay = new Date().getDate();
  const totalSpent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (currentDay === 0) return 0;
  return (totalSpent / currentDay) * daysInMonth;
}

export function detectRecurringExpenses(transactions: Transaction[]): Record<string, any[]> {
  // Simple algorithm to detect recurring transactions by name and amount
  // In a real app, this should look at past months as well.
  const expenseMap: Record<string, Transaction[]> = {};
  
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const key = `${t.title}-${t.amount}`;
      if (!expenseMap[key]) expenseMap[key] = [];
      expenseMap[key].push(t);
    });

  // Filter for those that appear multiple times (or just return map for now since we only have 1 month)
  return expenseMap;
}
