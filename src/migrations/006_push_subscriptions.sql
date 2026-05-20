-- Migration: 006_push_subscriptions
-- Create a table to store web push subscriptions for users

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Push subscription data
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  
  -- Metadata
  user_agent text,
  is_active boolean default true not null,
  last_used_at timestamptz default now() not null,
  
  -- Standard timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Row Level Security
alter table public.push_subscriptions enable row level security;

create policy "Users can manage their own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions(user_id);

create index if not exists idx_push_subscriptions_is_active
  on public.push_subscriptions(is_active)
  where is_active = true;
