'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components';
import { formatCurrency } from '@/libs/format';
import type { Transaction, CategoryJoin } from '@/types/database';
import { Heading, Paragraph } from '@/components/ui/typography';
import { useTranslation } from '@/libs/i18n/useTranslation';

function resolveCategory(
  categories: CategoryJoin | CategoryJoin[] | null | undefined
): CategoryJoin | null {
  if (!categories) return null;
  if (Array.isArray(categories)) return categories[0] ?? null;
  return categories;
}

interface Props {
  transactions: Transaction[];
  currency: string;
  locale: string;
}

export function CategoryBreakdown({ transactions, currency, locale }: Props) {
  const { t: t_fn } = useTranslation();
  const breakdown = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    if (total === 0) return [];

    const map: Record<string, { name: string; amount: number }> = {};
    expenses.forEach((t) => {
      const cat = resolveCategory(t.categories);
      const key = cat?.id || 'uncategorized';
      const name = cat?.name || ((t_fn as any)('finance.categoryBreakdown.others') as string) || 'Lainnya';
      if (!map[key]) map[key] = { name, amount: 0 };
      map[key].amount += Number(t.amount);
    });

    return Object.values(map)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        pct: Math.round((item.amount / total) * 100),
      }));
  }, [transactions]);

  if (breakdown.length === 0) return null;

  return (
    <Card className="p-4 md:p-6">
      <Heading as="h3" size="h6" className="text-xs font-bold text-gray-light tracking-widest uppercase mb-4">
        {(t_fn('finance.categoryBreakdown.title') as string) || 'Pengeluaran per Kategori'}
      </Heading>
      <div className="space-y-4">
        {breakdown.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-soft-cream font-medium truncate w-[100px] sm:w-[150px]">{item.name}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-gray-light text-[10px] sm:text-xs">
                  {formatCurrency(item.amount, currency, locale)}
                </span>
                <span className="text-primary font-bold w-6 sm:w-8 text-right">{item.pct}%</span>
              </div>
            </div>
            <div className="h-1.5 sm:h-1 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-500"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
