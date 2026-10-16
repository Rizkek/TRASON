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
import { withAlpha } from '@/config/colors';
import { useChartTheme } from '@/hooks/useChartTheme';
import { Card } from '@/components';
import { Placeholder } from '@/components/ui/Placeholder';
import { Heading, Paragraph } from '@/components/ui/typography';
import { Transaction } from '@/services/supabase/supabaseClient';
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
  month?: number; // 0-11
  year?: number;
}

export const FinancialChart = ({ transactions, month, year }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserPreferences();
  const [isMounted, setIsMounted] = useState(false);
  const { colors, chrome } = useChartTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const dailyData: Record<string, { income: number; expense: number; dateStr: string }> = {};

    const now = new Date();
    const targetYear = year !== undefined ? year : now.getFullYear();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(targetYear, targetMonth, i);
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
  }, [transactions, locale, month, year]);

  const chartDataState = useMemo(() => {
    return {
      labels: chartData.map(d => d.dateStr),
      datasets: [
        {
          label: t('dashboard.income'),
          data: chartData.map(d => d.income),
          borderColor: colors.success,
          backgroundColor: withAlpha(colors.success, 0.12),
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        },
        {
          label: t('dashboard.expenses'),
          data: chartData.map(d => d.expense),
          borderColor: colors.danger,
          backgroundColor: withAlpha(colors.danger, 0.12),
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [chartData, t, colors]);

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
        backgroundColor: chrome.tooltipBg,
        titleColor: colors.grayVeryLight,
        bodyColor: colors.foreground,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: chrome.tooltipBorder,
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
          color: chrome.tick,
          font: { size: 12 },
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
    <Card className="p-4 md:p-8">

      <div className="flex items-center justify-between mb-4 md:mb-8 relative z-10">
        <div>
          <Heading as="h3" size="h6">{t('dashboard.financial_analytics')}</Heading>
          <Paragraph className="mt-1 text-xs text-muted-foreground">{t('dashboard.monthly_overview')}</Paragraph>
        </div>
      </div>

      <div className="w-full h-[120px] md:h-[200px] relative z-10">
        {!isMounted || !chartDataState ? (
          <Placeholder className="h-full w-full" />
        ) : (
          <Line data={chartDataState} options={options} />
        )}
      </div>
    </Card>
  );
};
