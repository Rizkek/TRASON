'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import { CreditCard, CaretRight as ChevronRight } from '@phosphor-icons/react';
import { formatCurrency } from '@/libs/format';
import type { Subscription } from '@/types/database';

interface Props {
  subscriptions: Subscription[];
  currency: string;
  locale: string;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function cycleLabel(cycle: string): string {
  if (cycle === 'monthly') return '/ bln';
  if (cycle === 'yearly') return '/ thn';
  if (cycle === 'weekly') return '/ mgg';
  return '';
}

export function UpcomingBills({ subscriptions, currency, locale }: Props) {
  const upcoming = subscriptions
    .filter((s) => s.is_active)
    .map((s) => ({ ...s, daysLeft: daysUntil(s.next_billing_date) }))
    .filter((s) => s.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <Card className="p-md md:p-lg">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-[10px] md:text-xs font-bold text-gray-light tracking-widest uppercase">
          Tagihan Mendatang
        </h3>
        <Link
          href="/finance/subscriptions"
          className="flex items-center gap-xs text-[10px] text-primary font-bold uppercase tracking-widest hover:underline"
        >
          Semua <ChevronRight size={10} />
        </Link>
      </div>
      <div className="space-y-xs">
        {upcoming.map((sub) => {
          const urgency =
            sub.daysLeft <= 3
              ? 'text-danger'
              : sub.daysLeft <= 7
              ? 'text-accent-gold'
              : 'text-gray-light';
          const daysText =
            sub.daysLeft === 0
              ? 'Hari ini'
              : sub.daysLeft === 1
              ? 'Besok'
              : `${sub.daysLeft} hari lagi`;

          return (
            <div
              key={sub.id}
              className="flex items-center justify-between gap-md py-sm border-b border-white/[0.04] last:border-0"
            >
              <div className="flex items-center gap-sm min-w-0">
                <div className="w-8 h-8 flex items-center justify-center bg-white/[0.04] rounded-lg shrink-0">
                  <CreditCard size={14} className="text-gray-light" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-soft-cream truncate">{sub.name}</p>
                  <p className={`text-[10px] ${urgency}`}>{daysText}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-soft-cream">
                  {formatCurrency(sub.amount, sub.currency || currency, locale)}
                </p>
                <p className="text-[9px] text-gray-light">{cycleLabel(sub.billing_cycle)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
