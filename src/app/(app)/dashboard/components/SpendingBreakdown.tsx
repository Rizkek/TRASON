'use client';

import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card } from '@/components';
import { Placeholder } from '@/components/ui/Placeholder';
import { Heading, Paragraph } from '@/components/ui/typography';
import { Transaction } from '@/services/supabase/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatCurrency } from '@/libs/format';
import { useChartTheme } from '@/hooks/useChartTheme';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  transactions: Transaction[];
}

export const SpendingBreakdown = ({ transactions }: Props) => {
  const { t } = useTranslation();
  const { currency, locale } = useUserPreferences();
  const [isMounted, setIsMounted] = React.useState(false);
  const { colors, palette, chrome } = useChartTheme();

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
            color: cat?.color || (catName === 'Uncategorized' ? colors.grayLight : undefined)
          };
        }
        categoryData[catName].value += t.amount;
      }
    });

    const data = Object.keys(categoryData).map((key, index) => ({
      name: key,
      value: categoryData[key].value,
      color: categoryData[key].color || palette[index % palette.length]
    })).sort((a, b) => b.value - a.value);

    return { data, totalExpense };
  }, [transactions, colors, palette]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: chrome.tooltipBg,
        titleColor: colors.foreground,
        bodyColor: colors.grayVeryLight,
        bodyFont: { size: 12 },
        titleFont: { size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: chrome.tooltipBorder,
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
    <Card className="h-full p-4 md:p-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Heading as="h3" size="h6">{t('dashboard.spending_breakdown')}</Heading>
          <Paragraph className="mt-1 text-xs text-muted-foreground">{t('dashboard.percentage_based')}</Paragraph>
        </div>
      </div>

      {!isMounted ? (
        <Placeholder className="h-48 w-full" />
      ) : chartData.data.length > 0 ? (
        <div className="flex flex-col md:flex-row items-center gap-8 h-[200px] md:h-[240px]">
          <div className="w-[45%] md:w-[40%] h-full relative shrink-0">
            <Doughnut data={doughnutData} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{t('dashboard.total_label')}</span>
              <span className="text-body-md font-bold text-foreground">
                {formatCurrency(chartData.totalExpense, currency, locale)}
              </span>
            </div>
          </div>
          <div className="flex-1 h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              {chartData.data.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 truncate pr-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="shrink-0 font-bold text-foreground">
                    {chartData.totalExpense > 0 ? ((item.value / chartData.totalExpense) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-body-md text-muted-foreground">
          {t('dashboard.no_expenses')}
        </div>
      )}
    </Card>
  );
};
