'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import { Heading, Paragraph } from '@/components/ui/typography';
import { Placeholder } from '@/components/ui/Placeholder';
import { ArrowRight } from '@phosphor-icons/react';
import { Reminder } from '@/types/database';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface UpNextCardProps {
  reminders: Reminder[];
  isLoading?: boolean;
}

const MAX_SHOWN = 4;

export const UpNextCard: React.FC<UpNextCardProps> = ({ reminders, isLoading }) => {
  const { t } = useTranslation();

  const upcoming = useMemo(() => {
    if (!reminders || reminders.length === 0) return [];

    return reminders
      .filter((r) => r.status !== 'completed' && r.status !== 'cancelled')
      .sort((a, b) => {
        const dateA = a.due_date || '9999-12-31';
        const dateB = b.due_date || '9999-12-31';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.due_time || '23:59').localeCompare(b.due_time || '23:59');
      })
      .slice(0, MAX_SHOWN);
  }, [reminders]);

  return (
    <Card className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-foreground/10 pb-2">
        <Heading as="h2" size="h6" className="uppercase tracking-widest">
          {t('dashboard.up_next')}
        </Heading>
        <Link
          href="/reminders"
          className="-mr-2 inline-flex min-h-11 items-center gap-1 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <span>{t('dashboard.view_schedule')}</span>
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Placeholder className="h-14 w-full" />
          <Placeholder className="h-14 w-full" />
        </div>
      ) : upcoming.length === 0 ? (
        <Paragraph className="py-4 text-center text-body-md text-muted-foreground">{t('dashboard.up_next_empty')}</Paragraph>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((reminder) => (
            <li
              key={reminder.id}
              className="flex min-w-0 items-center gap-3 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-3"
            >
              <span className="shrink-0 rounded bg-primary/15 px-2 py-1 font-mono text-xs font-bold text-primary">
                {reminder.due_time || t('dashboard.today')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-medium text-foreground" title={reminder.title}>
                  {reminder.title}
                </p>
                {reminder.description && (
                  <p className="truncate text-xs text-muted-foreground">{reminder.description}</p>
                )}
              </div>
              {reminder.priority === 'high' && (
                <span className="shrink-0 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
                  {t('dashboard.high_priority')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
