create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.current_user_owns_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.companies
    where companies.id = target_company_id
      and companies.owner_id = (select auth.uid())
  );
$$;

revoke all on function private.current_user_owns_company(uuid) from public;
grant execute on function private.current_user_owns_company(uuid) to authenticated;

drop policy if exists "Employers can view their jobs" on public.jobs;
create policy "Employers can view their jobs"
on public.jobs
for select
to authenticated
using (private.current_user_owns_company(company_id));

drop policy if exists "Employers can create jobs for their company" on public.jobs;
create policy "Employers can create jobs for their company"
on public.jobs
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and private.current_user_owns_company(company_id)
);

drop policy if exists "Employers can update their jobs" on public.jobs;
create policy "Employers can update their jobs"
on public.jobs
for update
to authenticated
using (
  created_by = (select auth.uid())
  and private.current_user_owns_company(company_id)
)
with check (
  created_by = (select auth.uid())
  and private.current_user_owns_company(company_id)
);

drop policy if exists "Employers can delete their jobs" on public.jobs;
create policy "Employers can delete their jobs"
on public.jobs
for delete
to authenticated
using (
  created_by = (select auth.uid())
  and private.current_user_owns_company(company_id)
);
