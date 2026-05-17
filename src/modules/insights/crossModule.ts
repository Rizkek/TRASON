/**
 * Cross-Module Insight Generators
 * Creates insights that combine data from multiple modules
 */

import { CrossModuleInsight, ModuleId } from '../types';

// Types for module data
export interface FinanceData {
  monthlySpending: number;
  monthlyIncome: number;
  topExpenseCategory: string;
  savingsRate: number;
}

export interface InvestmentData {
  totalValue: number;
  dayChange: number;
  topPerformer: string;
  worstPerformer: string;
}

export interface TimelineData {
  activitiesToday: number;
  productiveHours: number;
  topActivityCategory: string;
}

export interface ReminderData {
  pendingCount: number;
  overdueCount: number;
  highPriorityCount: number;
}

// Mock data generators (in real app, these would come from API/hooks)
const getFinanceData = async (): Promise<FinanceData | null> => {
  // This would call useTransaction or finance service
  return {
    monthlySpending: 2500000,
    monthlyIncome: 5000000,
    topExpenseCategory: 'Food',
    savingsRate: 50,
  };
};

const getInvestmentData = async (): Promise<InvestmentData | null> => {
  // This would call useInvestment or investment service
  return {
    totalValue: 100000000,
    dayChange: 2.5,
    topPerformer: 'BBCA',
    worstPerformer: 'TLKM',
  };
};

const getTimelineData = async (): Promise<TimelineData | null> => {
  // This would call useActivity or timeline service
  return {
    activitiesToday: 5,
    productiveHours: 6,
    topActivityCategory: 'Work',
  };
};

const getReminderData = async (): Promise<ReminderData | null> => {
  // This would call useReminder or reminder service
  return {
    pendingCount: 8,
    overdueCount: 2,
    highPriorityCount: 3,
  };
};

// ============================================================================
// INSIGHT GENERATORS
// ============================================================================

/**
 * Finance + Investment insight
 * "You spent X on dining out, which is Y% of your investment portfolio growth today"
 */
export const generateFinanceInvestmentInsight = async (
  finance: FinanceData,
  investment: InvestmentData
): Promise<CrossModuleInsight | null> => {
  const dailyInvestmentChange = (investment.totalValue * investment.dayChange) / 100;
  const diningOutEstimate = finance.monthlySpending * 0.2; // Assume 20% is dining
  const percentageOfGrowth = (diningOutEstimate / Math.abs(dailyInvestmentChange)) * 100;

  if (percentageOfGrowth > 50) {
    return {
      id: 'finance-investment-1',
      type: 'finance_investment',
      title: 'Spending vs. Investment Growth',
      description: `Your estimated monthly dining expenses (${formatCurrency(diningOutEstimate)}) represent ${percentageOfGrowth.toFixed(0)}% of today's investment gains. Consider cooking at home to boost savings.`,
      severity: 'warning',
      relatedModules: ['finance', 'investments'],
      metadata: {
        diningEstimate: diningOutEstimate,
        dailyGrowth: dailyInvestmentChange,
        percentage: percentageOfGrowth,
      },
      createdAt: new Date(),
    };
  }

  return null;
};

/**
 * Finance + Timeline insight
 * "Your most productive days correlate with lower spending"
 */
export const generateFinanceTimelineInsight = async (
  finance: FinanceData,
  timeline: TimelineData
): Promise<CrossModuleInsight | null> => {
  // This would analyze historical correlation between productivity and spending
  // For now, returning a generic insight
  if (timeline.productiveHours > 4 && finance.monthlySpending > 2000000) {
    return {
      id: 'finance-timeline-1',
      type: 'finance_timeline',
      title: 'Productivity & Spending Pattern',
      description: `You've logged ${timeline.productiveHours} productive hours today but your monthly spending is ${formatCurrency(finance.monthlySpending)}. Focused work days often lead to mindful spending—track if this pattern holds for you.`,
      severity: 'info',
      relatedModules: ['finance', 'timeline'],
      metadata: {
        productiveHours: timeline.productiveHours,
        monthlySpending: finance.monthlySpending,
      },
      createdAt: new Date(),
    };
  }

  return null;
};

/**
 * Investment + Timeline insight
 * "Market volatility days often coincide with reduced activity"
 */
