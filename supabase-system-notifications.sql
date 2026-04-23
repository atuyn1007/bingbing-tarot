create extension if not exists pgcrypto;

create table if not exists public.system_notifications (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid not null
    references public.profiles (id)
    on delete cascade,
  title text not null default '测试补贴',
  body text not null,
  reward_coins integer not null default 99
    check (reward_coins >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'claimed')),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists system_notifications_receiver_id_idx
  on public.system_notifications (receiver_id);

create index if not exists system_notifications_status_idx
  on public.system_notifications (status);

create index if not exists system_notifications_created_at_idx
  on public.system_notifications (created_at desc);

alter table public.system_notifications enable row level security;

drop policy if exists "system_notifications_select_own" on public.system_notifications;
drop policy if exists "system_notifications_update_own" on public.system_notifications;
drop policy if exists "system_notifications_admin_all" on public.system_notifications;

create policy "system_notifications_select_own"
on public.system_notifications
for select
to authenticated
using (auth.uid() = receiver_id);

create policy "system_notifications_update_own"
on public.system_notifications
for update
to authenticated
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

create policy "system_notifications_admin_all"
on public.system_notifications
for all
to authenticated
using (auth.uid() = '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8')
with check (auth.uid() = '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8');

update public.system_notifications
set
  title = '测试补贴',
  body = '感谢您的注册与使用！因为你对饼饼的大力支持所以才有这个网站的今天~请查收随邮件附上的99饼币~ by爱你的饼饼'
where reward_coins = 99
  and receiver_id <> '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8';

insert into public.system_notifications (receiver_id, title, body, reward_coins)
select
  id,
  '测试补贴',
  '感谢您的注册与使用！因为你对饼饼的大力支持所以才有这个网站的今天~请查收随邮件附上的99饼币~ by爱你的饼饼',
  99
from public.profiles
where created_at < timestamptz '2026-04-24 00:00:00+08'
  and id <> '3fe35aa6-405d-4f6e-b7fe-2fb9b5aa66d8'
  and not exists (
    select 1
    from public.system_notifications existing
    where existing.receiver_id = public.profiles.id
      and existing.reward_coins = 99
  );
