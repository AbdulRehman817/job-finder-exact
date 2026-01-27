import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Users,
  FileText,
  Settings,
  User,
  MapPin,
  Eye,
  Trash2,
  Edit,
  Plus,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import PostJobForm from "@/components/employer/PostJobForm";
import { useAuth } from "@/contexts/AuthContext";
import { useMyJobs, useDeleteJob } from "@/hooks/useJobs";
import { useMyCompanies } from "@/hooks/useCompanies";
import { useJobApplications } from "@/hooks/useApplications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const EmployerDashboard = () => {
  const { user, profile, loading, userRole } = useAuth();
  const { data: jobs = [] } = useMyJobs();
  const { data: companies = [] } = useMyCompanies();
  const deleteJob = useDeleteJob();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";
  const [selectedJobForApps, setSelectedJobForApps] = useState<string | null>(null);

  const { data: applications = [] } = useJobApplications(selectedJobForApps || undefined);

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

  const stats = [
    { label: "Posted Jobs", value: jobs.length, icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: "Total Applicants", value: jobs.reduce((acc, job) => acc + (job.featured ? 0 : 0), 0), icon: Users, color: "bg-green-100 text-green-600" },
    { label: "Companies", value: companies.length, icon: Building2, color: "bg-purple-100 text-purple-600" },
  ];

  const handleDeleteJob = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob.mutateAsync(jobId);
        toast({
          title: "Job deleted",
          description: "The job has been successfully deleted.",
        });
      } catch (error: any) {
        toast({
          title: "Failed to delete job",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Employer Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Dashboard</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground">{profile?.full_name || "Employer"}</h3>
                <p className="text-sm text-muted-foreground">{companies[0]?.name || "Company"}</p>
                {companies[0]?.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {companies[0].location}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-primary/5 border-b border-border">
                <span className="text-sm font-medium text-foreground">Quick Links</span>
              </div>
              <nav className="p-2">
                {[
                  { icon: User, label: "Company Profile", href: "/company-profile" },
                  { icon: Briefcase, label: "My Jobs", href: "/employer-dashboard?tab=jobs" },
                  { icon: Plus, label: "Post a Job", href: "/employer-dashboard?tab=post-job" },
                  { icon: Users, label: "Applications", href: "/employer-dashboard?tab=applications" },
                  { icon: Settings, label: "Settings", href: "/settings" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-lg p-6 flex items-center gap-4"
                >
                  <div className={cn("p-3 rounded-lg", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <Tabs value={defaultTab} onValueChange={(value) => setSearchParams({ tab: value })} className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 mb-6">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  My Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="post-job"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Post a Job
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Applications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Recent Posted Jobs</h3>
                    <Link to="/employer-dashboard?tab=jobs" className="text-sm text-primary hover:underline">
                      View All
                    </Link>
                  </div>
                  {jobs.length === 0 ? (
                    <div className="p-8 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">No jobs posted yet</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start posting jobs to find the perfect candidates
                      </p>
                      <Button onClick={() => setSearchParams({ tab: "post-job" })} className="btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Post a Job
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {jobs.slice(0, 5).map((job) => (
                        <div
                          key={job.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {job.companies?.logo_url || "💼"}
                            </div>
                            <div>
                              <Link
                                to={`/job/${job.id}`}
                                className="font-medium text-foreground hover:text-primary"
                              >
                                {job.title}
                              </Link>
                              <div className="text-sm text-muted-foreground flex items-center gap-3">
                                <span>{job.location}</span>
                                <span className="capitalize">{job.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn("text-xs px-3 py-1 rounded-full capitalize", getStatusColor(job.status))}>
                              {job.status}
                            </span>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="jobs" className="mt-0">
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">All Jobs ({jobs.length})</h3>
                    <Button onClick={() => setSearchParams({ tab: "post-job" })} className="btn-primary" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </div>
                  {jobs.length === 0 ? (
                    <div className="p-8 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">No jobs posted yet</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Post your first job to start receiving applications
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {job.companies?.logo_url || "💼"}
                            </div>
                            <div>
                              <Link
                                to={`/job/${job.id}`}
                                className="font-medium text-foreground hover:text-primary"
                              >
                                {job.title}
                              </Link>
                              <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                                <span>{job.location}</span>
                                <span className="capitalize">{job.type}</span>
                                <span>
                                  Posted {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs px-3 py-1 rounded-full capitalize", getStatusColor(job.status))}>
                              {job.status}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedJobForApps(job.id);
                                setSearchParams({ tab: "applications" });
                              }}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="post-job" className="mt-0">
                <PostJobForm onSuccess={() => setSearchParams({ tab: "jobs" })} />
              </TabsContent>

              <TabsContent value="applications" className="mt-0">
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Applications</h3>
                    {jobs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {jobs.map((job) => (
                          <Button
                            key={job.id}
                            variant={selectedJobForApps === job.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedJobForApps(job.id)}
                          >
                            {job.title}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {!selectedJobForApps ? (
                    <div className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">Select a job</h4>
                      <p className="text-sm text-muted-foreground">
                        Select a job above to view its applications
                      </p>
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">No applications yet</h4>
                      <p className="text-sm text-muted-foreground">
                        No one has applied to this job yet
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {applications.map((app) => (
                        <div
                          key={app.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              {app.profiles?.avatar_url ? (
                                <img
                                  src={app.profiles.avatar_url}
                                  alt=""
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {app.profiles?.full_name || "Applicant"}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-3">
                                <span>{app.profiles?.title || "Job Seeker"}</span>
                                {app.profiles?.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {app.profiles.location}
                                  </span>
                                )}
                              </div>
                              {app.profiles?.skills && app.profiles.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {app.profiles.skills.slice(0, 3).map((skill, i) => (
                                    <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "text-xs px-3 py-1 rounded-full capitalize",
                                app.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : app.status === "shortlisted"
                                  ? "bg-green-100 text-green-700"
                                  : app.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              )}
                            >
                              {app.status}
                            </span>
                            <Button size="sm">View Profile</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployerDashboard;
