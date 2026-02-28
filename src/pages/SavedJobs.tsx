import { BookmarkCheck, ExternalLink, Heart, MapPin, Trash2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
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

const formatSalary = (min: number | null | undefined, max: number | null | undefined) => {
  if (!min && !max) return "Competitive";
  if (min && max) return `USD ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min) return `USD ${min.toLocaleString()}+`;
  return `Up to USD ${max!.toLocaleString()}`;
};

const SavedJobs = () => {
  const { user, loading, userRole } = useAuth();
  const { data: savedJobs = [], isLoading } = useSavedJobs();
  const unsaveJob = useUnsaveJob();
  const removingJobId = unsaveJob.variables;

  if (loading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
      <section className="relative overflow-hidden border-b border-border bg-card py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_55%)]" />
        <div className="container relative mx-auto px-4">
          <h1 className="mb-3 text-3xl font-bold text-foreground">Saved Jobs</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Keep track of roles you want to apply for.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Saved</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{savedJobs.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/80 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Updated</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {savedJobs.length > 0 ? getSavedTime(savedJobs[0]) : "No saves yet"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {savedJobs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-14 text-center shadow-sm">
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
          <div className="grid gap-4">
            {savedJobs.map((savedJob) => (
              <article
                key={savedJob.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <BookmarkCheck className="h-3.5 w-3.5" />
                    Saved {getSavedTime(savedJob)}
                  </Badge>
                  <Badge variant="outline">{formatJobType(savedJob.jobs?.type)}</Badge>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/job/${savedJob.job_id}`}
                      className="block truncate text-lg font-bold text-foreground hover:text-primary"
                    >
                      {savedJob.jobs?.title || "Job not available"}
                    </Link>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {savedJob.jobs?.companies?.name || "Company not available"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {savedJob.jobs?.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {savedJob.jobs.location}
                        </span>
                      )}
                      <span>{formatSalary(savedJob.jobs?.salary_min, savedJob.jobs?.salary_max)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:shrink-0">
                    <Link to={`/job/${savedJob.job_id}`}>
                      <Button variant="outline" className="h-10">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Job
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => unsaveJob.mutate(savedJob.job_id)}
                      disabled={unsaveJob.isPending || !savedJob.job_id}
                      className="h-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {unsaveJob.isPending && removingJobId === savedJob.job_id ? "Removing..." : "Remove"}
                    </Button>
                  </div>
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
