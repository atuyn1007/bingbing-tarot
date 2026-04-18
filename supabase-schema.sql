create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null unique,
  coin_balance integer not null default 0,
  last_sign_in_date text,
  today_card jsonb,
  daily_history jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  user_nickname text not null,
  teacher_nickname text not null default '饼饼大人',
  spread_key text not null,
  spread_name text not null,
  question text not null,
  cards jsonb not null,
  status text not null default 'pending',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tarot_history (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  card_name text not null,
  is_upright boolean not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.tarot_history enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "requests_select_own" on public.requests;
create policy "requests_select_own"
on public.requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "requests_insert_own" on public.requests;
create policy "requests_insert_own"
on public.requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "requests_update_own" on public.requests;
create policy "requests_update_own"
on public.requests
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tarot_history_select_own" on public.tarot_history;
create policy "tarot_history_select_own"
on public.tarot_history
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "tarot_history_insert_own" on public.tarot_history;
create policy "tarot_history_insert_own"
on public.tarot_history
for insert
to authenticated
with check (auth.uid() = user_id);
