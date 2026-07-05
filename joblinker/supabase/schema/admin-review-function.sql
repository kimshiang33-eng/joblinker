create or replace function public.admin_review_job(
  target_job_id uuid,
  new_status text,
  feedback text default null
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

  if new_status not in ('approved', 'rejected') then
    raise exception 'Invalid review status' using errcode = '22023';
  end if;

  if new_status = 'rejected' and nullif(trim(feedback), '') is null then
    raise exception 'Rejection feedback is required' using errcode = '22023';
  end if;

  update public.jobs
  set review_status = new_status,
      rejection_reason = case when new_status = 'rejected' then trim(feedback) else null end,
      published_at = case when new_status = 'approved' then coalesce(published_at, now()) else null end,
      featured = case when new_status = 'rejected' then false else featured end,
      updated_at = now()
  where id = target_job_id
  returning * into updated_job;

  if updated_job.id is null then
    raise exception 'Job not found' using errcode = 'P0002';
  end if;

  return updated_job;
end;
$$;

revoke all on function public.admin_review_job(uuid, text, text) from public, anon;
grant execute on function public.admin_review_job(uuid, text, text) to authenticated;
