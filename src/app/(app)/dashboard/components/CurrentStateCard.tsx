'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import { 
  ArrowRight, 
  Wallet, 
  Barbell, 
  Briefcase, 
  Flame, 
  Clock 
} from '@phosphor-icons/react';
import { formatCurrency } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { WeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { CareerStats } from '@/hooks/useCareer';
import { CareerApplication, Budget } from '@/types/database';

interface CurrentStateCardProps {
  totalIncome: number;
  totalExpense: number;
  globalBudget: Budget | null;
  sportSummary: WeeklySportSummary;
  careerStats: CareerStats;
  nextInterview: CareerApplication | null;
  isFinanceEnabled: boolean;
  isSportEnabled: boolean;
  isCareerEnabled: boolean;
  sportLoading?: boolean;
  careerLoading?: boolean;
}

export const CurrentStateCard: React.FC<CurrentStateCardProps> = ({
  totalIncome,
  totalExpense,
  globalBudget,
  sportSummary,
  careerStats,
  nextInterview,
  isFinanceEnabled,
  isSportEnabled,
  isCareerEnabled,
  sportLoading,
  careerLoading,
}) => {
  const { currency, locale } = useUserPreferences();
  const { t } = useTranslation();

  const enabledCount = [isFinanceEnabled, isSportEnabled, isCareerEnabled].filter(Boolean).length;
  if (enabledCount === 0) return null;

  const gridColsClass = 
    enabledCount === 1 ? 'grid-cols-1' :
    enabledCount === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    'grid-cols-1 md:grid-cols-3';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-light">
          {t('dashboard.current_state')}
        </h2>
      </div>

      <div className={`grid ${gridColsClass} gap-3`}>
        {/* Finance Pillar */}
        {isFinanceEnabled && (
          <Link
            href="/finance"
            className="group block rounded-xl p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] hover:border-primary/30 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                  <Wallet size={16} />
                </div>
                <span className="text-xs font-bold tracking-tight text-gray-light uppercase">
                  {t('nav.finance')}
                </span>
              </div>
              <ArrowRight size={14} className="text-gray-light opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-gray-light uppercase tracking-wider">{t('dashboard.income')}</div>
                  <div className="text-sm md:text-md font-bold font-mono text-emerald-400">
                    {formatCurrency(totalIncome, currency, locale)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-light uppercase tracking-wider">{t('dashboard.expenses')}</div>
                  <div className="text-sm md:text-md font-bold font-mono text-rose-400">
                    {formatCurrency(totalExpense, currency, locale)}
                  </div>
                </div>
              </div>

              {globalBudget && (
                <div className="flex items-center justify-between text-[11px] text-gray-light pt-1 border-t border-white/5">
                  <span className="truncate">
                    {Math.round((totalExpense / globalBudget.amount) * 100)}% {t('dashboard.budget_used')}
                  </span>
                  <span className="text-[10px] opacity-70 font-mono">
                    max {formatCurrency(globalBudget.amount, currency, locale)}
                  </span>
                </div>
              )}
            </div>

            {globalBudget && (
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    (totalExpense / globalBudget.amount) > 0.9 ? 'bg-rose-500' : 
                    (totalExpense / globalBudget.amount) > 0.75 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min((totalExpense / globalBudget.amount) * 100, 100)}%` }}
                />
              </div>
            )}
          </Link>
        )}

        {/* Vitality Pillar */}
        {isSportEnabled && (
          <Link
            href="/sport"
            className="group block rounded-xl p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] hover:border-primary/30 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Barbell size={16} />
                </div>
                <span className="text-xs font-bold tracking-tight text-gray-light uppercase">
                  {t('nav.sport')}
                </span>
              </div>
              <ArrowRight size={14} className="text-gray-light opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>

            {sportLoading ? (
              <div className="h-10 bg-white/[0.02] rounded animate-pulse" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg md:text-xl font-bold text-soft-cream">
                    {sportSummary.totalSessions} {t('dashboard.sessions')}
                  </span>
                  {sportSummary.streak >= 2 && (
                    <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                      <Flame size={12} />
                      {sportSummary.streak}d
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-light truncate">
                  {sportSummary.totalMinutes > 0 ? (
                    `${Math.floor(sportSummary.totalMinutes / 60)}h ${sportSummary.totalMinutes % 60}m ${t('dashboard.moved')}`
                  ) : (
                    t('dashboard.on_track')
                  )}
                </div>
              </div>
            )}
          </Link>
        )}

        {/* Career Pillar */}
        {isCareerEnabled && (
          <Link
            href="/career"
            className="group block rounded-xl p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] hover:border-primary/30 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Briefcase size={16} />
                </div>
                <span className="text-xs font-bold tracking-tight text-gray-light uppercase">
                  {t('nav.career')}
                </span>
              </div>
              <ArrowRight size={14} className="text-gray-light opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>

            {careerLoading ? (
              <div className="h-10 bg-white/[0.02] rounded animate-pulse" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg md:text-xl font-bold text-soft-cream">
                    {careerStats.active} {t('dashboard.active_now')}
                  </span>
                  {careerStats.interview > 0 && (
                    <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded-full">
                      {careerStats.interview} {t('dashboard.interview')}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-light truncate">
                  {nextInterview ? (
                    <span className="flex items-center gap-1 text-purple-300">
                      <Clock size={11} className="shrink-0" />
                      <span className="truncate">{nextInterview.company_name}</span>
                    </span>
                  ) : (
                    `${careerStats.applied} ${t('dashboard.applied')}`
                  )}
                </div>
              </div>
            )}
          </Link>
        )}
      </div>
    </div>
  );
};
