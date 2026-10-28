'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, Badge, Button, Alert, Loading, ConfirmModal, InlineError } from '@/components';
import { AppPageHeader } from '@/components/layout/AppPageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { insightQueries } from '@/services/analytics/insightQueries';
import { transactionQueries } from '@/services/finance/transactionQueries';
import { useInvestment } from '@/hooks/useInvestment';
import { useWeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { useCareer } from '@/hooks/useCareer';
import { useReminder } from '@/hooks/useReminder';
import { useActivity } from '@/hooks/useActivity';
import { Lightbulb, Target, ChartBar, Calendar, Stack, Trash as Trash2, ArrowCounterClockwise, ArrowsClockwise } from '@phosphor-icons/react';
import { formatDate } from '@/libs/format';
import { getProfileToday } from '@/libs/profileDate';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export function InsightsClient() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading: boolean = useAuthStore((s) => s.isLoading);
  const authLoading = isLoading;
  const userId = useAuthStore((s) => s.user?.id);
  const { t } = useTranslation();
  const { language } = useUserPreferences();

  const [dbInsights, setDbInsights] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

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

  const loadInsights = async () => {
    setIsFetching(true);
    setLoadFailed(false);
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const data = await insightQueries.getInsights(start, end);
      setDbInsights(data || []);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setLoadFailed(true);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    loadInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per mount; fetchStarted guards repeats
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
      const clientTimeout = setTimeout(() => controller.abort(), 45000);

      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userContextText, language }),
        signal: controller.signal,
      });

      clearTimeout(clientTimeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HardDrives error ${res.status}`);
      }

      const data = await res.json();
      
      if (data.insights && userId) {
        // 0. Reset and delete all previous insights permanently from Supabase & local state
        try {
          await insightQueries.clearAllInsights();
        } catch (err) {
          console.warn('Failed to clear previous insights before writing new ones:', err);
        }

        // Save generated AI insights to public.insights table in Supabase
        const savedInsights = await Promise.all(
          data.insights.map(async (i: any) => {
            try {
              return await insightQueries.createInsight({
                user_id: userId,
                date: getProfileToday(),
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
        // Replace previous insights completely with fresh generated ones
        setDbInsights(savedInsights);
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

  const handleResetAll = () => {
    if (dbInsights.length === 0) return;
    setIsResetModalOpen(true);
  };

  const confirmResetAll = async () => {
    setIsResetModalOpen(false);
    setIsResetting(true);
    try {
      await insightQueries.clearAllInsights();
      setDbInsights([]);
    } catch (err) {
      console.error('Failed to reset insights:', err);
    } finally {
      setIsResetting(false);
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

  // MapTrifold Supabase canonical Insight type rows to UI expectations
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
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text={t('dashboard.checking_session')} />
        </div>
      </>
    );
  }

  if (!isAuthenticated) return null;

  const busy = isGenerating || isResetting;

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <AppPageHeader
          title={t('insights_page.title')}
          description={t('insights_page.desc')}
          actions={
            <>
              {dbInsights.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnlyOnMobile
                  onClick={handleResetAll}
                  disabled={busy}
                  leftIcon={<ArrowCounterClockwise size={16} />}
                >
                  {isResetting ? t('insights_page.resetting') : t('insights_page.reset_insights')}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateAI}
                disabled={isResetting}
                isLoading={isGenerating}
                loadingText={t('insights_page.thinking')}
                leftIcon={<ArrowsClockwise size={16} />}
              >
                {t('insights_page.ask_ai')}
              </Button>
            </>
          }
        />

        {aiError && (
          <Alert type="error" onDismiss={() => setAiError(null)}>
            {aiError}
          </Alert>
        )}

        {loadFailed && (
          <InlineError message={t('insights_page.load_failed')} retryLabel={t('common.try_again')} onRetry={loadInsights} />
        )}

        {isFetching ? (
          <div className="py-12">
            <Loading text={t('common.loading')} />
          </div>
        ) : (
          !loadFailed && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {insights.length > 0 ? (
                insights.map((insight) => {
                  const tone = insightTone(insight.type);
                  const Icon = tone.icon;
                  return (
                    <Card key={insight.id} className="p-5 md:p-6">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone.box}`}>
                          <Icon size={20} aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <Badge variant={tone.badge} size="sm">
                                {insight.type.toUpperCase()}
                              </Badge>
                              <span className="flex items-center gap-1 text-label-sm text-muted-foreground">
                                <Calendar size={12} aria-hidden="true" /> {formatDate(insight.date)}
                              </span>
                            </div>
                            {insight.id && !insight.id.startsWith('live-') && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteInsight(insight.id, e)}
                                aria-label={t('insights_page.delete_insight')}
                                title={t('insights_page.delete_insight')}
                                className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            )}
                          </div>
                          <h3 className="break-words text-title-md text-foreground">{insight.title}</h3>
                          <p className="whitespace-pre-wrap break-words text-body-md text-muted-foreground">{insight.description}</p>
                          {insight.content && (
                            <p className="whitespace-pre-wrap break-words rounded-md border border-foreground/[0.05] bg-foreground/[0.02] p-4 text-body-sm text-foreground">
                              {insight.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="col-span-full flex flex-col items-center p-5 md:p-8 text-center">
                  <Stack size={28} aria-hidden="true" className="text-muted-foreground" />
                  <h3 className="mt-3 text-title-md text-foreground">{t('insights_page.no_insights_title')}</h3>
                  <p className="mt-1 max-w-sm text-body-sm text-muted-foreground">{t('insights_page.no_insights_desc')}</p>
                </Card>
              )}
            </div>
          )
        )}

        <p className="text-body-sm text-muted-foreground">{t('insights_page.footer_note')}</p>
      </div>

      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmResetAll}
        title={t('insights_page.reset_insights')}
        description={t('insights_page.reset_insights_confirm')}
        isDangerous={false}
      />
    </>
  );
}

function insightTone(type: string) {
  if (type === 'finance' || type === 'investment') {
    return { icon: ChartBar, box: 'bg-success/10 text-success', badge: 'success' as const };
  }
  if (type === 'productivity' || type === 'career') {
    return { icon: Target, box: 'bg-secondary/10 text-secondary', badge: 'insight' as const };
  }
  return { icon: Lightbulb, box: 'bg-primary/10 text-primary', badge: 'activity' as const };
}
