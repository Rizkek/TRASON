'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components';
import { formatCurrency } from '@/libs/format';
import type { Transaction, CategoryJoin } from '@/types/database';

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
  const breakdown = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    if (total === 0) return [];

    const map: Record<string, { name: string; amount: number }> = {};
    expenses.forEach((t) => {
      const cat = resolveCategory(t.categories);
      const key = cat?.id || 'uncategorized';
      const name = cat?.name || 'Lainnya';
      if (!map[key]) map[key] = { name, amount: 0 };
      map[key].amount += t.amount;
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
    <Card className="p-md md:p-lg">
      <h3 className="text-[10px] md:text-xs font-bold text-gray-light tracking-widest uppercase mb-md">
        Pengeluaran per Kategori
      </h3>
      <div className="space-y-md">
        {breakdown.map((item) => (
          <div key={item.name} className="space-y-xs">
            <div className="flex items-center justify-between text-xs gap-sm">
              <span className="text-soft-cream font-medium truncate">{item.name}</span>
              <div className="flex items-center gap-sm shrink-0">
                <span className="text-gray-light hidden sm:block">
                  {formatCurrency(item.amount, currency, locale)}
                </span>
                <span className="text-primary font-bold w-8 text-right">{item.pct}%</span>
              </div>
            </div>
            <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
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
