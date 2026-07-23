'use client';

import React from 'react';
import { Card } from '@/components';
import { Coins, Receipt, Landmark, Wallet } from 'lucide-react';
import { formatCurrency } from '@/libs/format';

interface Props {
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
  carryForwardBalance: number;
  currency: string;
  locale: string;
  isLoading?: boolean;
}

export function FinancialSummaryCards({
  totalIncome,
  totalExpense,
  closingBalance,
  carryForwardBalance,
  currency,
  locale,
  isLoading,
}: Props) {
  const netSavings = totalIncome - totalExpense;

  const cards = [
    {
      label: 'Pemasukan',
      value: totalIncome,
      Icon: Coins,
      valueColor: 'text-success',
      iconClass: 'bg-success/10 text-success',
      border: '',
    },
    {
      label: 'Pengeluaran',
      value: totalExpense,
      Icon: Receipt,
      valueColor: 'text-danger',
      iconClass: 'bg-danger/10 text-danger',
      border: '',
    },
    {
      label: 'Tabungan',
      value: netSavings,
      Icon: Landmark,
      valueColor: netSavings >= 0 ? 'text-primary' : 'text-danger',
      iconClass: netSavings >= 0 ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger',
      border: 'border-b-2 border-primary/20',
    },
    {
      label: 'Dompet',
      value: closingBalance,
      Icon: Wallet,
      valueColor: closingBalance >= 0 ? 'text-accent-gold' : 'text-danger',
      iconClass: closingBalance >= 0 ? 'bg-accent-gold/10 text-accent-gold' : 'bg-danger/10 text-danger',
      border: 'border-b-2 border-accent-gold/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-sm">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-sm md:p-lg animate-pulse">
            <div className="h-3 w-16 bg-white/10 rounded mb-2" />
            <div className="h-5 w-24 bg-white/10 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-sm">
      {cards.map(({ label, value, Icon, valueColor, iconClass, border }) => (
        <Card key={label} className={`p-sm md:p-lg ${border}`}>
          <div className="flex items-center gap-xs mb-1">
            <span className={`p-1 rounded-md shrink-0 ${iconClass}`}>
              <Icon size={12} />
            </span>
            <p className="text-[9px] md:text-[11px] tracking-widest uppercase font-semibold text-gray-light truncate">
              {label}
            </p>
          </div>
          <p className={`text-sm md:text-xl font-bold truncate ${valueColor}`}>
            {formatCurrency(value, currency, locale)}
          </p>
        </Card>
      ))}
    </div>
  );
}
