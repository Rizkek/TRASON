'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layout, Card, Badge, Loading } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { insightQueries } from '@/services/analytics/insightQueries';
import { transactionQueries } from '@/services/finance/transactionQueries';
import { useInvestment } from '@/hooks/useInvestment';
import { useWeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { useCareer } from '@/hooks/useCareer';
import { useReminder } from '@/hooks/useReminder';
import { useActivity } from '@/hooks/useActivity';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  BarChart3,
  Calendar,
  Layers,
  Trash2
} from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { formatDate } from '@/libs/format';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function InsightsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading: boolean = useAuthStore((s) => s.isLoading);
  const authLoading = isLoading;
  const userId = useAuthStore((s) => s.user?.id);
  const { t } = useTranslation();
  const { language } = useUserPreferences();

  const [dbInsights, setDbInsights] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Active module hooks to collect complete life context
  const { calculatedPositions, insights: investmentInsight, summary: investmentSummary } = useInvestment();
  const { summary: sportSummary } = useWeeklySportSummary();
  const { reminders: pendingReminders } = useReminder();
  const { stats: careerStats, nextInterview } = useCareer();

  // Load last 7 days of activities stably
  const sevenDaysAgo = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);
  const { activities: weeklyActivities } = useActivity(sevenDaysAgo, new Date());

  const fetchStarted = useRef(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (fetchStarted.current) return;
    fetchStarted.current = true;

    const fetchInsights = async () => {
      setIsFetching(true);
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const data = await insightQueries.getInsights(start, end);
        setDbInsights(data || []);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchInsights();
  }, [authLoading, isAuthenticated]);

  const handleGenerateAI = async () => {
    setAiError(null);
    try {
      setIsGenerating(true);
      
      // 1. Gather context data client-side: Finance
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const transactions = await transactionQueries.getTransactions(start, now);
      
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

      // 2. Vitality Context
      const activeMinutes = sportSummary?.totalMinutes || 0;
      const activeSessions = sportSummary?.totalSessions || 0;
      const sportStreak = sportSummary?.streak || 0;
      const topSport = sportSummary?.topActivity || 'None';

      // 3. Reminders Context
      const pendingCount = pendingReminders?.length || 0;
      const highPriorityReminders = pendingReminders?.filter((r: any) => r.priority === 'high') || [];

      // 4. Career Context
      const appliedCount = careerStats?.applied || 0;
      const interviewingCount = careerStats?.interview || 0;
      const careerOffers = careerStats?.offer || 0;
      const upcomingInterviewText = (nextInterview && nextInterview.interview_date)
        ? `${nextInterview.role_title} at ${nextInterview.company_name} on ${new Date(nextInterview.interview_date).toLocaleDateString()}`
        : 'None';

      // 5. Investment Context
      const portfolioCost = investmentSummary?.totalCost || 0;
      const portfolioValue = investmentSummary?.totalValue || 0;
      const portfolioProfitLoss = investmentSummary?.totalProfitLoss || 0;
      const dailyChangePct = investmentSummary?.dailyChangePercent || 0;

      // 6. Timeline Context
      const loggedActivitiesCount = weeklyActivities?.length || 0;
      const productiveHours = weeklyActivities?.reduce((acc: number, act: any) => acc + (act.duration_minutes || 0), 0) / 60;

      const userContextText = `
User Context Profile (TRASON Unified Life OS):

1. FINANCIALS (Last 30 Days):
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalSpend.toFixed(2)}
- Top Expense Categories: ${Object.entries(categorySpend).map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`).join(', ') || 'None'}
- Savings Rate: ${totalIncome > 0 ? (((totalIncome - totalSpend) / totalIncome) * 100).toFixed(1) : 0}%

2. VITALITY & SPORTS (This Week):
- Active Workout Minutes: ${activeMinutes} minutes
- Total Workout Sessions: ${activeSessions}
- Current Active Streak: ${sportStreak} days
- Dominant Sport: ${topSport}

