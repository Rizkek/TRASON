'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Badge, Button, Loading, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useTransaction } from '@/hooks/useTransaction';
import { useActivity } from '@/hooks/useActivity';
import { useReminder } from '@/hooks/useReminder';
import { useInvestment } from '@/hooks/useInvestment';
import { getDateRange } from '@/libs/date';
import { sanitizeError } from '@/libs/validation';

// Setup SWR Dates
const CURRENT_DATE = new Date();
const { start: CURRENT_START, end: CURRENT_END } = getDateRange(CURRENT_DATE.getMonth(), CURRENT_DATE.getFullYear());

import { 
  Calendar as CalendarIcon, 
  Bell, 
  Lightbulb, 
  Clock,
  ArrowRight
} from 'lucide-react';

// Extracted Components
import { DashboardHeader } from './components/DashboardHeader';
import { FinancialSummary } from './components/FinancialSummary';
import { ActivitiesList } from './components/ActivitiesList';
import { TransactionsList } from './components/TransactionsList';
import { RemindersSidebar } from './components/RemindersSidebar';
import { InvestmentSummary } from './components/InvestmentSummary';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);
  
  const [error, setError] = useState<string | null>(null);
  
  // SWR automatically handles transactions fetching in background
  const { transactions } = useTransaction(CURRENT_START, CURRENT_END);
  
  // SWR fetches this based on CURRENT_DATE gracefully!
  const { activities } = useActivity(CURRENT_DATE);
  
  const { reminders } = useReminder();
  const { summary: investmentSummary, insights: investmentInsights } = useInvestment();

  const isInitialLoading = React.useRef(true);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [isDataLoading, setIsDataLoading] = React.useState(false);
  const fetchStarted = React.useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (fetchStarted.current || dataLoaded) return;

    const loadData = async () => {
      fetchStarted.current = true;
      setIsDataLoading(true);
      const now = new Date();
      const { start, end } = getDateRange(now.getMonth(), now.getFullYear());

      try {
        await Promise.all([
          // transactions fetches itself via SWR
          // activities fetches itself via SWR
          // reminders fetches itself via SWR
          // investments fetches itself via SWR
        ]);
        setDataLoaded(true);
      } catch (err) {
        const errorMessage = sanitizeError(err);
        setError(errorMessage);
        console.error('Failed to load dashboard data:', err);
        fetchStarted.current = false;
      } finally {
        setIsDataLoading(false);
        isInitialLoading.current = false;
      }
    };

    loadData();
  }, [isAuthenticated, dataLoaded]);

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    return hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';
  }, []);

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const todayTime = useMemo(() => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading text="Checking your session..." />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <Layout>
        <div className="space-y-xl animate-fade-in">
        {/* Hero Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
          <div className="space-y-sm">
            <h1 className="text-display font-serif text-white flex items-center gap-md">
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
          <Button variant="primary" size="md" className="group shadow-lg shadow-primary/20">
            <span>Daily Check-in</span>
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Narrative Summary Card */}
        <DashboardHeader user={user} activities={activities} transactions={transactions} />

        {/* Financial Flow */}
        {isDataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white/5 rounded-lg" />
            ))}
          </div>
        ) : (
          <FinancialSummary transactions={transactions} />
        )}

        <InvestmentSummary summary={investmentSummary} />

        {/* Dynamic Insight Card & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          <div className="lg:col-span-2 space-y-xl">
            {/* Quick Action Input */}
            <Card className="p-lg bg-white bg-opacity-[0.02] border-white border-opacity-[0.05]">
              <div className="flex flex-col md:flex-row gap-md">
                <div className="flex-1 relative group">
                  <div className="absolute left-md top-1/2 -translate-y-1/2 text-primary">
                    <Lightbulb size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Log an activity, expense, or thought..."
                    className="w-full pl-xl pr-lg py-md bg-gray-strong bg-opacity-40 border border-white border-opacity-[0.05] rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-gray-light"
                  />
                </div>
                <Button variant="primary" size="md">LOG NOW</Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <ActivitiesList activities={activities} />
              <TransactionsList transactions={transactions} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-xl">
            <RemindersSidebar reminders={reminders} />

            <Card className="p-xl bg-gradient-to-br from-gray-strong to-black relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary opacity-10 blur-3xl rounded-full" />
              <div className="space-y-lg relative z-10">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary glow-secondary">
                    <Lightbulb size={20} />
                  </div>
                  <h3 className="font-serif italic text-lg text-white">Daily Insight</h3>
                </div>
                <p className="text-caption leading-relaxed tracking-wide text-gray-very-light italic">
                  "{investmentInsights?.headline || 'Pattern detected: You tend to spend more on Tuesdays. Consider setting a daily limit to stay on track.'}"
                </p>
                <div className="pt-md">
                  <Button variant="ghost" size="sm" className="w-full border-white/10 hover:bg-white/5 h-10">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Deep Analysis</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      </Layout>
    </>
  );
}
