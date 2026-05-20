-- Migration: 004_career_applications
-- Add career application tracker table

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- Core fields
  company_name text not null,
  role_title text not null,
  application_type text not null default 'job',
  -- values: 'job' | 'internship' | 'freelance'

  -- Status lifecycle
  status text not null default 'applied',
  -- values: 'applied' | 'reviewing' | 'interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn'

  -- Dates
  applied_date date not null default current_date,
  interview_date timestamptz,
  response_deadline date,

  -- Details
  location text,
  salary_range text,
  notes text,
  url text,
  priority text not null default 'medium',
  -- values: 'low' | 'medium' | 'high'

  tags text[],

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

-- Row Level Security
alter table public.career_applications enable row level security;

create policy "Users can manage their own career applications"
  on public.career_applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists idx_career_applications_user_id
  on public.career_applications(user_id);

create index if not exists idx_career_applications_user_status
  on public.career_applications(user_id, status)
  where deleted_at is null;

create index if not exists idx_career_applications_interview_date
  on public.career_applications(user_id, interview_date)
  where interview_date is not null and deleted_at is null;
