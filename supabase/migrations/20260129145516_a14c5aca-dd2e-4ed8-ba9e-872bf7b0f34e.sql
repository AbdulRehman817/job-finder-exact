-- Drop the existing INSERT policy for notifications
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

-- Create a new policy that allows employers to create notifications for job seekers
-- This enables the recruiter to notify candidates when shortlisting/hiring/rejecting
CREATE POLICY "Employers can create notifications for applicants"
ON public.notifications
FOR INSERT
WITH CHECK (
  -- The authenticated user must be an employer
  public.has_role(auth.uid(), 'employer')
  OR 
  -- Or inserting their own notification (for system notifications)
  auth.uid() = user_id
);