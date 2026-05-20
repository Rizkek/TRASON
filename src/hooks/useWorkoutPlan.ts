'use client';

import { useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { workoutPlanQueries, workoutDayQueries, workoutExerciseQueries } from '@/services/workoutQueries';
import type { WorkoutPlan, WorkoutDay, WorkoutExercise } from '@/types/database';
import { CACHE_KEYS } from '@/libs/cacheKeys';
import { SWR_CONFIG_STABLE } from '@/config/swr';
import { handleQueryError, logError } from '@/libs/apiErrors';

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
      try {
        return await workoutPlanQueries.getPlans();
      } catch (err) {
        logError(err, 'useWorkoutPlan.fetch');
        throw handleQueryError(err);
      }
    },
    SWR_CONFIG_STABLE
  );

  const invalidate = useCallback(async () => {
    await globalMutate(CACHE_KEYS.workoutPlans.list());
  }, []);

  // ── PLAN CRUD ─────────────────────────────────────────────

  const createPlan = useCallback(
    async (planData: Pick<WorkoutPlan, 'name' | 'description' | 'duration_weeks' | 'start_date'>) => {
      try {
        const newPlan = await workoutPlanQueries.createPlan(planData);
        await invalidate();
        return newPlan;
      } catch (err) {
        logError(err, 'useWorkoutPlan.createPlan');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  const updatePlan = useCallback(
    async (
      planId: string,
      updates: Partial<Pick<WorkoutPlan, 'name' | 'description' | 'duration_weeks' | 'start_date' | 'is_active' | 'is_completed'>>
    ) => {
      try {
        const updated = await workoutPlanQueries.updatePlan(planId, updates);
        await invalidate();
        return updated;
      } catch (err) {
        logError(err, 'useWorkoutPlan.updatePlan');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      try {
        await workoutPlanQueries.deletePlan(planId);
        await invalidate();
      } catch (err) {
        logError(err, 'useWorkoutPlan.deletePlan');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  const setActivePlan = useCallback(
    async (planId: string) => {
      try {
        await workoutPlanQueries.setActivePlan(planId);
        await invalidate();
      } catch (err) {
        logError(err, 'useWorkoutPlan.setActivePlan');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  // ── DAY CRUD ──────────────────────────────────────────────

  const addDay = useCallback(
    async (
      planId: string,
      dayData: Pick<WorkoutDay, 'day_of_week' | 'name' | 'notes' | 'target_duration_minutes'>
    ) => {
      try {
        const newDay = await workoutDayQueries.addDay(planId, dayData);
        await invalidate();
        return newDay;
      } catch (err) {
        logError(err, 'useWorkoutPlan.addDay');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  const updateDay = useCallback(
    async (
      dayId: string,
      updates: Partial<Pick<WorkoutDay, 'day_of_week' | 'name' | 'notes' | 'target_duration_minutes'>>
    ) => {
      try {
        const updated = await workoutDayQueries.updateDay(dayId, updates);
        await invalidate();
        return updated;
      } catch (err) {
        logError(err, 'useWorkoutPlan.updateDay');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  const deleteDay = useCallback(
    async (dayId: string) => {
      try {
        await workoutDayQueries.deleteDay(dayId);
        await invalidate();
      } catch (err) {
        logError(err, 'useWorkoutPlan.deleteDay');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  // ── EXERCISE CRUD ─────────────────────────────────────────

  const addExercise = useCallback(
    async (
      dayId: string,
      exerciseData: Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at' | 'updated_at'>
    ) => {
      try {
        const newExercise = await workoutExerciseQueries.addExercise(dayId, exerciseData);
        await invalidate();
        return newExercise;
      } catch (err) {
        logError(err, 'useWorkoutPlan.addExercise');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  const updateExercise = useCallback(
    async (
      exerciseId: string,
      updates: Partial<Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at'>>
    ) => {
      try {
        const updated = await workoutExerciseQueries.updateExercise(exerciseId, updates);
        await invalidate();
        return updated;
      } catch (err) {
        logError(err, 'useWorkoutPlan.updateExercise');
        throw handleQueryError(err);
      }
    },
    [invalidate]
  );

  const deleteExercise = useCallback(
    async (exerciseId: string) => {
      try {
        await workoutExerciseQueries.deleteExercise(exerciseId);
        await invalidate();
      } catch (err) {
        logError(err, 'useWorkoutPlan.deleteExercise');
        throw handleQueryError(err);
      }
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
