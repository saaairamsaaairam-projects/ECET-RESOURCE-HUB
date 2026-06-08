create table if not exists ecet_cutoffs (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references colleges(id) on delete cascade,
  branch text not null,
  year int not null check (year between 2023 and 2030),
  closing_rank integer not null check (closing_rank > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ecet_cutoffs enable row level security;

drop policy if exists "admins_manage_ecet_cutoffs" on ecet_cutoffs;
create policy "admins_manage_ecet_cutoffs"
  on ecet_cutoffs for all
  using (exists (select 1 from admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.user_id = auth.uid()));

create index if not exists ecet_cutoffs_college_id_idx on ecet_cutoffs(college_id);
