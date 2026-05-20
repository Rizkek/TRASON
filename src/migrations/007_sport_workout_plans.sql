-- ============================================================
-- Migration 007: Sport Workout Plans
-- 
-- Tables:
--   workout_plans      — program latihan multi-minggu
--   workout_days       — hari-hari dalam setiap plan
--   workout_exercises  — daftar exercise per workout day
--   workout_sessions   — log aktual setiap sesi workout
--   personal_records   — PR (Personal Record) per exercise type
--
-- RLS: semua tabel menggunakan Row Level Security
--      dan di-scope per user_id
-- ============================================================

-- ============================================================
-- 1. WORKOUT PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name          text NOT NULL,
  description   text,
  
  -- Duration & scheduling
  duration_weeks  integer NOT NULL DEFAULT 4 CHECK (duration_weeks BETWEEN 1 AND 52),
  start_date      date,
  
  -- Status
  is_active    boolean NOT NULL DEFAULT false,
  is_completed boolean NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout plans"
  ON public.workout_plans
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_is_active ON public.workout_plans(user_id, is_active) WHERE deleted_at IS NULL;

-- ============================================================
-- 2. WORKOUT DAYS
-- Hari-hari dalam sebuah plan (0=Sun, 1=Mon, ..., 6=Sat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_days (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id  uuid NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Day configuration
  day_of_week     integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  name            text,           -- e.g., "Push Day", "Leg Day"
  notes           text,
  
  -- Optional target duration
  target_duration_minutes integer,
  
  -- Timestamps
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout days"
  ON public.workout_days
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_days_plan_id ON public.workout_days(workout_plan_id);

-- ============================================================
-- 3. WORKOUT EXERCISES
-- Exercise dalam setiap workout day
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_day_id   uuid NOT NULL REFERENCES public.workout_days(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Exercise info
  name            text NOT NULL,
  sport_type      text NOT NULL DEFAULT 'other', -- 'run','lift','cycle','swim','yoga','other'
  notes           text,
  sort_order      integer NOT NULL DEFAULT 0,
  
  -- Target metrics (planned)
  target_sets     integer,
  target_reps     integer,
  target_weight_kg  numeric(6,2),
  target_distance_m integer,
  target_duration_s integer,
  
  -- Timestamps
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout exercises"
  ON public.workout_exercises
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_day_id ON public.workout_exercises(workout_day_id);

-- ============================================================
-- 4. WORKOUT SESSIONS
-- Log aktual setiap kali user menyelesaikan workout day
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_plan_id   uuid REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  workout_day_id    uuid REFERENCES public.workout_days(id) ON DELETE SET NULL,
  activity_id       uuid REFERENCES public.activities(id) ON DELETE SET NULL,
  
  -- Session info
  session_date     date NOT NULL DEFAULT CURRENT_DATE,
  started_at       timestamptz,
  completed_at     timestamptz,
  duration_minutes integer,
  
  -- Results
  mood            text,
  notes           text,
  rating          integer CHECK (rating BETWEEN 1 AND 5),
  
  -- Exercise logs (actual performed — stored as JSONB for flexibility)
  exercises_log   jsonb DEFAULT '[]'::jsonb,
  -- Format:
  -- [{ exercise_id, name, sets_done, reps_done, weight_kg, distance_m, duration_s, notes }]
  
  -- Timestamps
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout sessions"
  ON public.workout_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_date ON public.workout_sessions(user_id, session_date DESC);

-- ============================================================
-- 5. PERSONAL RECORDS (PR BOARD)
-- Auto-tracked setiap kali ada achievement baru
-- ============================================================
CREATE TABLE IF NOT EXISTS public.personal_records (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_session_id uuid REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
  
  -- PR info
  exercise_name   text NOT NULL,  -- e.g., "Bench Press", "5K Run"
  sport_type      text NOT NULL,  -- 'lift','run','cycle','swim','other'
  
  -- What was achieved
  metric_type     text NOT NULL,  -- 'weight','distance','reps','duration','pace'
  metric_value    numeric(10,3) NOT NULL,
  metric_unit     text NOT NULL,  -- 'kg','m','count','s','min/km'
  
  -- Context
  record_date     date NOT NULL DEFAULT CURRENT_DATE,
  notes           text,
  
  -- Timestamps
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own personal records"
  ON public.personal_records
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(user_id, exercise_name);

-- ============================================================
-- 6. SPORT LOGS
-- Core sport tracking table linked to activities
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sport_logs (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id      uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  type             text NOT NULL, -- 'run', 'lift', 'cycle', etc.
  
  -- Metrics
  duration_seconds integer,
  reps             integer,
  sets             integer,
  weight_kg        numeric(6,2),
  distance_meters  integer,
  
  -- Extra metadata
  metadata         jsonb,
  
  -- Timestamps
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  deleted_at       timestamptz
);

ALTER TABLE public.sport_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sport logs"
  ON public.sport_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sport_logs_user_id ON public.sport_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_logs_deleted_at
  ON public.sport_logs(user_id) WHERE deleted_at IS NULL;


-- ============================================================
-- 7. AUTO-UPDATE TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to workout_plans
CREATE TRIGGER set_updated_at_workout_plans
  BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Apply to workout_days
CREATE TRIGGER set_updated_at_workout_days
  BEFORE UPDATE ON public.workout_days
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Apply to workout_exercises
CREATE TRIGGER set_updated_at_workout_exercises
  BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Apply to workout_sessions
CREATE TRIGGER set_updated_at_workout_sessions
  BEFORE UPDATE ON public.workout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
