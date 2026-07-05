-- JobLinker production moderation: takedowns, employer suspension, expiry,
-- audit history, and employer dashboard notifications.

alter table public.companies
  add column if not exists account_status text not null default 'active'
    check (account_status in ('active', 'suspended')),
  add column if not exists suspension_reason text;

alter table public.jobs
  add column if not exists moderation_status text not null default 'active'
    check (moderation_status in ('active', 'suspended')),
  add column if not exists moderation_reason text,
  add column if not exists expires_at timestamptz;

update public.jobs
set expires_at = coalesce(published_at, created_at) + interval '30 days'
where review_status = 'approved' and expires_at is null;

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  target_type text not null check (target_type in ('job', 'company')),
  target_id uuid not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;
revoke all on table public.admin_audit_log from anon, authenticated;
grant select on table public.admin_audit_log to authenticated;

drop policy if exists "Admins can view audit history" on public.admin_audit_log;
create policy "Admins can view audit history"
on public.admin_audit_log for select to authenticated
using (private.current_user_is_admin());

create table if not exists public.employer_notifications (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  type text not null,
  title_en text not null,
  title_ms text not null,
  body_en text not null,
  body_ms text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists employer_notifications_owner_idx
  on public.employer_notifications (owner_id, created_at desc);

alter table public.employer_notifications enable row level security;
revoke all on table public.employer_notifications from anon, authenticated;
grant select on table public.employer_notifications to authenticated;
grant update (read_at) on table public.employer_notifications to authenticated;

drop policy if exists "Employers can view their notifications" on public.employer_notifications;
create policy "Employers can view their notifications"
on public.employer_notifications for select to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Employers can mark notifications read" on public.employer_notifications;
create policy "Employers can mark notifications read"
on public.employer_notifications for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create or replace function private.notify_company(
  target_company_id uuid,
  notification_type text,
  notification_title_en text,
  notification_title_ms text,
  notification_body_en text,
  notification_body_ms text,
  notification_href text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.employer_notifications (
    owner_id, company_id, type, title_en, title_ms, body_en, body_ms, href
  )
  select owner_id, id, notification_type, notification_title_en,
    notification_title_ms, notification_body_en, notification_body_ms,
    notification_href
  from public.companies
  where id = target_company_id;
$$;

revoke all on function private.notify_company(uuid, text, text, text, text, text, text)
  from public, anon, authenticated;

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
      expires_at = case when new_status = 'approved' then now() + interval '30 days' else expires_at end,
      moderation_status = case when new_status = 'approved' then 'active' else moderation_status end,
      featured = case when new_status = 'rejected' then false else featured end,
      updated_at = now()
  where id = target_job_id
  returning * into updated_job;

  if updated_job.id is null then
    raise exception 'Job not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, detail)
  values ((select auth.uid()), 'job_' || new_status, 'job', updated_job.id,
    jsonb_build_object('reason', feedback, 'reference', updated_job.reference_code));

  perform private.notify_company(
    updated_job.company_id,
    'job_' || new_status,
    case when new_status = 'approved' then 'Job approved' else 'Job needs changes' end,
    case when new_status = 'approved' then 'Iklan kerja diluluskan' else 'Iklan kerja perlu dibetulkan' end,
    case when new_status = 'approved' then updated_job.title_en || ' is now live.' else coalesce(trim(feedback), 'Please review your listing.') end,
    case when new_status = 'approved' then updated_job.title_ms || ' kini diterbitkan.' else coalesce(trim(feedback), 'Sila semak iklan anda.') end,
    '/employer/dashboard'
  );
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
  set featured = make_featured, updated_at = now()
  where id = target_job_id and review_status = 'approved'
    and moderation_status = 'active'
  returning * into updated_job;
  if updated_job.id is null then
    raise exception 'Only active approved jobs can be featured' using errcode = '22023';
  end if;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, detail)
  values ((select auth.uid()), case when make_featured then 'job_featured' else 'job_unfeatured' end,
    'job', updated_job.id, jsonb_build_object('reference', updated_job.reference_code));
  return updated_job;
end;
$$;

revoke all on function public.admin_set_job_featured(uuid, boolean) from public, anon;
grant execute on function public.admin_set_job_featured(uuid, boolean) to authenticated;

create or replace function public.admin_set_company_verification(
  target_company_id uuid,
  new_status text
)
returns public.companies
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_company public.companies;
begin
  if not private.current_user_is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if new_status not in ('unverified', 'pending', 'verified', 'rejected') then
    raise exception 'Invalid verification status' using errcode = '22023';
  end if;
  update public.companies
  set verification_status = new_status, updated_at = now()
  where id = target_company_id
  returning * into updated_company;
  if updated_company.id is null then
    raise exception 'Company not found' using errcode = 'P0002';
  end if;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, detail)
  values ((select auth.uid()), 'company_verification_' || new_status, 'company', updated_company.id,
    jsonb_build_object('company', updated_company.name));
  perform private.notify_company(updated_company.id, 'verification_' || new_status,
    'Company verification updated', 'Pengesahan syarikat dikemas kini',
    'Your verification status is now ' || new_status || '.',
    'Status pengesahan anda kini ' || new_status || '.', '/employer/dashboard');
  return updated_company;
