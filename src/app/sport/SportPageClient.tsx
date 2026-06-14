'use client';

import React, { useState } from 'react';
import { Layout, Button, Loading, ErrorAlert } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useSportHistory } from '@/hooks/useSportHistory';
import { useWorkoutPlan } from '@/hooks/useWorkoutPlan';
import { WorkoutPlanCard } from '@/components/modules/Sport/WorkoutPlanCard';
import { PRBoard } from '@/components/modules/Sport/PRBoard';
import { SportHistoryChart } from '@/components/modules/Sport/SportHistoryChart';
import { QuickLogModal } from '@/components/modules/Sport/QuickLogModal';
import { CreatePlanModal } from '@/components/modules/Sport/CreatePlanModal';
import { Dumbbell, Plus, Flame, Timer, Activity } from 'lucide-react';
import { useTranslation } from '@/libs/i18n/useTranslation';

export const SportPageClient: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <Layout>
        <div className="space-y-xl animate-fade-in pb-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gradient mb-2">{t('sport_page.sport_fitness_title')}</h1>
              <p className="text-gray-light text-sm tracking-wide">
                {t('sport_page.sport_fitness_desc')}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsLogModalOpen(true)}
              className="w-full sm:w-auto shadow-[0_0_20px_rgba(78,79,235,0.3)] hover:shadow-[0_0_30px_rgba(78,79,235,0.5)]"
            >
              <Dumbbell size={18} className="mr-2" /> {t('sport_page.quick_log_workout')}
            </Button>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <>
              {/* Top Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-xl p-md">
                  <div className="flex items-center gap-2 text-gray-light mb-2">
                    <Flame size={16} className="text-accent-purple" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{t('sport_page.this_week')}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.thisWeekSessions} <span className="text-sm font-normal text-gray-light">{t('sport_page.sessions_label')}</span></p>
                </div>

                <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-xl p-md">
                  <div className="flex items-center gap-2 text-gray-light mb-2">
                    <Timer size={16} className="text-accent-gold" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{t('sport_page.avg_session')}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.avgSessionMinutes} <span className="text-sm font-normal text-gray-light">{t('sport_page.min_label')}</span></p>
                </div>

                <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-xl p-md">
                  <div className="flex items-center gap-2 text-gray-light mb-2">
                    <Activity size={16} className="text-primary" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{t('sport_page.total_time')}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{Math.floor(stats.totalMinutes / 60)}<span className="text-sm font-normal text-gray-light">{t('sport_page.h_label')}</span> {stats.totalMinutes % 60}<span className="text-sm font-normal text-gray-light">{t('sport_page.m_label')}</span></p>
                </div>

                <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-xl p-md">
                  <div className="flex items-center gap-2 text-gray-light mb-2">
                    <Dumbbell size={16} className="text-secondary" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{t('sport_page.total_sessions')}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                </div>
              </div>

              {/* Chart */}
              <SportHistoryChart sessions={sessions} />

              {/* Workout Plans */}
              <div className="space-y-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-serif font-bold text-white">{t('sport_page.workout_plans')}</h2>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsCreatePlanModalOpen(true)}>
                    <Plus size={14} className="mr-1" /> {t('sport_page.new_plan')}
                  </Button>
                </div>

                {plans.length === 0 ? (
                  <div className="text-center p-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-xl">
                    <Dumbbell size={32} className="mx-auto text-gray-light mb-md opacity-50" />
                    <h4 className="text-white font-bold mb-1">{t('sport_page.no_active_plans')}</h4>
                    <p className="text-sm text-gray-light mb-md">{t('sport_page.create_workout_desc')}</p>
                    <Button variant="outline" size="sm" onClick={() => setIsCreatePlanModalOpen(true)}>{t('sport_page.create_plan_btn')}</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
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

              {/* PR Board */}
              <div className="space-y-md">
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Flame className="text-accent-gold" size={20} /> {t('sport_page.personal_records')}
                </h2>
                <PRBoard records={prBoard} />
              </div>

              {/* Recent Sessions List */}
              {recentSessions.length > 0 && (
                <div className="space-y-md">
                  <h2 className="text-xl font-serif font-bold text-white">{t('sport_page.recent_workouts')}</h2>
                  <div className="grid grid-cols-1 gap-md">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-lg p-md flex justify-between items-center hover:bg-black/[0.05] dark:bg-white/[0.05] transition-colors">
                        <div>
                          <p className="text-white font-bold">{new Date(session.session_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          <p className="text-xs text-gray-light">{session.duration_minutes} {t('sport_page.minutes_count')} â€¢ {t('sport_page.intensity')}: {session.rating}/5</p>
                          {session.notes && <p className="text-sm text-gray-very-light mt-1 italic line-clamp-1">{session.notes}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md text-gray-light">
                            {session.exercises_log?.length || 0} {t('sport_page.exercises_count')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>

      <QuickLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSubmit={handleQuickLog}
      />
      <CreatePlanModal
        isOpen={isCreatePlanModalOpen}
        onClose={() => setIsCreatePlanModalOpen(false)}
        onSubmit={handleCreatePlan}
      />
    </>
  );
};
