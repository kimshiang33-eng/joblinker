create or replace function public.admin_set_job_featured(
  target_job_id uuid,
  make_featured boolean
)
returns public.jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_job public.jobs;
begin
  if not private.current_user_is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  update public.jobs
  set featured = make_featured,
      updated_at = now()
  where id = target_job_id
    and review_status = 'approved'
  returning * into updated_job;

  if updated_job.id is null then
    raise exception 'Only approved jobs can be featured' using errcode = '22023';
  end if;

  return updated_job;
end;
$$;

revoke all on function public.admin_set_job_featured(uuid, boolean) from public, anon;
grant execute on function public.admin_set_job_featured(uuid, boolean) to authenticated;
