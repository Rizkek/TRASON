'use client';

import React from 'react';
import { Card } from '@/components';
import { TrendUp as TrendingUp, TrendDown as TrendingDown } from '@phosphor-icons/react';
import { formatCurrency } from '@/libs/format';
import type { SpendingLeak } from '@/libs/analytics/financialHealth';

interface Props {
  spendingLeaks: SpendingLeak[];
  currency: string;
  locale: string;
}

export function SpendingTrend({ spendingLeaks, currency, locale }: Props) {
  // Top 2 increases + top 1 notable drop
  const leaks = spendingLeaks.filter(l => l.changePercent > 5).slice(0, 2);
  const drops = spendingLeaks.filter(l => l.changePercent < -10).slice(0, 1);
  const items = [...leaks, ...drops];

  if (items.length === 0) return null;

  return (
    <Card className="p-md md:p-lg">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-[10px] md:text-xs font-bold text-gray-light tracking-widest uppercase">
          Tren Pengeluaran
        </h3>
        <span className="text-[9px] text-gray-light">vs bulan lalu</span>
      </div>
      <div className="space-y-sm">
        {items.map((item) => {
          const isUp = item.changePercent > 0;
          return (
            <div key={item.category} className="flex items-center justify-between gap-sm">
              <div className="flex items-center gap-sm min-w-0">
                <span
                  className={`shrink-0 p-1 rounded-md ${
                    isUp ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                  }`}
                >
                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                </span>
                <span className="text-xs text-soft-cream truncate font-medium">{item.category}</span>
              </div>
              <div className="flex items-center gap-sm shrink-0">
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
