import React from 'react';
import { Card, Button } from '@/components';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate } from '@/libs/format';
import { Transaction } from '@/services/supabaseClient';

interface Props {
  transactions: Transaction[];
}

export const TransactionsList = ({ transactions }: Props) => {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <div className="px-lg py-md border-b border-white border-opacity-[0.05] flex justify-between items-center bg-white bg-opacity-[0.01]">
        <div className="flex items-center gap-sm">
          <Wallet size={16} className="text-secondary" />
          <h3 className="text-sm font-bold tracking-tight">CASH FLOW</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] h-auto py-xs px-sm">LOG NEW</Button>
      </div>
      <div className="p-sm">
        {recentTransactions.map((t) => (
          <div key={t.id} className="group flex items-center gap-md p-md rounded-md hover:bg-white hover:bg-opacity-[0.02] transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {t.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{(t as any).categories?.name || t.title}</p>
              <p className="text-[10px] text-gray-light uppercase tracking-wider mt-0.5">{formatDate(t.date)}</p>
            </div>
            <p className={`text-sm font-bold ${t.type === 'income' ? 'text-success' : 'text-white'}`}>
              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
            </p>
          </div>
        ))}
        {recentTransactions.length === 0 && (
          <div className="py-2xl text-center text-gray-light text-xs italic">No transactions found.</div>
        )}
      </div>
    </Card>
  );
};
