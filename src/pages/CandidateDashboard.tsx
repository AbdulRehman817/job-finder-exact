import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Heart,
  Bell,
  User,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Target,
  Bookmark,
  Award,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import ProfileCompletionBanner from "@/components/profile/ProfileCompletionBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useApplications";
import { useSavedJobs, useUnsaveJob } from "@/hooks/useSavedJobs";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/useNotifications";
import { useCandidateProfileCompletion } from "@/hooks/useProfileCompletion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const CandidateDashboard = () => {
  const { user, profile, loading, userRole } = useAuth();
  const { data: applications = [] } = useMyApplications();
  const { data: savedJobs = [] } = useSavedJobs();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unsaveJob = useUnsaveJob();
  const profileCompletion = useCandidateProfileCompletion();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "overview";

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

  if (userRole === "employer") {
    return <Navigate to="/employer-dashboard" replace />;
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  // Calculate stats
  const appliedCount = applications.filter(a => a.status === "pending").length;
  const shortlistedCount = applications.filter(a => a.status === "shortlisted").length;
  const hiredCount = applications.filter(a => a.status === "hired").length;
  const rejectedCount = applications.filter(a => a.status === "rejected").length;

  const stats = [
    { label: "Applied", value: applications.length, icon: FileText, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300", subtext: `${appliedCount} pending` },
    { label: "Shortlisted", value: shortlistedCount, icon: Target, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300", subtext: "In review" },
    { label: "Hired", value: hiredCount, icon: Award, color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300", subtext: "Success!" },
    { label: "Saved Jobs", value: savedJobs.length, icon: Heart, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300", subtext: "Bookmarked" },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800/60", icon: Clock, label: "Applied" };
      case "shortlisted":
        return { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800/60", icon: Target, label: "Shortlisted" };
      case "rejected":
        return { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800/60", icon: XCircle, label: "Rejected" };
      case "hired":
        return { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800/60", icon: CheckCircle2, label: "Hired" };
      default:
        return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: Clock, label: status };
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "shortlisted":
        return "bg-emerald-100 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800/60";
      case "rejected":
        return "bg-red-100 border-red-200 dark:bg-red-900/40 dark:border-red-800/60";
      case "hired":
        return "bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-800/60";
      default:
        return "bg-muted border-border";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "shortlisted":
        return "🎯";
      case "rejected":
        return "❌";
      case "hired":
        return "🎉";
      default:
        return "🔔";
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  {profile?.title || "Job Seeker"}
                  {profile?.location && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
              <Link to="/find-jobs">
                <Button className="btn-primary" size="sm">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Profile Completion Banner */}
        <ProfileCompletionBanner
          isComplete={profileCompletion.isComplete}
          missingFields={profileCompletion.missingFields}
          completionPercentage={profileCompletion.completionPercentage}
          type="candidate"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card/80 border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow backdrop-blur"
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

        {/* Main Content Tabs */}
        <Tabs value={defaultTab} onValueChange={(v) => setSearchParams({ tab: v })} className="w-full">
          <div className="bg-card/80 border border-border/60 rounded-2xl mb-6 backdrop-blur">
            <TabsList className="w-full justify-start p-1 bg-transparent">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Applications ({applications.length})
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Saved ({savedJobs.length})
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg relative"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <span className="ml-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                    {unreadNotifications}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Applications */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Recent Applications</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSearchParams({ tab: "applications" })}>
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                {applications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">No applications yet</p>
                    <Link to="/find-jobs">
                      <Button size="sm" className="btn-primary">Browse Jobs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {applications.slice(0, 4).map((application) => {
                      const statusConfig = getStatusConfig(application.status || "pending");
                      return (
                        <div key={application.$id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/job/${application.job_id}`}
                                className="font-medium text-foreground hover:text-primary text-sm truncate block"
                              >
                                {application.jobs?.title || "Job Title"}
                              </Link>
                              <p className="text-xs text-muted-foreground truncate">
                                {application.jobs?.companies?.name}
                              </p>
                            </div>
                            <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border shrink-0", statusConfig.bg, statusConfig.text, statusConfig.border)}>
                              <statusConfig.icon className="h-3 w-3" />
                              {statusConfig.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Notifications */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Recent Notifications</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSearchParams({ tab: "notifications" })}>
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 4).map((notification) => (
                      <div
                        key={notification.$id}
                        onClick={() => !notification.is_read && markRead.mutate(notification.$id)}
                        className={cn("p-4 cursor-pointer hover:bg-muted/50 transition-colors", !notification.is_read && "bg-primary/5")}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg border shrink-0", getNotificationColor(notification.type))}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm truncate", !notification.is_read && "font-medium")}>{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-0">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">All Applications ({applications.length})</h3>
              </div>
              {applications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">No applications yet</h4>
                  <p className="text-sm text-muted-foreground mb-6">Start applying to jobs to see them here</p>
                  <Link to="/find-jobs">
                    <Button className="btn-primary">Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {applications.map((application) => {
                    const statusConfig = getStatusConfig(application.status || "pending");
                    return (
                      <div key={application.$id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                              💼
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                to={`/job/${application.job_id}`}
                                className="font-medium text-foreground hover:text-primary"
                              >
                                {application.jobs?.title || "Job Title"}
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {application.jobs?.companies?.name}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {application.jobs?.location}
                                </span>
                                <span className="capitalize">{application.jobs?.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border", statusConfig.bg, statusConfig.text, statusConfig.border)}>
                              <statusConfig.icon className="h-3 w-3" />
                              {statusConfig.label}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Saved Jobs Tab */}
          <TabsContent value="saved" className="mt-0">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Saved Jobs ({savedJobs.length})</h3>
              </div>
              {savedJobs.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">No saved jobs</h4>
                  <p className="text-sm text-muted-foreground mb-6">Save jobs to apply later</p>
                  <Link to="/find-jobs">
                    <Button className="btn-primary">Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {savedJobs.map((savedJob) => (
                    <div key={savedJob.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0">
                            💼
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/job/${savedJob.job_id}`}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {savedJob.jobs?.title || "Job Title"}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {savedJob.jobs?.companies?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link to={`/job/${savedJob.job_id}`}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => unsaveJob.mutate(savedJob.job_id)}
                            className="text-destructive hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-0">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                  Notifications {unreadNotifications > 0 && `(${unreadNotifications} unread)`}
                </h3>
                {unreadNotifications > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllRead.mutate()}
                    disabled={markAllRead.isPending}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">No notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive notifications when employers update your applications
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.$id}
                      onClick={() => !notification.is_read && markRead.mutate(notification.$id)}
                      className={cn("p-4 cursor-pointer hover:bg-muted/50 transition-colors", !notification.is_read && "bg-primary/5")}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-2xl border shrink-0", getNotificationColor(notification.type))}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("font-medium text-foreground", !notification.is_read && "font-semibold")}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true })}
                          </p>
                          {notification.job_id && (
                            <Link
                              to={`/job/${notification.job_id}`}
                              className="inline-block mt-2 text-sm text-primary hover:underline"
                            >
                              View Job Details →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CandidateDashboard;
