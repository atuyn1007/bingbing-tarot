create extension if not exists pgcrypto;

create table if not exists public.redeem_codes (
  code text primary key,
  reward_coins integer not null check (reward_coins >= 0),
  is_active boolean not null default true,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redeemed_count integer not null default 0 check (redeemed_count >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.redeem_code_claims (
  id uuid primary key default gen_random_uuid(),
  redeem_code text not null references public.redeem_codes (code) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reward_coins integer not null check (reward_coins >= 0),
  created_at timestamptz not null default now(),
  unique (redeem_code, user_id)
);

create index if not exists redeem_code_claims_user_id_idx
  on public.redeem_code_claims (user_id);

alter table public.redeem_codes enable row level security;
alter table public.redeem_code_claims enable row level security;

drop policy if exists "redeem_code_claims_select_own" on public.redeem_code_claims;
create policy "redeem_code_claims_select_own"
on public.redeem_code_claims
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "redeem_codes_admin_all" on public.redeem_codes;
create policy "redeem_codes_admin_all"
on public.redeem_codes
for all
to authenticated
using (auth.uid() = '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8')
with check (auth.uid() = '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8');

drop policy if exists "redeem_code_claims_admin_all" on public.redeem_code_claims;
create policy "redeem_code_claims_admin_all"
on public.redeem_code_claims
for all
to authenticated
using (auth.uid() = '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8')
with check (auth.uid() = '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8');

create or replace function public.redeem_coin_code(p_code text)
returns table (
  code text,
  reward_coins integer,
  new_coin_balance integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text := upper(trim(coalesce(p_code, '')));
  current_user_id uuid := auth.uid();
  code_row public.redeem_codes%rowtype;
  profile_row public.profiles%rowtype;
begin
  perform set_config('lock_timeout', '3s', true);
  perform set_config('statement_timeout', '10s', true);

  if current_user_id is null then
    raise exception 'Please sign in first.';
  end if;

  if normalized_code = '' then
    raise exception 'Please enter a redeem code.';
  end if;

  select *
  into code_row
  from public.redeem_codes
  where code = normalized_code
  for update;

  if not found or not code_row.is_active then
    raise exception 'This redeem code is invalid.';
  end if;

  if code_row.expires_at is not null and code_row.expires_at <= now() then
    raise exception 'This redeem code has expired.';
  end if;

  if code_row.max_redemptions is not null and code_row.redeemed_count >= code_row.max_redemptions then
    raise exception 'This redeem code has reached its limit.';
  end if;

  if exists (
    select 1
    from public.redeem_code_claims
    where redeem_code = normalized_code
      and user_id = current_user_id
  ) then
    raise exception 'You have already used this redeem code.';
  end if;

  select *
  into profile_row
  from public.profiles
  where id = current_user_id
  for update;

  if not found then
    raise exception 'Profile not found.';
  end if;

  insert into public.redeem_code_claims (redeem_code, user_id, reward_coins)
  values (normalized_code, current_user_id, code_row.reward_coins);

  update public.redeem_codes
  set redeemed_count = redeemed_count + 1
  where code = normalized_code;

  update public.profiles
  set coin_balance = coalesce(coin_balance, 0) + code_row.reward_coins
  where id = current_user_id
  returning * into profile_row;

  return query
  select normalized_code, code_row.reward_coins, profile_row.coin_balance;
end;
$$;

grant execute on function public.redeem_coin_code(text) to authenticated;

insert into public.redeem_codes (code, reward_coins, is_active, max_redemptions)
values ('BINGBING500', 500, true, null)
on conflict (code) do update
set reward_coins = excluded.reward_coins,
    is_active = excluded.is_active,
    max_redemptions = excluded.max_redemptions;
