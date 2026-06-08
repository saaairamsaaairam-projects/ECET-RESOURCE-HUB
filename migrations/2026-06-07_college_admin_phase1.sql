-- Phase 1: minimal Supabase schema for college CRUD validation

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text not null,
  district text not null,
  university text not null,
  naac_grade text not null default 'A',
  website text,
  description text,
  cover_image_url text,
  placements jsonb not null default '{"averagePackage":"₹0 LPA","highestPackage":"₹0 LPA","recruiters":[]}'::jsonb,
  fees jsonb not null default '{"tuition":"₹0 / year","hostel":"₹0 / year","transport":"₹0 / year","other":""}'::jsonb,
  student_insights jsonb not null default '{"codingCulture":"","attendance":"","placementReality":"","hostelReview":"","campusLife":"","studentLife":""}'::jsonb,
  branches text[] not null default '{}',
  autonomous boolean not null default false,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admins enable row level security;
alter table colleges enable row level security;

-- Make policies idempotent: drop if they already exist, then create
drop policy if exists "admins_select_own_record" on admins;
create policy "admins_select_own_record"
  on admins for select
  using (auth.uid() = user_id);

drop policy if exists "admins_insert_own_record" on admins;
create policy "admins_insert_own_record"
  on admins for insert
  with check (auth.uid() = user_id);

drop policy if exists "admins_update_own_record" on admins;
create policy "admins_update_own_record"
  on admins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "public_read_published_colleges" on colleges;
create policy "public_read_published_colleges"
  on colleges for select
  using (status = 'published');

drop policy if exists "admins_manage_colleges" on colleges;
create policy "admins_manage_colleges"
  on colleges for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));
