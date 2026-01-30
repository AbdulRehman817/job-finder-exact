-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Create policy for users to upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to view their own resumes
CREATE POLICY "Users can view their own resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to update their own resumes
CREATE POLICY "Users can update their own resumes"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for employers to view resumes of applicants for their jobs
CREATE POLICY "Employers can view applicant resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND public.has_role(auth.uid(), 'employer')
  AND EXISTS (
    SELECT 1 FROM public.job_applications ja
    JOIN public.jobs j ON ja.job_id = j.id
    WHERE j.user_id = auth.uid()
    AND ja.user_id::text = (storage.foldername(name))[1]
  )
);