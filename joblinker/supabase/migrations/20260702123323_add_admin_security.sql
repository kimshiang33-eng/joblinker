create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select on table public.admin_users to authenticated;

drop policy if exists "Admins can verify their own access" on public.admin_users;
create policy "Admins can verify their own access"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

create or replace function private.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  );
$$;

revoke all on function private.current_user_is_admin() from public, anon;
grant execute on function private.current_user_is_admin() to authenticated;

drop policy if exists "Admins can view all jobs" on public.jobs;
create policy "Admins can view all jobs"
on public.jobs
for select
to authenticated
using (private.current_user_is_admin());

drop policy if exists "Admins can view all companies" on public.companies;
create policy "Admins can view all companies"
on public.companies
for select
to authenticated
using (private.current_user_is_admin());

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
