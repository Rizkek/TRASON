import React from 'react';
import { Card } from '@/components';
import type { PersonalRecord } from '@/types/database';
import { Trophy, Barbell as Dumbbell, Timer, Footprints } from '@phosphor-icons/react/dist/ssr';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface Props {
  records: PersonalRecord[];
}

const getSportIcon = (type: string) => {
  switch (type) {
    case 'lift': return <Dumbbell size={16} />;
    case 'run': return <Footprints size={16} />;
    case 'cycle': return <Timer size={16} />;
    default: return <Trophy size={16} />;
  }
};

export const PRBoard: React.FC<Props> = ({ records }) => {
  const { locale } = useUserPreferences();
  if (records.length === 0) {
    return (
      <Card className="p-8 bg-foreground/[0.02] border-foreground/[0.05] text-center">
        <Trophy size={32} className="mx-auto text-muted-foreground mb-4 opacity-50" />
        <h4 className="text-foreground font-semibold mb-1">No Personal Records Yet</h4>
        <p className="text-sm text-muted-foreground">Log your first workout to start tracking your bests.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {records.map((pr) => (
        <Card 
          key={pr.id} 
          className="p-6 bg-foreground/[0.03] border-foreground/[0.05] relative overflow-hidden group hover:border-primary/30 transition-colors"
        >
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              {getSportIcon(pr.sport_type)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {pr.sport_type}
              </p>
              <h4 className="text-sm font-semibold text-foreground leading-tight">
                {pr.exercise_name}
              </h4>
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <span className="text-heading-xl text-primary tracking-tight">
              {pr.metric_value}
            </span>
            <span className="text-sm text-muted-foreground mb-1 font-medium">
              {pr.metric_unit}
            </span>
          </div>
          
          <div className="mt-2 text-xs text-subtle flex items-center justify-between border-t border-foreground/[0.05] pt-2">
            <span>{pr.metric_type}</span>
            <span>{new Date(pr.record_date).toLocaleDateString(locale)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};
