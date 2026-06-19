'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { workoutPlanQueries } from '@/services/workout/planQueries';
import { workoutDayQueries, workoutExerciseQueries } from '@/services/workout/dayQueries';
import type { WorkoutPlan, WorkoutDay, WorkoutExercise } from '@/types/database';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { SWR_CONFIG_STABLE } from '@/config/swr';
import { executeMutation } from "@/libs/api/mutationBuilder";

/**
 * useWorkoutPlan — SWR hook untuk manage workout plans.
 *
 * Menggabungkan fetch + CRUD operations dengan cache invalidation otomatis.
 * Workout plan data relatif stabil (tidak sering berubah) sehingga
 * menggunakan SWR_CONFIG_STABLE (retry sekali, cache lebih lama).
 */
export const useWorkoutPlan = () => {
  const key = CACHE_KEYS.workoutPlans.list();

  const { data: plans, isLoading, error, mutate } = useSWR(
    key,
    async () => {
      return await executeMutation(
          (async () => {
        return await workoutPlanQueries.getPlans();
          })(),
          'useWorkoutPlan.fetch'
        );
    },
    SWR_CONFIG_STABLE
  );

  const invalidate = useCallback(async () => {
    await globalMutate(CACHE_KEYS.workoutPlans.list());
  }, []);

  // ── PLAN CRUD ─────────────────────────────────────────────

  const createPlan = useCallback(
    async (planData: Pick<WorkoutPlan, 'name' | 'description' | 'duration_weeks' | 'start_date'>) => {
      return await executeMutation(
            (async () => {
          const newPlan = await workoutPlanQueries.createPlan(planData);
          await invalidate();
          return newPlan;
            })(),
            'useWorkoutPlan.createPlan'
          );
    },
    [invalidate]
  );

  const updatePlan = useCallback(
    async (
      planId: string,
      updates: Partial<Pick<WorkoutPlan, 'name' | 'description' | 'duration_weeks' | 'start_date' | 'is_active' | 'is_completed'>>
    ) => {
      return await executeMutation(
            (async () => {
          const updated = await workoutPlanQueries.updatePlan(planId, updates);
          await invalidate();
          return updated;
            })(),
            'useWorkoutPlan.updatePlan'
          );
    },
    [invalidate]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      return await executeMutation(
            (async () => {
          await workoutPlanQueries.deletePlan(planId);
          await invalidate();
            })(),
            'useWorkoutPlan.deletePlan'
          );
    },
    [invalidate]
  );

  const setActivePlan = useCallback(
    async (planId: string) => {
      return await executeMutation(
            (async () => {
          await workoutPlanQueries.setActivePlan(planId);
          await invalidate();
            })(),
            'useWorkoutPlan.setActivePlan'
          );
    },
    [invalidate]
  );

  // ── DAY CRUD ──────────────────────────────────────────────

  const addDay = useCallback(
    async (
      planId: string,
      dayData: Pick<WorkoutDay, 'day_of_week' | 'name' | 'notes' | 'target_duration_minutes'>
    ) => {
      return await executeMutation(
            (async () => {
          const newDay = await workoutDayQueries.addDay(planId, dayData);
          await invalidate();
          return newDay;
            })(),
            'useWorkoutPlan.addDay'
          );
    },
    [invalidate]
  );

  const updateDay = useCallback(
    async (
      dayId: string,
      updates: Partial<Pick<WorkoutDay, 'day_of_week' | 'name' | 'notes' | 'target_duration_minutes'>>
    ) => {
      return await executeMutation(
            (async () => {
          const updated = await workoutDayQueries.updateDay(dayId, updates);
          await invalidate();
          return updated;
            })(),
            'useWorkoutPlan.updateDay'
          );
    },
    [invalidate]
  );

  const deleteDay = useCallback(
    async (dayId: string) => {
      return await executeMutation(
            (async () => {
          await workoutDayQueries.deleteDay(dayId);
          await invalidate();
            })(),
            'useWorkoutPlan.deleteDay'
          );
    },
    [invalidate]
  );

  // ── EXERCISE CRUD ─────────────────────────────────────────

  const addExercise = useCallback(
    async (
      dayId: string,
      exerciseData: Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at' | 'updated_at'>
    ) => {
      return await executeMutation(
            (async () => {
          const newExercise = await workoutExerciseQueries.addExercise(dayId, exerciseData);
          await invalidate();
          return newExercise;
            })(),
            'useWorkoutPlan.addExercise'
          );
    },
    [invalidate]
  );

  const updateExercise = useCallback(
    async (
      exerciseId: string,
      updates: Partial<Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at'>>
    ) => {
      return await executeMutation(
            (async () => {
          const updated = await workoutExerciseQueries.updateExercise(exerciseId, updates);
          await invalidate();
          return updated;
            })(),
            'useWorkoutPlan.updateExercise'
          );
    },
    [invalidate]
  );

  const deleteExercise = useCallback(
    async (exerciseId: string) => {
      return await executeMutation(
            (async () => {
          await workoutExerciseQueries.deleteExercise(exerciseId);
          await invalidate();
            })(),
            'useWorkoutPlan.deleteExercise'
          );
    },
    [invalidate]
  );

  // Computed
  const activePlan = plans?.find((p) => p.is_active) ?? null;

  return {
    plans: plans || [],
    activePlan,
    isLoading,
    error,
    mutate,
    // Plan
    createPlan,
    updatePlan,
    deletePlan,
    setActivePlan,
    // Day
    addDay,
    updateDay,
    deleteDay,
    // Exercise
    addExercise,
    updateExercise,
    deleteExercise,
  };
};
