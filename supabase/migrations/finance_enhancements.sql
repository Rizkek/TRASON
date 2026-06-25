-- Migration: Finance Enhancements (Life Decision Tracker)
-- Run this in Supabase Studio SQL Editor

-- 1. Create Goals Table
CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    target_amount numeric NOT NULL,
    target_date date,
    currency text DEFAULT 'USD'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    icon text,
    color text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

-- 2. Create Subscriptions Table
CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'USD'::text NOT NULL,
    billing_cycle text DEFAULT 'monthly'::text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly')),
    next_billing_date date NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- 3. Modify Transactions Table
ALTER TABLE public.transactions
ADD COLUMN goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL;
-- (Note: metadata JSONB column should already exist in transactions table. We will use it for decision_notes and expected_impact)

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_goal_id ON public.transactions(goal_id);
