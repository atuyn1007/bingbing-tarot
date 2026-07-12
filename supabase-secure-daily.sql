alter table public.profiles
add column if not exists timezone_name text;

drop function if exists public.claim_daily_tarot(jsonb);

create or replace function public.claim_daily_tarot(
  p_today_card jsonb,
  p_timezone text
)
returns table (
  id uuid,
  nickname text,
  coin_balance integer,
  last_sign_in_date text,
  today_card jsonb,
  daily_history jsonb,
  created_at timestamptz,
  timezone_name text,
  already_claimed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  requested_timezone text := nullif(trim(coalesce(p_timezone, '')), '');
  effective_timezone text;
  today_key text;
  profile_row public.profiles%rowtype;
  was_already_claimed boolean := false;
begin
  perform set_config('lock_timeout', '3s', true);
  perform set_config('statement_timeout', '10s', true);

  if current_user_id is null then
    raise exception 'Please sign in first.';
  end if;

  if requested_timezone is null or not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = requested_timezone
  ) then
    raise exception 'Invalid timezone.';
  end if;

  if p_today_card is null
    or jsonb_typeof(p_today_card) <> 'object'
    or not (p_today_card ? 'id')
    or not (p_today_card ? 'name')
    or not (p_today_card ? 'isReversed')
    or octet_length(p_today_card::text) > 4096
  then
    raise exception 'Invalid daily tarot card.';
  end if;

  select p.*
  into profile_row
  from public.profiles p
  where p.id = current_user_id
  for update;

  if not found then
    raise exception 'Profile not found.';
  end if;

  effective_timezone := coalesce(profile_row.timezone_name, requested_timezone);
  today_key := ((now() at time zone effective_timezone)::date)::text;

  if profile_row.timezone_name is null then
    update public.profiles p
    set timezone_name = effective_timezone
    where p.id = current_user_id
    returning p.* into profile_row;
  end if;

  was_already_claimed := profile_row.last_sign_in_date = today_key;

  if not was_already_claimed then
    update public.profiles p
    set
      last_sign_in_date = today_key,
      today_card = p_today_card,
      daily_history = coalesce(p.daily_history, '{}'::jsonb)
        || jsonb_build_object(today_key, p_today_card),
      coin_balance = p.coin_balance + 1
    where p.id = current_user_id
    returning p.* into profile_row;
  end if;

  return query
  select
    profile_row.id,
    profile_row.nickname,
    profile_row.coin_balance,
    profile_row.last_sign_in_date,
    profile_row.today_card,
    profile_row.daily_history,
    profile_row.created_at,
    profile_row.timezone_name,
    was_already_claimed;
end;
$$;

revoke all on function public.claim_daily_tarot(jsonb, text) from public;
revoke all on function public.claim_daily_tarot(jsonb, text) from anon;
grant execute on function public.claim_daily_tarot(jsonb, text) to authenticated;
