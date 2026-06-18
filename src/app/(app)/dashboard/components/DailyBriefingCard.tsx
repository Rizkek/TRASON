'use client';

import React from 'react';
import { Card, Loading } from '@/components';
import { useDailyBriefing } from '@/hooks/useDailyBriefing';
import { BellRing, CheckSquare, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function DailyBriefingCard() {
  const { briefing, isLoading } = useDailyBriefing();
  const user = useAuthStore(s => s.user);

  if (isLoading) {
    return (
      <Card className="p-lg bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05]">
        <div className="flex justify-center py-sm">
          <Loading text="Menyusun Daily Briefing..." />
        </div>
      </Card>
    );
  }

  if (!briefing) return null;

  return (
    <Card className="p-xl bg-gradient-to-r from-primary/10 via-transparent to-transparent border border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
      
      <div className="relative z-10 space-y-md">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-serif text-white mb-1">
              {briefing.greetingInsight}
            </h2>
            <p className="text-sm text-gray-light italic">
              {briefing.highlightInsight}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-md pt-sm">
          <div className="flex items-center gap-sm bg-black/20 dark:bg-white/5 rounded-full px-lg py-xs border border-black/5 dark:border-white/5">
            <CheckSquare size={14} className={briefing.tasksRemaining > 0 ? 'text-amber-400' : 'text-emerald-400'} />
            <span className="text-xs text-soft-cream">
              {briefing.tasksRemaining > 0 ? `${briefing.tasksRemaining} tugas tersisa` : 'Semua tugas selesai!'}
            </span>
          </div>

          {briefing.urgentReminders > 0 && (
            <div className="flex items-center gap-sm bg-red-400/10 rounded-full px-lg py-xs border border-red-400/20">
              <BellRing size={14} className="text-red-400" />
              <span className="text-xs text-red-400 font-bold">
                {briefing.urgentReminders} pengingat mendesak
              </span>
            </div>
          )}
          
          {briefing.urgentReminders === 0 && briefing.tasksRemaining === 0 && (
             <div className="flex items-center gap-sm bg-emerald-400/10 rounded-full px-lg py-xs border border-emerald-400/20">
             <Zap size={14} className="text-emerald-400" />
             <span className="text-xs text-emerald-400 font-bold">
               Hari yang tenang dan produktif
             </span>
           </div>
          )}
        </div>
      </div>
    </Card>
  );
}
