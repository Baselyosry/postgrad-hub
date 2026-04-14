alter table public.thesis_upload_submissions
alter column user_id drop not null;

drop policy if exists "Users insert own thesis_upload_submissions" on public.thesis_upload_submissions;
drop policy if exists "Users select own thesis_upload_submissions" on public.thesis_upload_submissions;
drop policy if exists "Admins select all thesis_upload_submissions" on public.thesis_upload_submissions;
drop policy if exists "Admins update thesis_upload_submissions" on public.thesis_upload_submissions;

create policy "Anyone can insert thesis_upload_submissions"
on public.thesis_upload_submissions
for insert
to anon, authenticated
with check (true);

create policy "Users select own thesis_upload_submissions"
on public.thesis_upload_submissions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins select all thesis_upload_submissions"
on public.thesis_upload_submissions
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins update thesis_upload_submissions"
on public.thesis_upload_submissions
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Authenticated upload thesis-submissions PDFs" on storage.objects;
drop policy if exists "Anyone can upload thesis submission files" on storage.objects;
drop policy if exists "Anyone can read thesis submission files" on storage.objects;

create policy "Anyone can upload thesis submission files"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = 'thesis-submissions'
);

create policy "Anyone can read thesis submission files"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = 'thesis-submissions'
);