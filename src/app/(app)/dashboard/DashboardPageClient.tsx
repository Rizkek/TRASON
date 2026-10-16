'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Loading, InlineError } from '@/components';
import { Placeholder } from '@/components/ui/Placeholder';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useReminder } from '@/hooks/useReminder';
import { useSubscription } from '@/hooks/useSubscription';
import { useBudget } from '@/hooks/useBudget';
import { useWeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { useCareer } from '@/hooks/useCareer';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getDateRange } from '@/libs/date';
import { getLocalISODate } from '@/libs/format';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Warning, CaretLeft, CaretRight, CaretDown, CaretUp, ChartLineUp } from '@phosphor-icons/react';
import { TrasonIcon } from '@/components/ui/TrasonIcon';
import dynamic from 'next/dynamic';
import { useFinanceInsights } from '@/hooks/useFinanceInsights';
import { InsightCard } from '@/components/insights/InsightCard';
import { Heading } from '@/components/ui/typography';

import { UpNextCard } from './components/UpNextCard';
import { CurrentStateCard } from './components/CurrentStateCard';
import { DailyTasksSummary } from './components/DailyTasksSummary';
import { LifeScoreCard } from './components/LifeScoreCard';

const ChartPlaceholder = () => <Placeholder className="h-64 w-full rounded-xl" />;

const FinancialChart = dynamic(() => import('./components/FinancialChart').then((mod) => mod.FinancialChart), {
  ssr: false,
  loading: ChartPlaceholder,
});
const SpendingBreakdown = dynamic(() => import('./components/SpendingBreakdown').then((mod) => mod.SpendingBreakdown), {
  ssr: false,
  loading: ChartPlaceholder,
});

const CURRENT_DATE = new Date();

const MONTH_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground';

