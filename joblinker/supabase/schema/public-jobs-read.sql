create or replace function public.get_public_jobs(
  target_job_id uuid default null
)
returns table (
  id uuid,
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
    and (target_job_id is null or jobs.id = target_job_id)
  order by jobs.featured desc, coalesce(jobs.published_at, jobs.created_at) desc;
$$;

revoke all on function public.get_public_jobs(uuid) from public, anon, authenticated;
grant execute on function public.get_public_jobs(uuid) to anon, authenticated;
