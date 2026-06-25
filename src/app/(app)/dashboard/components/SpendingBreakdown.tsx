'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components';
import { Transaction } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatCurrency } from '@/libs/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface Props {
  transactions: Transaction[];
}

const COLORS = [
  '#4E4FEB', // Primary
  '#7B7DF1', // Primary light
  '#2C2DA5', // Primary dark
  '#A8A9F7', // Primary lighter
  '#10B981', // Success
  '#F59E0B', // Warning
  '#EF4444', // Danger
  '#8B5CF6'  // Purple
];

export const SpendingBreakdown = ({ transactions }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserPreferences();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => { setIsMounted(true); }, []);

  const chartData = useMemo(() => {
    const categoryData: Record<string, { value: number, color?: string }> = {};
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'expense') {
        totalExpense += t.amount;
        const cat = Array.isArray(t.categories) ? t.categories[0] : (t.categories as any);
        const catName = cat?.name || 'Uncategorized';
        
        if (!categoryData[catName]) {
          categoryData[catName] = { value: 0, color: cat?.color };
        }
        categoryData[catName].value += t.amount;
      }
    });

    const data = Object.keys(categoryData).map((key, index) => ({
      name: key,
      value: categoryData[key].value,
      // Use category color if exists, else fallback to COLORS palette
      color: categoryData[key].color || COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return { data, totalExpense };
  }, [transactions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = chartData.totalExpense > 0 ? ((data.value / chartData.totalExpense) * 100).toFixed(1) : '0';
      return (
        <div className="bg-black/90 border border-black/10 dark:border-white/10 p-md rounded-xl shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-md justify-between">
            <span style={{ color: data.color }} className="text-sm font-bold">
              {data.name}
            </span>
            <span className="text-white text-sm font-bold">
              {percentage}%
            </span>
          </div>
          <p className="text-gray-light text-xs mt-1">
            {formatCurrency(data.value, currency, locale)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-md md:p-xl bg-gradient-to-br from-[#0F172A]/80 to-[#020617]/80 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.05] relative overflow-hidden group h-full">
      <div className="flex justify-between items-start mb-md">
        <div>
          <h3 className="font-serif italic text-md md:text-lg text-white">Spending Breakdown</h3>
          <p className="text-[10px] md:text-micro text-gray-light mt-1">Percentage based analysis</p>
        </div>
      </div>

      {!isMounted ? (
        <div className="w-full h-48 bg-white/[0.02] rounded-lg animate-pulse" />
      ) : chartData.data.length > 0 ? (
        <div className="flex flex-col md:flex-row items-center gap-xl h-[200px] md:h-[240px]">
          <div className="w-1/2 h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.data}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-gray-light uppercase tracking-widest">Total</span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(chartData.totalExpense, currency, locale)}
              </span>
            </div>
          </div>
          <div className="w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-sm">
              {chartData.data.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-xs truncate pr-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-light truncate">{item.name}</span>
                  </div>
                  <span className="text-white font-bold shrink-0">
                    {chartData.totalExpense > 0 ? ((item.value / chartData.totalExpense) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-light text-sm opacity-50">
          No expenses recorded this month.
        </div>
      )}
    </Card>
  );
};
