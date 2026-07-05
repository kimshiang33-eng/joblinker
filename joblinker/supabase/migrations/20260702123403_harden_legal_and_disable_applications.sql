-- Keep the unused application feature private until a rate-limited application
-- flow is intentionally shipped. Existing rows and files remain available to
-- trusted server/service-role operations only.
do $$
begin
  if to_regclass('public.job_applications') is not null then
    execute 'drop policy if exists "Anyone can apply to an open public job" on public.job_applications';
    execute 'drop policy if exists "Employers can view their applications" on public.job_applications';
    execute 'drop policy if exists "Employers can manage their applications" on public.job_applications';
    execute 'revoke all on table public.job_applications from anon, authenticated';
  end if;
end;
$$;

drop policy if exists "Applicants can upload resumes" on storage.objects;
drop policy if exists "Employers can read applicant resumes" on storage.objects;

-- Capture an immutable, database-timestamped copy of the legal versions that
-- were accepted during account creation. Clients cannot read or mutate it.
create table if not exists public.legal_acceptances (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null check (char_length(terms_version) between 1 and 40),
  privacy_version text not null check (char_length(privacy_version) between 1 and 40),
  locale text not null check (locale in ('en', 'ms')),
  accepted_at timestamptz not null default now(),
  unique (user_id, terms_version, privacy_version)
);

create index if not exists legal_acceptances_user_id_idx
  on public.legal_acceptances (user_id, accepted_at desc);

alter table public.legal_acceptances enable row level security;
revoke all on table public.legal_acceptances from anon, authenticated;

create or replace function private.capture_legal_acceptance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted_terms_version text := nullif(btrim(new.raw_user_meta_data ->> 'terms_version'), '');
  accepted_privacy_version text := nullif(btrim(new.raw_user_meta_data ->> 'privacy_version'), '');
  accepted_locale text := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'legal_locale'), ''), 'en');
begin
  if new.raw_user_meta_data ->> 'terms_accepted' = 'true'
    and new.raw_user_meta_data ->> 'privacy_accepted' = 'true'
    and accepted_terms_version = '2026-07-01'
    and accepted_privacy_version = '2026-07-01'
  then
    insert into public.legal_acceptances (
      user_id,
      terms_version,
      privacy_version,
      locale
    ) values (
      new.id,
      accepted_terms_version,
      accepted_privacy_version,
      case when accepted_locale in ('en', 'ms') then accepted_locale else 'en' end
    )
    on conflict (user_id, terms_version, privacy_version) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function private.capture_legal_acceptance() from public, anon, authenticated;

drop trigger if exists capture_legal_acceptance_on_signup on auth.users;
create trigger capture_legal_acceptance_on_signup
after insert on auth.users
for each row execute function private.capture_legal_acceptance();

create or replace function private.current_user_has_legal_acceptance()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.legal_acceptances
    where legal_acceptances.user_id = (select auth.uid())
  );
$$;

revoke all on function private.current_user_has_legal_acceptance() from public, anon;
grant execute on function private.current_user_has_legal_acceptance() to authenticated;

-- A new employer company can only be created after the signup trigger has
-- recorded acceptance. Existing companies are unaffected.
drop policy if exists "Employers can create their company" on public.companies;
create policy "Employers can create their company"
on public.companies
for insert
to authenticated
with check (
  (select auth.uid()) = owner_id
  and private.current_user_has_legal_acceptance()
);

notify pgrst, 'reload schema';
