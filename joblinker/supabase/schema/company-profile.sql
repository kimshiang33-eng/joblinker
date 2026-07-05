create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  registration_number text,
  industry text,
  company_size text,
  website text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  description_en text,
  description_ms text,
  logo_path text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_one_per_owner unique (owner_id)
);

alter table public.companies enable row level security;

-- New Supabase projects do not necessarily expose tables to the Data API.
revoke all on table public.companies from anon;
grant select, insert, update on table public.companies to authenticated;

drop policy if exists "Employers can view their company" on public.companies;
create policy "Employers can view their company"
on public.companies
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Employers can create their company" on public.companies;
create policy "Employers can create their company"
on public.companies
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Employers can update their company" on public.companies;
create policy "Employers can update their company"
on public.companies
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
