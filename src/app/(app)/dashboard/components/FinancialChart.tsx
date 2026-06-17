'use client';

import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card } from '@/components';
import { Transaction } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatCurrency } from '@/libs/format';

interface Props {
  transactions: Transaction[];
}

// Custom Tooltip for premium aesthetics
const CustomTooltip = ({ active, payload, label, currency, locale }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-black/10 dark:border-white/10 p-md rounded-xl shadow-2xl backdrop-blur-xl">
        <p className="text-gray-light text-xs font-semibold mb-sm">{label}</p>
        <div className="space-y-xs">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-md justify-between">
              <span style={{ color: entry.color }} className="text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="text-white font-mono text-sm font-bold">
                {formatCurrency(entry.value, currency, locale)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const FinancialChart = ({ transactions }: Props) => {
  const { t } = useTranslation();
  const { currency, locale, timezone } = useUserPreferences();

  const chartData = useMemo(() => {
    // Group transactions by date
    const dailyData: Record<string, { income: number; expense: number; dateStr: string }> = {};

    // Get current month and year to generate all days in the current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Initialize all days of the month with 0
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dayStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const displayDate = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
      dailyData[dayStr] = { income: 0, expense: 0, dateStr: displayDate };
    }

    // Populate actual data
    transactions.forEach(t => {
      // Parse transaction date in correct timezone
      const tDate = new Date(t.date);
      const dayStr = tDate.toLocaleDateString('en-CA'); // Extract YYYY-MM-DD reliably
      if (dailyData[dayStr]) {
        if (t.type === 'income') {
          dailyData[dayStr].income += t.amount;
        } else if (t.type === 'expense') {
          dailyData[dayStr].expense += t.amount;
        }
      }
    });

    // Convert object back to sorted array
    return Object.keys(dailyData)
      .sort((a, b) => a.localeCompare(b))
      .map(key => dailyData[key]);

  }, [transactions, locale]);



  return (
    <Card className="p-xl bg-gradient-to-br from-[#0F172A]/80 to-[#020617]/80 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.05] relative overflow-hidden group">
      {/* Glow Effect Behind Chart */}
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-primary/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-xl relative z-10">
        <div>
          <h3 className="font-serif italic text-lg text-white">{t('dashboard.financial_analytics')}</h3>
          <p className="text-micro text-gray-light mt-1">{t('dashboard.monthly_overview')}</p>
        </div>
      </div>

      <div className="w-full h-[200px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              {/* Income Gradient */}
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              {/* Expense Gradient */}
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} vertical={false} />
            <XAxis 
              dataKey="dateStr" 
              stroke="#ffffff" 
              strokeOpacity={0.3} 
              fontSize={10} 
              tickMargin={10} 
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis 
              hide={true} 
              domain={['auto', 'auto']} 
            />
            <Tooltip content={<CustomTooltip currency={currency} locale={locale} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            
            <Area 
              type="monotone" 
              dataKey="income" 
              name={t('dashboard.income')} 
              stroke="#10B981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIncome)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              name={t('dashboard.expenses')} 
              stroke="#EF4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorExpense)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
