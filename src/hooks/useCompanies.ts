import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Company {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Company[];
    },
  });
};

export const useMyCompanies = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-companies", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Company[];
    },
    enabled: !!user,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (company: Partial<Omit<Company, "id" | "user_id" | "created_at" | "updated_at" | "featured">>) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("companies")
        .insert({
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
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["my-companies"] });
    },
  });
};
