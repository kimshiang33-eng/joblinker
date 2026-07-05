create or replace function private.reset_job_review_after_content_edit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.title_en is distinct from old.title_en
    or new.title_ms is distinct from old.title_ms
    or new.category is distinct from old.category
    or new.location is distinct from old.location
    or new.state is distinct from old.state
    or new.salary_min is distinct from old.salary_min
    or new.salary_max is distinct from old.salary_max
    or new.salary_unit is distinct from old.salary_unit
    or new.work_type is distinct from old.work_type
    or new.description_en is distinct from old.description_en
    or new.description_ms is distinct from old.description_ms
    or new.requirements_en is distinct from old.requirements_en
    or new.requirements_ms is distinct from old.requirements_ms
    or new.whatsapp is distinct from old.whatsapp
    or new.vacancies is distinct from old.vacancies
    or new.urgent is distinct from old.urgent
  then
    new.review_status := 'pending';
    new.featured := false;
    new.rejection_reason := null;
    new.published_at := null;
  end if;

  return new;
end;
$$;

revoke all on function private.reset_job_review_after_content_edit() from public;
grant execute on function private.reset_job_review_after_content_edit() to authenticated;

drop trigger if exists jobs_reset_review_after_content_edit on public.jobs;
create trigger jobs_reset_review_after_content_edit
before update on public.jobs
for each row
execute function private.reset_job_review_after_content_edit();