3. TIMELINE & PRODUCTIVITY (Last 7 Days):
- Logged Activity Events: ${loggedActivitiesCount}
- Estimated Productive Hours: ${productiveHours.toFixed(1)} hrs

4. TASKS & REMINDERS:
- Pending Task Reminders: ${pendingCount} pending
- High Priority Tasks: ${highPriorityReminders.map((r: any) => r.title).join(', ') || 'None'}

5. CAREER TRACKER:
- Total Job Applications: ${appliedCount} applied
- Applications in Interview Stage: ${interviewingCount}
- Received Job Offers: ${careerOffers}
- Next Scheduled Interview: ${upcomingInterviewText}

6. PORTFOLIO & INVESTMENTS:
- Total Portfolio Value: $${portfolioValue.toFixed(2)}
- Total Cost Basis: $${portfolioCost.toFixed(2)}
- Net Profit/Loss: $${portfolioProfitLoss.toFixed(2)} (${portfolioCost > 0 ? ((portfolioProfitLoss / portfolioCost) * 100).toFixed(2) : 0}%)
- Daily Portfolio Change: ${dailyChangePct >= 0 ? '+' : ''}${dailyChangePct.toFixed(2)}%
`;

      const controller = new AbortController();
      const clientTimeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userContextText, language }),
        signal: controller.signal,
      });

      clearTimeout(clientTimeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      
      if (data.insights && userId) {
        // Save generated AI insights to public.insights table in Supabase
        const savedInsights = await Promise.all(
          data.insights.map(async (i: any) => {
            try {
              return await insightQueries.createInsight({
                user_id: userId,
                date: new Date().toISOString().split('T')[0],
                type: i.type,
                category: i.type,
                insight_text: i.description,
                data: {
                  title: i.title,
                  actionable_advice: i.actionable_advice,
                },
                confidence_score: 0.95,
                is_actionable: true,
              });
            } catch (err) {
              console.error('Failed to write insight to Supabase:', err);
              // Graceful fallback to client-side offline representation
              return {
                id: `ai-${Date.now()}-${Math.random()}`,
                user_id: userId,
                date: new Date().toISOString(),
                type: i.type,
                category: i.type,
                insight_text: i.description,
                data: {
                  title: i.title,
                  actionable_advice: i.actionable_advice,
                },
                confidence_score: 0.95,
                is_actionable: true,
              };
            }
          })
        );
        setDbInsights(prev => [...savedInsights, ...prev]);
      }
    } catch (err: any) {
      const msg = err?.name === 'AbortError'
        ? t('insights_page.ai_timeout_error')
        : err?.message || t('insights_page.ai_generic_error');
      setAiError(msg);
      console.error('[handleGenerateAI]', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteInsight = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await insightQueries.deleteInsight(id);
      setDbInsights(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete insight:', err);
    }
  };

  const rawInsights = [
    ...(investmentInsight && calculatedPositions.length > 0
      ? [
          {
            id: 'live-investment-insight',
            type: 'investment',
            insight_text: investmentInsight.headline,
            data: {
              title: 'Investment Analyst',
              actionable_advice: investmentInsight.observations.join(' '),
            },
            date: new Date().toISOString(),
          },
        ]
      : []),
    ...dbInsights,
  ];

  // Map Supabase canonical Insight type rows to UI expectations
  const insights = rawInsights.map((i: any) => {
    if (i.description && i.title) {
      return i;
    }
    return {
      id: i.id,
      type: i.type || 'general',
      title: i.data?.title || i.category || 'AI Insight',
      description: i.insight_text || i.description || '',
      content: i.data?.actionable_advice || i.content || '',
      date: i.date,
    };
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text={t('dashboard.checking_session')} />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="space-y-xl animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="space-y-sm">
            <h1 className="text-display font-serif text-gradient">{t('insights_page.title')}</h1>
            <p className="text-subtext flex items-center gap-sm">
              <Sparkles size={14} className="text-primary" />
              {t('insights_page.desc')}
            </p>
          </div>
          <button 
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="px-lg py-md bg-primary text-black font-bold rounded-lg flex items-center gap-sm hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {isGenerating ? <Loading text={t('insights_page.thinking')} /> : <><Sparkles size={16} /> {t('insights_page.ask_ai')}</>}
          </button>
        </div>

        {/* Error banner jika AI gagal */}
        {aiError && (
          <div className="flex items-center gap-md p-md rounded-md bg-danger/10 border border-danger/20">
            <Zap size={16} className="text-danger shrink-0" />
            <p className="text-xs text-danger">{aiError}</p>
            <button onClick={() => setAiError(null)} className="ml-auto text-danger/60 hover:text-danger text-lg leading-none">&times;</button>
          </div>
        )}

        {isFetching ? (
          <div className="flex justify-center py-2xl"><Loading /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg" style={{ minHeight: '200px' }}>
            {insights.length > 0 ? (
              insights.map((insight) => (
                <Card 
                  key={insight.id} 
                  className="p-xl relative overflow-hidden group hover:scale-[1.01] transition-transform"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                  
                  <div className="flex items-start gap-xl relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      insight.type === 'finance' || insight.type === 'investment' ? 'bg-success/10 text-success' : 
                      insight.type === 'productivity' || insight.type === 'career' ? 'bg-secondary/10 text-secondary' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      {insight.type === 'finance' || insight.type === 'investment' ? <BarChart3 size={24} /> : 
                       insight.type === 'productivity' || insight.type === 'career' ? <Target size={24} /> : 
                       <Lightbulb size={24} />}
                    </div>
                    
                    <div className="space-y-md flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-md">
                          <Badge variant={insight.type === 'finance' || insight.type === 'investment' ? 'success' : insight.type === 'productivity' || insight.type === 'career' ? 'insight' : 'activity'} size="sm">
                            {insight.type.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] font-bold text-gray-light uppercase tracking-widest flex items-center gap-sm">
                            <Calendar size={10} /> {formatDate(insight.date)}
                          </span>
                        </div>
                        {insight.id && !insight.id.startsWith('live-') && (
                          <button
                            onClick={(e) => handleDeleteInsight(insight.id, e)}
                            className="p-sm text-gray-light hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                            title={t('insights_page.delete_insight')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-soft-cream leading-tight truncate">
                        {insight.title}
                      </h3>
                      
                      <p className="text-sm text-gray-light leading-relaxed whitespace-pre-wrap break-words">
                        {insight.description}
                      </p>
                      
                      {insight.content && (
                         <div className="p-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-md mt-md">
                            <p className="text-xs text-soft-cream opacity-90 group-hover:opacity-100 transition-opacity whitespace-pre-wrap break-words">
                               {insight.content}
                            </p>
                         </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              // Empty state with some placeholder premium cards
              <>
                <Card className="p-xl flex flex-col justify-center items-center text-center space-y-md opacity-60">
                  <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-light">
                    <Layers size={32} />
                  </div>
                  <h3 className="text-lg font-bold">{t('insights_page.no_insights_title')}</h3>
                  <p className="text-xs text-gray-light max-w-xs">
                    {t('insights_page.no_insights_desc')}
                  </p>
                </Card>
                
                <Card className="p-xl border-dashed border-black/10 dark:border-white/10 bg-transparent flex flex-col justify-center items-center text-center space-y-md opacity-40">
                  <div className="w-12 h-12 border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase">{t('insights_page.system_idle')}</p>
                </Card>
              </>
            )}
          </div>
        )}

        <div className="pt-xl">
           <Card className="p-xl glass overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-xl relative z-10">
                 <div className="p-md bg-primary/20 rounded-full animate-pulse">
                    <Lightbulb size={24} className="text-primary" />
                 </div>
                 <div>
                    <h4 className="text-md font-bold text-white uppercase tracking-wider mb-1">{t('insights_page.architect_perspective_title')}</h4>
                    <p className="text-sm text-gray-light">
                      {t('insights_page.architect_perspective_desc')}
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </Layout>
  );
}

