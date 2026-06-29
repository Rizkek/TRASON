'use client';

import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card } from '@/components';
import { Transaction } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatCurrency } from '@/libs/format';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

const COLORS = [
  '#F4C95D', // Gold/Primary
  '#10B981', // Emerald/Success
  '#3B82F6', // Blue/Info
  '#8B5CF6', // Purple/Timeline
  '#EC4899', // Pink/Insights
  '#F59E0B', // Amber/Warning
  '#EF4444', // Red/Danger
  '#14B8A6'  // Teal
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
          categoryData[catName] = { 
            value: 0, 
            color: cat?.color || (catName === 'Uncategorized' ? '#64748B' : undefined) 
          };
        }
        categoryData[catName].value += t.amount;
      }
    });

    const data = Object.keys(categoryData).map((key, index) => ({
      name: key,
      value: categoryData[key].value,
      color: categoryData[key].color || COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    return { data, totalExpense };
  }, [transactions]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#FFFFFF',
        bodyColor: '#94A3B8',
        bodyFont: { size: 12 },
        titleFont: { size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const percentage = chartData.totalExpense > 0 ? ((val / chartData.totalExpense) * 100).toFixed(1) : '0';
            return ` ${percentage}% (${formatCurrency(val, currency, locale)})`;
          }
        }
      }
    }
  };

  const doughnutData = {
    labels: chartData.data.map(d => d.name),
    datasets: [
      {
        data: chartData.data.map(d => d.value),
        backgroundColor: chartData.data.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
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
          <div className="w-[45%] md:w-[40%] h-full relative shrink-0">
            <Doughnut data={doughnutData} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-gray-light uppercase tracking-widest">Total</span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(chartData.totalExpense, currency, locale)}
              </span>
            </div>
          </div>
          <div className="flex-1 h-full overflow-y-auto pr-2 custom-scrollbar">
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