end;
$$;

revoke all on function public.admin_set_company_verification(uuid, text) from public, anon;
grant execute on function public.admin_set_company_verification(uuid, text) to authenticated;

create or replace function public.admin_set_job_moderation(
  target_job_id uuid,
  new_status text,
  reason text default null
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
  if new_status not in ('active', 'suspended') then
    raise exception 'Invalid moderation status' using errcode = '22023';
  end if;
  if new_status = 'suspended' and nullif(trim(reason), '') is null then
    raise exception 'A takedown reason is required' using errcode = '22023';
  end if;

  update public.jobs
  set moderation_status = new_status,
      moderation_reason = case when new_status = 'suspended' then trim(reason) else null end,
      featured = case when new_status = 'suspended' then false else featured end,
      expires_at = case when new_status = 'active' and expires_at <= now() then now() + interval '30 days' else expires_at end,
      updated_at = now()
  where id = target_job_id and review_status = 'approved'
  returning * into updated_job;

  if updated_job.id is null then
    raise exception 'Approved job not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, detail)
  values ((select auth.uid()), 'job_' || new_status, 'job', updated_job.id,
    jsonb_build_object('reason', reason, 'reference', updated_job.reference_code));

  perform private.notify_company(
    updated_job.company_id,
    'job_' || new_status,
    case when new_status = 'suspended' then 'Job taken down' else 'Job restored' end,
    case when new_status = 'suspended' then 'Iklan kerja diturunkan' else 'Iklan kerja dipulihkan' end,
    case when new_status = 'suspended' then trim(reason) else updated_job.title_en || ' is public again.' end,
    case when new_status = 'suspended' then trim(reason) else updated_job.title_ms || ' diterbitkan semula.' end,
    '/employer/dashboard'
  );
  return updated_job;
end;
$$;

revoke all on function public.admin_set_job_moderation(uuid, text, text) from public, anon;
grant execute on function public.admin_set_job_moderation(uuid, text, text) to authenticated;

create or replace function public.admin_extend_job(
  target_job_id uuid,
  extension_days integer default 30
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
  if extension_days < 1 or extension_days > 365 then
    raise exception 'Extension must be between 1 and 365 days' using errcode = '22023';
  end if;

  update public.jobs
  set expires_at = greatest(coalesce(expires_at, now()), now()) + make_interval(days => extension_days),
      updated_at = now()
  where id = target_job_id and review_status = 'approved'
  returning * into updated_job;

  if updated_job.id is null then
    raise exception 'Approved job not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, detail)
  values ((select auth.uid()), 'job_extended', 'job', updated_job.id,
    jsonb_build_object('days', extension_days, 'reference', updated_job.reference_code));

  perform private.notify_company(updated_job.company_id, 'job_extended', 'Job expiry extended',
    'Tempoh iklan dilanjutkan', 'Your listing has been extended.', 'Tempoh iklan anda telah dilanjutkan.',
    '/employer/dashboard');
  return updated_job;
end;
$$;

revoke all on function public.admin_extend_job(uuid, integer) from public, anon;
grant execute on function public.admin_extend_job(uuid, integer) to authenticated;

create or replace function public.admin_set_company_account_status(
  target_company_id uuid,
  new_status text,
  reason text default null
)
returns public.companies
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_company public.companies;
begin
  if not private.current_user_is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if new_status not in ('active', 'suspended') then
    raise exception 'Invalid account status' using errcode = '22023';
  end if;
  if new_status = 'suspended' and nullif(trim(reason), '') is null then
    raise exception 'A suspension reason is required' using errcode = '22023';
  end if;

  update public.companies
  set account_status = new_status,
      suspension_reason = case when new_status = 'suspended' then trim(reason) else null end,
      updated_at = now()
  where id = target_company_id
  returning * into updated_company;

  if updated_company.id is null then
    raise exception 'Company not found' using errcode = 'P0002';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, detail)
  values ((select auth.uid()), 'company_' || new_status, 'company', updated_company.id,
    jsonb_build_object('reason', reason, 'company', updated_company.name));

  perform private.notify_company(updated_company.id, 'company_' || new_status,
    case when new_status = 'suspended' then 'Employer account suspended' else 'Employer account restored' end,
    case when new_status = 'suspended' then 'Akaun majikan digantung' else 'Akaun majikan dipulihkan' end,
    case when new_status = 'suspended' then trim(reason) else 'You can post jobs again.' end,
    case when new_status = 'suspended' then trim(reason) else 'Anda boleh mengiklankan kerja semula.' end,
    '/employer/dashboard');
  return updated_company;
end;
$$;

revoke all on function public.admin_set_company_account_status(uuid, text, text) from public, anon;
grant execute on function public.admin_set_company_account_status(uuid, text, text) to authenticated;

drop policy if exists "Employers can create jobs for their company" on public.jobs;
create policy "Employers can create jobs for their company"
on public.jobs for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.companies
    where companies.id = jobs.company_id
      and companies.owner_id = (select auth.uid())
      and companies.account_status = 'active'
  )
);

