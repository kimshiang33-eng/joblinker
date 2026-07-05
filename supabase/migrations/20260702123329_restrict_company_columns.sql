-- Employers can edit profile fields, but cannot self-approve verification.
revoke insert, update on table public.companies from authenticated;

grant insert (
  owner_id,
  name,
  registration_number,
  industry,
  company_size,
  website,
  phone,
  email,
  address,
  city,
  state,
  description_en,
  description_ms,
  logo_path,
  updated_at
) on table public.companies to authenticated;

grant update (
  name,
  registration_number,
  industry,
  company_size,
  website,
  phone,
  email,
  address,
  city,
  state,
  description_en,
  description_ms,
  logo_path,
  updated_at
) on table public.companies to authenticated;
