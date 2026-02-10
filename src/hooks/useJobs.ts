import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";


const parseStringArrayField = (value: unknown): string[] | null => {
  if (!value) return null;
  if (Array.isArray(value)) return value as string[];
  if (typeof value !== "string") return null;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.warn("Invalid JSON stored for job field:", value, error);
    return null;
  }
};


// Helper function to parse JSON strings stored in Appwrite
const parseJobData = (job: any): Job => {
  return {
    ...job,
   requirements: parseStringArrayField(job.requirements),
    responsibilities: parseStringArrayField(job.responsibilities),
    benefits: parseStringArrayField(job.benefits),
  };
};

export interface Job {
  $id: string;
  company_id: string;
   apply_link?: string | null;
  apply_url?: string | null;
  application_url?: string | null;
  user_id: string;
  title: string;
  description: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: "USD" | "PKR" | null;
  type: "full-time" | "part-time" | "internship" | "remote" | "contract";
  experience_level: string | null;
  category: string | null;
  benefits: string[] | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  featured: boolean;
  status: "active" | "closed" | "draft";
  posted_date: string;
  expiry_date: string | null;
  $createdAt: string;
  $updatedAt: string;
  companies?: {
    $id: string;
    name: string;
    logo_url: string | null;
    location: string | null;
        email?: string | null;
  };
}

export const useJobs = (filters?: { type?: string; location?: string; search?: string }) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      console.log('🔄 useJobs: Fetching jobs with filters:', filters);
      try {
        let queries = [
          Query.equal('status', 'active'),
          Query.orderDesc('posted_date')
        ];

        if (filters?.type) {
          queries.push(Query.equal('type', filters.type));
          console.log('📋 useJobs: Added type filter:', filters.type);
        }
        if (filters?.location) {
          queries.push(Query.search('location', filters.location));
          console.log('📋 useJobs: Added location filter:', filters.location);
        }
        if (filters?.search) {
          queries.push(Query.search('title', filters.search));
          console.log('📋 useJobs: Added search filter:', filters.search);
        }

        console.log('📡 useJobs: Querying Appwrite for jobs with queries:', queries);
        const { documents: jobs } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          queries
        );
        console.log('📥 useJobs: Received jobs from Appwrite:', jobs.length);

        // Fetch company data for each job
        console.log('📡 useJobs: Fetching company data for jobs');
        const jobsWithCompanies = await Promise.all(
          jobs.map(async (job) => {
            try {
               if (!job.company_id) {
                return parseJobData(job);
              }
              const { documents: companies } = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMPANIES,
                [Query.equal('$id', job.company_id)]
              );

              const parsedJob = parseJobData(job);
              const result = {
                ...parsedJob,
                companies: companies.length > 0 ? {
                  $id: companies[0].$id,
                  name: companies[0].name,
                  logo_url: companies[0].logo_url,
                  location: companies[0].location,
                    email: companies[0].email ?? null,
                } : undefined
              };
              console.log('📋 useJobs: Processed job with company:', { jobId: job.$id, companyName: result.companies?.name });
              return result;
            } catch (error) {
              console.error('❌ useJobs: Error fetching company for job:', job.$id, error);
              return parseJobData(job);
            }
          })
        );

        console.log('✅ useJobs: Jobs fetched successfully:', jobsWithCompanies.length);
        return jobsWithCompanies;
      } catch (error) {
        console.error('❌ useJobs: Error fetching jobs:', error);
        throw error;
      }
    },
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      console.log('🔄 useJob: Fetching single job:', id);
      try {
        console.log('📡 useJob: Getting job document from Appwrite');
        const job = await databases.getDocument(DATABASE_ID, COLLECTIONS.JOBS, id);
        console.log('📥 useJob: Received job:', job.$id);

        // Fetch company data
        console.log('📡 useJob: Fetching company data for job');
          const parsedJob = parseJobData(job);
        if (!job.company_id) {
          return parsedJob;
        }
        const { documents: companies } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COMPANIES,
          [Query.equal('$id', job.company_id)]
        );
        console.log('📥 useJob: Received company data:', companies.length > 0 ? companies[0].name : 'none');

        const result = {
          ...parsedJob,
          companies: companies.length > 0 ? {
            id: companies[0].$id,
            name: companies[0].name,
            logo_url: companies[0].logo_url,
  location: companies[0].location,
                  email: companies[0].email ?? null,
          } : undefined
        };
        console.log('✅ useJob: Job with company data ready');
        return result;
      } catch (error) {
        console.error('❌ useJob: Error fetching job:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useMyJobs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-jobs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        
        const { documents } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          [Query.equal('user_id', user.id), Query.orderDesc('$createdAt')]
        );

        // Fetch company data for each job
        const jobsWithCompanies = await Promise.all(
          documents.map(async (job) => {
            try {
                 if (!job.company_id) {
                return parseJobData(job);
              }
              const { documents: companies } = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMPANIES,
                [Query.equal('$id', job.company_id)]
              );

              const parsedJob = parseJobData(job);
              return {
                ...parsedJob,
                companies: companies.length > 0 ? {
                  id: companies[0].$id,
                  name: companies[0].name,
                  logo_url: companies[0].logo_url,
                  location: companies[0].location,
                   email: companies[0].email ?? null,
                } : undefined
              };
            } catch (error) {
              console.error('Error fetching company for job:', job.$id, error);
              return parseJobData(job);
            }
          })
        );

        return jobsWithCompanies;
      } catch (error) {
        console.error('Error fetching my jobs:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (job: Omit<Job, "$id" | "user_id" | "$createdAt" | "$updatedAt" | "posted_date" | "featured" | "companies">) => {
      if (!user) throw new Error("You must be signed in to post a job.");

      const payload = {
        ...job,
        user_id: user.id,
        posted_date: new Date().toISOString(),
        featured: false,
      };

      try {
        const document = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          ID.unique(),
          payload
        );

        // Fetch company data
          if (!document.company_id) {
          return {
            ...document,
            companies: undefined,
          };
        }
        const { documents: companies } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COMPANIES,
          [Query.equal('$id', document.company_id)]
        );

        return {
          ...document,
          companies: companies.length > 0 ? {
            id: companies[0].$id,
            name: companies[0].name,
            logo_url: companies[0].logo_url,
            location: companies[0].location,
             email: companies[0].email ?? null,
          } : undefined
        };
      } catch (error) {
        console.error('Error creating job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      try {
        const document = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          id,
          updates
        );

        // Fetch company data
        if (!document.company_id) {
          return {
            ...document,
            companies: undefined,
          };
        }
        const { documents: companies } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COMPANIES,
          [Query.equal('$id', document.company_id)]
        );

        return {
          ...document,
          companies: companies.length > 0 ? {
            id: companies[0].$id,
            name: companies[0].name,
            logo_url: companies[0].logo_url,
            location: companies[0].location,
             email: companies[0].email ?? null,
          } : undefined
        };
      } catch (error) {
        console.error('Error updating job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.JOBS, id);
      } catch (error) {
        console.error('Error deleting job:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
    },
  });
};