drop function if exists public.get_public_jobs(text);
create function public.get_public_jobs(target_job_reference text default null)
returns table (
  id uuid, reference_code text, company_id uuid, company_name text,
  company_logo_path text, company_verification_status text,
  title_en text, title_ms text, category text, location text, state text,
  salary_min integer, salary_max integer, salary_unit text, work_type text,
  description_en text, description_ms text, requirements_en text,
  requirements_ms text, whatsapp text, vacancies integer, urgent boolean,
  featured boolean, published_at timestamptz, expires_at timestamptz,
  created_at timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select jobs.id, jobs.reference_code, jobs.company_id, companies.name,
    companies.logo_path, companies.verification_status, jobs.title_en,
    jobs.title_ms, jobs.category, jobs.location, jobs.state, jobs.salary_min,
    jobs.salary_max, jobs.salary_unit, jobs.work_type, jobs.description_en,
    jobs.description_ms, jobs.requirements_en, jobs.requirements_ms,
    jobs.whatsapp, jobs.vacancies, jobs.urgent, jobs.featured,
    jobs.published_at, jobs.expires_at, jobs.created_at
  from public.jobs
  join public.companies on companies.id = jobs.company_id
  where jobs.review_status = 'approved'
    and jobs.listing_status = 'active'
    and jobs.moderation_status = 'active'
    and companies.account_status = 'active'
    and (jobs.expires_at is null or jobs.expires_at > now())
    and (
      target_job_reference is null
      or lower(jobs.reference_code) = lower(target_job_reference)
      or jobs.id::text = target_job_reference
    )
  order by jobs.featured desc, coalesce(jobs.published_at, jobs.created_at) desc;
$$;

revoke all on function public.get_public_jobs(text) from public, anon, authenticated;
grant execute on function public.get_public_jobs(text) to anon, authenticated;

notify pgrst, 'reload schema';
