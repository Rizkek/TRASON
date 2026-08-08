'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Loading } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useReminder } from '@/hooks/useReminder';
import { useSubscription } from '@/hooks/useSubscription';
import { useBudget } from '@/hooks/useBudget';
import { useWeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { useCareer } from '@/hooks/useCareer';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getDateRange } from '@/libs/date';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { 
  Warning, 
  CaretLeft, 
  CaretRight, 
  CaretDown, 
  CaretUp,
  ChartLineUp
} from '@phosphor-icons/react';
import { TrasonIcon } from '@/components/ui/TrasonIcon';
import dynamic from 'next/dynamic';

// Components
import { UpNextCard } from './components/UpNextCard';
import { CurrentStateCard } from './components/CurrentStateCard';
import { DailyTasksSummary } from './components/DailyTasksSummary';
import { LifeScoreCard } from './components/LifeScoreCard';

const FinancialChart = dynamic(() => import('./components/FinancialChart').then(mod => mod.FinancialChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-800 animate-pulse rounded-xl" />
});
const SpendingBreakdown = dynamic(() => import('./components/SpendingBreakdown').then(mod => mod.SpendingBreakdown), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-800 animate-pulse rounded-xl" />
});

const CURRENT_DATE = new Date();

export function DashboardClient() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const preferences = useUserPreferences();
  const { locale, timezone, module_features } = preferences;

  // Chart collapse toggle state (Default collapsed for calm command center feel)
  const [showFinancialChart, setShowFinancialChart] = useState(false);
  const [financeMonth, setFinanceMonth] = useState(CURRENT_DATE.getMonth());
  const [financeYear, setFinanceYear] = useState(CURRENT_DATE.getFullYear());
  const { start: financeStart, end: financeEnd } = useMemo(() => getDateRange(financeMonth, financeYear), [financeMonth, financeYear]);

  // SWR Hooks
  const { transactions } = useTransaction(financeStart, financeEnd);
  const { reminders, isLoading: remindersLoading } = useReminder();
  const { summary: sportSummary, isLoading: sportLoading } = useWeeklySportSummary();
  const { stats: careerStats, nextInterview, isLoading: careerLoading } = useCareer();
  const { subscriptions } = useSubscription();
  const { globalBudget } = useBudget();

  // Module enablement flags
  const isFinanceEnabled = module_features?.['finance'] !== false;
  const isSportEnabled = module_features?.['sport'] !== false;
  const isCareerEnabled = module_features?.['career'] !== false;
  const isTimelineEnabled = module_features?.['timeline'] !== false;
  const isRemindersEnabled = module_features?.['reminders'] !== false;

  const totalExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const dueSubscriptions = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return [];
    const today = new Date().toISOString().split('T')[0];
    return subscriptions.filter(sub => sub.is_active && sub.next_billing_date <= today);
  }, [subscriptions]);

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    return hours < 12 
      ? t('dashboard.greeting_morning') 
      : hours < 18 
      ? t('dashboard.greeting_afternoon') 
      : t('dashboard.greeting_evening');
  }, [t]);

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString(locale || 'en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      timeZone: timezone 
    });
  }, [locale, timezone]);

  const todayTime = useMemo(() => {
    return new Date().toLocaleTimeString(locale || 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      timeZone: timezone 
    });
  }, [locale, timezone]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

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
      <div className="space-y-4 md:space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
        {/* 1. Contextual Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1 pb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white flex flex-wrap items-baseline gap-x-2">
              <span className="text-soft-cream">{greeting},</span>
              <span>{user?.first_name || user?.name?.split(' ')[0] || 'User'}</span>
            </h1>
            <div className="flex items-center gap-2 text-gray-light/70 text-xs mt-1">
              <span className="uppercase tracking-wider font-medium">{todayDate}</span>
              <span className="w-1 h-1 rounded-full bg-gray-light/40" />
              <span className="font-mono tabular-nums">{todayTime}</span>
            </div>
          </div>
        </div>

        {/* 2. Needs Attention (Conditional Alerts) */}
        {isFinanceEnabled && dueSubscriptions.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400 shrink-0">
                <TrasonIcon icon={Warning} size={18} />
              </div>
              <div>
                <p className="text-amber-300 text-xs font-bold">
                  {dueSubscriptions.length === 1
                    ? t('dashboard.subscriptions_due_single')
                    : t('dashboard.subscriptions_due_multiple').replace('{count}', dueSubscriptions.length.toString())}
                </p>
                <p className="text-[11px] text-amber-300/80 mt-0.5 truncate max-w-md">
                  {dueSubscriptions.map(s => s.name).join(', ')}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/finance/subscriptions')}
              className="shrink-0 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs px-3 py-1"
            >
              {t('dashboard.review')}
            </Button>
          </div>
        )}

        {/* 3. Up Next (Schedule & Reminders) */}
        {isRemindersEnabled && (
          <UpNextCard reminders={reminders} isLoading={remindersLoading} />
        )}

        {/* 4. Current State (Finance, Vitality, Career Pillars) */}
        <CurrentStateCard
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

        {/* 5. Today's Action Checklist */}
        {isTimelineEnabled && preferences?.module_features?.['timeline_daily_checklist'] !== false && (
          <DailyTasksSummary />
        )}

        {/* 6. Life Score (Compact Overview) */}
        <LifeScoreCard />

        {/* 7. Collapsible Financial Analytics (Deep Dive) */}
        {isFinanceEnabled && (
          <div className="pt-2">
            <div className="flex items-center justify-between border-t border-black/[0.05] dark:border-white/[0.05] pt-4">
              <button
                onClick={() => setShowFinancialChart(!showFinancialChart)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-light hover:text-soft-cream transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
              >
                <ChartLineUp size={16} className="text-primary" />
                <span>
                  {showFinancialChart ? t('dashboard.toggle_chart_hide') : t('dashboard.toggle_chart_show')}
                </span>
                {showFinancialChart ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </button>

              {showFinancialChart && (
                <div className="flex items-center bg-black/[0.02] dark:bg-white/[0.02] p-1 rounded-lg border border-black/5 dark:border-white/5">
                  <button 
                    onClick={() => {
                      if (financeMonth === 0) { setFinanceMonth(11); setFinanceYear(y => y - 1); }
                      else { setFinanceMonth(m => m - 1); }
                    }} 
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-gray-light"
                    aria-label="Previous month"
                  >
                    <TrasonIcon icon={CaretLeft} size={16} />
                  </button>
                  <span className="text-xs font-bold text-soft-cream px-2 tracking-wide font-mono">
                    {new Date(financeYear, financeMonth).toLocaleString(locale || 'en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => {
                      if (financeMonth === 11) { setFinanceMonth(0); setFinanceYear(y => y + 1); }
                      else { setFinanceMonth(m => m + 1); }
                    }} 
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-gray-light"
                    aria-label="Next month"
                  >
                    <TrasonIcon icon={CaretRight} size={16} />
                  </button>
                </div>
              )}
            </div>

            {showFinancialChart && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3 animate-fade-in">
                <div className="lg:col-span-2">
                  <FinancialChart transactions={transactions} month={financeMonth} year={financeYear} />
                </div>
                <div>
                  <SpendingBreakdown transactions={transactions} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
