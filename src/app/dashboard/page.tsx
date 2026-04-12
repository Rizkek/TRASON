'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Badge, Button, Loading } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useTransaction } from '@/hooks/useTransaction';
import { useActivity } from '@/hooks/useActivity';
import { useReminder } from '@/hooks/useReminder';
import { formatCurrency, formatDate } from '@/libs/format';
import { getDateRange } from '@/libs/date';

import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar as CalendarIcon, 
  Bell, 
  Lightbulb, 
  Clock,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { transactions, fetchTransactions } = useTransaction();
  const { activities, fetchActivities } = useActivity();
  const { reminders, fetchReminders } = useReminder();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setIsLoading(true);
      const now = new Date();
      const { start, end } = getDateRange(now.getMonth(), now.getFullYear());

      try {
        await Promise.all([
          fetchTransactions(start, end),
          fetchActivities(now),
          fetchReminders(),
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loading />
        </div>
      </Layout>
    );
  }

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const upcomingReminders = reminders
    .filter((r) => r.status !== 'completed')
    .slice(0, 5);

  const recentActivities = activities.slice(0, 5);

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <Layout>
      <div className="space-y-xl animate-fade-in">
        {/* Hero Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
          <div className="space-y-sm">
            <h1 className="text-display font-serif text-white flex items-center gap-md">
              <span className="text-gradient">{greeting}</span>, 
              <span>{user?.name?.split(' ')[0] || 'User'}</span>
            </h1>
            <div className="flex items-center gap-md text-gray-very-light opacity-60">
              <CalendarIcon size={14} className="text-secondary" />
              <p className="text-micro">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <div className="w-1 h-1 rounded-full bg-gray-light" />
              <Clock size={14} className="text-secondary" />
              <p className="text-micro">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <Button variant="primary" size="md" className="group shadow-lg shadow-primary/20">
            <span>Daily Check-in</span>
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Narrative Summary Card */}
        <Card className="relative overflow-hidden border-none glass p-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-[0.05] blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-xl">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center glow-primary flex-shrink-0">
              <TrendingUp size={32} className="text-white" />
            </div>
            <div className="space-y-sm">
              <p className="text-lg leading-relaxed text-soft-cream font-serif italic opacity-90">
                "You've tracked <span className="text-primary font-bold">{recentActivities.length} activities</span> today and 
                invested <span className="text-secondary font-bold">{formatCurrency(totalExpenses)}</span> in yourself. 
                {totalIncome > 0 ? ` Your positive momentum shows with an income of ${formatCurrency(totalIncome)}.` : ' Keep focus on your goals.'}"
              </p>
            </div>
          </div>
        </Card>

        {/* Financial Flow - Modern 3-col */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <Card className="p-xl border-l-[4px] border-l-success group hover:border-l-primary transition-all">
            <div className="flex justify-between items-start mb-md">
              <p className="text-micro text-gray-light">INCOME</p>
              <TrendingUp size={16} className="text-success" />
            </div>
            <p className="text-3xl font-bold text-white group-hover:text-success transition-colors">
              {formatCurrency(totalIncome)}
            </p>
          </Card>

          <Card className="p-xl border-l-[4px] border-l-danger group hover:border-l-primary transition-all">
            <div className="flex justify-between items-start mb-md">
              <p className="text-micro text-gray-light">EXPENSES</p>
              <TrendingDown size={16} className="text-danger" />
            </div>
            <p className="text-3xl font-bold text-white group-hover:text-danger transition-colors">
              {formatCurrency(totalExpenses)}
            </p>
          </Card>

          <Card className="p-xl border-l-[4px] border-l-secondary group hover:border-l-primary transition-all">
            <div className="flex justify-between items-start mb-md">
              <p className="text-micro text-gray-light">BALANCE</p>
              <Wallet size={16} className="text-secondary" />
            </div>
            <p className={`text-3xl font-bold text-white ${totalIncome - totalExpenses >= 0 ? 'group-hover:text-success' : 'group-hover:text-danger'} transition-colors`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </Card>
        </div>

        {/* Dynamic Insight Card */}
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

            {/* Activities & Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
              <Card className="overflow-hidden">
                <div className="px-lg py-md border-b border-white border-opacity-[0.05] flex justify-between items-center bg-white bg-opacity-[0.01]">
                  <div className="flex items-center gap-sm">
                    <Clock size={16} className="text-primary" />
                    <h3 className="text-sm font-bold tracking-tight">RECENT ACTIVITIES</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] h-auto py-xs px-sm">VIEW ALL</Button>
                </div>
                <div className="p-sm">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="group flex items-center gap-md p-md rounded-md hover:bg-white hover:bg-opacity-[0.02] transition-colors">
                        <div className="w-1 h-8 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{activity.title}</p>
                          <p className="text-[10px] text-gray-light uppercase tracking-wider mt-0.5">{activity.category || 'Lifestyle'}</p>
                        </div>
                        <Badge variant="activity" size="sm">✓</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-2xl text-center text-gray-light text-xs italic">No activities recorded yet.</div>
                  )}
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="px-lg py-md border-b border-white border-opacity-[0.05] flex justify-between items-center bg-white bg-opacity-[0.01]">
                  <div className="flex items-center gap-sm">
                    <Wallet size={16} className="text-secondary" />
                    <h3 className="text-sm font-bold tracking-tight">CASH FLOW</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] h-auto py-xs px-sm">LOG NEW</Button>
                </div>
                <div className="p-sm">
                  {transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="group flex items-center gap-md p-md rounded-md hover:bg-white hover:bg-opacity-[0.02] transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{t.category?.name || t.title}</p>
                        <p className="text-[10px] text-gray-light uppercase tracking-wider mt-0.5">{formatDate(t.date)}</p>
                      </div>
                      <p className={`text-sm font-bold ${t.type === 'income' ? 'text-success' : 'text-white'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="py-2xl text-center text-gray-light text-xs italic">No transactions found.</div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Sidebar - Reminders & Insights */}
          <div className="space-y-xl">
            <Card className="overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="px-lg py-md border-b border-white border-opacity-[0.05] flex justify-between items-center bg-white bg-opacity-[0.01]">
                <div className="flex items-center gap-sm">
                  <Bell size={16} className="text-secondary" />
                  <h3 className="text-sm font-bold tracking-tight">REMINDERS</h3>
                </div>
                <div className="w-5 h-5 bg-danger text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                  {upcomingReminders.length}
                </div>
              </div>
              <div className="p-md space-y-md relative z-10">
                {upcomingReminders.map((r) => (
                  <div key={r.id} className="flex gap-md p-sm rounded-md bg-white bg-opacity-[0.02] border border-white border-opacity-[0.03]">
                    <div className="text-xs font-serif italic text-secondary min-w-[40px] pt-0.5">
                      {new Date(r.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{r.title}</p>
                      {r.description && <p className="text-[10px] text-gray-light truncate mt-0.5">{r.description}</p>}
                    </div>
                  </div>
                ))}
                {upcomingReminders.length === 0 && (
                  <div className="py-lg text-center text-gray-light text-xs italic">All clear!</div>
                )}
              </div>
            </Card>

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
