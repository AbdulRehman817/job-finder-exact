import { Link, Navigate } from "react-router-dom";
import { Building2, PlusCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import PostJobForm from "@/components/employer/PostJobForm";
import ProfileCompletionBanner from "@/components/profile/ProfileCompletionBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployerProfileCompletion } from "@/hooks/useProfileCompletion";
import { Button } from "@/components/ui/button";

const PostJob = () => {
  const { user, loading, userRole } = useAuth();
  const profileCompletion = useEmployerProfileCompletion();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (userRole === "candidate") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Post a Job</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Create a job listing that highlights your role, benefits, and the impact candidates can make.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/employer-dashboard">
                <Button variant="ghost" size="sm">
                  View Dashboard
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                Employer workspace
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <ProfileCompletionBanner
          isComplete={profileCompletion.isComplete}
          missingFields={profileCompletion.missingFields}
          completionPercentage={profileCompletion.completionPercentage}
          type="employer"
        />

        {!profileCompletion.isComplete ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-amber-600" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Complete your recruiter profile first
            </h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Candidates trust listings with complete recruiter and company information. Finish your profile to post jobs.
            </p>
            <Link to="/recruiter-profile">
              <Button className="btn-primary">
                <PlusCircle className="h-4 w-4 mr-2" />
                Complete Recruiter Profile
              </Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <PostJobForm />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PostJob;
