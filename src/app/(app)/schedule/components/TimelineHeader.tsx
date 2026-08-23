'use client';

import React from 'react';
import { Button } from '@/components';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Plus } from '@phosphor-icons/react';
import { Heading, Paragraph } from '@/components/ui/typography';

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

  return (
    <div className="flex items-start justify-between flex-wrap gap-4">
      <div className="space-y-1">
        <Heading as="h1" size="h1" className="text-heading-xl md:text-display-lg font-display font-extrabold tracking-tight text-soft-cream">
          {t('timeline_page.title')}
        </Heading>
        <Paragraph className="text-subtext flex items-center gap-2">
          {t('timeline_page.desc')}
        </Paragraph>
      </div>
      <div className="flex items-center gap-4">
        {activeTab === 'weekly-log' && hasWeeklyLogFeature && activitiesCount > 0 && (
          <div className="flex items-center gap-8 text-center">
            <div>
              <Paragraph className="text-2xl font-bold text-gradient-static">{activitiesCount}</Paragraph>
              <Paragraph className="text-[10px] text-gray-light uppercase tracking-widest">
                {t('timeline_page.logs_upper')}
              </Paragraph>
            </div>
            <div>
              <Paragraph className="text-2xl font-bold text-secondary">
                {totalHours > 0 ? `${totalHours}h` : `${remMinutes}m`}
              </Paragraph>
              <Paragraph className="text-[10px] text-gray-light uppercase tracking-widest">
                {t('timeline_page.logged_upper')}
              </Paragraph>
            </div>
          </div>
        )}
        {activeTab === 'daily-checklist' && hasDailyChecklistFeature && totalCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="text-center">
              <Paragraph className="text-2xl font-bold text-gradient-static">
                {completedCount}
                <span className="text-gray-light opacity-50 text-lg">/{totalCount}</span>
              </Paragraph>
              <Paragraph className="text-[10px] text-gray-light uppercase tracking-widest">
                {t('timeline_page.done_today')}
              </Paragraph>
            </div>
          </div>
        )}
        {activeTab === 'weekly-log' && hasWeeklyLogFeature && (
          <Button variant="primary" size="md" onClick={onOpenAddModal} leftIcon={<Plus size={18} />}>
            {t('timeline_page.log_activity_btn')}
          </Button>
        )}
      </div>
    </div>
  );
}
