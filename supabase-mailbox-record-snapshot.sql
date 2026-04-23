alter table public.messages
add column if not exists record_snapshot jsonb;
