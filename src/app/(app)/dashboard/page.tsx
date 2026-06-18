'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Badge, Button, Loading, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useActivity } from '@/hooks/useActivity';
import { useReminder } from '@/hooks/useReminder';
import { useInvestment } from '@/hooks/useInvestment';
import { InvestmentInsightResponse } from '@/services/investmentService';
import { getDateRange } from '@/libs/date';

// Setup SWR Dates
const CURRENT_DATE = new Date();
const { start: CURRENT_START, end: CURRENT_END } = getDateRange(CURRENT_DATE.getMonth(), CURRENT_DATE.getFullYear());

import { useTranslation } from '@/libs/i18n/useTranslation';
import { 
  RiCalendarLine as CalendarIcon, 
  RiNotification3Line as Bell, 
  RiLightbulbLine as Lightbulb, 
  RiTimeLine as Clock 
} from 'react-icons/ri';

// Extracted Components
import { DashboardHeader } from './components/DashboardHeader';
import { FinancialChart } from './components/FinancialChart';
import { DailyTasksSummary } from './components/DailyTasksSummary';
import { ActivitiesList } from './components/ActivitiesList';
import { TransactionsList } from './components/TransactionsList';
import { RemindersSidebar } from './components/RemindersSidebar';
import { InvestmentSummary } from './components/InvestmentSummary';
import { SportSummary } from './components/SportSummary';
import { CareerSummary } from './components/CareerSummary';
import { LifeScoreCard } from './components/LifeScoreCard';
import { DailyBriefingCard } from './components/DailyBriefingCard';
import { FinancialHealthWidget } from './components/FinancialHealthWidget';
import { useWeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { useCareer } from '@/hooks/useCareer';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();
  const preferences = useUserPreferences();
  const { locale, timezone, module_features, isOnboarded } = preferences;
  
  // SWR automatically handles all data fetching in background
  const { transactions } = useTransaction(CURRENT_START, CURRENT_END);
  const { activities } = useActivity(CURRENT_DATE);
  const { reminders } = useReminder();
  const { summary: investmentSummary, insights: investmentInsights } = useInvestment();
  const typedInsights = investmentInsights as InvestmentInsightResponse | null;
  const { summary: sportSummary, isLoading: sportLoading } = useWeeklySportSummary();
  const { stats: careerStats, nextInterview, isLoading: careerLoading } = useCareer();

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    return hours < 12 ? t('dashboard.greeting_morning') : hours < 18 ? t('dashboard.greeting_afternoon') : t('dashboard.greeting_evening');
  }, [t]);

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', timeZone: timezone });
  }, [locale, timezone]);

  const todayTime = useMemo(() => {
    return new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: timezone });
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
      <div className="space-y-md md:space-y-xl animate-fade-in">
        {/* Hero Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-lg md:mb-xl">
          <div className="space-y-sm">
            <h1 className="text-3xl md:text-display font-serif text-white flex flex-wrap items-baseline gap-x-md">
              <span className="text-gradient">{greeting}</span>, 
              <span>{user?.first_name || user?.name?.split(' ')[0] || 'User'}</span>
            </h1>
            <div className="flex items-center gap-md text-gray-very-light opacity-60">
              <CalendarIcon size={14} className="text-secondary" />
              <p className="text-micro">{todayDate}</p>
              <div className="w-1 h-1 rounded-full bg-gray-light" />
              <Clock size={14} className="text-secondary" />
              <p className="text-micro">{todayTime}</p>
            </div>
          </div>
        </div>

        {/* Narrative Summary Card */}
        <DashboardHeader user={user} activities={activities} transactions={transactions} />

        {/* Daily Briefing */}
        <DailyBriefingCard />

        {/* Life Score — Primary Intelligence Widget */}
        <LifeScoreCard />

        {/* Financial Flow and Daily Tasks - Compact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md md:gap-xl">
          <FinancialChart transactions={transactions} />
          {preferences?.module_features?.['timeline_daily_checklist'] !== false && (
            <DailyTasksSummary />
          )}
        </div>

        <InvestmentSummary summary={investmentSummary} />

        {/* Dynamic Insight Card & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md md:gap-xl">
          <div className="lg:col-span-2 space-y-md md:space-y-xl">
            {/* Quick Action Input */}
            <Card className="p-md md:p-lg bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex flex-col md:flex-row gap-md">
                <div className="flex-1 relative group">
                  <div className="absolute left-md top-1/2 -translate-y-1/2 text-primary">
                    <Lightbulb size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder={t('dashboard.capture_placeholder')}
                    className="w-full pl-xl pr-lg py-md bg-gray-strong/40 border border-black/[0.05] dark:border-white/[0.05] rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-gray-light"
                  />
                </div>
                <Button variant="primary" size="md">{t('dashboard.capture_btn')}</Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-xl">
              {preferences?.module_features?.['timeline_weekly_log'] !== false && (
                <ActivitiesList activities={activities} />
              )}
              <TransactionsList transactions={transactions} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-md md:space-y-xl">
            <FinancialHealthWidget />
            {preferences?.module_features?.['reminders_active'] !== false && (
              <RemindersSidebar reminders={reminders} />
            )}
            <SportSummary summary={sportSummary} isLoading={sportLoading} />
            <CareerSummary stats={careerStats} nextInterview={nextInterview} isLoading={careerLoading} />

            <Card className="p-md md:p-xl bg-gradient-to-br from-gray-strong to-black relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary opacity-10 blur-3xl rounded-full" />
              <div className="space-y-lg relative z-10">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary glow-secondary">
                    <Lightbulb size={20} />
                  </div>
                  <h3 className="font-serif italic text-lg text-white">{t('dashboard.daily_insight')}</h3>
                </div>
                <p className="text-caption leading-relaxed tracking-wide text-gray-very-light italic">
                  &ldquo;{typedInsights?.headline || t('dashboard.default_insight')}&rdquo;
                </p>
                <div className="flex flex-wrap gap-2 pt-sm">
                  {typedInsights?.scenario ? (
                    <Badge variant="info" size="sm">{t(`investment_page.scenario_${typedInsights.scenario}`)}</Badge>
                  ) : null}
                  {typedInsights?.confidence ? (
                    <Badge variant={typedInsights.confidence === 'low' ? 'danger' : typedInsights.confidence === 'moderate' ? 'warning' : 'success'} size="sm">
                      {t(`investment_page.confidence_${typedInsights.confidence}`)}
                    </Badge>
                  ) : null}
                </div>
                {typedInsights?.riskWarning ? (
                  <p className="text-xs text-warning mt-2">{typedInsights.riskWarning}</p>
                ) : null}
                {typedInsights?.recommendation ? (
                  <p className="text-xs text-gray-light mt-2">{typedInsights.recommendation}</p>
                ) : null}
                <div className="pt-md">
                  <Button variant="ghost" size="sm" className="w-full border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5 h-10">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">{t('dashboard.open_insights')}</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
