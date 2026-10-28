'use client';

import React, { useState } from 'react';
import { Button, Loading, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useSportHistory } from '@/hooks/useSportHistory';
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan';
import { WorkoutPlanCard } from '@/components/modules/Sport/WorkoutPlanCard';
import { PRBoard } from '@/components/modules/Sport/PRBoard';
import { QuickLogModal } from '@/components/modules/Sport/QuickLogModal';
import { CreatePlanModal } from '@/components/modules/Sport/CreatePlanModal';
import { Barbell as Dumbbell, Plus, Flame, Timer, Heartbeat as Activity } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

const SportHistoryChart = dynamic(() => import('@/components/modules/Sport/SportHistoryChart').then(mod => mod.SportHistoryChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-surface rounded-xl" />
});
import { useTranslation } from '@/libs/i18n/useTranslation';
import { Heading, Paragraph } from '@/components/ui/typography';
import { AppPageHeader } from '@/components/layout/AppPageHeader';

export const SportPageClient: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    sessions,
    recentSessions,
    prBoard,
    stats,
    isLoading: historyLoading,
    logSession
  } = useSportHistory();

  const {
    plans,
    activePlan,
    isLoading: plansLoading,
    setActivePlan,
    createPlan
  } = useWorkoutPlan();

  const isLoading = historyLoading || plansLoading;

  const handleQuickLog = async (data: any) => {
    try {
      await logSession(data);
    } catch (err: any) {
      setError(err.message || 'Failed to log workout');
    }
  };

  const handleActivatePlan = async (planId: string) => {
    try {
      await setActivePlan(planId);
    } catch (err: any) {
      setError(err.message || 'Failed to activate plan');
    }
  };

  const handleCreatePlan = async (data: any) => {
    try {
      await createPlan(data);
      setIsCreatePlanModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create plan');
    }
  };

  if (!user) return null;

  return (
    <>
      <ErrorAlert error={error} onDismiss={() => setError(null)} />
      <>
        <div className="space-y-8 animate-fade-in pb-12">
          {/* Header */}
          <AppPageHeader
            title={t('sport_page.sport_fitness_title')}
            description={t('sport_page.sport_fitness_desc')}
            actions={
              <Button variant="primary" size="sm" onClick={() => setIsLogModalOpen(true)} leftIcon={<Dumbbell size={16} />} className="hidden md:inline-flex">
                {t('sport_page.quick_log_workout')}
              </Button>
            }
          />

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <>
              {/* Workout Plans */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Heading as="h2" size="h2" className="text-xl font-sans font-semibold tracking-tight text-foreground">{t('sport_page.workout_plans')}</Heading>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsCreatePlanModalOpen(true)}>
                    <Plus size={14} className="mr-1" /> {t('sport_page.new_plan')}
                  </Button>
                </div>

                {plans.length === 0 ? (
                  <div className="text-center p-5 md:p-8 bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl">
                    <Dumbbell size={32} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                    <Heading as="h4" size="h4" className="text-foreground font-bold mb-1">{t('sport_page.no_active_plans')}</Heading>
                    <Paragraph className="text-sm text-muted-foreground mb-4">{t('sport_page.create_workout_desc')}</Paragraph>
                    <Button variant="outline" size="sm" onClick={() => setIsCreatePlanModalOpen(true)}>{t('sport_page.create_plan_btn')}</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                      <WorkoutPlanCard
                        key={plan.id}
                        plan={plan}
                        onActivate={() => handleActivatePlan(plan.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Top Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Flame size={16} className="text-accent-purple" />
                    <span className="text-xs uppercase tracking-widest font-bold">{t('sport_page.this_week')}</span>
                  </div>
                  <Paragraph className="text-2xl font-semibold text-foreground">{stats.thisWeekSessions} <span className="text-sm font-normal text-muted-foreground">{t('sport_page.sessions_label')}</span></Paragraph>
                </div>

                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Timer size={16} className="text-primary" />
                    <span className="text-xs uppercase tracking-widest font-bold">{t('sport_page.avg_session')}</span>
                  </div>
                  <Paragraph className="text-2xl font-semibold text-foreground">{stats.avgSessionMinutes} <span className="text-sm font-normal text-muted-foreground">{t('sport_page.min_label')}</span></Paragraph>
                </div>

                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Activity size={16} className="text-primary" />
                    <span className="text-xs uppercase tracking-widest font-bold">{t('sport_page.total_time')}</span>
                  </div>
                  <Paragraph className="text-2xl font-semibold text-foreground">{Math.floor(stats.totalMinutes / 60)}<span className="text-sm font-normal text-muted-foreground">{t('sport_page.h_label')}</span> {stats.totalMinutes % 60}<span className="text-sm font-normal text-muted-foreground">{t('sport_page.m_label')}</span></Paragraph>
                </div>

                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Dumbbell size={16} className="text-secondary" />
                    <span className="text-xs uppercase tracking-widest font-bold">{t('sport_page.total_sessions')}</span>
                  </div>
                  <Paragraph className="text-2xl font-semibold text-foreground">{stats.totalSessions}</Paragraph>
                </div>
              </div>

              {/* Chart */}
              <SportHistoryChart sessions={sessions} />

              {/* PR Board */}
              <div className="space-y-4">
                <Heading as="h2" size="h2" className="text-xl font-sans font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <Flame className="text-primary" size={20} /> {t('sport_page.personal_records')}
                </Heading>
                <PRBoard records={prBoard} />
              </div>

              {/* Sessions history list */}
              {sessions.length > 0 && (
                <div className="space-y-4">
                  <Heading as="h2" size="h2" className="text-xl font-sans font-semibold tracking-tight text-foreground">{t('sport_page.recent_workouts')}</Heading>
                  <div className="grid grid-cols-1 gap-4">
                    {sessions.slice((page - 1) * limit, page * limit).map((session) => (
                      <div key={session.id} className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-lg p-4 flex justify-between items-center hover:bg-foreground/[0.05] transition-colors">
                        <div>
                          <Paragraph className="text-foreground font-semibold">{new Date(session.session_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Paragraph>
                          <Paragraph className="text-xs text-muted-foreground">{session.duration_minutes} {t('sport_page.minutes_count')} â€¢ {t('sport_page.intensity')}: {session.rating}/5</Paragraph>
                          {session.notes && <Paragraph className="text-sm text-subtle mt-1 italic line-clamp-1">{session.notes}</Paragraph>}
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold px-2 py-1 bg-foreground/5 rounded-md text-muted-foreground">
                            {session.exercises_log?.length || 0} {t('sport_page.exercises_count')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {Math.ceil(sessions.length / limit) > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <Paragraph className="text-xs text-muted-foreground">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, sessions.length)} of {sessions.length}
                      </Paragraph>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPage(p => Math.max(1, p - 1))} 
                          disabled={page === 1}
                        >
                          Prev
                        </Button>
                        <div className="px-2 text-xs font-bold text-foreground min-w-[60px] text-center">
                          {page} / {Math.ceil(sessions.length / limit)}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPage(p => Math.min(Math.ceil(sessions.length / limit), p + 1))} 
                          disabled={page === Math.ceil(sessions.length / limit)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </>

      {/* Mobile-only FAB for Quick Log */}
      <div className="md:hidden fixed bottom-24 right-4 z-40">
        <Button 
          variant="primary" 
          onClick={() => setIsLogModalOpen(true)} 
          className="rounded-full w-14 h-14 flex items-center justify-center "
          aria-label={t('sport_page.quick_log_workout')}
        >
          <Dumbbell size={24} />
        </Button>
      </div>

      {isLogModalOpen && (
        <QuickLogModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          onSubmit={handleQuickLog}
        />
      )}
      {isCreatePlanModalOpen && (
        <CreatePlanModal
          isOpen={isCreatePlanModalOpen}
          onClose={() => setIsCreatePlanModalOpen(false)}
          onSubmit={handleCreatePlan}
        />
      )}
    </>
  );
};
