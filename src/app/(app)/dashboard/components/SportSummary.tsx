import React from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import { FaDumbbell as Dumbbell } from 'react-icons/fa6';
import { RiFireLine as Flame } from 'react-icons/ri';
import { WeeklySportSummary } from '@/hooks/useWeeklySportSummary';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  summary: WeeklySportSummary;
  isLoading?: boolean;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TODAY_IDX = (() => {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;   // Mon=0
})();

export const SportSummary = ({ summary, isLoading }: Props) => {
  const { t } = useTranslation();
  const { totalSessions, totalMinutes, dayActivity, streak } = summary;
  const maxMin = Math.max(...dayActivity, 1);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMin = totalMinutes % 60;

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
          <Dumbbell size={16} className="text-secondary" />
          <h3 className="text-sm font-bold tracking-tight">{t('dashboard.vitality_this_week')}</h3>
        </div>
        {streak >= 2 && (
          <div className="flex items-center gap-1 text-amber-400">
            <Flame size={14} />
            <span className="text-xs font-bold">{streak}d</span>
          </div>
        )}
      </div>

      <div className="p-lg space-y-lg">
        {totalSessions === 0 ? (
          <p className="text-xs text-gray-light italic text-center py-md">{t('dashboard.sport_empty_desc')}</p>
        ) : (
          <>
            {/* Stats */}
            <div className="flex items-center gap-xl">
              <div>
                <p className="text-2xl font-bold text-gradient">{totalSessions}</p>
                <p className="text-[10px] text-gray-light uppercase tracking-widest">{t('dashboard.sessions')}</p>
              </div>
              {totalMinutes > 0 && (
                <div>
                  <p className="text-2xl font-bold text-secondary">
                    {totalHours > 0 ? `${totalHours}h${remMin > 0 ? ` ${remMin}m` : ''}` : `${remMin}m`}
                  </p>
                  <p className="text-[10px] text-gray-light uppercase tracking-widest">{t('dashboard.moved')}</p>
                </div>
              )}
            </div>

            {/* Mini bar chart: Mon-Sun */}
            <div
              className="flex items-end gap-1"
              role="img"
              aria-label={`Sport activity this week: ${dayActivity.map((m, i) => `${DAY_LABELS[i]}: ${m}min`).join(', ')}`}
            >
              {dayActivity.map((mins, idx) => {
                const heightPct = Math.round((mins / maxMin) * 100);
                const isToday = idx === TODAY_IDX;
                const isActive = mins > 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className={`w-full rounded-sm transition-all ${
                        isActive
                          ? isToday
                            ? 'bg-primary'
                            : 'bg-secondary/70'
                          : 'bg-black/[0.05] dark:bg-white/[0.05]'
                      }`}
                      style={{ height: `${Math.max(heightPct * 0.32, 4)}px` }}
                      title={`${DAY_LABELS[idx]}: ${mins}min`}
                    />
                    <span className={`text-[8px] ${isToday ? 'text-primary font-bold' : 'text-gray-light opacity-50'}`}>
                      {DAY_LABELS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <Link
          href="/sport"
          className="block text-center text-[10px] font-bold uppercase tracking-widest text-gray-light hover:text-primary transition-colors"
          aria-label="Go to Sport page to log workouts"
        >
          {totalSessions === 0 ? t('dashboard.log_first_session') : t('dashboard.review_rhythm')}
        </Link>
      </div>
    </Card>
  );
};
