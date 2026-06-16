'use client';

import React from 'react';
import { useFinancialHealth } from '@/hooks/useFinancialHealth';
import { Card } from '@/components';
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCcw } from 'lucide-react';
import { formatCurrency } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const HEALTH_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  Excellent: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  Good:      { text: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/20' },
  Fair:      { text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  Poor:      { text: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
  Critical:  { text: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20' },
};

export function FinancialHealthWidget() {
  const { healthScore, subscriptions, spendingLeaks, isLoading } = useFinancialHealth();
  const { currency, locale } = useUserPreferences();

  if (isLoading || !healthScore) return null;

  const colors = HEALTH_COLOR[healthScore.label] ?? HEALTH_COLOR.Fair;
  const leaks = spendingLeaks.filter(l => l.isLeak).slice(0, 2);

  return (
    <Card className={`p-xl border ${colors.border} ${colors.bg}`}>
      <div className="flex items-start justify-between mb-lg">
        <div>
          <h3 className="text-sm font-bold text-white mb-0.5">💰 Financial Health</h3>
          <p className="text-[10px] text-gray-light uppercase tracking-widest">Bulan ini</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className={`text-3xl font-bold ${colors.text}`}>{healthScore.score}</span>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>{healthScore.label}</p>
            <p className="text-[10px] text-gray-light">/ 100</p>
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-black/10 rounded-full overflow-hidden mb-lg">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            healthScore.score >= 70 ? 'bg-emerald-400' :
            healthScore.score >= 50 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${healthScore.score}%` }}
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-md text-center mb-lg">
        <div>
          <p className="text-sm font-bold text-income">{formatCurrency(healthScore.totalIncome, currency, locale)}</p>
          <p className="text-[10px] text-gray-light">Pemasukan</p>
        </div>
        <div>
          <p className="text-sm font-bold text-expense">{formatCurrency(healthScore.totalExpense, currency, locale)}</p>
          <p className="text-[10px] text-gray-light">Pengeluaran</p>
        </div>
        <div>
          <p className={`text-sm font-bold ${healthScore.netFlow >= 0 ? 'text-income' : 'text-expense'}`}>
            {(healthScore.savingRate * 100).toFixed(0)}%
          </p>
          <p className="text-[10px] text-gray-light">Saving Rate</p>
        </div>
      </div>

      {/* Spending Leaks */}
      {leaks.length > 0 && (
        <div className="pt-md border-t border-black/[0.05] dark:border-white/[0.05] space-y-sm">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
            <AlertTriangle size={10} /> Kenaikan Pengeluaran
          </p>
          {leaks.map(leak => (
            <div key={leak.category} className="flex items-center justify-between">
              <span className="text-xs text-gray-light truncate">{leak.category}</span>
              <span className="text-xs text-amber-400 font-bold ml-2 flex-shrink-0">
                +{leak.changePercent}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Subscriptions */}
      {subscriptions.length > 0 && (
        <div className="pt-md border-t border-black/[0.05] dark:border-white/[0.05] space-y-sm">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
            <RefreshCcw size={10} /> Langganan Terdeteksi
          </p>
          {subscriptions.slice(0, 2).map(sub => (
            <div key={sub.title} className="flex items-center justify-between">
              <span className="text-xs text-gray-light truncate">{sub.title}</span>
              <span className="text-xs text-soft-cream font-bold ml-2 flex-shrink-0">
                {formatCurrency(sub.amount, currency, locale)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
