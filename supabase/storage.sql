-- Storage policies for resume uploads
-- Ensure the bucket "resumes" exists (Storage -> Create bucket)

create policy "Resumes: insert own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Resumes: update own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Resumes: delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Optional: if you keep the bucket private, enable authenticated reads
create policy "Resumes: read for authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'resumes');
