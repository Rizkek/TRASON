-- Migration: Create Weekly Templates System
-- Date: 2025-05-13
-- Purpose: Support template-based weekly schedules

-- 1. Create weekly_templates table
CREATE TABLE IF NOT EXISTS weekly_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Template info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Validity
  start_date DATE,
  end_date DATE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Create template_activities table
CREATE TABLE IF NOT EXISTS template_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_template_id UUID NOT NULL,
  
  -- Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Timing
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  
  -- Activity info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  mood VARCHAR(50),
  location VARCHAR(255),
  rating DECIMAL(2,1),
  
  -- Options
  allow_override BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (weekly_template_id) REFERENCES weekly_templates(id) ON DELETE CASCADE
);

-- 3. Create template_overrides table
CREATE TABLE IF NOT EXISTS template_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  weekly_template_id UUID NOT NULL,
  
  -- Week info
  week_start_date DATE NOT NULL,
  
  -- Changes
  removed_activity_ids UUID[] DEFAULT ARRAY[]::UUID[],
  added_activities JSONB,
  modified_activities JSONB,
  
  -- Info
  reason VARCHAR(255),
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (weekly_template_id) REFERENCES weekly_templates(id) ON DELETE CASCADE,
  UNIQUE(user_id, weekly_template_id, week_start_date)
);

-- 4. Extend reminders table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS linked_template_activity_id UUID;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS is_recurring_weekly BOOLEAN DEFAULT FALSE;
ALTER TABLE reminders ADD CONSTRAINT fk_linked_template_activity
  FOREIGN KEY (linked_template_activity_id) REFERENCES template_activities(id) ON DELETE SET NULL;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_templates_user_id ON weekly_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_templates_is_active ON weekly_templates(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_templates_is_default ON weekly_templates(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_template_activities_template_id ON template_activities(weekly_template_id);
CREATE INDEX IF NOT EXISTS idx_template_activities_day ON template_activities(weekly_template_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_template_overrides_user_week ON template_overrides(user_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_template_overrides_template ON template_overrides(weekly_template_id);
CREATE INDEX IF NOT EXISTS idx_reminders_linked_template ON reminders(linked_template_activity_id);

-- 6. Grant permissions (if using Supabase)
ALTER TABLE weekly_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_overrides ENABLE ROW LEVEL SECURITY;

-- Policies for weekly_templates
CREATE POLICY "Users can view own templates"
  ON weekly_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create templates"
  ON weekly_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON weekly_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON weekly_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for template_activities (inherit from templates)
CREATE POLICY "Users can view template activities"
  ON template_activities FOR SELECT
  USING (
    weekly_template_id IN (
      SELECT id FROM weekly_templates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage template activities"
  ON template_activities FOR INSERT
  WITH CHECK (
    weekly_template_id IN (
      SELECT id FROM weekly_templates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update template activities"
  ON template_activities FOR UPDATE
  USING (
    weekly_template_id IN (
      SELECT id FROM weekly_templates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete template activities"
  ON template_activities FOR DELETE
  USING (
    weekly_template_id IN (
      SELECT id FROM weekly_templates WHERE user_id = auth.uid()
    )
  );

-- Policies for template_overrides
CREATE POLICY "Users can view own overrides"
  ON template_overrides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create overrides"
  ON template_overrides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own overrides"
  ON template_overrides FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own overrides"
  ON template_overrides FOR DELETE
  USING (auth.uid() = user_id);
