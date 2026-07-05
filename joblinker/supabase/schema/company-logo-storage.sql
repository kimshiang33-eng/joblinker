insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'company-logos',
  'company-logos',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Company owners can read their logo objects" on storage.objects;
create policy "Company owners can read their logo objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Company owners can upload logo objects" on storage.objects;
create policy "Company owners can upload logo objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Company owners can update logo objects" on storage.objects;
create policy "Company owners can update logo objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Company owners can delete logo objects" on storage.objects;
create policy "Company owners can delete logo objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'company-logos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
