import { transactionQueries, activityQueries } from '@/services/queries';

export async function aggregateUserDataForAI(userId: string) {
  try {
    // 1. Define 30-day window
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // 2. Fetch transactions
    const transactions = await transactionQueries.getTransactions(startDate, endDate);
    
    // Calculate total spend and top categories
    let totalSpend = 0;
    let totalIncome = 0;
    const categorySpend: Record<string, number> = {};

    (transactions.data || []).forEach((t: any) => {
      if (t.type === 'expense') {
        totalSpend += t.amount;
        if (t.categories?.name) {
          categorySpend[t.categories.name] = (categorySpend[t.categories.name] || 0) + t.amount;
        }
      } else if (t.type === 'income') {
        totalIncome += t.amount;
      }
    });

    // 3. Fetch activities (assuming last 30 days are handled or we fetch last 30 days)
    // Note: If activityQueries.getActivities only gets one date, we'd need to adapt, 
    // but assuming we can fetch recent activities here for the sake of MVP aggregation.
    // For now, we will just use summary placeholders if we don't have range query for activities.
    
    // Combine into a succinct summary text for the LLM prompt
    const summary = `
User Financial Summary (Last 30 Days):
- Total Income: $${totalIncome}
- Total Expenses: $${totalSpend}
- Category Breakdown: ${Object.entries(categorySpend).map(([cat, amount]) => `${cat}: $${amount}`).join(', ')}

Please provide 3 actionable, personalized insights based on this data. Be encouraging but realistic.
    `;

    return summary;
  } catch (error) {
    console.error('Failed to aggregate user data:', error);
    throw new Error('Aggregation failed');
  }
}
