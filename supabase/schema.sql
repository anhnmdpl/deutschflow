-- DeutschFlow: run in Supabase SQL Editor after reviewing.
-- Only logged-in users can access their own data.
create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.learning_progress enable row level security;
revoke all on table public.learning_progress from anon;
grant select, insert, update on table public.learning_progress to authenticated;
drop policy if exists "Read own learning progress" on public.learning_progress;
drop policy if exists "Insert own learning progress" on public.learning_progress;
drop policy if exists "Update own learning progress" on public.learning_progress;
create policy "Read own learning progress" on public.learning_progress
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own learning progress" on public.learning_progress
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own learning progress" on public.learning_progress
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
