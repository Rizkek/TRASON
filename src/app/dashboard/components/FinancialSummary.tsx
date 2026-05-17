import React from 'react';
import { Card } from '@/components';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '@/libs/format';
import { Transaction } from '@/services/supabaseClient';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface Props {
  transactions: Transaction[];
}

export const FinancialSummary = ({ transactions }: Props) => {
  const { currency, locale } = useUserPreferences();
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
      <Card className="p-xl border-l-[4px] border-l-success group hover:border-l-primary transition-all">
        <div className="flex justify-between items-start mb-md">
          <p className="text-micro text-gray-light">INCOME</p>
          <TrendingUp size={16} className="text-success" />
        </div>
        <p className="text-3xl font-bold text-white group-hover:text-success transition-colors">
          {formatCurrency(totalIncome, currency, locale)}
        </p>
      </Card>

      <Card className="p-xl border-l-[4px] border-l-danger group hover:border-l-primary transition-all">
        <div className="flex justify-between items-start mb-md">
          <p className="text-micro text-gray-light">EXPENSES</p>
          <TrendingDown size={16} className="text-danger" />
        </div>
        <p className="text-3xl font-bold text-white group-hover:text-danger transition-colors">
          {formatCurrency(totalExpenses, currency, locale)}
        </p>
      </Card>

      <Card className="p-xl border-l-[4px] border-l-secondary group hover:border-l-primary transition-all">
        <div className="flex justify-between items-start mb-md">
          <p className="text-micro text-gray-light">BALANCE</p>
          <Wallet size={16} className="text-secondary" />
        </div>
        <p className={`text-3xl font-bold text-white ${balance >= 0 ? 'group-hover:text-success' : 'group-hover:text-danger'} transition-colors`}>
          {formatCurrency(balance, currency, locale)}
        </p>
      </Card>
    </div>
  );
};
