import React from 'react';
import Link from 'next/link';
import { Card, Badge } from '@/components';
import { RiBriefcaseLine as Briefcase, RiTimeLine as Clock } from 'react-icons/ri';
import { CareerStats } from '@/hooks/useCareer';
import { CareerApplication } from '@/types/database';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  stats: CareerStats;
  nextInterview: CareerApplication | null;
  isLoading?: boolean;
}

export const CareerSummary = ({ stats, nextInterview, isLoading }: Props) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <Card className="p-xl bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
        <div className="h-20 animate-pulse bg-black/5 dark:bg-white/5 rounded-md" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
      <div className="px-lg py-md border-b border-black/[0.05] dark:border-white/[0.05] flex justify-between items-center bg-black/[0.01] dark:bg-white/[0.01]">
        <div className="flex items-center gap-sm">
          <Briefcase size={16} className="text-warm-gold" />
          <h3 className="text-sm font-bold tracking-tight">{t('dashboard.career_pipeline')}</h3>
        </div>
        {stats.active > 0 && (
          <Badge variant="default" size="sm" aria-label={`${stats.active} active applications`}>
            {stats.active} {t('dashboard.active')}
          </Badge>
        )}
      </div>

      <div className="p-lg space-y-lg">
        {stats.total === 0 ? (
          <p className="text-xs text-gray-light italic text-center py-md">
            {t('dashboard.career_empty_desc')}
          </p>
        ) : (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-sm">
              {[
                { label: t('dashboard.applied'),   value: stats.applied,   color: 'text-primary' },
                { label: t('dashboard.interview'), value: stats.interview,  color: 'text-purple-400' },
                { label: t('dashboard.offer'),     value: stats.offer,     color: 'text-income' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-gray-light uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Next interview */}
            {nextInterview && (
              <div
                className="flex items-start gap-sm p-md rounded-md bg-purple-500/10 border border-purple-500/20"
                role="status"
                aria-label={`Next interview: ${nextInterview.company_name} on ${new Date(nextInterview.interview_date!).toLocaleDateString()}`}
              >
                <Clock size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{t('dashboard.next_conversation')}</p>
                  <p className="text-sm font-semibold text-soft-cream truncate">{nextInterview.company_name}</p>
                  <p className="text-[10px] text-gray-light">
                    {new Date(nextInterview.interview_date!).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <Link
          href="/career"
          className="block text-center text-[10px] font-bold uppercase tracking-widest text-gray-light hover:text-warm-gold transition-colors"
          aria-label="Go to Career Tracker"
        >
          {stats.total === 0 ? t('dashboard.add_first_move') : t('dashboard.review_pipeline')}
        </Link>
      </div>
    </Card>
  );
};
