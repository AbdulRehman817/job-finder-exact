import { Bookmark, Building2, Heart, MapPin } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { SavedJob, useSavedJobs, useUnsaveJob } from "@/hooks/useSavedJobs";

const getSavedTime = (savedJob: SavedJob) => {
  const parsedDate = new Date(savedJob.saved_at);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Saved recently";
  }

  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

const formatJobType = (type?: string) => {
  if (!type) return "Role";
  return type
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const toSalaryText = (value: number) => {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }

  return `$${value.toLocaleString()}`;
};

const formatSalary = (min: number | null | undefined, max: number | null | undefined) => {
  if (!min && !max) return "Salary not specified";
  if (min && max) return `${toSalaryText(min)} - ${toSalaryText(max)}`;
  if (min) return `${toSalaryText(min)}+`;
  return `Up to ${toSalaryText(max!)}`;
};

const SavedJobs = () => {
  const navigate = useNavigate();
  const { user, loading, userRole } = useAuth();
  const { data: savedJobs = [], isLoading } = useSavedJobs();
  const unsaveJob = useUnsaveJob();
  const removingJobId = unsaveJob.variables;

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading saved jobs...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (userRole === "employer") {
    return <Navigate to="/employer-dashboard" replace />;
  }

  return (
    <Layout hideFooter>
      <section className="border-b border-border bg-card py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Saved Jobs</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            You currently have {savedJobs.length} saved job{savedJobs.length === 1 ? "" : "s"}.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-6 sm:py-10">
        {savedJobs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-foreground">No saved jobs yet</h3>
            <p className="mb-6 text-base text-muted-foreground">
              Save jobs from listings and they will appear here.
            </p>
            <Link to="/find-jobs">
              <Button className="btn-primary h-11 px-6">Browse Jobs</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((savedJob) => (
              <article
                key={savedJob.id}
                role="button"
                tabIndex={0}
                onClick={() => savedJob.job_id && navigate(`/job/${savedJob.job_id}`)}
                onKeyDown={(event) => {
                  if (!savedJob.job_id) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/job/${savedJob.job_id}`);
                  }
                }}
                className="group cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-slate-100 hover:shadow-md dark:hover:bg-slate-800/70 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {savedJob.jobs?.companies?.logo_url ? (
                        <img
                          src={savedJob.jobs.companies.logo_url}
                          alt={savedJob.jobs.companies.name}
                          className="h-9 w-9 object-contain"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-foreground">
                        {savedJob.jobs?.companies?.name || "Company not available"}
                      </p>

                      <h3 className="mt-1 block text-lg font-bold leading-snug text-foreground transition-colors  sm:text-2xl">
                        {savedJob.jobs?.title || "Job not available"}
                      </h3>

                      {savedJob.jobs?.location && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground sm:text-base">
                          <MapPin className="h-4 w-4" />
                          {savedJob.jobs.location}
                        </p>
                      )}

                     
                      
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        unsaveJob.mutate(savedJob.job_id);
                      }}
                      disabled={unsaveJob.isPending || !savedJob.job_id}
                      className="text-[#6366f2] hover:bg-transparent hover:text-[#6366f2] focus-visible:ring-[#6366f2]/40"
                      aria-label="Remove saved job"
                    >
                      <Bookmark className="h-4 w-4 fill-[#6366f2] text-[#6366f2]" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {unsaveJob.isPending && removingJobId === savedJob.job_id ? "Removing..." : "Saved in your list"}
                  </p>

                  <p className="text-xs text-muted-foreground">Saved {getSavedTime(savedJob)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default SavedJobs;
