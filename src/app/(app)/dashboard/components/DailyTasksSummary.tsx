'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, InlineError } from '@/components';
import { Heading, Paragraph } from '@/components/ui/typography';
import { Placeholder } from '@/components/ui/Placeholder';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Check, ArrowRight } from '@phosphor-icons/react';

const MAX_PREVIEW = 5;

export const DailyTasksSummary = () => {
  const { t } = useTranslation();
  const { tasks, isLoading, error, mutate, toggleTask, pendingToggleIds } = useDailyTasks();

  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.completed_today).length;
  const previewTasks = tasks.slice(0, MAX_PREVIEW);
  const hasMore = totalCount > MAX_PREVIEW;

  return (
    <Card className="flex flex-col p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-foreground/10 pb-2">
        <div className="flex items-center gap-2">
          <Heading as="h2" size="h6" className="uppercase tracking-widest">
            {t('dashboard.dailyTasks.title')}
          </Heading>
          {totalCount > 0 && (
            <Badge variant={completedCount === totalCount ? 'success' : 'default'} size="sm">
              {completedCount} / {totalCount}
            </Badge>
          )}
        </div>
        <Link
          href="/schedule"
          className="-mr-2 inline-flex min-h-11 items-center gap-1 px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <span>{t('dashboard.view_all')}</span>
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      <div className="flex-1">
        {error ? (
          <InlineError message={t('dashboard.section_load_failed')} retryLabel={t('common.try_again')} onRetry={() => mutate()} />
        ) : isLoading ? (
          <div className="space-y-2">
            <Placeholder className="h-11 w-full" />
            <Placeholder className="h-11 w-full" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="space-y-3 py-4 text-center">
            <Paragraph className="text-body-md text-muted-foreground">{t('dashboard.dailyTasks.empty')}</Paragraph>
            <Link href="/schedule" className="inline-flex min-h-11 items-center text-body-md font-medium text-primary hover:underline">
              {t('dashboard.tasks_empty_cta')}
            </Link>
          </div>
        ) : (
          <ul className="space-y-1">
            {previewTasks.map((task) => {
              const toggling = pendingToggleIds.has(task.id);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={task.completed_today}
                    disabled={toggling}
                    onClick={() => toggleTask(task.id, !task.completed_today)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-foreground/5 disabled:cursor-wait disabled:opacity-60"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        task.completed_today ? 'border-primary bg-primary' : 'border-muted-foreground/60'
                      }`}
                    >
                      {task.completed_today && <Check size={12} weight="bold" className="text-on-primary" />}
                    </span>
                    <span
                      className={`flex-1 truncate text-body-md ${
                        task.completed_today ? 'text-muted-foreground line-through' : 'font-medium text-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>
                </li>
              );
            })}

            {hasMore && (
              <li className="pt-1 text-center">
                <Link
                  href="/schedule"
                  className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('dashboard.view_all_tasks').replace('{count}', totalCount.toString())}
                  <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </Card>
  );
};
