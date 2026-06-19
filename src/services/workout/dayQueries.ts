import { supabase } from '../supabase/supabaseClient';
import { withAuthQuery } from '../supabase/queryBuilder';
import type { WorkoutDay, WorkoutExercise } from '@/types/database';

export const workoutDayQueries = {
  async addDay(planId: string, day: Pick<WorkoutDay, 'day_of_week' | 'name' | 'notes' | 'target_duration_minutes'>): Promise<WorkoutDay> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_days')
        .insert([{ ...day, workout_plan_id: planId, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data as WorkoutDay;
    });
  },

  async updateDay(dayId: string, updates: Partial<Pick<WorkoutDay, 'day_of_week' | 'name' | 'notes' | 'target_duration_minutes'>>): Promise<WorkoutDay> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_days')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', dayId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data as WorkoutDay;
    });
  },

  async deleteDay(dayId: string): Promise<void> {
    return withAuthQuery(async (userId) => {
      const { error } = await supabase
        .from('workout_days')
        .delete()
        .eq('id', dayId)
        .eq('user_id', userId);
      if (error) throw error;
    });
  },
};

export const workoutExerciseQueries = {
  async addExercise(dayId: string, exercise: Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at' | 'updated_at'>): Promise<WorkoutExercise> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_exercises')
        .insert([{ ...exercise, workout_day_id: dayId, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data as WorkoutExercise;
    });
  },

  async updateExercise(exerciseId: string, updates: Partial<Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at'>>): Promise<WorkoutExercise> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_exercises')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', exerciseId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data as WorkoutExercise;
    });
  },

  async deleteExercise(exerciseId: string): Promise<void> {
    return withAuthQuery(async (userId) => {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', userId);
      if (error) throw error;
    });
  },
};
