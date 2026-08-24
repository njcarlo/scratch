-- Gabay — Phase 1 schema
--
-- Run this against a Supabase (Postgres) project, then set
-- NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in your
-- environment (see SETUP.md). Until you do, the app runs in Demo Mode on
-- device-local storage instead — this file is never required to develop
-- or evaluate the app end-to-end.
--
-- Design notes:
--  * One row per user per table, scoped by `user_id = auth.uid()`. Row
--    level security means a user can only ever see or write their own
--    rows — the API layer additionally always filters by user_id (see
--    src/lib/data/supabase-repository.ts) so this is defense in depth,
--    not the only guard.
--  * `profiles.id` IS the Supabase auth user id (1:1 with auth.users),
--    matching Supabase's usual pattern.
--  * Full Section 28 table list (labs, medication_logs, ai_conversations,
--    community_*, healthcare_providers, education_articles, notifications,
--    consents, audit_logs, etc.) is intentionally NOT created yet — those
--    are Phase 2/3 surfaces with no UI reading/writing them today. Adding
--    them is additive (new migration files) and won't require touching
--    this one.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  language text not null default 'en' check (language in ('en', 'tl-en')),
  pcos_status text check (pcos_status in ('diagnosed','suspected','evaluating','not_sure','learning')),
  age_range text check (age_range in ('18-24','25-30','31-35','36-40','41-45','46+')),
  goals text[] not null default '{}',
  display_name text,
  last_period_start date,
  typical_cycle_length_days int,
  typical_bleeding_days int,
  cycle_regularity text check (cycle_regularity in ('regular','irregular','unknown')),
  height_cm numeric,
  activity_level text check (activity_level in ('sedentary','light','moderate','active','unknown')),
  track_weight boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner read" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: owner insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles: owner update" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles: owner delete" on public.profiles
  for delete using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- cycle_logs (period_entries)
-- ---------------------------------------------------------------------------
create table if not exists public.cycle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  type text not null check (type in ('period_start','period_end','spotting')),
  flow text check (flow in ('light','medium','heavy')),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists cycle_logs_user_date_idx on public.cycle_logs (user_id, date);

alter table public.cycle_logs enable row level security;
create policy "cycle_logs: owner all" on public.cycle_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- symptom_logs (one row per user per day)
-- ---------------------------------------------------------------------------
create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  symptoms jsonb not null default '[]', -- [{ key, severity }]
  custom_symptoms jsonb, -- [{ label, severity }]
  mood int check (mood between 1 and 5),
  sleep_hours numeric,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists symptom_logs_user_date_idx on public.symptom_logs (user_id, date);

alter table public.symptom_logs enable row level security;
create policy "symptom_logs: owner all" on public.symptom_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- food_logs
-- ---------------------------------------------------------------------------
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  time text not null, -- HH:mm
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  items jsonb not null default '[]', -- [{ foodId?, customName?, portion? }]
  note text,
  created_at timestamptz not null default now()
);
create index if not exists food_logs_user_date_idx on public.food_logs (user_id, date);

alter table public.food_logs enable row level security;
create policy "food_logs: owner all" on public.food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- weight_logs
-- ---------------------------------------------------------------------------
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  kg numeric not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists weight_logs_user_date_idx on public.weight_logs (user_id, date);

alter table public.weight_logs enable row level security;
create policy "weight_logs: owner all" on public.weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- medications (medications + supplements, per Section 13)
-- ---------------------------------------------------------------------------
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('medication','supplement')),
  dosage text,
  frequency text,
  prescribed_by text,
  started_at date,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists medications_user_idx on public.medications (user_id);

alter table public.medications enable row level security;
create policy "medications: owner all" on public.medications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
