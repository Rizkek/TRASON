CREATE TABLE IF NOT EXISTS interview_journal (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id  UUID REFERENCES career_applications(id) ON DELETE SET NULL,  -- nullable
  company_name    TEXT NOT NULL,       -- denormalized untuk standalone entries
  role_title      TEXT NOT NULL,
  interview_date  DATE NOT NULL,
  questions       TEXT,               -- pertanyaan yang ditanyakan interviewer
  difficulty      TEXT CHECK (difficulty IN ('easy','medium','hard')),
  outcome         TEXT CHECK (outcome IN ('pass','fail','pending','unknown')),
  lessons_learned TEXT,               -- pelajaran dari interview ini
  notes           TEXT,               -- catatan bebas
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE interview_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal" ON interview_journal
  FOR ALL USING (auth.uid() = user_id);
