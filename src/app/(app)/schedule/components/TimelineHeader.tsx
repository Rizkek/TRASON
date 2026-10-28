'use client';

import React from 'react';
import { Button } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Plus } from '@phosphor-icons/react';
import { AppPageHeader } from '@/components/layout/AppPageHeader';

interface TimelineHeaderProps {
  activeTab: 'weekly-log' | 'daily-checklist';
  hasWeeklyLogFeature: boolean;
  hasDailyChecklistFeature: boolean;
  activitiesCount: number;
  totalHours: number;
  remMinutes: number;
  completedCount: number;
  totalCount: number;
  onOpenAddModal: () => void;
}

export function TimelineHeader({
  activeTab,
  hasWeeklyLogFeature,
  hasDailyChecklistFeature,
  activitiesCount,
  totalHours,
  remMinutes,
  completedCount,
  totalCount,
  onOpenAddModal,
}: TimelineHeaderProps) {
  const { t } = useTranslation();

  const showWeekly = activeTab === 'weekly-log' && hasWeeklyLogFeature;
  const showDaily = activeTab === 'daily-checklist' && hasDailyChecklistFeature && totalCount > 0;
  const stats = showWeekly && activitiesCount > 0
    ? [
        { label: t('timeline_page.logs_upper'), value: String(activitiesCount) },
        { label: t('timeline_page.logged_upper'), value: totalHours > 0 ? `${totalHours}h` : `${remMinutes}m` },
      ]
    : showDaily
      ? [{ label: t('timeline_page.done_today'), value: `${completedCount}/${totalCount}` }]
      : [];

  return (
    <AppPageHeader
      title={t('timeline_page.title')}
      description={t('timeline_page.desc')}
      actions={
        showWeekly && (
          <Button variant="primary" size="sm" onClick={onOpenAddModal} leftIcon={<Plus size={16} />}>
            {t('timeline_page.log_activity_btn')}
          </Button>
        )
      }
    >
      {stats.length > 0 && (
        <dl className="flex items-baseline gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-row-reverse items-baseline gap-1.5">
              <dt className="text-label-sm text-muted-foreground">{stat.label}</dt>
              <dd className="font-mono text-title-md text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </AppPageHeader>
  );
}
