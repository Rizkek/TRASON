'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import { ArrowRight, CalendarBlank, Clock, CheckCircle } from '@phosphor-icons/react';
import { Reminder } from '@/types/database';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface UpNextCardProps {
  reminders: Reminder[];
  isLoading?: boolean;
}

export const UpNextCard: React.FC<UpNextCardProps> = ({ reminders, isLoading }) => {
  const { t } = useTranslation();

  const activeReminders = useMemo(() => {
    if (!reminders || reminders.length === 0) return [];
    
    return reminders
      .filter((r) => r.status !== 'completed' && r.status !== 'cancelled')
      .sort((a, b) => {
        // Sort by due_date first, then due_time
        const dateA = a.due_date || '9999-12-31';
        const dateB = b.due_date || '9999-12-31';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        const timeA = a.due_time || '23:59';
        const timeB = b.due_time || '23:59';
        return timeA.localeCompare(timeB);
      })
      .slice(0, 4);
  }, [reminders]);

  return (
    <Card className="p-md md:p-lg bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] relative overflow-hidden group">
      <div className="flex items-center justify-between mb-md pb-xs border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-soft-cream">
            {t('dashboard.up_next')}
          </h2>
        </div>
        <Link
          href="/reminders"
          className="text-xs font-medium text-gray-light hover:text-primary transition-colors flex items-center gap-1 group/link"
        >
          <span>{t('dashboard.view_schedule')}</span>
          <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-2">
          <div className="h-9 w-full bg-white/[0.02] rounded-lg animate-pulse" />
          <div className="h-9 w-full bg-white/[0.02] rounded-lg animate-pulse" />
        </div>
      ) : activeReminders.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-light italic opacity-75">
            {t('dashboard.up_next_empty')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {activeReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] hover:border-primary/20 transition-all min-w-0"
            >
              <div className="flex items-center justify-center shrink-0 px-2 py-1 rounded bg-primary/10 text-primary font-mono text-[11px] font-bold tracking-tight">
                {reminder.due_time || 'Today'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-soft-cream truncate" title={reminder.title}>
                  {reminder.title}
                </p>
                {reminder.description && (
                  <p className="text-[10px] text-gray-light truncate opacity-70">
                    {reminder.description}
                  </p>
                )}
              </div>
              {reminder.priority === 'high' && (
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="High priority" />
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
