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
  set verification_status = new_status,
      updated_at = now()
  where id = target_company_id
  returning * into updated_company;

  if updated_company.id is null then
    raise exception 'Company not found' using errcode = 'P0002';
  end if;

  return updated_company;
end;
$$;

revoke all on function public.admin_set_company_verification(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_company_verification(uuid, text) to authenticated;
