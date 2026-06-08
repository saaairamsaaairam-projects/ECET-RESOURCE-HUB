-- Create the public profiles table required by Supabase auth and app logic.
-- This also provides a compatibility view named user_profiles used by older migrations.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists updated_at timestamptz;

update public.profiles
set updated_at = coalesce(updated_at, created_at)
where updated_at is null;

create or replace view public.user_profiles as
select id, email, role, created_at, updated_at
from public.profiles;

alter table public.profiles enable row level security;

-- Allow users to read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Allow users to update their own profile.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow auth to create a profile row when a user signs up.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);
