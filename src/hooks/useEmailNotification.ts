interface SendEmailParams {
  to: string;
  type: "shortlisted" | "hired" | "rejected";
  jobTitle: string;
  companyName: string;
  candidateName: string;
}

export const sendNotificationEmail = async (params: SendEmailParams) => {
  console.warn("Email notifications are disabled (no provider configured).", params);
  return { success: false, error: "Email provider not configured" };
};