export function DashboardClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const { locale, timezone, module_features } = useUserPreferences();

  // The analytics panel starts collapsed so the first screen stays calm.
  const [showFinancialChart, setShowFinancialChart] = useState(false);
  const [financeMonth, setFinanceMonth] = useState(CURRENT_DATE.getMonth());
  const [financeYear, setFinanceYear] = useState(CURRENT_DATE.getFullYear());
  const { start: financeStart, end: financeEnd } = useMemo(() => getDateRange(financeMonth, financeYear), [financeMonth, financeYear]);

  const { transactions, userErrorMessage: transactionsError, refresh: refreshTransactions } = useTransaction(financeStart, financeEnd);
  const { reminders, isLoading: remindersLoading, userErrorMessage: remindersError, refresh: refreshReminders } = useReminder();
  const { summary: sportSummary, isLoading: sportLoading } = useWeeklySportSummary();
  const { stats: careerStats, nextInterview, isLoading: careerLoading, error: careerError, mutate: refreshCareer } = useCareer();
  const { subscriptions, error: subscriptionsError, mutate: refreshSubscriptions } = useSubscription();
  const { globalBudget, error: budgetError, mutate: refreshBudget } = useBudget();
  const { insights: financeInsights } = useFinanceInsights();

  const dashboardInsights = useMemo(
    () => financeInsights.filter((i) => i.priority === 'high' || i.priority === 'medium').slice(0, 2),
    [financeInsights]
  );

  const isFinanceEnabled = module_features?.['finance'] !== false;
  const isSportEnabled = module_features?.['sport'] !== false;
  const isCareerEnabled = module_features?.['career'] !== false;
  const isTimelineEnabled = module_features?.['timeline'] !== false;
  const isRemindersEnabled = module_features?.['reminders'] !== false;

  const totalExpense = useMemo(
    () => transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );
  const totalIncome = useMemo(
    () => transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
    [transactions]
  );

  const dueSubscriptions = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return [];
    const today = getLocalISODate(new Date(), timezone);
    return subscriptions.filter((sub) => sub.is_active && sub.next_billing_date <= today);
  }, [subscriptions, timezone]);

  // Only sections the user has switched on can fail visibly.
  const loadError =
    transactionsError ||
    remindersError ||
    ((isFinanceEnabled && (budgetError || subscriptionsError)) || (isCareerEnabled && careerError)
      ? t('dashboard.load_failed')
      : null);

  const retryAll = () => {
    refreshTransactions();
    refreshReminders();
    refreshBudget();
    refreshSubscriptions();
    refreshCareer();
  };

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    return hours < 12 ? t('dashboard.greeting_morning') : hours < 18 ? t('dashboard.greeting_afternoon') : t('dashboard.greeting_evening');
  }, [t]);

  const todayDate = useMemo(
    () => new Date().toLocaleDateString(locale || 'en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: timezone }),
    [locale, timezone]
  );
  const todayTime = useMemo(
    () => new Date().toLocaleTimeString(locale || 'en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone }),
    [locale, timezone]
  );

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text={t('dashboard.checking_session')} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const firstName = user?.first_name || user?.name?.split(' ')[0];
  const monthLabel = new Date(financeYear, financeMonth).toLocaleString(locale || 'en-US', { month: 'short', year: 'numeric' });

  const goPreviousMonth = () => {
    if (financeMonth === 0) {
      setFinanceMonth(11);
      setFinanceYear((y) => y - 1);
    } else {
      setFinanceMonth((m) => m - 1);
    }
  };
  const goNextMonth = () => {
    if (financeMonth === 11) {
      setFinanceMonth(0);
      setFinanceYear((y) => y + 1);
    } else {
      setFinanceMonth((m) => m + 1);
    }
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6 pb-12">
      {loadError && <InlineError message={loadError} retryLabel={t('common.try_again')} onRetry={retryAll} />}

      <header className="flex flex-col gap-1 pb-1 pt-1">
        <Heading as="h1" size="h2" weight="semibold" className="flex flex-wrap items-baseline gap-x-2">
          <span>{firstName ? `${greeting},` : greeting}</span>
          {firstName && <span>{firstName}</span>}
        </Heading>
        <div className="flex items-center gap-2 text-label-sm font-normal text-muted-foreground">
          <span className="uppercase tracking-wider">{todayDate}</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted-foreground/60" />
          <span className="font-mono tabular-nums">{todayTime}</span>
        </div>
      </header>

      {dashboardInsights.length > 0 && (
        <section aria-labelledby="insights-heading" className="space-y-3">
          <Heading as="h2" size="h6" id="insights-heading" className="uppercase tracking-wider text-muted-foreground">
            {t('dashboard.insights_title')}
          </Heading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dashboardInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
      )}

      {isFinanceEnabled && dueSubscriptions.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="shrink-0 rounded-lg bg-warning/20 p-2 text-warning">
              <TrasonIcon icon={Warning} size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-label-md text-warning">
                {dueSubscriptions.length === 1
                  ? t('dashboard.subscriptions_due_single')
                  : t('dashboard.subscriptions_due_multiple').replace('{count}', dueSubscriptions.length.toString())}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{dueSubscriptions.map((s) => s.name).join(', ')}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/finance/subscriptions')}
            className="min-h-11 shrink-0 self-start border-warning text-warning hover:bg-warning hover:text-background sm:self-auto"
          >
            {t('dashboard.review')}
          </Button>
        </div>
      )}

      {isRemindersEnabled && <UpNextCard reminders={reminders} isLoading={remindersLoading} />}

      <CurrentStateCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        globalBudget={globalBudget}
        sportSummary={sportSummary}
        careerStats={careerStats}
        nextInterview={nextInterview}
        isFinanceEnabled={isFinanceEnabled}
        isSportEnabled={isSportEnabled}
        isCareerEnabled={isCareerEnabled}
        sportLoading={sportLoading}
        careerLoading={careerLoading}
      />

      {isTimelineEnabled && module_features?.['timeline_daily_checklist'] !== false && <DailyTasksSummary />}

      <LifeScoreCard />

      {isFinanceEnabled && (
        <section className="pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-foreground/10 pt-2">
            <button
              type="button"
              onClick={() => setShowFinancialChart(!showFinancialChart)}
              aria-expanded={showFinancialChart}
              aria-controls="financial-chart-panel"
              className="-ml-2 flex min-h-11 items-center gap-2 rounded-lg px-2 text-label-sm uppercase tracking-wider text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <ChartLineUp size={16} aria-hidden="true" className="text-primary" />
              <span>{showFinancialChart ? t('dashboard.toggle_chart_hide') : t('dashboard.toggle_chart_show')}</span>
              {showFinancialChart ? <CaretUp size={14} aria-hidden="true" /> : <CaretDown size={14} aria-hidden="true" />}
            </button>

            {showFinancialChart && (
              <div className="flex items-center rounded-lg border border-foreground/10 bg-foreground/[0.03] p-0.5">
                <button type="button" onClick={goPreviousMonth} className={MONTH_BUTTON} aria-label={t('dashboard.prev_month')}>
                  <TrasonIcon icon={CaretLeft} size={16} />
                </button>
                <span className="min-w-24 px-2 text-center font-mono text-label-sm text-foreground">{monthLabel}</span>
                <button type="button" onClick={goNextMonth} className={MONTH_BUTTON} aria-label={t('dashboard.next_month')}>
                  <TrasonIcon icon={CaretRight} size={16} />
                </button>
              </div>
            )}
          </div>

          {showFinancialChart && (
            <div id="financial-chart-panel" className="mt-3 grid grid-cols-1 gap-4 animate-fade-in lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FinancialChart transactions={transactions} month={financeMonth} year={financeYear} />
              </div>
              <div>
                <SpendingBreakdown transactions={transactions} />
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
