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

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { transactions, fetchTransactions } = useTransaction();
  const { activities, fetchActivities } = useActivity();
  const { reminders, fetchReminders } = useReminder();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch initial data
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

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <Loading fullPage />
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

  return (
    <Layout>
      <div className="space-y-2xl animate-fade-in max-w-4xl">
        {/* Hero Greeting - Today View */}
        <div className="mb-2xl">
          <h1 className="text-display font-serif text-warm-gold mb-md">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-subtext">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Daily Summary Card - Narrative style */}
        <Card className="border-b-2 border-warm-gold border-opacity-40" hover>
          <div className="space-y-md">
            <p className="text-base leading-relaxed text-soft-cream">
              You've tracked <span className="text-warm-gold font-semibold">{recentActivities.length} activities</span> today and 
              spent <span className="text-warm-brown font-semibold">{formatCurrency(totalExpenses)}</span> on essentials
              {totalIncome > 0 && (
                <span>, earning <span className="text-muted-green font-semibold">{formatCurrency(totalIncome)}</span> in the process</span>
              )}.
            </p>
            <div className="text-caption text-gray-light">
              Net balance: <span className={totalIncome - totalExpenses >= 0 ? 'text-muted-green' : 'text-warm-brown'}>
                {totalIncome - totalExpenses >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalIncome - totalExpenses))}
              </span>
            </div>
          </div>
        </Card>

        {/* Financial Summary - 3 column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <Card hover className="text-center">
            <div>
              <p className="text-micro text-gray-light mb-md">INCOME</p>
              <p className="text-3xl font-bold text-muted-green">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </Card>

          <Card hover className="text-center">
            <div>
              <p className="text-micro text-gray-light mb-md">EXPENSES</p>
              <p className="text-3xl font-bold text-warm-brown">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </Card>

          <Card hover className="text-center">
            <div>
              <p className="text-micro text-gray-light mb-md">NET BALANCE</p>
              <p className={`text-3xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-muted-green' : 'text-warm-brown'}`}>
                {totalIncome - totalExpenses >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalIncome - totalExpenses))}
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Input Section - Chat-like */}
        <Card title="What are you doing right now?" className="border-l-4 border-l-warm-gold">
          <div className="flex gap-md">
            <input
              type="text"
              placeholder="Log an activity, expense, or thought..."
              className="flex-1 px-lg py-md bg-gray-strong text-soft-cream placeholder-gray-light border border-deep-sage border-opacity-20 rounded-md text-base focus:border-warm-gold focus:outline-none focus:ring-2 focus:ring-warm-gold focus:ring-opacity-50 transition-all"
            />
            <Button variant="primary" size="md">Send</Button>
          </div>
        </Card>

        {/* Today's Insight */}
        <Card className="bg-gradient-to-br from-insight-taupe from-opacity-5 to-transparent">
          <div className="space-y-lg">
            <h3 className="text-heading font-serif text-warm-gold">
              💡 Today's Insight
            </h3>
            <p className="text-base text-soft-cream leading-relaxed">
              You're most active between 2-4 PM. Your top category is <span className="text-warm-gold font-semibold">'Work'</span> with {recentActivities.filter(a => a.category === 'Work').length} hours logged.
              {recentActivities.length > 0 && ` Consider taking a break after ${new Date().getHours() > 16 ? '4 PM' : '2 PM'} to recharge.`}
            </p>
            <div className="flex gap-md pt-md">
              <Button variant="ghost" size="sm">Learn More</Button>
              <Button variant="ghost" size="sm">Dismiss</Button>
            </div>
          </div>
        </Card>

        {/* Reminders & Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Upcoming Reminders */}
          <Card title="📍 Upcoming Reminders" hover>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-1">
                {upcomingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-start gap-md py-md px-md border-b border-deep-sage border-opacity-10 last:border-0"
                  >
                    <span className="text-warm-gold font-semibold text-sm min-w-fit">
                      {new Date(reminder.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-soft-cream">{reminder.title}</p>
                      {reminder.description && (
                        <p className="text-sm text-gray-light mt-1">{reminder.description}</p>
                      )}
                    </div>
                    <Badge variant={reminder.priority === 'high' ? 'expense' : reminder.priority === 'medium' ? 'activity' : 'insight'} size="sm">
                      {reminder.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-light py-lg">No pending reminders</p>
            )}
          </Card>

          {/* Recent Activities */}
          <Card title="🔄 Recent Activities" hover>
            {recentActivities.length > 0 ? (
              <div className="space-y-1">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-md py-md px-md border-b border-deep-sage border-opacity-10 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-soft-cream">{activity.title}</p>
                      {activity.category && (
                        <p className="text-micro text-gray-light mt-1">{activity.category}</p>
                      )}
                    </div>
                    <Badge variant="activity" size="sm">✓ Done</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-light py-lg">No activities recorded</p>
            )}
          </Card>
        </div>

        {/* Recent Transactions Table */}
        {transactions.length > 0 && (
          <Card title="💳 Recent Transactions" description={`${transactions.length} this month`} hover>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-deep-sage border-opacity-20">
                    <th className="text-left py-md px-md text-micro text-gray-light font-semibold">DATE</th>
                    <th className="text-left py-md px-md text-micro text-gray-light font-semibold">CATEGORY</th>
                    <th className="text-right py-md px-md text-micro text-gray-light font-semibold">AMOUNT</th>
                    <th className="text-right py-md px-md text-micro text-gray-light font-semibold">TYPE</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-deep-sage border-opacity-10 hover:bg-gray-strong hover:bg-opacity-30 transition-colors"
                    >
                      <td className="py-md px-md text-soft-cream">{formatDate(transaction.date)}</td>
                      <td className="py-md px-md text-soft-cream">{transaction.category?.name || transaction.title}</td>
                      <td className={`py-md px-md text-right font-semibold ${
                        transaction.type === 'income'
                          ? 'text-muted-green'
                          : 'text-warm-brown'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-md px-md text-right">
                        <Badge
                          variant={transaction.type === 'income' ? 'income' : 'expense'}
                          size="sm"
                        >
                          {transaction.type}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
