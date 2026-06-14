import React from 'react';
import { Card, Badge, Button } from '@/components';
import type { WorkoutPlan } from '@/types/database';
import { Calendar, Play, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

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
          ? 'border-primary/50 shadow-[0_0_15px_rgba(78,79,235,0.15)] bg-gradient-to-br from-primary/10 to-transparent' 
          : 'border-black/[0.05] dark:border-white/[0.05] hover:border-black/[0.15] dark:border-white/[0.15] bg-black/[0.02] dark:bg-white/[0.02]'
      }`}
      onClick={() => onSelect?.(plan)}
    >
      {/* Active Indicator Glow */}
      {plan.is_active && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 blur-[50px] rounded-full pointer-events-none" />
      )}

      <div className="p-xl space-y-lg relative z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-xl font-serif font-bold tracking-tight ${plan.is_active ? 'text-primary' : 'text-soft-cream'}`}>
                {plan.name}
              </h3>
              {plan.is_active && (
                <Badge variant="info" className="text-[10px] uppercase tracking-widest px-2 py-0.5">
                  Active Plan
                </Badge>
              )}
            </div>
            {plan.description && (
              <p className="text-sm text-gray-light line-clamp-2">
                {plan.description}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:bg-white/10 transition-colors">
            <Activity size={20} className={plan.is_active ? 'text-primary' : 'text-gray-light'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="bg-black/5 dark:bg-white/5 rounded-md p-md">
            <div className="flex items-center gap-2 text-gray-light mb-1">
              <Calendar size={14} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Duration</span>
            </div>
            <p className="text-lg font-bold text-white">{plan.duration_weeks} Weeks</p>
          </div>
          <div className="bg-black/5 dark:bg-white/5 rounded-md p-md">
            <div className="flex items-center gap-2 text-gray-light mb-1">
              <CheckCircle2 size={14} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Training Days</span>
            </div>
            <p className="text-lg font-bold text-white">{daysCount} Days/Week</p>
          </div>
        </div>

        <div className="pt-sm flex items-center justify-between border-t border-black/[0.05] dark:border-white/[0.05]">
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
          <div className="text-xs font-bold text-gray-light group-hover:text-primary transition-colors flex items-center gap-1">
            View Details <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </Card>
  );
};
