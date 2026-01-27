import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
      const { data, error } = await supabase
        .from("saved_jobs")
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            type,
            salary_min,
            salary_max,
            posted_date,
            companies (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false });

      if (error) throw error;
      return data as SavedJob[];
    },
    enabled: !!user,
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("saved_jobs")
        .insert({
          job_id: jobId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("job_id", jobId)
        .eq("user_id", user.id);

      if (error) throw error;
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
      if (!user || !jobId) return false;
      const { data, error } = await supabase
        .from("saved_jobs")
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
