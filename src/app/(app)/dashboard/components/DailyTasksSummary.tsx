'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Loading } from '@/components';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { ListChecks, ArrowRight } from '@phosphor-icons/react';

const MAX_PREVIEW = 5;

export const DailyTasksSummary = () => {
  const { t } = useTranslation();
  const { tasks, isLoading, toggleTask } = useDailyTasks();

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed_today).length;
  const previewTasks = tasks.slice(0, MAX_PREVIEW);
  const hasMore = totalCount > MAX_PREVIEW;

  return (
    <Card className="p-md md:p-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] flex flex-col">
      <div className="flex items-center justify-between mb-md pb-xs border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-soft-cream">
            {t('dashboard.dailyTasks.title')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <Badge variant={completedCount === totalCount ? 'success' : 'default'} size="sm">
              {completedCount} / {totalCount}
            </Badge>
          )}
          <Link
            href="/schedule"
            className="text-xs font-medium text-gray-light hover:text-primary transition-colors flex items-center gap-1 group/link ml-2"
          >
            <span>{t('dashboard.view_all')}</span>
            <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-6"><Loading /></div>
        ) : tasks.length === 0 ? (
          <p className="text-xs text-gray-light italic text-center py-6 opacity-60">
            {t('dashboard.dailyTasks.empty')}
          </p>
        ) : (
          <div className="space-y-1.5">
            {previewTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center gap-2.5 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer group" 
                onClick={() => toggleTask(task.id, !task.completed_today)}
              >
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  task.completed_today ? 'bg-primary border-primary' : 'border-gray-light/40 group-hover:border-primary'
                }`}>
                  {task.completed_today && <ListChecks size={10} className="text-white" />}
                </div>
                <span className={`text-xs truncate transition-opacity flex-1 ${
                  task.completed_today ? 'opacity-40 line-through text-gray-light' : 'text-soft-cream font-medium'
                }`}>
                  {task.title}
                </span>
              </div>
            ))}

            {hasMore && (
              <div className="pt-2 text-center">
                <Link
                  href="/schedule"
                  className="text-[11px] font-semibold text-gray-light hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {t('dashboard.view_all_tasks').replace('{count}', totalCount.toString())}
                  <ArrowRight size={11} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
