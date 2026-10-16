'use client';

import React from 'react';
import Link from 'next/link';
import { Heading } from '@/components/ui/typography';
import { Placeholder } from '@/components/ui/Placeholder';
import { ArrowRight, Wallet, Barbell, Briefcase, Flame, Clock } from '@phosphor-icons/react';
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

const TILE =
  'group block rounded-xl border border-foreground/10 bg-foreground/[0.03] p-4 transition-colors hover:border-primary/40 hover:bg-foreground/[0.05]';

interface TileHeaderProps {
  icon: React.ElementType;
  label: string;
}

const TileHeader = ({ icon: Icon, label }: TileHeaderProps) => (
  <div className="mb-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="rounded-lg bg-primary/15 p-1.5 text-primary">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="text-label-sm uppercase text-muted-foreground">{label}</span>
    </div>
    <ArrowRight size={14} aria-hidden="true" className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
  </div>
);

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

  const gridCols =
    enabledCount === 1 ? 'grid-cols-1' : enabledCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';

  const budgetRatio = globalBudget && globalBudget.amount > 0 ? totalExpense / globalBudget.amount : 0;
  const budgetTone = budgetRatio > 0.9 ? 'bg-danger' : budgetRatio > 0.75 ? 'bg-warning' : 'bg-success';

  return (
    <section aria-labelledby="current-state-heading" className="space-y-3">
      <Heading as="h2" size="h6" id="current-state-heading" className="px-1 uppercase tracking-widest text-muted-foreground">
        {t('dashboard.current_state')}
      </Heading>

      <div className={`grid ${gridCols} gap-3`}>
        {isFinanceEnabled && (
          <Link href="/finance" className={TILE}>
            <TileHeader icon={Wallet} label={t('nav.finance')} />

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="text-label-sm uppercase text-muted-foreground">{t('dashboard.income')}</div>
                <div className="truncate font-mono text-body-md font-semibold text-success">
                  {formatCurrency(totalIncome, currency, locale)}
                </div>
              </div>
              <div className="min-w-0 text-right">
                <div className="text-label-sm uppercase text-muted-foreground">{t('dashboard.expenses')}</div>
                <div className="truncate font-mono text-body-md font-semibold text-danger">
                  {formatCurrency(totalExpense, currency, locale)}
                </div>
              </div>
            </div>

            {globalBudget && (
              <div className="mt-3 space-y-2 border-t border-foreground/10 pt-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {Math.round(budgetRatio * 100)}% {t('dashboard.budget_used')}
                  </span>
                  <span className="shrink-0 font-mono">
                    {t('dashboard.max_budget').replace('{amount}', formatCurrency(globalBudget.amount, currency, locale))}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div className={`h-full rounded-full ${budgetTone}`} style={{ width: `${Math.min(budgetRatio * 100, 100)}%` }} />
                </div>
              </div>
            )}
          </Link>
        )}

        {isSportEnabled && (
          <Link href="/sport" className={TILE}>
            <TileHeader icon={Barbell} label={t('nav.sport')} />

            {sportLoading ? (
              <Placeholder className="h-12 w-full" />
            ) : sportSummary.totalSessions === 0 ? (
              <p className="text-body-md text-muted-foreground">{t('dashboard.sport_empty')}</p>
            ) : (
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-title-lg text-foreground">
                    {sportSummary.totalSessions} {t('dashboard.sessions')}
                  </span>
                  {sportSummary.streak >= 2 && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      <Flame size={12} aria-hidden="true" />
                      {sportSummary.streak}d
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {sportSummary.totalMinutes > 0
                    ? `${Math.floor(sportSummary.totalMinutes / 60)}h ${sportSummary.totalMinutes % 60}m ${t('dashboard.moved')}`
                    : t('dashboard.on_track')}
                </div>
              </div>
            )}
          </Link>
        )}

        {isCareerEnabled && (
          <Link href="/career" className={TILE}>
            <TileHeader icon={Briefcase} label={t('nav.career')} />

            {careerLoading ? (
              <Placeholder className="h-12 w-full" />
            ) : careerStats.total === 0 ? (
              <p className="text-body-md text-muted-foreground">{t('dashboard.career_empty')}</p>
            ) : (
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-title-lg text-foreground">
                    {careerStats.active} {t('dashboard.active_now')}
                  </span>
                  {careerStats.interview > 0 && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {careerStats.interview} {t('dashboard.interview')}
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {nextInterview ? (
                    <span className="flex items-center gap-1 text-primary">
                      <Clock size={12} aria-hidden="true" className="shrink-0" />
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
    </section>
  );
};
