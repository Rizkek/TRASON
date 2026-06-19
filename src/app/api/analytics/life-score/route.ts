import { NextResponse } from 'next/server';
import { createClient, getAuthenticatedUser } from '@/utils/supabase/server';
import { getDateRange } from '@/libs/date';
import {
  calculateFinanceScore,
  calculateProductivityScore,
  calculateHealthScore,
  calculateCareerScore,
  calculateLifeScore,
} from '@/libs/analytics/lifeScore';
import { calculateCareerAnalytics } from '@/libs/analytics/careerAnalytics';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const { start: monthStart, end: monthEnd } = getDateRange(now.getMonth(), now.getFullYear());

    const rollingStart = new Date(now);
    rollingStart.setDate(now.getDate() - 7);
    rollingStart.setHours(0, 0, 0, 0);

    const rollingEnd = new Date(now);
    rollingEnd.setHours(23, 59, 59, 999);

    // Run parallel DB queries natively on the server (saves client bandwidth)
    const [
      { data: transactions },
      { data: activities },
      { data: tasks },
      { data: applications }
    ] = await Promise.all([
      // 1. Transactions
      supabase
        .from('transactions')
        .select('amount, type, category_id')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .is('deleted_at', null),
      
      // 2. Activities (last 7 days)
      supabase
        .from('activities')
        .select('title, category')
        .eq('user_id', user.id)
        .gte('start_time', rollingStart.toISOString())
        .lte('start_time', rollingEnd.toISOString())
        .is('deleted_at', null),
        
      // 3. Tasks
      supabase
        .from('daily_tasks')
        .select('id')
        .eq('user_id', user.id)
        .is('deleted_at', null),

      // 4. Career Applications
      supabase
        .from('career_applications')
        .select('status, applied_date, salary_min')
        .eq('user_id', user.id)
        .is('deleted_at', null)
    ]);

    // Finance metrics
    const txs = transactions || [];
    const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    const hasCategories = txs.some(t => t.category_id);

    const financeScore = calculateFinanceScore({
      totalIncome,
      totalExpense,
      transactionCount: txs.length,
      hasCategories,
    });

    // Productivity metrics
    const streak = 0; // Replace with streak logic if available
    const totalCount = tasks?.length || 0;
    const totalTasksLast7Days = totalCount * 7;
    
    const completedLast7Days = (activities || [])
      .filter(a => a.category === 'daily_tasks')
      .reduce((sum, a) => {
        const match = a.title?.match(/^(\d+)\s+Daily Task/);
        return sum + (match ? parseInt(match[1], 10) : 1);
      }, 0);

    const productivityScore = calculateProductivityScore({
      completedLast7Days,
      totalTasksLast7Days,
      streak,
    });

    // Health metrics
    const SPORT_CATEGORIES = ['sport', 'exercise'];
    const sportSessionsLast7Days = (activities || []).filter(
      a => a.category && SPORT_CATEGORIES.includes(a.category.toLowerCase())
    ).length;

    const healthScore = calculateHealthScore({
      sportSessionsLast7Days,
      sportTargetPerWeek: 3,
    });

    // Career metrics
    const careerAnalytics = calculateCareerAnalytics(applications as any || []);
    const careerScore = calculateCareerScore({
      totalApplications: careerAnalytics.totalApplications,
      activeApplications: careerAnalytics.activeApplications,
      daysSinceLastApplication: careerAnalytics.daysSinceLastApplication,
      responseRate: careerAnalytics.responseRate / 100,
    });

    // Calculate final score
    const lifeScore = calculateLifeScore({
      finance: financeScore,
      productivity: productivityScore,
      health: healthScore,
      career: careerScore,
    }, (key: string) => key);

    return NextResponse.json({ lifeScore });

  } catch (error: any) {
    console.error('LifeScore API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to calculate life score' }, { status: 500 });
  }
}
