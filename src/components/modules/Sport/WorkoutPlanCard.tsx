import { useTranslation } from '@/libs/i18n/useTranslation';
import React from 'react';
import { Card, Badge, Button } from '@/components';
import type { WorkoutPlan } from '@/types/database';
import { Calendar, Play, CheckCircle, CaretRight, Heartbeat as Activity } from '@phosphor-icons/react/dist/ssr';

interface Props {
  plan: WorkoutPlan;
  onSelect?: (plan: WorkoutPlan) => void;
  onActivate?: (plan: WorkoutPlan) => void;
}

export const WorkoutPlanCard: React.FC<Props> = ({ plan, onSelect, onActivate }) => {
  const { t } = useTranslation();
  const daysCount = plan.days?.length || 0;

  return (
    <Card
      className={`relative overflow-hidden ${
        plan.is_active
          ? 'border-primary/50 bg-primary/10'
          : 'border-foreground/[0.05] bg-foreground/[0.02]'
      }`}
    >
      <div className="p-5 md:p-8 space-y-6 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-heading-md tracking-tight ${plan.is_active ? 'text-primary' : 'text-foreground'}`}>
                {plan.name}
              </h3>
              {plan.is_active && (
                <Badge variant="info" className="text-xs px-2 py-0.5">{t('sport_forms.active_plan')}</Badge>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-foreground/5 ">
            <Activity size={20} className={plan.is_active ? 'text-primary' : 'text-muted-foreground'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-foreground/5 rounded-md p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar size={14} />
              <span className="text-xs font-medium">{t('sport_forms.duration_label')}</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{t('sport_forms.weeks_value').replace('{n}', String(plan.duration_weeks))}</p>
          </div>
          <div className="bg-foreground/5 rounded-md p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle size={14} />
              <span className="text-xs font-medium">{t('sport_forms.training_days')}</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{t('sport_forms.days_value').replace('{n}', String(daysCount))}</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-foreground/[0.05]">
          <div className="flex items-center gap-2">
            {!plan.is_active && onActivate && (
              <Button variant="outline" size="sm" onClick={() => onActivate(plan)} leftIcon={<Play size={12} />}>
                {t('sport_forms.activate')}
              </Button>
            )}
          </div>
          {onSelect && (
            <Button variant="ghost" size="sm" onClick={() => onSelect(plan)} rightIcon={<CaretRight size={14} />}>
              {t('plan_ui.details')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
