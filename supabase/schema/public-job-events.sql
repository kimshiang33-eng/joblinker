create or replace function public.record_public_job_event(
  target_job_reference text,
  event_type text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if target_job_reference is null or btrim(target_job_reference) = '' then
    raise exception 'A job reference is required' using errcode = '22023';
  end if;

  if event_type not in ('view', 'whatsapp_click') then
    raise exception 'Unsupported job event' using errcode = '22023';
  end if;

  update public.jobs
  set
    views = views + case when event_type = 'view' then 1 else 0 end,
    whatsapp_clicks = whatsapp_clicks + case when event_type = 'whatsapp_click' then 1 else 0 end
  where reference_code = upper(btrim(target_job_reference))
    and review_status = 'approved'
    and listing_status = 'active';
end;
$$;

comment on function public.record_public_job_event(text, text) is
  'Records a bounded public view or WhatsApp click for an active, approved job.';

revoke all on function public.record_public_job_event(text, text) from public, anon, authenticated;
grant execute on function public.record_public_job_event(text, text) to anon, authenticated;
