-- ============================================================
-- Migration: Add tracking logs for recurring/template features
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Daily Task Logs
CREATE TABLE IF NOT EXISTS public.daily_task_logs (
  id              UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id         UUID            NOT NULL REFERENCES public.daily_tasks(id) ON DELETE CASCADE,
  completed_date  DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, task_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_task_logs_user_id ON public.daily_task_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_daily_task_logs_date ON public.daily_task_logs (completed_date);

ALTER TABLE public.daily_task_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_task_logs: select own" ON public.daily_task_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_task_logs: insert own" ON public.daily_task_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_task_logs: delete own" ON public.daily_task_logs FOR DELETE USING (auth.uid() = user_id);

-- 2. Habit Logs
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id              UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  habit_id        UUID            NOT NULL, -- No foreign key yet as 'habits' table might not exist
  completed_date  DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, habit_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON public.habit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs (completed_date);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_logs: select own" ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habit_logs: insert own" ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_logs: delete own" ON public.habit_logs FOR DELETE USING (auth.uid() = user_id);

-- 3. Reminder Logs
CREATE TABLE IF NOT EXISTS public.reminder_logs (
  id              UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reminder_id     UUID            NOT NULL REFERENCES public.reminders(id) ON DELETE CASCADE,
  completed_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id ON public.reminder_logs (user_id);

ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminder_logs: select own" ON public.reminder_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reminder_logs: insert own" ON public.reminder_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reminder_logs: delete own" ON public.reminder_logs FOR DELETE USING (auth.uid() = user_id);
