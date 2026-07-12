drop function if exists public.claim_daily_tarot(jsonb);
drop function if exists public.claim_daily_tarot(jsonb, text);

create or replace function public.claim_daily_tarot(
  p_today_card jsonb,
  p_date_key text
)
returns table (
  id uuid,
  nickname text,
  coin_balance integer,
  last_sign_in_date text,
  today_card jsonb,
  daily_history jsonb,
  created_at timestamptz,
  already_claimed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  today_key text := trim(coalesce(p_date_key, ''));
  profile_row public.profiles%rowtype;
  was_already_claimed boolean := false;
begin
  perform set_config('lock_timeout', '3s', true);
  perform set_config('statement_timeout', '10s', true);

  if current_user_id is null then
    raise exception 'Please sign in first.';
  end if;

  if today_key !~ '^\d{4}-\d{2}-\d{2}$'
    or to_char(to_date(today_key, 'YYYY-MM-DD'), 'YYYY-MM-DD') <> today_key
  then
    raise exception 'Invalid local date.';
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
    was_already_claimed;
end;
$$;

revoke all on function public.claim_daily_tarot(jsonb, text) from public;
revoke all on function public.claim_daily_tarot(jsonb, text) from anon;
grant execute on function public.claim_daily_tarot(jsonb, text) to authenticated;
