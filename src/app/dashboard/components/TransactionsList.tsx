import React from 'react';
import { Card, Button } from '@/components';
import { FiTrendingUp as TrendingUp, FiTrendingDown as TrendingDown } from 'react-icons/fi';
import { RiWallet3Line as Wallet } from 'react-icons/ri';
import { formatCurrency, formatDate } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Transaction } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  transactions: Transaction[];
}

export const TransactionsList = ({ transactions }: Props) => {
  const { currency, locale, timezone } = useUserPreferences();
  const { t } = useTranslation();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <div className="px-lg py-md border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
        <div className="flex items-center gap-sm">
          <Wallet size={16} className="text-secondary" />
          <h3 className="text-sm font-bold tracking-tight">{t('dashboard.cash_flow')}</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] h-auto py-xs px-sm">{t('dashboard.log_new')}</Button>
      </div>
      <div className="p-sm">
        {recentTransactions.map((t) => (
          <div key={t.id} className="group flex items-center gap-md p-md rounded-md hover:bg-white/[0.02] transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{(t as any).categories?.name || t.title}</p>
              <p className="text-[10px] text-gray-light uppercase tracking-wider mt-0.5">{formatDate(t.date, 'short', locale, timezone)}</p>
            </div>
            <p className={`text-sm font-bold ${t.type === 'income' ? 'text-success' : 'text-white'}`}>
              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency, locale)}
            </p>
          </div>
        ))}
        {recentTransactions.length === 0 && (
          <div className="py-2xl text-center text-gray-light text-xs italic">{t('dashboard.no_transactions')}</div>
        )}
      </div>
    </Card>
  );
};
