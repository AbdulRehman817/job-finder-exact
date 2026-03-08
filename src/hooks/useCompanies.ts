import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Permission, Role } from "appwrite";
import { useAuth } from "@/contexts/AuthContext";
import { COLLECTIONS, DATABASE_ID, ID, Query, databases } from "@/lib/appwrite";

export interface Company {
  $id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
  industry: string | null;
  size: string | null;
  founded: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  featured: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export const COMPANIES_QUERY_KEY = ["companies"] as const;
export const COMPANIES_STALE_TIME = 5 * 60 * 1000;
const COMPANIES_GC_TIME = 30 * 60 * 1000;

export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COMPANIES,
      [Query.orderDesc("$createdAt")]
    );

    return documents as unknown as Company[];
  } catch (error) {
    console.error("useCompanies: Error fetching companies:", error);
    throw error;
  }
};

export const useCompanies = () => {
  return useQuery({
    queryKey: COMPANIES_QUERY_KEY,
    queryFn: fetchCompanies,
    staleTime: COMPANIES_STALE_TIME,
    gcTime: COMPANIES_GC_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useMyCompanies = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-companies", user?.id],
    queryFn: async () => {
      if (!user) {
        return [] as Company[];
      }

      try {
        const { documents } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.COMPANIES,
          [Query.equal("user_id", user.id), Query.orderDesc("$createdAt")]
        );

        return documents as unknown as Company[];
      } catch (error) {
        console.error("useMyCompanies: Error fetching my companies:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    gcTime: COMPANIES_GC_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      company: Partial<
        Omit<Company, "$id" | "user_id" | "$createdAt" | "$updatedAt" | "featured">
      >
    ) => {
      if (!user) throw new Error("You must be signed in to create a company.");

      try {
        const document = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.COMPANIES,
          ID.unique(),
          {
            name: company.name || "",
            logo_url: company.logo_url || null,
            description: company.description || null,
            website: company.website || null,
            location: company.location || null,
            industry: company.industry || null,
            size: company.size || null,
            founded: company.founded || null,
            email: company.email || null,
            phone: company.phone || null,
            linkedin_url: company.linkedin_url || null,
            twitter_url: company.twitter_url || null,
            user_id: user.id,
            featured: false,
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(user.id)),
            Permission.delete(Role.user(user.id)),
          ]
        );

        return document as unknown as Company;
      } catch (error: any) {
        console.error("Error creating company:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      try {
        const document = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.COMPANIES,
          id,
          updates
        );
        return document as unknown as Company;
      } catch (error) {
        console.error("Error updating company:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
    },
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      try {
        const document = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.COMPANIES,
          id
        );
        return document as unknown as Company;
      } catch (error) {
        console.error("Error fetching company:", error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: COMPANIES_STALE_TIME,
    gcTime: COMPANIES_GC_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useCompanyJobs = (companyId: string) => {
  return useQuery({
    queryKey: ["company-jobs", companyId],
    queryFn: async () => {
      if (!companyId) return [];

      try {
        const { documents } = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          [
            Query.equal("company_id", companyId),
            Query.equal("status", "active"),
            Query.orderDesc("posted_date"),
          ]
        );

        const jobsWithCompanies = await Promise.all(
          documents.map(async (job) => {
            try {
              const company = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.COMPANIES,
                job.company_id
              );
              return { ...job, companies: company };
            } catch (error) {
              console.error(
                "useCompanyJobs: Error fetching company for job:",
                job.$id,
                error
              );
              return job;
            }
          })
        );

        return jobsWithCompanies;
      } catch (error) {
        console.error("useCompanyJobs: Error fetching company jobs:", error);
        throw error;
      }
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
