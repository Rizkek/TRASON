-- ============================================================================
-- TRASON - Additive Investment Analyst Module
-- Adds only new tables, indexes, policies, and triggers.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.investment_positions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    asset_type              VARCHAR(20) NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'gold')),
    symbol                  VARCHAR(50) NOT NULL,
    display_name            VARCHAR(255),
    amount                  NUMERIC(20, 8) NOT NULL CHECK (amount > 0),
    buy_price               NUMERIC(20, 8) NOT NULL CHECK (buy_price > 0),
    buy_date                DATE NOT NULL DEFAULT CURRENT_DATE,
    quote_currency          VARCHAR(10) NOT NULL DEFAULT 'USD',
    price_source            VARCHAR(50) NOT NULL DEFAULT 'manual',
    external_id             VARCHAR(100),
    manual_current_price    NUMERIC(20, 8),
    last_price              NUMERIC(20, 8),
    last_price_change_pct   NUMERIC(10, 4),
    last_valued_at          TIMESTAMP WITH TIME ZONE,
    notes                   TEXT,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at              TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.investment_price_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    position_id         UUID NOT NULL REFERENCES public.investment_positions(id) ON DELETE CASCADE,
    snapshot_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    price               NUMERIC(20, 8) NOT NULL CHECK (price >= 0),
    change_percent      NUMERIC(10, 4),
    source              VARCHAR(50) NOT NULL DEFAULT 'manual',
    metadata            JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(position_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_investment_positions_user_id
  ON public.investment_positions(user_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_investment_positions_asset_type
  ON public.investment_positions(user_id, asset_type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_investment_price_snapshots_user_date
  ON public.investment_price_snapshots(user_id, snapshot_date DESC);

ALTER TABLE public.investment_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_price_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investment_positions_manage_own"
  ON public.investment_positions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "investment_snapshots_manage_own"
  ON public.investment_price_snapshots
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_investment_positions_timestamp
  BEFORE UPDATE ON public.investment_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
