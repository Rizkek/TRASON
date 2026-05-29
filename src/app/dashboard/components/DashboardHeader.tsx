import React from 'react';
import { Card } from '@/components';
import { FiTrendingUp as TrendingUp } from 'react-icons/fi';
import { formatCurrency } from '@/libs/format';
import { User, Transaction, Activity } from '@/types/database';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  user: User | null;
  activities: Activity[];
  transactions: Transaction[];
}

export const DashboardHeader = ({ user, activities, transactions }: Props) => {
  const { currency, locale } = useUserPreferences();
  const { t } = useTranslation();

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <Card className="relative overflow-hidden border-none glass p-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-[0.05] blur-3xl rounded-full" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-xl">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center glow-primary flex-shrink-0">
          <TrendingUp size={32} className="text-white" />
        </div>
        <div className="space-y-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-md mb-sm">
            <h2 className="text-xl font-bold text-gradient">
              {t('dashboard.welcome_back')}, {user?.first_name || t('dashboard.builder')}
            </h2>
            {user?.bio && (
              <span className="hidden md:inline text-xs bg-primary/10 text-primary px-md py-xs rounded-full border border-primary/20 italic">
                "{user.bio}"
              </span>
            )}
          </div>
          <p className="text-lg leading-relaxed text-soft-cream font-serif italic opacity-90">
            "{t('dashboard.narrative_today')} <span className="text-primary font-bold">{activities.length} {t('dashboard.narrative_logged_moments')}</span> {t('dashboard.narrative_and')} 
            <span className="text-secondary font-bold"> {formatCurrency(totalExpenses, currency, locale)}</span> {t('dashboard.narrative_in_outflow')} 
            {totalIncome > 0 ? ` ${t('dashboard.narrative_income_msg').replace('{income}', formatCurrency(totalIncome, currency, locale))}` : ` ${t('dashboard.narrative_default_msg')}`}"
          </p>
          {user?.bio && (
            <p className="md:hidden text-xs text-gray-light italic mt-md opacity-70">
              "{user.bio}"
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
