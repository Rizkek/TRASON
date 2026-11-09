'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import { Heading, Paragraph } from '@/components/ui/typography';
import { Placeholder } from '@/components/ui/Placeholder';
import { ArrowRight } from '@phosphor-icons/react';
import { Reminder } from '@/types/database';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNow } from '@/hooks/useNow';
import { formatReminderDue } from '@/libs/format';
import { getReminderDueAt, isReminderActive } from '@/libs/notificationLogic';

interface UpNextCardProps {
  reminders: Reminder[];
  isLoading?: boolean;
}

const MAX_SHOWN = 4;

const dueTimestamp = (reminder: Reminder) => getReminderDueAt(reminder)?.getTime() ?? Infinity;

export const UpNextCard: React.FC<UpNextCardProps> = ({ reminders, isLoading }) => {
  const { t } = useTranslation();
  const { locale, timezone } = useUserPreferences();
  const now = useNow();

  const upcoming = useMemo(
    () =>
      (reminders ?? [])
        .filter((r) => isReminderActive(now, r))
        .sort((a, b) => dueTimestamp(a) - dueTimestamp(b))
        .slice(0, MAX_SHOWN),
    [reminders, now]
  );

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between border-b border-foreground/10 pb-2">
        <Heading as="h2" size="h6">
          {t('dashboard.up_next')}
        </Heading>
        <Link
          href="/reminders"
          className="-mr-2 inline-flex min-h-11 items-center gap-1 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <span>{t('dashboard.view_all')}</span>
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Placeholder className="h-14 w-full" />
          <Placeholder className="h-14 w-full" />
        </div>
      ) : upcoming.length === 0 ? (
        <Paragraph className="py-4 text-center text-body-md text-muted-foreground">{t('dashboard.up_next_empty')}</Paragraph>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {upcoming.map((reminder) => {
            const dueLabel = formatReminderDue(reminder, locale, timezone, now);
            return (
              <li
                key={reminder.id}
                className="flex min-w-0 flex-col gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {dueLabel && (
                    <span className="rounded bg-primary/15 px-2 py-1 font-mono text-xs font-bold text-primary">
                      {dueLabel}
                    </span>
                  )}
                  {reminder.priority === 'high' && (
                    <span className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
                      {t('dashboard.high_priority')}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-body-md font-medium text-foreground" title={reminder.title}>
                    {reminder.title}
                  </p>
                  {reminder.description && (
                    <p className="truncate text-xs text-muted-foreground">{reminder.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
