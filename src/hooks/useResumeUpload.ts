import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useResumeUpload = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadResume = async (file: File): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a resume",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return null;
    }

    setUploading(true);

    try {
      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_resume.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      // Since the bucket is private, we'll store the path and use signed URLs when needed
      const resumePath = filePath;

      // Update profile with resume URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ resume_url: resumePath })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();

      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully",
      });

      return resumePath;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload resume",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getResumeUrl = async (path: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from("resumes")
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch {
      return null;
    }
  };

  const deleteResume = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get current resume path from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("resume_url")
        .eq("user_id", user.id)
        .single();

      if (profile?.resume_url) {
        // Delete from storage
        await supabase.storage.from("resumes").remove([profile.resume_url]);
      }

      // Update profile
      await supabase
        .from("profiles")
        .update({ resume_url: null })
        .eq("user_id", user.id);

      await refreshProfile();

      toast({
        title: "Resume deleted",
        description: "Your resume has been removed",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadResume,
    getResumeUrl,
    deleteResume,
    uploading,
  };
};
