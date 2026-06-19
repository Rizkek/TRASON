'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Badge, Button, Loading, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useActivity } from '@/hooks/useActivity';
import { useReminder } from '@/hooks/useReminder';
import { useInvestment } from '@/hooks/useInvestment';
import { InvestmentInsightResponse } from '@/services/finance/investmentService';
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
import { RemindersSidebar } from './components/RemindersSidebar';
import { InvestmentSummary } from './components/InvestmentSummary';
import { SportSummary } from './components/SportSummary';
import { CareerSummary } from './components/CareerSummary';
import { LifeScoreCard } from './components/LifeScoreCard';
import { DailyBriefingCard } from './components/DailyBriefingCard';
import { useWeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { useCareer } from '@/hooks/useCareer';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useAllModuleStatus } from '@/hooks/useModuleStatus';

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
  const { enabledModules } = useAllModuleStatus(user?.id);

  const isFinanceEnabled = enabledModules.includes('finance');
  const isSportEnabled = enabledModules.includes('sport');
  const isCareerEnabled = enabledModules.includes('career');
  const isTimelineEnabled = enabledModules.includes('timeline');
  const isRemindersEnabled = enabledModules.includes('reminders');

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

        {/* Life Score — Primary Intelligence Widget */}
        <LifeScoreCard />

        {/* Financial Flow and Daily Tasks - Compact Grid */}
        {(isFinanceEnabled || (isTimelineEnabled && preferences?.module_features?.['timeline_daily_checklist'] !== false)) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-md md:gap-xl">
            {isFinanceEnabled && <FinancialChart transactions={transactions} />}
            {isTimelineEnabled && preferences?.module_features?.['timeline_daily_checklist'] !== false && (
              <DailyTasksSummary />
            )}
          </div>
        )}

        {isFinanceEnabled && <InvestmentSummary summary={investmentSummary} />}

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
                className="w-full pl-2xl pr-lg py-lg bg-gray-strong/40 border border-black/[0.05] dark:border-white/[0.05] rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-gray-light"
              />
            </div>
            <Button variant="primary" size="md">{t('dashboard.capture_btn')}</Button>
          </div>
        </Card>

        {/* Modules Summary Grid */}
        {(isRemindersEnabled || isSportEnabled || isCareerEnabled) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md md:gap-xl">
            {isRemindersEnabled && preferences?.module_features?.['reminders_active'] !== false && (
              <RemindersSidebar reminders={reminders} />
            )}
            {isSportEnabled && <SportSummary summary={sportSummary} isLoading={sportLoading} />}
            {isCareerEnabled && <CareerSummary stats={careerStats} nextInterview={nextInterview} isLoading={careerLoading} />}
          </div>
        )}
      </div>
    </Layout>
  );
}