export const generateInvestmentTimelineInsight = async (
  investment: InvestmentData,
  timeline: TimelineData
): Promise<CrossModuleInsight | null> => {
  if (Math.abs(investment.dayChange) > 3 && timeline.activitiesToday < 3) {
    return {
      id: 'investment-timeline-1',
      type: 'investment_timeline',
      title: 'Market Volatility & Activity',
      description: `Market moved ${investment.dayChange > 0 ? '+' : ''}${investment.dayChange}% today and you only logged ${timeline.activitiesToday} activities. High volatility days can be distracting—consider time-blocking to maintain productivity.`,
      severity: investment.dayChange > 0 ? 'success' : 'warning',
      relatedModules: ['investments', 'timeline'],
      metadata: {
        dayChange: investment.dayChange,
        activitiesCount: timeline.activitiesToday,
      },
      createdAt: new Date(),
    };
  }

  return null;
};

/**
 * Reminders + Finance insight
 * "You have X pending bill reminders and Y spending today"
 */
export const generateReminderFinanceInsight = async (
  reminders: ReminderData,
  finance: FinanceData
): Promise<CrossModuleInsight | null> => {
  if (reminders.pendingCount > 5) {
    return {
      id: 'reminder-finance-1',
      type: 'reminder_finance',
      title: 'Pending Tasks & Financial Health',
      description: `You have ${reminders.pendingCount} pending reminders including bills to pay. Your savings rate is ${finance.savingsRate}%. Consider automating bill payments to reduce mental load and maintain your savings discipline.`,
      severity: reminders.overdueCount > 0 ? 'warning' : 'info',
      relatedModules: ['reminders', 'finance'],
      metadata: {
        pendingCount: reminders.pendingCount,
        overdueCount: reminders.overdueCount,
        savingsRate: finance.savingsRate,
      },
      createdAt: new Date(),
    };
  }

  return null;
};

/**
 * All modules - Weekly summary
 */
export const generateWeeklySummaryInsight = async (
  finance: FinanceData,
  investment: InvestmentData,
  timeline: TimelineData,
  reminders: ReminderData
): Promise<CrossModuleInsight> => {
  return {
    id: 'weekly-summary',
    type: 'weekly_summary',
    title: 'Weekly Life Dashboard Summary',
    description: `This week: Saved ${finance.savingsRate}% of income, portfolio ${investment.dayChange > 0 ? 'gained' : 'lost'} ${Math.abs(investment.dayChange).toFixed(1)}%, logged ${timeline.productiveHours} productive hours, and have ${reminders.pendingCount} tasks pending.`,
    severity: 'info',
    relatedModules: ['finance', 'investments', 'timeline', 'reminders'],
    metadata: {
      savingsRate: finance.savingsRate,
      investmentChange: investment.dayChange,
      productiveHours: timeline.productiveHours,
      pendingReminders: reminders.pendingCount,
    },
    createdAt: new Date(),
  };
};

// ============================================================================
// MAIN GENERATOR
// ============================================================================

/**
 * Generate all cross-module insights
 * Call this from the insights page or dashboard
 */
export const generateCrossModuleInsights = async (
  enabledModules: ModuleId[]
): Promise<CrossModuleInsight[]> => {
  const insights: CrossModuleInsight[] = [];

  // Fetch data for all modules
  const [finance, investment, timeline, reminders] = await Promise.all([
    enabledModules.includes('finance') ? getFinanceData() : null,
    enabledModules.includes('investments') ? getInvestmentData() : null,
    enabledModules.includes('timeline') ? getTimelineData() : null,
    enabledModules.includes('reminders') ? getReminderData() : null,
  ]);

  // Generate finance + investment insight
  if (finance && investment) {
    const fiInsight = await generateFinanceInvestmentInsight(finance, investment);
    if (fiInsight) insights.push(fiInsight);
  }

  // Generate finance + timeline insight
  if (finance && timeline) {
    const ftInsight = await generateFinanceTimelineInsight(finance, timeline);
    if (ftInsight) insights.push(ftInsight);
  }

  // Generate investment + timeline insight
  if (investment && timeline) {
    const itInsight = await generateInvestmentTimelineInsight(investment, timeline);
    if (itInsight) insights.push(itInsight);
  }

  // Generate reminder + finance insight
  if (reminders && finance) {
    const rfInsight = await generateReminderFinanceInsight(reminders, finance);
    if (rfInsight) insights.push(rfInsight);
  }

  // Generate weekly summary if at least 2 modules enabled
  const enabledCount = [finance, investment, timeline, reminders].filter(Boolean).length;
  if (enabledCount >= 2 && finance && investment && timeline && reminders) {
    const summary = await generateWeeklySummaryInsight(finance, investment, timeline, reminders);
    insights.push(summary);
  }

  return insights;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Hook for using cross-module insights (to be used in components)
export const useCrossModuleInsights = (enabledModules: ModuleId[]) => {
  // This would use SWR to fetch and cache insights
  // For now, just export the generator function
  return {
    generate: () => generateCrossModuleInsights(enabledModules),
  };
};
