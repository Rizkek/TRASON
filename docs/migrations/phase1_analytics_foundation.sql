-- Phase 1: Analytics Engine Foundation
-- Run this in Supabase SQL Editor

-- =============================================
-- TABLE: life_scores
-- =============================================
CREATE TABLE IF NOT EXISTS public.life_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  finance_score SMALLINT NOT NULL DEFAULT 0,
  productivity_score SMALLINT NOT NULL DEFAULT 0,
  health_score SMALLINT NOT NULL DEFAULT 0,
  career_score SMALLINT NOT NULL DEFAULT 0,
  overall_score SMALLINT NOT NULL DEFAULT 0,
  finance_detail JSONB DEFAULT '{}',
  productivity_detail JSONB DEFAULT '{}',
  health_detail JSONB DEFAULT '{}',
  career_detail JSONB DEFAULT '{}',
  calculated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only keep the latest score per user per day
CREATE UNIQUE INDEX IF NOT EXISTS life_scores_user_date ON public.life_scores(user_id, calculated_at);

ALTER TABLE public.life_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "life_scores_all" ON public.life_scores FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TABLE: user_goals
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'saving', 'habit', 'career', 'fitness', 'custom'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_value DECIMAL(15,2),
  current_value DECIMAL(15,2) DEFAULT 0,
  unit VARCHAR(50),               -- 'IDR', 'sessions', 'applications', '%'
  deadline DATE,
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "user_goals_all" ON public.user_goals FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TABLE: achievements
-- =============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  badge_icon VARCHAR(50),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "achievements_all" ON public.achievements FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TABLE: budgets
-- =============================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'yearly')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "budgets_all" ON public.budgets FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TABLE: weekly_reviews
-- =============================================
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "weekly_reviews_all" ON public.weekly_reviews FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- ALTER: transactions — add subscription flag
-- =============================================
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT FALSE;

-- =============================================
-- ALTER: reminders — add recurrence fields
-- =============================================
ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS recurrence VARCHAR(20) DEFAULT NULL CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'weekdays', 'custom')),
  ADD COLUMN IF NOT EXISTS recurrence_days INT[] DEFAULT NULL,  -- [1,2,3,4,5] = Mon-Fri
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE DEFAULT NULL;

-- =============================================
-- UPDATE: user_preferences — add module_features JSONB
-- =============================================
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS module_features JSONB DEFAULT '{}';

-- =============================================
-- INDEX: for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_career_applications_user ON public.career_applications(user_id, applied_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_task_logs_user_date ON public.daily_task_logs(user_id, completed_date DESC);
