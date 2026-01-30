import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface JobApplication {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  applied_at: string;
  updated_at: string;
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
    id: string;
    full_name: string;
    avatar_url: string | null;
    title: string | null;
    location: string | null;
    skills: string[] | null;
    experience_years: number | null;
  };
}

export const useMyApplications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            type,
            salary_min,
            salary_max,
            companies (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      return data as JobApplication[];
    },
    enabled: !!user,
  });
};

export const useJobApplications = (jobId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["job-applications", jobId],
    queryFn: async () => {
      if (!jobId) return [];
      
      // First get applications
      const { data: applications, error: appError } = await supabase
        .from("job_applications")
        .select("*")
        .eq("job_id", jobId)
        .order("applied_at", { ascending: false });

      if (appError) throw appError;
      
      // Then fetch profiles for each application
      const applicationsWithProfiles = await Promise.all(
        (applications || []).map(async (app) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, title, location, skills, experience_years")
            .eq("user_id", app.user_id)
            .maybeSingle();
          
          return {
            ...app,
            profiles: profile,
          };
        })
      );

      return applicationsWithProfiles as JobApplication[];
    },
    enabled: !!jobId && !!user,
  });
};

export const useApplyForJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ jobId, coverLetter, resumeUrl }: { jobId: string; coverLetter?: string; resumeUrl?: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("job_applications")
        .insert({
          job_id: jobId,
          user_id: user.id,
          cover_letter: coverLetter || null,
          resume_url: resumeUrl || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["has-applied"] });
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobApplication["status"] }) => {
      const { data, error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });
};

export const useHasApplied = (jobId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["has-applied", jobId, user?.id],
    queryFn: async () => {
      if (!user || !jobId) return false;
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!jobId,
  });
};
