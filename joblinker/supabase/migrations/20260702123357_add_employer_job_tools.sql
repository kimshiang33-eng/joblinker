-- Employer-only job duplication, extension and repost tools.

create or replace function private.employer_copy_job(target_job_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  copied_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;

  insert into public.jobs (
    company_id, created_by, title_en, title_ms, category, location, state,
    salary_min, salary_max, salary_unit, work_type, description_en, description_ms,
    requirements_en, requirements_ms, whatsapp, vacancies, urgent, listing_status, updated_at
  )
  select
    jobs.company_id, (select auth.uid()), jobs.title_en || ' (Copy)', jobs.title_ms || ' (Copy)',
    jobs.category, jobs.location, jobs.state, jobs.salary_min, jobs.salary_max, jobs.salary_unit,
    jobs.work_type, jobs.description_en, jobs.description_ms, jobs.requirements_en,
    jobs.requirements_ms, jobs.whatsapp, jobs.vacancies, false, 'active', now()
  from public.jobs
  join public.companies on companies.id = jobs.company_id
  where jobs.id = target_job_id
    and private.current_user_owns_company(jobs.company_id)
    and companies.account_status = 'active'
  returning id into copied_id;

  if copied_id is null then raise exception 'Job not found or unavailable'; end if;
  return copied_id;
end;
$$;

create or replace function private.employer_refresh_job(target_job_id uuid, action text)
returns public.jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_job public.jobs;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if action not in ('extend', 'repost') then raise exception 'Invalid action'; end if;

  update public.jobs
  set expires_at = greatest(coalesce(expires_at, now()), now()) + interval '30 days',
      listing_status = case when action = 'repost' then 'active' else listing_status end,
      review_status = case when action = 'repost' then 'pending' else review_status end,
      rejection_reason = case when action = 'repost' then null else rejection_reason end,
      updated_at = now()
  from public.companies
  where jobs.id = target_job_id
    and companies.id = jobs.company_id
    and private.current_user_owns_company(jobs.company_id)
    and companies.account_status = 'active'
    and jobs.moderation_status = 'active'
  returning jobs.* into updated_job;

  if updated_job.id is null then raise exception 'Job not found or unavailable'; end if;
  return updated_job;
end;
$$;

revoke all on function private.employer_copy_job(uuid) from public, anon, authenticated;
revoke all on function private.employer_refresh_job(uuid, text) from public, anon, authenticated;
grant execute on function private.employer_copy_job(uuid) to authenticated;
grant execute on function private.employer_refresh_job(uuid, text) to authenticated;

create or replace function public.employer_copy_job(target_job_id uuid)
returns uuid language sql security invoker set search_path = ''
as $$ select private.employer_copy_job(target_job_id); $$;

create or replace function public.employer_extend_job(target_job_id uuid)
returns public.jobs language sql security invoker set search_path = ''
as $$ select private.employer_refresh_job(target_job_id, 'extend'); $$;

create or replace function public.employer_repost_job(target_job_id uuid)
returns public.jobs language sql security invoker set search_path = ''
as $$ select private.employer_refresh_job(target_job_id, 'repost'); $$;

revoke all on function public.employer_copy_job(uuid) from public, anon;
revoke all on function public.employer_extend_job(uuid) from public, anon;
revoke all on function public.employer_repost_job(uuid) from public, anon;
grant execute on function public.employer_copy_job(uuid) to authenticated;
grant execute on function public.employer_extend_job(uuid) to authenticated;
grant execute on function public.employer_repost_job(uuid) to authenticated;

notify pgrst, 'reload schema';
