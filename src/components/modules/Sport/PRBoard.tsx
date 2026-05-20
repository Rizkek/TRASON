import React from 'react';
import { Card } from '@/components';
import type { PersonalRecord } from '@/types/database';
import { Trophy, Dumbbell, Timer, Footprints } from 'lucide-react';

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
  if (records.length === 0) {
    return (
      <Card className="p-xl bg-white/[0.02] border-white/[0.05] text-center">
        <Trophy size={32} className="mx-auto text-gray-light mb-md opacity-50" />
        <h4 className="text-white font-bold mb-1">No Personal Records Yet</h4>
        <p className="text-sm text-gray-light">Log your first workout to start tracking your bests.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
      {records.map((pr) => (
        <Card 
          key={pr.id} 
          className="p-lg bg-gradient-to-br from-white/[0.05] to-transparent border-white/[0.05] relative overflow-hidden group hover:border-accent-gold/30 transition-colors"
        >
          {/* Subtle gold glow for PRs */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-accent-gold opacity-10 blur-2xl rounded-full pointer-events-none group-hover:opacity-20 transition-opacity" />
          
          <div className="flex items-center gap-3 mb-md">
            <div className="w-8 h-8 rounded-full bg-accent-gold/10 text-accent-gold flex items-center justify-center">
              {getSportIcon(pr.sport_type)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-light font-bold">
                {pr.sport_type}
              </p>
              <h4 className="text-sm font-bold text-white leading-tight">
                {pr.exercise_name}
              </h4>
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <span className="text-3xl font-serif font-bold text-accent-gold tracking-tight">
              {pr.metric_value}
            </span>
            <span className="text-sm text-gray-light mb-1 font-medium">
              {pr.metric_unit}
            </span>
          </div>
          
          <div className="mt-sm text-[10px] text-gray-very-light flex items-center justify-between border-t border-white/[0.05] pt-sm">
            <span>{pr.metric_type}</span>
            <span>{new Date(pr.record_date).toLocaleDateString()}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};
