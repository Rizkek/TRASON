import React from 'react';
import { Card, Badge, Button } from '@/components';
import type { WorkoutPlan } from '@/types/database';
import { Calendar, Play, CheckCircle, CaretRight as ChevronRight, Heartbeat as Activity } from '@phosphor-icons/react/dist/ssr';

interface Props {
  plan: WorkoutPlan;
  onSelect?: (plan: WorkoutPlan) => void;
  onActivate?: (plan: WorkoutPlan) => void;
}

export const WorkoutPlanCard: React.FC<Props> = ({ plan, onSelect, onActivate }) => {
  const daysCount = plan.days?.length || 0;
  
  return (
    <Card 
      className={`relative overflow-hidden group cursor-pointer transition-all duration-300 ${
        plan.is_active 
          ? 'border-primary/50 bg-primary/10' 
          : 'border-foreground/[0.05] hover:border-foreground/[0.15] bg-foreground/[0.02]'
      }`}
      onClick={() => onSelect?.(plan)}
    >
      <div className="p-8 space-y-6 relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-heading-md tracking-tight ${plan.is_active ? 'text-primary' : 'text-foreground'}`}>
                {plan.name}
              </h3>
              {plan.is_active && (
                <Badge variant="info" className="text-xs uppercase tracking-widest px-2 py-0.5">
                  Active Plan
                </Badge>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
            <Activity size={20} className={plan.is_active ? 'text-primary' : 'text-muted-foreground'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-foreground/5 rounded-md p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar size={14} />
              <span className="text-xs uppercase tracking-widest font-medium">Duration</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{plan.duration_weeks} Weeks</p>
          </div>
          <div className="bg-foreground/5 rounded-md p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle size={14} />
              <span className="text-xs uppercase tracking-widest font-medium">Training Days</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{daysCount} Days/Week</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-foreground/[0.05]">
          <div className="flex items-center gap-2">
            {!plan.is_active && onActivate && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onActivate(plan);
                }}
                className="text-xs py-1 h-8"
              >
                <Play size={12} className="mr-2" /> Activate
              </Button>
            )}
          </div>
          <div className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
            View Details <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </Card>
  );
};
