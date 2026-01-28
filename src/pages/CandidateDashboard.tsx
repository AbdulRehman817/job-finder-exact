import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Heart,
  Bell,
  Settings,
  User,
  MapPin,
  Clock,
  ChevronRight,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useApplications";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const CandidateDashboard = () => {
  const { user, profile, loading, userRole } = useAuth();
  const { data: applications = [] } = useMyApplications();
  const { data: savedJobs = [] } = useSavedJobs();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const [searchParams] = useSearchParams();
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

  const stats = [
    { label: "Applied Jobs", value: applications.length, icon: FileText, color: "bg-primary/10 text-primary" },
    { label: "Favorite Jobs", value: savedJobs.length, icon: Heart, color: "bg-red-100 text-red-600" },
    { label: "Notifications", value: unreadNotifications, icon: Bell, color: "bg-yellow-100 text-yellow-600" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      case "shortlisted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "hired":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-muted text-muted-foreground";
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
      case "application_received":
        return "📩";
      default:
        return "🔔";
    }
  };

  return (
    <Layout>
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Candidate Dashboard</h1>
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
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground">{profile?.full_name || "User"}</h3>
                <p className="text-sm text-muted-foreground">{profile?.title || "Job Seeker"}</p>
                {profile?.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
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
                  { icon: User, label: "My Profile", href: "/profile" },
                  { icon: FileText, label: "Applied Jobs", href: "/dashboard?tab=applications" },
                  { icon: Heart, label: "Saved Jobs", href: "/dashboard?tab=saved" },
                  { icon: Bell, label: "Notifications", href: "/dashboard?tab=notifications", badge: unreadNotifications },
                  { icon: Settings, label: "Settings", href: "/settings" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
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

            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 mb-6">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Applied Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="saved"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Saved Jobs
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent relative"
                >
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className="ml-2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Recent Applications</h3>
                    <Link to="/dashboard?tab=applications" className="text-sm text-primary hover:underline">
                      View All
                    </Link>
                  </div>
                  {applications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">No applications yet</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start applying for jobs to see your applications here
                      </p>
                      <Link to="/find-jobs">
                        <Button className="btn-primary">
                          <Plus className="h-4 w-4 mr-2" />
                          Find Jobs
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {applications.slice(0, 5).map((application) => (
                        <div
                          key={application.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {application.jobs?.companies?.logo_url || "🏢"}
                            </div>
                            <div>
                              <Link
                                to={`/job/${application.job_id}`}
                                className="font-medium text-foreground hover:text-primary"
                              >
                                {application.jobs?.title || "Job Title"}
                              </Link>
                              <div className="text-sm text-muted-foreground flex items-center gap-3">
                                <span>{application.jobs?.companies?.name || "Company"}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "text-xs px-3 py-1 rounded-full capitalize",
                                getStatusColor(application.status)
                              )}
                            >
                              {application.status}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="applications" className="mt-0">
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">All Applied Jobs ({applications.length})</h3>
                  </div>
                  {applications.length === 0 ? (
                    <div className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">No applications yet</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start applying for jobs to track your progress here
                      </p>
                      <Link to="/find-jobs">
                        <Button className="btn-primary">Browse Jobs</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {applications.map((application) => (
                        <div
                          key={application.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {application.jobs?.companies?.logo_url || "🏢"}
                            </div>
                            <div>
                              <Link
                                to={`/job/${application.job_id}`}
                                className="font-medium text-foreground hover:text-primary"
                              >
                                {application.jobs?.title || "Job Title"}
                              </Link>
                              <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                                <span>{application.jobs?.companies?.name || "Company"}</span>
                                <span>{application.jobs?.location}</span>
                                <span className="badge-fulltime">{application.jobs?.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={cn(
                                "text-xs px-3 py-1 rounded-full capitalize",
                                getStatusColor(application.status)
                              )}
                            >
                              {application.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="saved" className="mt-0">
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Saved Jobs ({savedJobs.length})</h3>
                  </div>
                  {savedJobs.length === 0 ? (
                    <div className="p-8 text-center">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">No saved jobs</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Save jobs you're interested in to review them later
                      </p>
                      <Link to="/find-jobs">
                        <Button className="btn-primary">Browse Jobs</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {savedJobs.map((saved) => (
                        <div
                          key={saved.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {saved.jobs?.companies?.logo_url || "🏢"}
                            </div>
                            <div>
                              <Link
                                to={`/job/${saved.job_id}`}
                                className="font-medium text-foreground hover:text-primary"
                              >
                                {saved.jobs?.title || "Job Title"}
                              </Link>
                              <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                                <span>{saved.jobs?.companies?.name || "Company"}</span>
                                <span>{saved.jobs?.location}</span>
                                <span className="badge-fulltime">{saved.jobs?.type}</span>
                              </div>
                            </div>
                          </div>
                          <Link to={`/job/${saved.job_id}`}>
                            <Button size="sm">View Job</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <div className="bg-card border border-border rounded-lg">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      Notifications ({notifications.length})
                    </h3>
                    <Link to="/notifications" className="text-sm text-primary hover:underline">
                      View All
                    </Link>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-medium text-foreground mb-2">No notifications yet</h4>
                      <p className="text-sm text-muted-foreground">
                        You'll receive notifications when employers respond to your applications
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                            !notification.is_read && "bg-primary/5"
                          )}
                          onClick={() => {
                            if (!notification.is_read) {
                              markRead.mutate(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className={cn("text-foreground", !notification.is_read && "font-semibold")}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                                )}
                              </div>
                              {notification.job_id && (
                                <Link
                                  to={`/job/${notification.job_id}`}
                                  className="inline-block mt-2 text-sm text-primary hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Job →
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
        </div>
      </div>
    </Layout>
  );
};

export default CandidateDashboard;
