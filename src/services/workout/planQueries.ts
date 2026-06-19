import { supabase } from '../supabase/supabaseClient';
import { withAuthQuery } from '../supabase/queryBuilder';
import type { WorkoutPlan } from '@/types/database';

export const workoutPlanQueries = {
  async getPlans(): Promise<WorkoutPlan[]> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select(`
          *,
          days:workout_days (
            *,
            exercises:workout_exercises ( * )
          )
        `)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as WorkoutPlan[]) || [];
    });
  },

  async getPlanById(planId: string): Promise<WorkoutPlan | null> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .select(`
          *,
          days:workout_days (
            *,
            exercises:workout_exercises ( * )
          )
        `)
        .eq('id', planId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) throw error;
      return data as WorkoutPlan | null;
    });
  },

  async createPlan(plan: Pick<WorkoutPlan, 'name' | 'description' | 'duration_weeks' | 'start_date'>): Promise<WorkoutPlan> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert([{ ...plan, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data as WorkoutPlan;
    });
  },

  async updatePlan(planId: string, updates: Partial<Pick<WorkoutPlan, 'name' | 'description' | 'duration_weeks' | 'start_date' | 'is_active' | 'is_completed'>>): Promise<WorkoutPlan> {
    return withAuthQuery(async (userId) => {
      const { data, error } = await supabase
        .from('workout_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as WorkoutPlan;
    });
  },

  async deletePlan(planId: string): Promise<void> {
    return withAuthQuery(async (userId) => {
      const { error } = await supabase
        .from('workout_plans')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', planId)
        .eq('user_id', userId);

      if (error) throw error;
    });
  },

  async setActivePlan(planId: string): Promise<void> {
    return withAuthQuery(async (userId) => {
      await supabase
        .from('workout_plans')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('deleted_at', null);

      const { error } = await supabase
        .from('workout_plans')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .eq('user_id', userId);

      if (error) throw error;
    });
  },
};
