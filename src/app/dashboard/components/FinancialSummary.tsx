import React from 'react';
import { Card } from '@/components';
import { FiTrendingUp as TrendingUp, FiTrendingDown as TrendingDown } from 'react-icons/fi';
import { RiWallet3Line as Wallet } from 'react-icons/ri';
import { formatCurrency } from '@/libs/format';
import { Transaction } from '@/services/supabaseClient';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  transactions: Transaction[];
}

export const FinancialSummary = ({ transactions }: Props) => {
  const { currency, locale } = useUserPreferences();
  const { t } = useTranslation();
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
          <p className="text-micro text-gray-light">{t('dashboard.income')}</p>
          <TrendingUp size={16} className="text-success" />
        </div>
        <p className="text-3xl font-bold text-white group-hover:text-success transition-colors">
          {formatCurrency(totalIncome, currency, locale)}
        </p>
      </Card>

      <Card className="p-xl border-l-[4px] border-l-danger group hover:border-l-primary transition-all">
        <div className="flex justify-between items-start mb-md">
          <p className="text-micro text-gray-light">{t('dashboard.expenses')}</p>
          <TrendingDown size={16} className="text-danger" />
        </div>
        <p className="text-3xl font-bold text-white group-hover:text-danger transition-colors">
          {formatCurrency(totalExpenses, currency, locale)}
        </p>
      </Card>

      <Card className="p-xl border-l-[4px] border-l-secondary group hover:border-l-primary transition-all">
        <div className="flex justify-between items-start mb-md">
          <p className="text-micro text-gray-light">{t('dashboard.balance')}</p>
          <Wallet size={16} className="text-secondary" />
        </div>
        <p className={`text-3xl font-bold text-white ${balance >= 0 ? 'group-hover:text-success' : 'group-hover:text-danger'} transition-colors`}>
          {formatCurrency(balance, currency, locale)}
        </p>
      </Card>
    </div>
  );
};
