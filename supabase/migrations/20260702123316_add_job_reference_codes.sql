create schema if not exists private;
revoke all on schema private from public;

create sequence if not exists private.job_reference_seq
  start with 1001
  increment by 1
  minvalue 1001;

alter table public.jobs
  add column if not exists reference_code text;

update public.jobs
set reference_code = 'JL-' || nextval('private.job_reference_seq')::text
where reference_code is null;

alter table public.jobs
  alter column reference_code set not null;

create unique index if not exists jobs_reference_code_key
  on public.jobs (reference_code);

create or replace function private.assign_job_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reference_code is null then
    new.reference_code := 'JL-' || nextval('private.job_reference_seq')::text;
  end if;
  return new;
end;
$$;

revoke all on function private.assign_job_reference() from public, anon, authenticated;

drop trigger if exists jobs_assign_reference on public.jobs;
create trigger jobs_assign_reference
before insert on public.jobs
for each row
execute function private.assign_job_reference();

drop function if exists public.get_public_jobs(uuid);
drop function if exists public.get_public_jobs(text);

create function public.get_public_jobs(
  target_job_reference text default null
)
returns table (
  id uuid,
  reference_code text,
  company_id uuid,
  company_name text,
  company_logo_path text,
  company_verification_status text,
  title_en text,
  title_ms text,
  category text,
  location text,
  state text,
  salary_min integer,
  salary_max integer,
  salary_unit text,
  work_type text,
  description_en text,
  description_ms text,
  requirements_en text,
  requirements_ms text,
  whatsapp text,
  vacancies integer,
  urgent boolean,
  featured boolean,
  published_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    jobs.id,
    jobs.reference_code,
    jobs.company_id,
    companies.name,
    companies.logo_path,
    companies.verification_status,
    jobs.title_en,
    jobs.title_ms,
    jobs.category,
    jobs.location,
    jobs.state,
    jobs.salary_min,
    jobs.salary_max,
    jobs.salary_unit,
    jobs.work_type,
    jobs.description_en,
    jobs.description_ms,
    jobs.requirements_en,
    jobs.requirements_ms,
    jobs.whatsapp,
    jobs.vacancies,
    jobs.urgent,
    jobs.featured,
    jobs.published_at,
    jobs.created_at
  from public.jobs
  join public.companies on companies.id = jobs.company_id
  where jobs.review_status = 'approved'
    and jobs.listing_status = 'active'
    and (
      target_job_reference is null
      or lower(jobs.reference_code) = lower(target_job_reference)
      or jobs.id::text = target_job_reference
    )
  order by jobs.featured desc, coalesce(jobs.published_at, jobs.created_at) desc;
$$;

revoke all on function public.get_public_jobs(text) from public, anon, authenticated;
grant execute on function public.get_public_jobs(text) to anon, authenticated;
