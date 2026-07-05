create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title_en text not null,
  title_ms text not null,
  category text not null,
  location text not null,
  state text not null,
  salary_min integer not null check (salary_min >= 0),
  salary_max integer not null check (salary_max >= salary_min),
  salary_unit text not null check (salary_unit in ('month', 'day', 'hour')),
  work_type text not null check (work_type in ('full-time', 'part-time', 'contract')),
  description_en text not null,
  description_ms text not null,
  requirements_en text not null,
  requirements_ms text not null,
  whatsapp text not null,
  vacancies integer not null default 1 check (vacancies > 0),
  urgent boolean not null default false,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected')),
  listing_status text not null default 'active'
    check (listing_status in ('active', 'paused', 'closed')),
  featured boolean not null default false,
  views bigint not null default 0 check (views >= 0),
  whatsapp_clicks bigint not null default 0 check (whatsapp_clicks >= 0),
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_company_id_idx on public.jobs (company_id);
create index if not exists jobs_review_listing_idx on public.jobs (review_status, listing_status);

alter table public.jobs enable row level security;

revoke all on table public.jobs from anon, authenticated;
grant select, delete on table public.jobs to authenticated;

grant insert (
  company_id,
  created_by,
  title_en,
  title_ms,
  category,
  location,
  state,
  salary_min,
  salary_max,
  salary_unit,
  work_type,
  description_en,
  description_ms,
  requirements_en,
  requirements_ms,
  whatsapp,
  vacancies,
  urgent,
  listing_status,
  updated_at
) on table public.jobs to authenticated;

grant update (
  title_en,
  title_ms,
  category,
  location,
  state,
  salary_min,
  salary_max,
  salary_unit,
  work_type,
  description_en,
  description_ms,
  requirements_en,
  requirements_ms,
  whatsapp,
  vacancies,
  urgent,
  listing_status,
  updated_at
) on table public.jobs to authenticated;

drop policy if exists "Employers can view their jobs" on public.jobs;
create policy "Employers can view their jobs"
on public.jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = (select auth.uid())
  )
);

drop policy if exists "Employers can create jobs for their company" on public.jobs;
create policy "Employers can create jobs for their company"
on public.jobs
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = (select auth.uid())
  )
);

drop policy if exists "Employers can update their jobs" on public.jobs;
create policy "Employers can update their jobs"
on public.jobs
for update
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = (select auth.uid())
  )
);

drop policy if exists "Employers can delete their jobs" on public.jobs;
create policy "Employers can delete their jobs"
on public.jobs
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = (select auth.uid())
  )
);
