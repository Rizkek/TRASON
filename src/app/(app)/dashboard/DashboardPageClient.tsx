'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Loading, InlineError } from '@/components';
import { AppPageHeader } from '@/components/layout/AppPageHeader';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useReminder } from '@/hooks/useReminder';
import { useSubscription } from '@/hooks/useSubscription';
import { useBudget } from '@/hooks/useBudget';
import { useWeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { useCareer } from '@/hooks/useCareer';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNow } from '@/hooks/useNow';
import { getDateRange } from '@/libs/date';
import { getLocalISODate } from '@/libs/format';
import { getLocalDateHour } from '@/libs/notificationLogic';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Warning } from '@phosphor-icons/react';
import { TrasonIcon } from '@/components/ui/TrasonIcon';
import { useFinanceInsights } from '@/hooks/useFinanceInsights';
import { InsightCard } from '@/components/insights/InsightCard';
import { Heading } from '@/components/ui/typography';

import { UpNextCard } from './components/UpNextCard';
import { CurrentStateCard } from './components/CurrentStateCard';
import { DailyTasksSummary } from './components/DailyTasksSummary';
import { LifeScoreCard } from './components/LifeScoreCard';

export function DashboardClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const { locale, timezone, module_features } = useUserPreferences();
  const now = useNow();

  const month = now.getMonth();
  const year = now.getFullYear();
  const { start, end } = useMemo(() => getDateRange(month, year), [month, year]);

  const { transactions, userErrorMessage: transactionsError, refresh: refreshTransactions } = useTransaction(start, end);
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
  const isRemindersEnabled = module_features?.['reminders'] !== false;
  const showDailyTasks = module_features?.['timeline'] !== false && module_features?.['timeline_daily_checklist'] !== false;
  const showCurrentState = isFinanceEnabled || isSportEnabled || isCareerEnabled;

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

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loading text={t('dashboard.checking_session')} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const { hour } = getLocalDateHour(now, timezone);
  const greeting = hour < 12 ? t('dashboard.greeting_morning') : hour < 18 ? t('dashboard.greeting_afternoon') : t('dashboard.greeting_evening');
  const firstName = user?.first_name || user?.name?.split(' ')[0];
  const nowLabel = now.toLocaleString(locale, { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: timezone });

  // The checklist shares the top two rows on wide screens and otherwise follows Up Next directly,
  // so what needs doing today comes before the summaries at every width.
  const mainColumn = showDailyTasks ? 'min-w-0 xl:col-span-8' : 'min-w-0 xl:col-span-12';

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      {loadError && <InlineError message={loadError} retryLabel={t('common.try_again')} onRetry={retryAll} />}

      <AppPageHeader title={firstName ? `${greeting}, ${firstName}` : greeting} description={nowLabel} />

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {isRemindersEnabled && (
          <div className={mainColumn}>
            <UpNextCard reminders={reminders} isLoading={remindersLoading} />
          </div>
        )}

        {showDailyTasks && (
          <div className="min-w-0 xl:col-span-4 xl:row-span-2">
            <DailyTasksSummary />
          </div>
        )}

        {showCurrentState && (
          <div className={mainColumn}>
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
          </div>
        )}

        <div className="min-w-0 xl:col-span-12">
          <LifeScoreCard />
        </div>
      </div>

      {dashboardInsights.length > 0 && (
        <section aria-labelledby="insights-heading" className="space-y-3">
          <Heading as="h2" size="h6" id="insights-heading" className="text-muted-foreground">
            {t('dashboard.insights_title')}
          </Heading>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dashboardInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
