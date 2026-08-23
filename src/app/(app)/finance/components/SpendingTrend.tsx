'use client';

import React from 'react';
import { Card } from '@/components';
import { TrendUp as TrendingUp, TrendDown as TrendingDown } from '@phosphor-icons/react';
import { formatCurrency } from '@/libs/format';
import type { SpendingLeak } from '@/libs/analytics/financialHealth';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Heading, Paragraph } from '@/components/ui/typography';

interface Props {
  spendingLeaks: SpendingLeak[];
  currency: string;
  locale: string;
}

export function SpendingTrend({ spendingLeaks, currency, locale }: Props) {
  const { t } = useTranslation();
  // Top 2 increases + top 1 notable drop
  const leaks = spendingLeaks.filter(l => l.changePercent > 5).slice(0, 2);
  const drops = spendingLeaks.filter(l => l.changePercent < -10).slice(0, 1);
  const items = [...leaks, ...drops];

  if (items.length === 0) return null;

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <Heading as="h3" size="h3" className="text-[10px] md:text-xs font-bold text-gray-light tracking-widest uppercase">
          Tren Pengeluaran
        </Heading>
        <span className="text-[9px] text-gray-light">{t('finance.trend.vsLastMonth')}</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const isUp = item.changePercent > 0;
          return (
            <div key={item.category} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 p-1 rounded-md ${
                    isUp ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                  }`}
                >
                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                </span>
                <span className="text-xs text-soft-cream truncate font-medium">{item.category}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isUp ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {item.changePercent}%
                </span>
                <span className="text-xs text-gray-light hidden sm:block">
                  {formatCurrency(item.thisMonth, currency, locale)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
