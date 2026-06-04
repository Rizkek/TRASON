-- ============================================================
-- Migration: Create daily_tasks table
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id              UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT            NOT NULL,
  description     TEXT,
  category        TEXT,
  sort_order      INTEGER         NOT NULL DEFAULT 0,
  completed_today BOOLEAN         NOT NULL DEFAULT FALSE,
  last_reset_date DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id
  ON public.daily_tasks (user_id)
  WHERE deleted_at IS NULL;

-- Row Level Security
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own tasks
CREATE POLICY "daily_tasks: select own"
  ON public.daily_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "daily_tasks: insert own"
  ON public.daily_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_tasks: update own"
  ON public.daily_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "daily_tasks: delete own"
  ON public.daily_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_daily_tasks_updated_at ON public.daily_tasks;
CREATE TRIGGER set_daily_tasks_updated_at
  BEFORE UPDATE ON public.daily_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
