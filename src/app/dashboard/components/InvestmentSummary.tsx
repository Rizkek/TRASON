import React from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components';
import { FiArrowRight as ArrowRight } from 'react-icons/fi';
import { RiBankLine as Landmark, RiCoinsLine as Coins, RiShieldLine as Shield } from 'react-icons/ri';
import {
  InvestmentPortfolioSummary,
  getAllocationLabel,
  formatSignedCurrency,
  formatSignedPercent,
} from '@/services/investmentService';
import { formatCurrency } from '@/libs/format';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  summary: InvestmentPortfolioSummary | null;
}

export const InvestmentSummary = ({ summary }: Props) => {
  const { currency, locale } = useUserPreferences();
  const { t } = useTranslation();

  if (!summary || summary.positionsCount === 0) {
    return (
      <Card className="p-xl border border-dashed border-black/10 dark:border-white/10 bg-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-lg">
          <div className="space-y-sm w-full sm:w-auto flex-1 min-w-0">
            <p className="text-micro text-gray-light">{t('dashboard.investment_analyst')}</p>
            <h3 className="text-xl font-bold text-soft-cream">{t('dashboard.start_with_one_position')}</h3>
            <p className="text-xs text-gray-light opacity-80 mt-2">
              {t('dashboard.investment_empty_desc')}
            </p>
          </div>
          <div className="shrink-0 mt-4 sm:mt-0">
            <Link href="/investments">
              <Button variant="primary" size="md">{t('dashboard.open_module')}</Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />
      <div className="relative z-10 space-y-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <p className="text-micro text-gray-light">{t('dashboard.investment_analyst')}</p>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(summary.totalValue, currency, locale)}</h3>
            <p className="text-xs text-gray-light mt-1">
              {summary.positionsCount} {t('dashboard.positions_connected')}
            </p>
          </div>
          <Link href="/investments">
            <Button variant="ghost" size="sm" className="border-black/10 dark:border-white/10">
              {t('dashboard.review_positions')}
              <ArrowRight size={14} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="p-lg rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <p className="text-[10px] text-gray-light uppercase tracking-widest mb-2">{t('dashboard.built_up_pl')}</p>
            <p className={`text-lg font-bold ${summary.totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatSignedCurrency(summary.totalProfitLoss, currency, locale)}
            </p>
            <p className="text-xs text-gray-light mt-1">{formatSignedPercent(summary.totalChangePercent)} {t('dashboard.from_cost_basis')}</p>
          </div>

          <div className="p-lg rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <p className="text-[10px] text-gray-light uppercase tracking-widest mb-2">{t('dashboard.today')}</p>
            <p className={`text-lg font-bold ${summary.dailyChangeValue >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatSignedCurrency(summary.dailyChangeValue, currency, locale)}
            </p>
            <p className="text-xs text-gray-light mt-1">{formatSignedPercent(summary.dailyChangePercent)} {t('dashboard.movement_today')}</p>
          </div>

          <div className="p-lg rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <p className="text-[10px] text-gray-light uppercase tracking-widest mb-2">{t('dashboard.allocation')}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info" size="sm"><Landmark size={12} className="mr-1" />{getAllocationLabel(summary, 'stock').toFixed(0)}% {t('dashboard.stocks')}</Badge>
              <Badge variant="activity" size="sm"><Coins size={12} className="mr-1" />{getAllocationLabel(summary, 'crypto').toFixed(0)}% {t('dashboard.crypto')}</Badge>
              <Badge variant="warning" size="sm"><Shield size={12} className="mr-1" />{getAllocationLabel(summary, 'gold').toFixed(0)}% {t('dashboard.gold')}</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
