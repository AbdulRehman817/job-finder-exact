import { supabase } from "@/integrations/supabase/client";

interface SendEmailParams {
  to: string;
  type: "shortlisted" | "hired" | "rejected";
  jobTitle: string;
  companyName: string;
  candidateName: string;
}

export const sendNotificationEmail = async (params: SendEmailParams) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification-email", {
      body: params,
    });

    if (error) {
      console.error("Failed to send notification email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Error sending notification email:", err);
    return { success: false, error: err };
  }
};
