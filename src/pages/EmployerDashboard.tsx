import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Users,
  Building2,
  User,
  MapPin,
  Eye,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,
  TrendingUp,
  FileText,
  ExternalLink,
  Mail,
  ChevronRight,
  Award,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import PostJobForm from "@/components/employer/PostJobForm";
import { useAuth } from "@/contexts/AuthContext";
import { useMyJobs, useDeleteJob } from "@/hooks/useJobs";
import { useMyCompanies } from "@/hooks/useCompanies";
import { useJobApplications, useUpdateApplicationStatus } from "@/hooks/useApplications";
import { useCreateNotification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const EmployerDashboard = () => {
  const { user, profile, loading, userRole } = useAuth();
  const { data: jobs = [] } = useMyJobs();
  const { data: companies = [] } = useMyCompanies();
  const deleteJob = useDeleteJob();
  const updateApplicationStatus = useUpdateApplicationStatus();
  const createNotification = useCreateNotification();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";
  const [selectedJobForApps, setSelectedJobForApps] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "shortlist" | "reject" | "hire" | null;
    applicationId: string;
    userId: string;
    jobTitle: string;
    applicantName: string;
  }>({ open: false, type: null, applicationId: "", userId: "", jobTitle: "", applicantName: "" });

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

  // Get all applications across all jobs for stats
  const activeJobs = jobs.filter(j => j.status === "active").length;
  const totalApplicants = applications.length;
  const pendingApplicants = applications.filter(a => a.status === "pending").length;

  const stats = [
    { label: "Active Jobs", value: activeJobs, icon: Briefcase, color: "bg-primary/10 text-primary", subtext: `${jobs.length} total` },
    { label: "Applicants", value: totalApplicants, icon: Users, color: "bg-emerald-100 text-emerald-600", subtext: `${pendingApplicants} pending` },
    { label: "Companies", value: companies.length, icon: Building2, color: "bg-violet-100 text-violet-600", subtext: "Registered" },
  ];

  const handleDeleteJob = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob.mutateAsync(jobId);
        toast({ title: "Job deleted", description: "The job has been removed." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const openConfirmDialog = (
    type: "shortlist" | "reject" | "hire",
    applicationId: string,
    userId: string,
    jobTitle: string,
    applicantName: string
  ) => {
    setConfirmDialog({ open: true, type, applicationId, userId, jobTitle, applicantName });
  };

  const handleUpdateStatus = async () => {
    const { type, applicationId, userId, jobTitle } = confirmDialog;
    if (!type) return;

    try {
      await updateApplicationStatus.mutateAsync({ id: applicationId, status: type === "shortlist" ? "shortlisted" : type === "hire" ? "hired" : "rejected" });
      
      const notificationMessages = {
        shortlist: {
          title: "You've been shortlisted! 🎯",
          message: `Great news! Your application for "${jobTitle}" has been shortlisted. The employer is interested in your profile.`,
          type: "shortlisted" as const,
        },
        reject: {
          title: "Application Update",
          message: `We appreciate your interest in "${jobTitle}". Unfortunately, we've decided to move forward with other candidates. Keep applying!`,
          type: "rejected" as const,
        },
        hire: {
          title: "Congratulations! You're Hired! 🎉",
          message: `Amazing news! You've been selected for "${jobTitle}". The employer will contact you with next steps soon.`,
          type: "hired" as const,
        },
      };

      const config = notificationMessages[type];
      await createNotification.mutateAsync({
        user_id: userId,
        type: config.type,
        title: config.title,
        message: config.message,
        job_id: selectedJobForApps,
        application_id: applicationId,
      });

      toast({
        title: type === "shortlist" ? "Candidate shortlisted" : type === "hire" ? "Candidate hired!" : "Application updated",
        description: "The candidate has been notified.",
      });
      setConfirmDialog({ open: false, type: null, applicationId: "", userId: "", jobTitle: "", applicantName: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
      case "draft":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
      case "closed":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
      default:
        return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
    }
  };

  const getAppStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock };
      case "shortlisted":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: UserCheck };
      case "rejected":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
      case "hired":
        return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: Award };
      default:
        return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: Clock };
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobForApps);

  const dialogConfig = {
    shortlist: {
      title: "Shortlist Candidate",
      description: `Are you sure you want to shortlist ${confirmDialog.applicantName} for "${confirmDialog.jobTitle}"? They will receive a notification.`,
      buttonText: "Shortlist",
      buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      icon: UserCheck,
    },
    reject: {
      title: "Reject Application",
      description: `Are you sure you want to reject ${confirmDialog.applicantName}'s application for "${confirmDialog.jobTitle}"? They will receive a notification.`,
      buttonText: "Reject",
      buttonClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
      icon: XCircle,
    },
    hire: {
      title: "Hire Candidate",
      description: `Congratulations! You're about to hire ${confirmDialog.applicantName} for "${confirmDialog.jobTitle}". They will receive a notification with this great news!`,
      buttonText: "Confirm Hire",
      buttonClass: "bg-green-600 hover:bg-green-700 text-white",
      icon: Award,
    },
  };

  return (
    <Layout>
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogContent>
          {confirmDialog.type && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = dialogConfig[confirmDialog.type].icon;
                    return <Icon className="h-6 w-6 text-primary" />;
                  })()}
                  <DialogTitle>{dialogConfig[confirmDialog.type].title}</DialogTitle>
                </div>
                <DialogDescription className="pt-2">
                  {dialogConfig[confirmDialog.type].description}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                  Cancel
                </Button>
                <Button
                  className={dialogConfig[confirmDialog.type].buttonClass}
                  onClick={handleUpdateStatus}
                  disabled={updateApplicationStatus.isPending}
                >
                  {updateApplicationStatus.isPending ? "Processing..." : dialogConfig[confirmDialog.type].buttonText}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                {companies[0]?.logo_url ? (
                  <img src={companies[0].logo_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {companies[0]?.name || "Employer Dashboard"}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  {profile?.full_name}
                  {companies[0]?.location && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <MapPin className="h-3 w-3" />
                      {companies[0].location}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Button className="btn-primary" size="sm" onClick={() => setSearchParams({ tab: "post-job" })}>
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                </div>
                <div className={cn("p-3 rounded-xl", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={defaultTab} onValueChange={(v) => setSearchParams({ tab: v })} className="w-full">
          <div className="bg-card border border-border rounded-xl mb-6">
            <TabsList className="w-full justify-start p-1 bg-transparent">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="jobs"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                My Jobs
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <Users className="h-4 w-4 mr-2" />
                Applicants
              </TabsTrigger>
              <TabsTrigger
                value="post-job"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Recent Jobs</h3>
                <Button variant="ghost" size="sm" onClick={() => setSearchParams({ tab: "jobs" })}>
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              {jobs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">No jobs posted yet</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Post your first job to start receiving applications
                  </p>
                  <Button className="btn-primary" onClick={() => setSearchParams({ tab: "post-job" })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {jobs.slice(0, 5).map((job) => {
                    const statusConfig = getStatusConfig(job.status || "active");
                    return (
                      <div key={job.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                              💼
                            </div>
                            <div className="min-w-0">
                              <Link to={`/job/${job.id}`} className="font-medium text-foreground hover:text-primary truncate block">
                                {job.title}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {job.location} • {job.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={cn("px-3 py-1.5 rounded-full text-xs font-medium border capitalize", statusConfig.bg, statusConfig.text, statusConfig.border)}>
                              {job.status}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJobForApps(job.id);
                                setSearchParams({ tab: "applications" });
                              }}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              View Applicants
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-0">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">All Jobs ({jobs.length})</h3>
                <Button className="btn-primary" size="sm" onClick={() => setSearchParams({ tab: "post-job" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
              </div>
              {jobs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">No jobs posted yet</h4>
                  <p className="text-sm text-muted-foreground">Post your first job to start hiring</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {jobs.map((job) => {
                    const statusConfig = getStatusConfig(job.status || "active");
                    return (
                      <div key={job.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                              💼
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link to={`/job/${job.id}`} className="font-medium text-foreground hover:text-primary">
                                {job.title}
                              </Link>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                                <span className="capitalize">{job.type}</span>
                                <span>Posted {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn("px-3 py-1.5 rounded-full text-xs font-medium border capitalize", statusConfig.bg, statusConfig.text, statusConfig.border)}>
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-0 space-y-6">
            {/* Job Selector */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-4">Select a Job to View Applicants</h3>
              {jobs.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <p className="text-sm text-amber-700">Post a job first to receive applications.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobForApps(job.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        selectedJobForApps === job.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <p className="font-medium text-foreground truncate">{job.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{job.location}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Applicants List */}
            {selectedJob && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">
                    Applicants for "{selectedJob.title}" ({applications.length})
                  </h3>
                </div>
                {applications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">No applicants yet</h4>
                    <p className="text-sm text-muted-foreground">Share your job posting to attract candidates</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {applications.map((app) => {
                      const statusConfig = getAppStatusConfig(app.status || "pending");
                      const StatusIcon = statusConfig.icon;
                      const applicantName = app.profiles?.full_name || "Applicant";
                      return (
                        <div key={app.id} className="p-5 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                {app.profiles?.avatar_url ? (
                                  <img src={app.profiles.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                                ) : (
                                  <User className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-foreground">{applicantName}</h4>
                                <p className="text-sm text-muted-foreground">{app.profiles?.title || "Job Seeker"}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                  {app.profiles?.location && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      {app.profiles.location}
                                    </span>
                                  )}
                                  {app.profiles?.experience_years && (
                                    <span className="text-muted-foreground">{app.profiles.experience_years} yrs exp</span>
                                  )}
                                  <span className="text-muted-foreground">
                                    Applied {formatDistanceToNow(new Date(app.applied_at), { addSuffix: true })}
                                  </span>
                                </div>
                                {app.profiles?.skills && app.profiles.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {app.profiles.skills.slice(0, 4).map((skill, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-secondary text-xs rounded-md text-muted-foreground">
                                        {skill}
                                      </span>
                                    ))}
                                    {app.profiles.skills.length > 4 && (
                                      <span className="text-xs text-muted-foreground">+{app.profiles.skills.length - 4} more</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:shrink-0">
                              <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border", statusConfig.bg, statusConfig.text, statusConfig.border)}>
                                <StatusIcon className="h-3 w-3" />
                                {app.status === "pending" ? "Pending Review" : app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                              </div>
                              
                              {app.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                    onClick={() => openConfirmDialog("shortlist", app.id, app.user_id, selectedJob.title, applicantName)}
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Shortlist
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive border-destructive/30 hover:bg-destructive/5"
                                    onClick={() => openConfirmDialog("reject", app.id, app.user_id, selectedJob.title, applicantName)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              
                              {app.status === "shortlisted" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => openConfirmDialog("hire", app.id, app.user_id, selectedJob.title, applicantName)}
                                  >
                                    <Award className="h-4 w-4 mr-1" />
                                    Hire
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive border-destructive/30 hover:bg-destructive/5"
                                    onClick={() => openConfirmDialog("reject", app.id, app.user_id, selectedJob.title, applicantName)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {app.cover_letter && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                              <p className="text-xs font-medium text-muted-foreground mb-2">Cover Letter</p>
                              <p className="text-sm text-foreground whitespace-pre-wrap">{app.cover_letter}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Post Job Tab */}
          <TabsContent value="post-job" className="mt-0">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Post a New Job</h3>
              <PostJobForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default EmployerDashboard;
