-- ============================================================================
-- TRASON PWA — INSIGHTS PERSISTENCE MIGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.insights (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date                DATE NOT NULL DEFAULT CURRENT_DATE,
    type                VARCHAR(50) NOT NULL,
    category            VARCHAR(100),
    insight_text        TEXT NOT NULL,
    data                JSONB DEFAULT '{}'::jsonb,
    confidence_score    DECIMAL(3, 2) DEFAULT 1.00,
    is_actionable       BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Policy to allow CRUD operations for own insights only
CREATE POLICY "insight_all" ON public.insights FOR ALL USING (auth.uid() = user_id);
