import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Bookmark, 
  Bell, 
  Settings, 
  LogOut,
  ArrowRight,
  Eye,
  MapPin,
  DollarSign,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CandidateDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarLinks = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "applied", label: "Applied Jobs", icon: Briefcase },
    { id: "favorites", label: "Favorite Jobs", icon: Bookmark },
    { id: "alerts", label: "Job Alert", icon: Bell, badge: "09" },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    { value: 589, label: "Applied jobs", icon: Briefcase, color: "bg-primary/10 text-primary" },
    { value: 238, label: "Favorite jobs", icon: Bookmark, color: "bg-warning/10 text-warning" },
    { value: 574, label: "Job Alerts", icon: Bell, color: "bg-success/10 text-success" },
  ];

  const recentlyApplied = [
    { 
      id: "1", 
      title: "Networking Engineer", 
      company: "Upwork",
      companyLogo: "🟢",
      type: "Remote",
      location: "Washington",
      salary: "$50k-80k/month",
      dateApplied: "Feb 2, 2019 19:28",
      status: "Active"
    },
    { 
      id: "2", 
      title: "Product Designer", 
      company: "Dribbble",
      companyLogo: "🏀",
      type: "Full Time",
      location: "Dhaka",
      salary: "$50k-80k/month",
      dateApplied: "Dec 7, 2019 23:26",
      status: "Active"
    },
    { 
      id: "3", 
      title: "Junior Graphic Designer", 
      company: "Apple",
      companyLogo: "🍎",
      type: "Temporary",
      location: "Brazil",
      salary: "$50k-80k/month",
      dateApplied: "Feb 2, 2019 19:28",
      status: "Active"
    },
    { 
      id: "4", 
      title: "Visual Designer", 
      company: "Microsoft",
      companyLogo: "🪟",
      type: "Contract Base",
      location: "Wisconsin",
      salary: "$50k-80k/month",
      dateApplied: "Dec 7, 2019 23:26",
      status: "Active"
    },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Jobpilot</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/find-jobs" className="nav-link">Find Job</Link>
              <Link to="/employers" className="nav-link">Find Employers</Link>
              <Link to="/dashboard" className="nav-link-active">Dashboard</Link>
              <Link to="/job-alerts" className="nav-link">Job Alerts</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 px-4">
                Candidate Dashboard
              </p>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={cn(
                      "sidebar-link w-full",
                      activeTab === link.id && "sidebar-link-active"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{link.label}</span>
                    {link.badge && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="border-t border-border mt-4 pt-4">
                <Link to="/" className="sidebar-link text-destructive hover:bg-destructive/10">
                  <LogOut className="h-5 w-5" />
                  <span>Log-out</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Welcome Banner */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">Hello, Esther Howard</h1>
              <p className="text-muted-foreground">Here is your daily activities and job alerts</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
                  <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center", stat.color)}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Profile Completion Alert */}
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-6 flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
                    alt="User" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <p className="font-semibold text-warning">Your profile editing is not completed.</p>
                  <p className="text-sm text-muted-foreground">Complete your profile editing & build your custom Resume</p>
                </div>
              </div>
              <Link to="/dashboard/settings">
                <Button variant="outline" className="border-warning text-warning hover:bg-warning hover:text-warning-foreground">
                  Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Recently Applied */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recently Applied</h2>
                <button className="text-primary text-sm hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Job</th>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Date Applied</th>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentlyApplied.map((job) => (
                      <tr key={job.id} className="hover:bg-secondary/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-2xl">
                              {job.companyLogo}
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">{job.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded",
                                  job.type === "Remote" ? "badge-remote" :
                                  job.type === "Full Time" ? "badge-fulltime" :
                                  job.type === "Temporary" ? "badge-parttime" :
                                  "badge-contract"
                                )}>
                                  {job.type}
                                </span>
                                <MapPin className="h-3 w-3" />
                                <span>{job.location}</span>
                                <DollarSign className="h-3 w-3" />
                                <span>{job.salary}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{job.dateApplied}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-success text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            to={`/job/${job.id}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Jobpilot - Job Board. All rights Reserved
        </div>
      </footer>
    </div>
  );
};

export default CandidateDashboard;
