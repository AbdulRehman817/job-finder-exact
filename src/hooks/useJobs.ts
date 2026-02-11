import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { databases, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";
import { useAuth } from "@/contexts/AuthContext";

const enrichJobsWithCompanies = async (jobs: any[]) => {
  const { documents: companies } = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.COMPANIES
  );
  const companiesById = new Map(companies.map((company) => [company.$id, company]));

  return jobs.map((job) => {
    const parsedJob = parseJobData(job);
    const company = job.company_id ? companiesById.get(job.company_id) : undefined;

    return {
      ...parsedJob,
      companies: company
        ? {
            $id: company.$id,
            name: company.name,
            logo_url: company.logo_url,
            location: company.location,
            email: company.email ?? null,
          }
        : undefined,
    };
  });
};

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
const parseArrayField = (value: unknown): string[] | null => {
  if (!value) return null;

  const normalize = (items: unknown[]): string[] | null => {
    const cleaned = items
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);

    return cleaned.length > 0 ? cleaned : null;
  };

  if (Array.isArray(value)) {
    return normalize(value);
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return normalize(parsed);
      }
    } catch {
      // Fall back to delimiter-based parsing for legacy/plain-text formats.
    }

    const splitValues = raw.includes('\n')
      ? raw.split(/\r?\n/)
      : raw.split(',');

    return normalize(splitValues);
  }

  return null;
};

const parseJobData = (job: any): Job => ({
  ...job,
  requirements: parseArrayField(job.requirements),
  responsibilities: parseArrayField(job.responsibilities),
  benefits: parseArrayField(job.benefits),
  skills_required: parseArrayField(job.skills_required),
});


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
        console.log('📡 useJobs: Querying Appwrite for all jobs');
        const { documents: jobs } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS
        );
        console.log('📥 useJobs: Received jobs from Appwrite:', jobs.length);

        const filteredJobs = jobs
          .filter((job) => job.status === "active")
          .filter((job) => !filters?.type || job.type === filters.type)
          .filter((job) => !filters?.location || String(job.location || "").toLowerCase().includes(filters.location.toLowerCase()))
          .filter((job) => !filters?.search || String(job.title || "").toLowerCase().includes(filters.search.toLowerCase()))
          .sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime());

        const jobsWithCompanies = await enrichJobsWithCompanies(filteredJobs);

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

        const { documents: companies } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMPANIES);
        const company = companies.find((item) => item.$id === job.company_id);
        console.log('📥 useJob: Received company data:', companies.length > 0 ? companies[0].name : 'none');

        const result = {
          ...parsedJob,
          companies: company ? {
            id: company.$id,
            name: company.name,
            logo_url: company.logo_url,
            location: company.location,
            email: company.email ?? null,
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
        const { documents } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.JOBS);
        const myJobs = documents
          .filter((job) => job.user_id === user.id)
          .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());

        const jobsWithCompanies = await enrichJobsWithCompanies(myJobs);

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

        const { documents: companies } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMPANIES);
        const company = companies.find((item) => item.$id === document.company_id);

        return {
          ...document,
          companies: company ? {
            id: company.$id,
            name: company.name,
            logo_url: company.logo_url,
            location: company.location,
            email: company.email ?? null,
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

        const { documents: companies } = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMPANIES);
        const company = companies.find((item) => item.$id === document.company_id);

        return {
          ...document,
          companies: company ? {
            id: company.$id,
            name: company.name,
            logo_url: company.logo_url,
            location: company.location,
            email: company.email ?? null,
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
