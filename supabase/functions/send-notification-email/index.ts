import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationEmailRequest {
  to: string;
  type: "shortlisted" | "hired" | "rejected";
  jobTitle: string;
  companyName: string;
  candidateName: string;
}

const getEmailContent = (type: string, jobTitle: string, companyName: string, candidateName: string) => {
  const baseStyle = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
    background-color: #f8fafc;
  `;

  const cardStyle = `
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  `;

  switch (type) {
    case "shortlisted":
      return {
        subject: `🎯 Great News! You've been shortlisted for ${jobTitle}`,
        html: `
          <div style="${baseStyle}">
            <div style="${cardStyle}">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
                <h1 style="color: #059669; margin: 0; font-size: 28px;">You've Been Shortlisted!</h1>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Dear ${candidateName},
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Congratulations! You have been shortlisted for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
              </p>
              
              <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 16px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0; color: #047857; font-size: 14px;">
                  The recruiter has reviewed your profile and may contact you soon. Please keep an eye on your notifications and messages for further updates.
                </p>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Best regards,<br/>
                <strong>The Jobpilot Team</strong>
              </p>
            </div>
          </div>
        `,
      };

    case "hired":
      return {
        subject: `🎉 Congratulations! You're Hired for ${jobTitle}`,
        html: `
          <div style="${baseStyle}">
            <div style="${cardStyle}">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
                <h1 style="color: #16a34a; margin: 0; font-size: 28px;">Congratulations, You're Hired!</h1>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Dear ${candidateName},
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                We're excited to inform you that you have been selected and hired for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
              </p>
              
              <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0; color: #15803d; font-size: 14px;">
                  The recruiter will contact you shortly with further details regarding joining, documents, and next steps. Welcome aboard!
                </p>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Congratulations and best wishes,<br/>
                <strong>The Jobpilot Team</strong>
              </p>
            </div>
          </div>
        `,
      };

    case "rejected":
      return {
        subject: `Update on your application for ${jobTitle}`,
        html: `
          <div style="${baseStyle}">
            <div style="${cardStyle}">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                <h1 style="color: #1e40af; margin: 0; font-size: 28px;">Application Update</h1>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Dear ${candidateName},
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Thank you for your interest in the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.
              </p>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                After careful consideration, we regret to inform you that your application was not selected at this time.
              </p>
              
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 8px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  Don't be discouraged! We encourage you to apply for other opportunities that match your skills and experience.
                </p>
              </div>
              
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Best regards,<br/>
                <strong>The Jobpilot Team</strong>
              </p>
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: `Application Update for ${jobTitle}`,
        html: `<p>Your application status has been updated.</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, type, jobTitle, companyName, candidateName }: NotificationEmailRequest = await req.json();

    // Validate required fields
    if (!to || !type || !jobTitle || !companyName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getEmailContent(type, jobTitle, companyName, candidateName);

    const emailResponse = await resend.emails.send({
      from: "Jobpilot <noreply@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
