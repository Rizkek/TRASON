'use client';

import { sanitizeError } from '@/libs/validation';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { Fab } from '@/components/ui/Fab';
import React, { useState } from 'react';
import { Button, Loading, ErrorAlert, InlineError } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useSportHistory } from '@/hooks/useSportHistory';
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan';
import { WorkoutPlanCard } from '@/components/modules/Sport/WorkoutPlanCard';
import { PRBoard } from '@/components/modules/Sport/PRBoard';
import { QuickLogModal } from '@/components/modules/Sport/QuickLogModal';
import { CreatePlanModal } from '@/components/modules/Sport/CreatePlanModal';
import { PlanDetailModal } from '@/components/modules/Sport/PlanDetailModal';
import type { WorkoutDay, WorkoutPlan } from '@/types/database';
import { Barbell as Dumbbell, Plus, Flame } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

const SportHistoryChart = dynamic(() => import('@/components/modules/Sport/SportHistoryChart').then(mod => mod.SportHistoryChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-surface rounded-xl" />
});
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Heading, Paragraph } from '@/components/ui/typography';
import { AppPageHeader } from '@/components/layout/AppPageHeader';

export const SportPageClient: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { locale } = useUserPreferences();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [detailPlanId, setDetailPlanId] = useState<string | null>(null);
  const [logTarget, setLogTarget] = useState<{ plan: WorkoutPlan; day: WorkoutDay } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    sessions,
    prBoard,
    stats,
    isLoading: historyLoading,
    error: historyError,
    refresh: refreshHistory,
    logSession
  } = useSportHistory();

  const {
    plans,
    error: plansError,
    isLoading: plansLoading,
    setActivePlan,
    createPlan,
    addDay,
    deleteDay,
    addExercise,
    deleteExercise,
    deletePlan,
  } = useWorkoutPlan();
  const detailPlan = plans.find((plan) => plan.id === detailPlanId);

  const isLoading = historyLoading || plansLoading;

  const handleQuickLog = async (data: any) => {
    try {
      await logSession(data);
    } catch (err: any) {
      setError(sanitizeError(err) || t('sport_forms.log_failed'));
    }
  };

  const handleActivatePlan = async (planId: string) => {
    try {
      await setActivePlan(planId);
    } catch (err: any) {
      setError(sanitizeError(err) || t('sport_forms.activate_failed'));
    }
  };

  const handleCreatePlan = async (data: any) => {
    try {
      await createPlan(data);
      setIsCreatePlanModalOpen(false);
    } catch (err: any) {
      setError(sanitizeError(err) || t('sport_forms.create_failed'));
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

          {(historyError || plansError) && (
            <InlineError message={t('dashboard.section_load_failed')} retryLabel={t('common.try_again')} onRetry={() => refreshHistory()} />
          )}

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <>
              {/* Top Stats Row */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard label={t('sport_page.this_week')} value={`${stats.thisWeekSessions} ${t('sport_page.sessions_label')}`} />
                <StatCard label={t('sport_page.avg_session')} value={`${stats.avgSessionMinutes} ${t('sport_page.min_label')}`} />
                <StatCard
                  label={t('sport_page.total_time')}
                  value={`${Math.floor(stats.totalMinutes / 60)}${t('sport_page.h_label')} ${stats.totalMinutes % 60}${t('sport_page.m_label')}`}
                />
                <StatCard label={t('sport_page.total_sessions')} value={stats.totalSessions} />
              </div>

              {/* Workout Plans */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Heading as="h2" size="h3">{t('sport_page.workout_plans')}</Heading>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsCreatePlanModalOpen(true)}>
                    <Plus size={14} className="mr-1" /> {t('sport_page.new_plan')}
                  </Button>
                </div>

                {plans.length === 0 ? (
                  <EmptyState
                    icon={Dumbbell}
                    className="glass-card"
                    title={t('sport_page.no_active_plans')}
                    description={t('sport_page.create_workout_desc')}
                    action={<Button variant="outline" size="sm" onClick={() => setIsCreatePlanModalOpen(true)}>{t('sport_page.create_plan_btn')}</Button>}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan) => (
                      <WorkoutPlanCard
                        key={plan.id}
                        plan={plan}
                        onSelect={() => setDetailPlanId(plan.id)}
                        onActivate={() => handleActivatePlan(plan.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Chart */}
              <SportHistoryChart sessions={sessions} />

              {/* PR Board */}
              <div className="space-y-4">
                <Heading as="h2" size="h3" className="flex items-center gap-2">
                  <Flame className="text-primary" size={20} /> {t('sport_page.personal_records')}
                </Heading>
                <PRBoard records={prBoard} />
              </div>

              {/* Sessions history list */}
              {sessions.length > 0 && (
                <div className="space-y-4">
                  <Heading as="h2" size="h3">{t('sport_page.recent_workouts')}</Heading>
                  <div className="grid grid-cols-1 gap-4">
                    {sessions.slice((page - 1) * limit, page * limit).map((session) => (
                      <div key={session.id} className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-lg p-4 flex justify-between items-center hover:bg-foreground/[0.05] transition-colors">
                        <div>
                          <Paragraph className="text-foreground font-semibold">{new Date(session.session_date).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}</Paragraph>
                          <Paragraph className="text-xs text-muted-foreground">{session.duration_minutes} {t('sport_page.minutes_count')} • {t('sport_page.intensity')}: {session.rating}/5</Paragraph>
                          {session.notes && <Paragraph className="text-sm text-subtle mt-1 line-clamp-1">{session.notes}</Paragraph>}
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
                        {t('moduleCommon.showing')} {((page - 1) * limit) + 1} {t('moduleCommon.to')} {Math.min(page * limit, sessions.length)} {t('moduleCommon.of')} {sessions.length}
                      </Paragraph>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPage(p => Math.max(1, p - 1))} 
                          disabled={page === 1}
                        >{t('moduleCommon.prev')}</Button>
                        <div className="px-2 text-xs font-bold text-foreground min-w-[60px] text-center">
                          {page} / {Math.ceil(sessions.length / limit)}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPage(p => Math.min(Math.ceil(sessions.length / limit), p + 1))} 
                          disabled={page === Math.ceil(sessions.length / limit)}
                        >{t('moduleCommon.next')}</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </>

      <Fab label={t('sport_page.quick_log_workout')} onClick={() => setIsLogModalOpen(true)} icon={<Dumbbell size={24} aria-hidden="true" />} />

      {(isLogModalOpen || logTarget) && (
        <QuickLogModal
          key={logTarget?.day.id ?? 'quick'}
          isOpen
          onClose={() => {
            setIsLogModalOpen(false);
            setLogTarget(null);
          }}
          onSubmit={handleQuickLog}
          planDay={logTarget ?? undefined}
        />
      )}
      {detailPlan && (
        <PlanDetailModal
          plan={detailPlan}
          actions={{ addDay, deleteDay, addExercise, deleteExercise, setActivePlan, deletePlan }}
          onClose={() => setDetailPlanId(null)}
          onLogDay={(plan, day) => {
            setDetailPlanId(null);
            setLogTarget({ plan, day });
          }}
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
