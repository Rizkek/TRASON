import React from 'react';
import { Card, Badge, Button } from '@/components';
import { RiTimeLine as Clock } from 'react-icons/ri';
import { Activity } from '@/services/supabaseClient';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Props {
  activities: Activity[];
}

export const ActivitiesList = ({ activities }: Props) => {
  const { t } = useTranslation();
  const recentActivities = activities.slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <div className="px-lg py-md border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
        <div className="flex items-center gap-sm">
          <Clock size={16} className="text-primary" />
          <h3 className="text-sm font-bold tracking-tight">{t('dashboard.recent_moments')}</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] h-auto py-xs px-sm">{t('dashboard.open_timeline')}</Button>
      </div>
      <div className="p-sm">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <div key={activity.id} className="group flex items-center gap-md p-md rounded-md hover:bg-white/[0.02] transition-colors">
              <div className="w-1 h-8 bg-primary/20 rounded-full group-hover:bg-primary transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{activity.title}</p>
                <p className="text-[10px] text-gray-light uppercase tracking-wider mt-0.5">{activity.category || 'Lifestyle'}</p>
              </div>
              <Badge variant="activity" size="sm">{t('dashboard.done')}</Badge>
            </div>
          ))
        ) : (
          <div className="py-2xl text-center text-gray-light text-xs italic">{t('dashboard.timeline_quiet')}</div>
        )}
      </div>
    </Card>
  );
};
