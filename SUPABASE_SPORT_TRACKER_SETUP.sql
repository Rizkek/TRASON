-- ============================================================================
-- TRASON PWA - SPORT TRACKER MODULE SETUP
-- ============================================================================

-- Sport Logs Table
CREATE TABLE IF NOT EXISTS sport_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'run', 'lift', 'cycle', 'swim'
    duration_seconds INTEGER,
    reps INTEGER,
    sets INTEGER,
    weight_kg DECIMAL(10, 2),
    distance_meters DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sport_logs_user_id ON sport_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_logs_activity_id ON sport_logs(activity_id);
CREATE INDEX IF NOT EXISTS idx_sport_logs_type ON sport_logs(type);

-- RLS
ALTER TABLE sport_logs ENABLE ROW LEVEL SECURITY;

-- Only create policy if it doesn't exist (standard Supabase pattern doesn't have IF NOT EXISTS for policies, 
-- but we can use a DO block or just assume clean slate if we're careful)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sport_logs' AND policyname = 'Users can manage own sport logs'
    ) THEN
        CREATE POLICY "Users can manage own sport logs" ON sport_logs 
        FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- Trigger for updated_at
-- Note: update_timestamp() function is already created in SUPABASE_SETUP_CLEAN.sql
CREATE TRIGGER update_sport_logs_timestamp 
BEFORE UPDATE ON sport_logs 
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
