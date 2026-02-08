import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";

export interface JobApplication {
  $id: string;
  job_id: string;
  user_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  applied_at: string;
  $updatedAt: string;
  jobs?: {
    id: string;
    title: string;
    location: string;
    type: string;
    salary_min: number | null;
    salary_max: number | null;
    companies?: {
      id: string;
      name: string;
      logo_url: string | null;
    };
  };
  profiles?: {
    $id: string;
    email?: string | null;
    full_name: string;
    avatar_url: string | null;
    title: string | null;
    location: string | null;
    skills: string[] | null;
    experience_years: number | null;
    phone: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    website: string | null;
    resume_url?: string | null;
  };
}


export const useMyApplications = () => {
  const { user } = useAuth();
  console.log('🔄 useMyApplications: Hook called, user:', user);

  return useQuery<JobApplication[]>({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('ℹ️ useMyApplications: No user, returning empty array');
        return [];
      }
      console.log('🔄 useMyApplications: Fetching applications for user:', user.id);
      try {
        console.log('📡 useMyApplications: Querying job applications from Appwrite');
        const { documents: applications } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOB_APPLICATIONS,
          [Query.equal('user_id', user.id), Query.orderDesc('applied_at')]
        );
           const typedApplications = applications as unknown as JobApplication[];
        console.log('📥 useMyApplications: Received applications:', applications.length);

        // Fetch job and company data for each application
        console.log('📡 useMyApplications: Fetching job and company data for applications');
        const applicationsWithData = await Promise.all(
         typedApplications.map(async (application) => {
            try {
              // Fetch job data
              console.log('📋 useMyApplications: Fetching job data for application:', application.$id);
              const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, application.job_id);

              // Fetch company data
              const { documents: companies } = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMPANIES,
                [Query.equal('$id', job.company_id)]
              );

              const result = {
                ...application,
                jobs: {
                  id: job.$id,
                  title: job.title,
                  location: job.location,
                  type: job.type,
                  salary_min: job.salary_min,
                  salary_max: job.salary_max,
                  companies: companies.length > 0 ? {
                    id: companies[0].$id,
                    name: companies[0].name,
                    logo_url: companies[0].logo_url
                  } : undefined
                }
              };
              console.log('📋 useMyApplications: Processed application with job:', { appId: application.$id, jobTitle: job.title });
                return result as JobApplication;
            } catch (error) {
              console.error('❌ useMyApplications: Error fetching job data for application:', application.$id, error);
              return application as JobApplication;
            }
          })
        );

        console.log('✅ useMyApplications: Applications with data fetched successfully:', applicationsWithData.length);
        return applicationsWithData;
      } catch (error) {
        console.error('❌ useMyApplications: Error fetching my applications:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
};


export const useJobApplications = (jobId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: async () => {
      if (!jobId || !user) return [];
      try {
        const { documents: applications } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOB_APPLICATIONS,
          [Query.equal('job_id', jobId), Query.orderDesc('applied_at')]
        );

        // Fetch profile data for each application
        const applicationsWithProfiles = await Promise.all(
          applications.map(async (application) => {
            try {
              const { documents: profiles } = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PROFILES,
                [Query.equal('user_id', application.user_id)]
              );

              return {
                ...application,
                profiles: profiles.length > 0 ? {
                  id: profiles[0].$id,
                  email: profiles[0].email,
                  full_name: profiles[0].full_name,
                  avatar_url: profiles[0].avatar_url,
                  title: profiles[0].title,
                  location: profiles[0].location,
                  skills: profiles[0].skills,
                  experience_years: profiles[0].experience_years,
                  phone: profiles[0].phone,
                  linkedin_url: profiles[0].linkedin_url,
                  github_url: profiles[0].github_url,
                  website: profiles[0].website,
                  resume_url: profiles[0].resume_url
                } : undefined
              };
            } catch (error) {
              console.error('Error fetching profile for application:', application.$id, error);
              return application;
            }
          })
        );

        return applicationsWithProfiles;
      } catch (error) {
        console.error('Error fetching job applications:', error);
        throw error;
      }
    },
    enabled: !!jobId && !!user,
  });
};


export const useApplyForJob = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ jobId, coverLetter, resumeUrl }: { jobId: string; coverLetter?: string; resumeUrl?: string }) => {
      if (!user) throw new Error("You must be signed in to apply.");

      try {
        // Check if job exists and is active
        const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, jobId);

        if (job.status !== 'active') {
          throw new Error("This job is no longer accepting applications.");
        }

        // Check if user already applied
        const { documents: existingApplications } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOB_APPLICATIONS,
          [Query.equal('user_id', user.id), Query.equal('job_id', jobId)]
        );

        if (existingApplications.length > 0) {
          throw new Error("You have already applied for this job.");
        }

        // Create application - Using exact column names from your Appwrite schema
        const application = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.JOB_APPLICATIONS,
          ID.unique(),
          {
            user_id: user.id,        // Match schema: user_id (with underscore)
            job_id: jobId,           // Match schema: job_id
            cover_letter: coverLetter || null,
            resume_url: resumeUrl || profile?.resume_url || null,
            status: 'pending',
            // applied_at is auto-generated by Appwrite (datetime type)
          }
        );

        // Create notification for job owner
        const applicantName = profile?.full_name || user.email || "A candidate";

        // Get company info
        const { documents: companies } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COMPANIES,
          [Query.equal('$id', job.company_id)]
        );
        const companyName = companies.length > 0 ? companies[0].name : "your company";

        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.NOTIFICATIONS,
          ID.unique(),
          {
            user_id: job.user_id,
            type: "application_received",
            title: "New application received",
            message: `${applicantName} applied for ${job.title} at ${companyName}.`,
            job_id: jobId,
            application_id: application.$id,
            is_read: false,
          }
        );

        return application;
      } catch (error) {
        console.error('Error applying for job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["has-applied"] });
    },
  });
};

export const useHasApplied = (jobId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["has-applied", jobId, user?.id],
    queryFn: async () => {
      if (!jobId || !user) return false;
      try {
        const { documents } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOB_APPLICATIONS,
          [Query.equal('user_id', user.id), Query.equal('job_id', jobId)]
        );
        return documents.length > 0;
      } catch (error) {
        console.error('Error checking if user has applied:', error);
        return false;
      }
    },
    enabled: !!jobId && !!user,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobApplication["status"] }) => {
      try {
        const document = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.JOB_APPLICATIONS,
          id,
          { status }
        );
        return document;
      } catch (error) {
        console.error('Error updating application status:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
};