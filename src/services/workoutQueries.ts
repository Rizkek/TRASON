import { supabase, getCurrentUser } from './supabaseClient';
import type {
  WorkoutPlan,
  WorkoutDay,
  WorkoutExercise,
  WorkoutSession,
  PersonalRecord,
  ExerciseLogEntry,
} from '@/types/database';

/**
 * ==================== WORKOUT PLAN QUERIES ====================
 * CRUD for workout_plans, workout_days, workout_exercises,
 * workout_sessions, and personal_records tables.
 */

// ──────────────────────────────────────────────────────────────
// WORKOUT PLANS
// ──────────────────────────────────────────────────────────────

export const workoutPlanQueries = {
  /** Fetch all active (non-deleted) plans for current user, with days+exercises joined */
  async getPlans(): Promise<WorkoutPlan[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_plans')
      .select(`
        *,
        days:workout_days (
          *,
          exercises:workout_exercises ( * )
        )
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as WorkoutPlan[]) || [];
  },

  /** Fetch single plan by ID with days+exercises */
  async getPlanById(planId: string): Promise<WorkoutPlan | null> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

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
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as WorkoutPlan | null;
  },

  /** Create a new workout plan */
  async createPlan(
    plan: Pick<WorkoutPlan, 'name' | 'description' | 'duration_weeks' | 'start_date'>
  ): Promise<WorkoutPlan> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_plans')
      .insert([{ ...plan, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutPlan;
  },

  /** Update a plan */
  async updatePlan(
    planId: string,
    updates: Partial<Pick<WorkoutPlan, 'name' | 'description' | 'duration_weeks' | 'start_date' | 'is_active' | 'is_completed'>>
  ): Promise<WorkoutPlan> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', planId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutPlan;
  },

  /** Soft delete a plan */
  async deletePlan(planId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('workout_plans')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', planId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /** Set active plan (deactivate all others, activate the target one) */
  async setActivePlan(planId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Deactivate all
    await supabase
      .from('workout_plans')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('deleted_at', null);

    // Activate target
    const { error } = await supabase
      .from('workout_plans')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', planId)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

// ──────────────────────────────────────────────────────────────
// WORKOUT DAYS
// ──────────────────────────────────────────────────────────────

export const workoutDayQueries = {
  /** Add a workout day to a plan */
  async addDay(
    planId: string,
    day: Pick<WorkoutDay, 'day_of_week' | 'name' | 'notes' | 'target_duration_minutes'>
  ): Promise<WorkoutDay> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_days')
      .insert([{ ...day, workout_plan_id: planId, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutDay;
  },

  /** Update a workout day */
  async updateDay(
    dayId: string,
    updates: Partial<Pick<WorkoutDay, 'day_of_week' | 'name' | 'notes' | 'target_duration_minutes'>>
  ): Promise<WorkoutDay> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_days')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', dayId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutDay;
  },

  /** Delete a workout day (and its exercises via cascade) */
  async deleteDay(dayId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('workout_days')
      .delete()
      .eq('id', dayId)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

// ──────────────────────────────────────────────────────────────
// WORKOUT EXERCISES
// ──────────────────────────────────────────────────────────────

export const workoutExerciseQueries = {
  /** Add exercise to a workout day */
  async addExercise(
    dayId: string,
    exercise: Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at' | 'updated_at'>
  ): Promise<WorkoutExercise> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_exercises')
      .insert([{ ...exercise, workout_day_id: dayId, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutExercise;
  },

  /** Update an exercise */
  async updateExercise(
    exerciseId: string,
    updates: Partial<Omit<WorkoutExercise, 'id' | 'user_id' | 'workout_day_id' | 'created_at'>>
  ): Promise<WorkoutExercise> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_exercises')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', exerciseId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutExercise;
  },

  /** Delete an exercise */
  async deleteExercise(exerciseId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', exerciseId)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

// ──────────────────────────────────────────────────────────────
// WORKOUT SESSIONS
// ──────────────────────────────────────────────────────────────

export const workoutSessionQueries = {
  /** Fetch sessions by date range */
  async getSessions(startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('session_date', startDate.toISOString().split('T')[0])
      .lte('session_date', endDate.toISOString().split('T')[0])
      .order('session_date', { ascending: false });

    if (error) throw error;
    return (data as WorkoutSession[]) || [];
  },

  /** Fetch recent sessions (last N) */
  async getRecentSessions(limit = 10): Promise<WorkoutSession[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as WorkoutSession[]) || [];
  },

  /** Log a new workout session */
  async logSession(
    session: Omit<WorkoutSession, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ): Promise<WorkoutSession> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([{ ...session, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutSession;
  },

  /** Update a session */
  async updateSession(
    sessionId: string,
    updates: Partial<Omit<WorkoutSession, 'id' | 'user_id' | 'created_at'>>
  ): Promise<WorkoutSession> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workout_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkoutSession;
  },

  /** Soft delete a session */
  async deleteSession(sessionId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('workout_sessions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;
  },
};

// ──────────────────────────────────────────────────────────────
// PERSONAL RECORDS
// ──────────────────────────────────────────────────────────────

export const personalRecordQueries = {
  /** Fetch all PRs for current user, grouped by exercise */
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .order('record_date', { ascending: false });

    if (error) throw error;
    return (data as PersonalRecord[]) || [];
  },

  /** Check if a value beats existing PR for exercise+metric, and save it if so */
  async checkAndSavePR(
    exerciseName: string,
    sportType: PersonalRecord['sport_type'],
    metricType: PersonalRecord['metric_type'],
    metricValue: number,
    metricUnit: string,
    sessionId?: string
  ): Promise<PersonalRecord | null> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Find existing best
    const { data: existing } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('exercise_name', exerciseName)
      .eq('metric_type', metricType)
      .order('metric_value', { ascending: false })
      .limit(1)
      .maybeSingle();

    // For 'pace' metric, lower is better. For all others, higher is better.
    const isBetter = !existing
      ? true
      : metricType === 'pace'
        ? metricValue < existing.metric_value
        : metricValue > existing.metric_value;

    if (!isBetter) return null;

    const { data, error } = await supabase
      .from('personal_records')
      .insert([{
        user_id: user.id,
        workout_session_id: sessionId,
        exercise_name: exerciseName,
        sport_type: sportType,
        metric_type: metricType,
        metric_value: metricValue,
        metric_unit: metricUnit,
        record_date: new Date().toISOString().split('T')[0],
      }])
      .select()
      .single();

    if (error) throw error;
    return data as PersonalRecord;
  },

  /** Get latest PR per exercise (for PR board) */
  async getPRBoard(): Promise<PersonalRecord[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Get all PRs and deduplicate client-side to get best per exercise+metric
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .order('metric_value', { ascending: false });

    if (error) throw error;

    // Deduplicate: keep best value per (exercise_name + metric_type)
    const best = new Map<string, PersonalRecord>();
    for (const pr of (data as PersonalRecord[])) {
      const key = `${pr.exercise_name}::${pr.metric_type}`;
      if (!best.has(key)) {
        best.set(key, pr);
      }
    }
    return Array.from(best.values());
  },
};
