-- ============================================================================
-- TRASON PWA — FINAL SUPABASE SETUP (SINGLE FILE, COMPLETE)
-- ============================================================================
-- Jalankan SELURUH file ini di Supabase SQL Editor (satu kali)
-- Sudah menggantikan: SUPABASE_SETUP_CLEAN.sql, SUPABASE_FIX_AUTH_USERS.sql,
--                     SUPABASE_COMPLETE_SETUP.sql
-- ============================================================================

-- ============================================================================
-- STEP 0: CLEANUP (aman dijalankan berulang karena pakai IF EXISTS)
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created          ON auth.users   CASCADE;
DROP TRIGGER IF EXISTS create_preferences_on_user_create ON public.users CASCADE;
DROP TRIGGER IF EXISTS update_users_timestamp         ON public.users CASCADE;
DROP TRIGGER IF EXISTS update_user_preferences_timestamp ON public.user_preferences CASCADE;
DROP TRIGGER IF EXISTS update_categories_timestamp    ON public.categories CASCADE;
DROP TRIGGER IF EXISTS update_transactions_timestamp  ON public.transactions CASCADE;
DROP TRIGGER IF EXISTS update_activities_timestamp    ON public.activities CASCADE;
DROP TRIGGER IF EXISTS update_reminders_timestamp     ON public.reminders CASCADE;
DROP TRIGGER IF EXISTS update_insights_timestamp      ON public.insights CASCADE;
DROP TRIGGER IF EXISTS update_push_subscriptions_timestamp ON public.push_subscriptions CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user()             CASCADE;
DROP FUNCTION IF EXISTS public.create_user_preferences()     CASCADE;
DROP FUNCTION IF EXISTS public.update_timestamp()            CASCADE;
DROP FUNCTION IF EXISTS public.get_transaction_analytics(UUID, DATE, DATE) CASCADE;

DROP VIEW IF EXISTS public.user_transaction_summary CASCADE;
DROP VIEW IF EXISTS public.active_reminders         CASCADE;

-- ============================================================================
-- STEP 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: TABEL
-- CATATAN: users.id HARUS sama dengan auth.uid() — tidak pakai gen_random_uuid()
--          karena Supabase Auth yang generate UUID-nya.
-- ============================================================================

-- Users Table
-- Sengaja tidak ada DEFAULT di id — id diisi dari auth.uid() lewat trigger
CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY,           -- diisi dari auth.uid()
    email           VARCHAR(255) UNIQUE NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    avatar_url      VARCHAR(500),
    email_verified  BOOLEAN DEFAULT FALSE,
    phone           VARCHAR(20),
    bio             TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    theme                       VARCHAR(50) DEFAULT 'light',
    language                    VARCHAR(10) DEFAULT 'en',
    currency                    VARCHAR(3)  DEFAULT 'USD',
    timezone                    VARCHAR(50) DEFAULT 'UTC',
    notifications_enabled       BOOLEAN DEFAULT TRUE,
    push_notifications_enabled  BOOLEAN DEFAULT TRUE,
    email_digest_enabled        BOOLEAN DEFAULT TRUE,
    digest_frequency            VARCHAR(50) DEFAULT 'weekly',
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    icon        VARCHAR(50),
    color       VARCHAR(7),
    type        VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    is_default  BOOLEAN DEFAULT FALSE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at  TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, name)
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    amount              DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    type                VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    date                DATE NOT NULL,
    time                TIME,
    payment_method      VARCHAR(50),
    receipt_image_url   VARCHAR(500),
    tags                TEXT[],
    metadata            JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at          TIMESTAMP WITH TIME ZONE
);

-- Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    category            VARCHAR(100),
    start_time          TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time            TIMESTAMP WITH TIME ZONE,
    duration_minutes    INTEGER,
    mood                VARCHAR(50),
    rating              INTEGER CHECK (rating >= 1 AND rating <= 5),
    location            VARCHAR(255),
    participants        TEXT[],
    tags                TEXT[],
    image_urls          VARCHAR(500)[],
    metadata            JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at          TIMESTAMP WITH TIME ZONE
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title                   VARCHAR(255) NOT NULL,
    description             TEXT,
    due_date                DATE,
    due_time                TIME,
    due_datetime            TIMESTAMP WITH TIME ZONE,
    category                VARCHAR(100),
    priority                VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status                  VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    is_recurring            BOOLEAN DEFAULT FALSE,
    recurrence_pattern      VARCHAR(50),
    recurrence_custom_rule  VARCHAR(500),
    recurrence_end_date     DATE,
    recurrence_occurrences  INTEGER,
    notify_days_before      INTEGER DEFAULT 1,
    notify_hours_before     INTEGER,
    notify_times            INTEGER[],
    tags                    TEXT[],
    metadata                JSONB DEFAULT '{}'::jsonb,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at              TIMESTAMP WITH TIME ZONE
);

