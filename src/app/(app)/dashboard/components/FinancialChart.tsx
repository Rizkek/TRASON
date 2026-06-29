'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card } from '@/components';
import { Transaction } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatCurrency } from '@/libs/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface Props {
  transactions: Transaction[];
}

export const FinancialChart = ({ transactions }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserPreferences();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const dailyData: Record<string, { income: number; expense: number; dateStr: string }> = {};

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dayStr = d.toLocaleDateString('en-CA');
      const displayDate = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
      dailyData[dayStr] = { income: 0, expense: 0, dateStr: displayDate };
    }

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const dayStr = tDate.toLocaleDateString('en-CA');
      if (dailyData[dayStr]) {
        if (t.type === 'income') {
          dailyData[dayStr].income += t.amount;
        } else if (t.type === 'expense') {
          dailyData[dayStr].expense += t.amount;
        }
      }
    });

    return Object.keys(dailyData)
      .sort((a, b) => a.localeCompare(b))
      .map(key => dailyData[key]);
  }, [transactions, locale]);

  const chartDataState = useMemo(() => {
    return {
      labels: chartData.map(d => d.dateStr),
      datasets: [
        {
          label: t('dashboard.income'),
          data: chartData.map(d => d.income),
          borderColor: '#10B981',
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'transparent';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        },
        {
          label: t('dashboard.expenses'),
          data: chartData.map(d => d.expense),
          borderColor: '#EF4444',
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'transparent';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [chartData, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#94A3B8',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y, currency, locale);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'rgba(255,255,255,0.3)',
          font: { size: 10 },
          maxTicksLimit: 10
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <Card className="p-md md:p-xl bg-gradient-to-br from-[#0F172A]/80 to-[#020617]/80 backdrop-blur-2xl border border-black/[0.05] dark:border-white/[0.05] relative overflow-hidden group">
      <div className="absolute top-0 left-1/4 w-1/2 h-full bg-primary/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-md md:mb-xl relative z-10">
        <div>
          <h3 className="font-serif italic text-md md:text-lg text-white">{t('dashboard.financial_analytics')}</h3>
          <p className="text-[10px] md:text-micro text-gray-light mt-1">{t('dashboard.monthly_overview')}</p>
        </div>
      </div>

      <div className="w-full h-[120px] md:h-[200px] relative z-10">
        {!isMounted || !chartDataState ? (
          <div className="w-full h-full bg-white/[0.02] rounded-lg animate-pulse" />
        ) : (
          <Line data={chartDataState} options={options} />
        )}
      </div>
    </Card>
  );
};
