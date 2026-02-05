import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { databases, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";

export interface SavedJob {
  id: string;
  job_id: string;
  user_id: string;
  saved_at: string;
  jobs?: {
    id: string;
    title: string;
    location: string;
    type: string;
    salary_min: number | null;
    salary_max: number | null;
    posted_date: string;
    companies?: {
      id: string;
      name: string;
      logo_url: string | null;
    };
  };
}

export const useSavedJobs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-jobs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const { documents: savedJobs } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SAVED_JOBS,
          [`user_id=${user.id}`, `orderDesc=saved_at`]
        );

        // Fetch job and company data for each saved job
        const savedJobsWithData = await Promise.all(
          savedJobs.map(async (savedJob) => {
            try {
              // Fetch job data
              const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, savedJob.job_id);

              // Fetch company data
              const { documents: companies } = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMPANIES,
                [`$id=${job.company_id}`]
              );

              return {
                ...savedJob,
                jobs: {
                  id: job.$id,
                  title: job.title,
                  location: job.location,
                  type: job.type,
                  salary_min: job.salary_min,
                  salary_max: job.salary_max,
                  posted_date: job.posted_date,
                  companies: companies.length > 0 ? {
                    id: companies[0].$id,
                    name: companies[0].name,
                    logo_url: companies[0].logo_url
                  } : undefined
                }
              };
            } catch (error) {
              console.error('Error fetching data for saved job:', savedJob.$id, error);
              return savedJob;
            }
          })
        );

        return savedJobsWithData;
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!user) throw new Error("You must be signed in to save jobs.");

      try {
        const document = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.SAVED_JOBS,
          ID.unique(),
          {
            job_id: jobId,
            user_id: user.id,
            saved_at: new Date().toISOString(),
          }
        );
        return document;
      } catch (error: any) {
        if (error.code === 409) {
          return { message: "Already saved" };
        }
        console.error('Error saving job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["is-job-saved"] });
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!user) throw new Error("You must be signed in.");

      try {
        // Find the saved job document
        const { documents } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SAVED_JOBS,
          [`user_id=${user.id}`, `job_id=${jobId}`]
        );

        if (documents.length > 0) {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SAVED_JOBS, documents[0].$id);
        }
      } catch (error) {
        console.error('Error unsaving job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["is-job-saved"] });
    },
  });
};

export const useIsJobSaved = (jobId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-job-saved", jobId, user?.id],
    queryFn: async () => {
      if (!jobId || !user) return false;
      try {
        const { documents } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.SAVED_JOBS,
          [`user_id=${user.id}`, `job_id=${jobId}`]
        );
        return documents.length > 0;
      } catch (error) {
        console.error('Error checking if job is saved:', error);
        return false;
      }
    },
    enabled: !!jobId && !!user,
  });
};