-- Insights Table
CREATE TABLE IF NOT EXISTS public.insights (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date                DATE NOT NULL,
    type                VARCHAR(100),
    category            VARCHAR(100),
    insight_text        TEXT NOT NULL,
    data                JSONB,
    confidence_score    NUMERIC(3, 2),
    is_actionable       BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint    VARCHAR(500) NOT NULL UNIQUE,
    p256dh      VARCHAR(500) NOT NULL,
    auth        VARCHAR(500) NOT NULL,
    user_agent  VARCHAR(500),
    is_active   BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action          VARCHAR(100) NOT NULL,
    resource_type   VARCHAR(100),
    resource_id     UUID,
    changes         JSONB,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email          ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at     ON public.users(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id   ON public.user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_categories_user_id   ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type      ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_deleted   ON public.categories(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cat_id  ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type    ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_deleted ON public.transactions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_activities_user_id   ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_start     ON public.activities(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_activities_deleted   ON public.activities(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reminders_user_id    ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due        ON public.reminders(due_datetime);
CREATE INDEX IF NOT EXISTS idx_reminders_status     ON public.reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_deleted    ON public.reminders(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_insights_user_id     ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_date        ON public.insights(date DESC);

CREATE INDEX IF NOT EXISTS idx_push_subs_user_id    ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user   ON public.activity_logs(user_id, created_at DESC);

-- ============================================================================
-- STEP 4: ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs      ENABLE ROW LEVEL SECURITY;

-- Drop semua policy lama sebelum buat ulang (idempotent)
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- users: SELECT, INSERT, UPDATE (INSERT wajib ada agar user baru bisa buat row)
CREATE POLICY "users_select_own"  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own"  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own"  ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- user_preferences: full access milik sendiri
CREATE POLICY "prefs_manage_own"  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- categories
CREATE POLICY "cats_manage_own"   ON public.categories FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- transactions
CREATE POLICY "txn_manage_own"    ON public.transactions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- activities
CREATE POLICY "act_manage_own"    ON public.activities FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- reminders
CREATE POLICY "rem_manage_own"    ON public.reminders FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- insights
CREATE POLICY "ins_manage_own"    ON public.insights FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- push_subscriptions
CREATE POLICY "push_manage_own"   ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- activity_logs: read only
CREATE POLICY "logs_select_own"   ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own"   ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: FUNCTIONS & TRIGGERS
-- ============================================================================

-- 5a. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_user_preferences_timestamp
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_categories_timestamp
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_transactions_timestamp
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_activities_timestamp
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_reminders_timestamp
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_insights_timestamp
  BEFORE UPDATE ON public.insights
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_push_subscriptions_timestamp
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- 5b. Auto-create public.users row ketika auth user baru dibuat
--     Trigger ini di auth.users sehingga user baru langsung punya row
--     tanpa perlu client insert manual. Ini menghilangkan PGRST116 sepenuhnya.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, email_verified, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- aman jika dipanggil dua kali
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5c. Auto-create user_preferences setelah row users dibuat
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_preferences (
    user_id, theme, language, currency, timezone,
    notifications_enabled, push_notifications_enabled,
    email_digest_enabled, digest_frequency,
    created_at, updated_at
  )
  VALUES (
    NEW.id, 'light', 'en', 'USD', 'UTC',
    TRUE, TRUE, TRUE, 'weekly',
    NOW(), NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_preferences_on_user_create
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_preferences();

-- 5d. RPC: get_transaction_analytics (dipakai di queries.ts)
CREATE OR REPLACE FUNCTION public.get_transaction_analytics(
  p_user_id   UUID,
  p_start_date DATE,
  p_end_date   DATE
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_income',   COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0),
    'total_expense',  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
    'net',            COALESCE(SUM(CASE WHEN type = 'income'  THEN amount
                                        WHEN type = 'expense' THEN -amount ELSE 0 END), 0),
    'transaction_count', COUNT(*)
  )
  INTO result
  FROM public.transactions
  WHERE user_id    = p_user_id
    AND date      >= p_start_date
    AND date      <= p_end_date
    AND deleted_at IS NULL;

  RETURN result;
END;
$$;

-- ============================================================================
-- STEP 6: VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW public.user_transaction_summary AS
SELECT
    t.user_id,
    DATE(t.date)   AS trans_date,
    t.type,
    c.name         AS category_name,
    COUNT(*)       AS transaction_count,
    SUM(t.amount)  AS total_amount,
    AVG(t.amount)  AS avg_amount,
    MIN(t.amount)  AS min_amount,
    MAX(t.amount)  AS max_amount
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
WHERE t.deleted_at IS NULL
GROUP BY t.user_id, DATE(t.date), t.type, c.name;

CREATE OR REPLACE VIEW public.active_reminders AS
SELECT
    id, user_id, title, description, due_datetime,
    priority, status, category,
    CASE
        WHEN due_datetime IS NOT NULL
        THEN EXTRACT(EPOCH FROM (due_datetime - NOW())) / 3600
        ELSE NULL
    END AS hours_until_due
FROM public.reminders
WHERE deleted_at IS NULL
  AND status = 'pending'
  AND (due_datetime IS NULL OR due_datetime >= NOW() - INTERVAL '1 day');

-- ============================================================================
-- STEP 7: VERIFIKASI
-- ============================================================================

-- Cek semua tabel
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Cek semua RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Cek triggers (termasuk trigger di auth.users)
SELECT trigger_schema, trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- ✅ SELESAI! Semua tabel, index, RLS, trigger, dan view sudah dibuat.
-- Tiga file SQL lama (SUPABASE_SETUP_CLEAN, SUPABASE_FIX_AUTH_USERS,
-- SUPABASE_COMPLETE_SETUP) bisa dihapus.
-- ============================================================================
