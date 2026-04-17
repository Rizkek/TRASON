import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Badge, Button, Loading } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useTransaction } from '@/hooks/useTransaction';
import { useActivity } from '@/hooks/useActivity';
import { useReminder } from '@/hooks/useReminder';
import { getDateRange } from '@/libs/date';

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

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const { transactions, fetchTransactions } = useTransaction();
  const { activities, fetchActivities } = useActivity();
  const { reminders, fetchReminders } = useReminder();

  const isInitialLoading = React.useRef(true);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      const now = new Date();
      const { start, end } = getDateRange(now.getMonth(), now.getFullYear());

      try {
        await Promise.all([
          fetchTransactions(start, end),
          fetchActivities(now),
          fetchReminders(),
        ]);
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        isInitialLoading.current = false;
      }
    };

    if (!dataLoaded) {
      loadData();
    }
  }, [isAuthenticated, dataLoaded, fetchTransactions, fetchActivities, fetchReminders]);

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    return hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';
  }, []);

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const todayTime = useMemo(() => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }, []);

  if (!isAuthenticated) return null;

  if (isInitialLoading.current && !dataLoaded && transactions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
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
        <FinancialSummary transactions={transactions} />

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
                  "Pattern detected: You tend to spend more on Tuesdays. Consider setting a daily limit to stay on track."
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
  );
}

