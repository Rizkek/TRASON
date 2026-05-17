-- ============================================================================
-- TRASON PWA — UNIFIED SUPABASE SETUP (MASTER SCHEMA)
-- ============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY,           -- Matches auth.uid()
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

-- 2. USER PREFERENCES
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

-- 3. CATEGORIES
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

-- 4. TRANSACTIONS
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

-- 5. ACTIVITIES
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

-- 6. REMINDERS
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

-- 7. INVESTMENT POSITIONS
CREATE TABLE IF NOT EXISTS public.investment_positions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    asset_type              VARCHAR(20) NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'gold')),
    symbol                  VARCHAR(50) NOT NULL,
    display_name            VARCHAR(255),
    amount                  DECIMAL(20, 8) NOT NULL,
    buy_price               DECIMAL(20, 8) NOT NULL,
    buy_date                DATE,
    quote_currency          VARCHAR(10) DEFAULT 'USD',
    price_source            VARCHAR(50),
    external_id             VARCHAR(255),
    manual_current_price    DECIMAL(20, 8),
    last_price              DECIMAL(20, 8),
    last_price_change_pct   DECIMAL(10, 4),
    last_valued_at          TIMESTAMP WITH TIME ZONE,
    is_active               BOOLEAN DEFAULT TRUE,
    notes                   TEXT,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at              TIMESTAMP WITH TIME ZONE
);

-- 8. ACTIVITY LOGS (Centralized Logging)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action          VARCHAR(255) NOT NULL,
    resource_type   VARCHAR(100),
    resource_id     UUID,
    changes         JSONB,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES (Simplified & Unified)
-- ============================================================================

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs      ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Generator (Cleanup first)
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Policies
CREATE POLICY "user_all" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "pref_all" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "cat_all" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "txn_all" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "act_all" ON public.activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "rem_all" ON public.reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "inv_all" ON public.investment_positions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "log_all" ON public.activity_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- 1. Auth to Public.Users sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. User to Preferences sync
CREATE OR REPLACE FUNCTION public.handle_new_user_prefs()
RETURNS TRIGGER SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_prefs
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_prefs();
