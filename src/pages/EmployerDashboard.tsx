import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CreditCard, 
  Building2,
  Settings, 
  LogOut,
  Plus,
  ArrowRight,
  Eye,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EmployerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarLinks = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "Employers Profile", icon: Building2 },
    { id: "post-job", label: "Post a Job", icon: Plus },
    { id: "my-jobs", label: "My Jobs", icon: Briefcase },
    { id: "saved", label: "Saved Candidate", icon: Users, badge: "0" },
    { id: "billing", label: "Plans & Billing", icon: CreditCard },
    { id: "companies", label: "All Companies", icon: Building2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    { value: 589, label: "Open Jobs", color: "bg-primary/10 text-primary" },
    { value: "2,517", label: "Saved Candidates", color: "bg-warning/10 text-warning" },
  ];

  const recentJobs = [
    { 
      id: "1", 
      title: "UI/UX Designer",
      status: "Active",
      applications: 798,
    },
    { 
      id: "2", 
      title: "Senior UX Designer",
      status: "Active",
      applications: 185,
    },
    { 
      id: "3", 
      title: "Technical Support Specialist",
      status: "Active",
      applications: 556,
    },
    { 
      id: "4", 
      title: "Junior Graphic Designer",
      status: "Active",
      applications: 583,
    },
    { 
      id: "5", 
      title: "Front End Developer",
      status: "Expire",
      applications: 740,
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
              <Link to="/candidates" className="nav-link">Find Candidate</Link>
              <Link to="/employer-dashboard" className="nav-link-active">Dashboard</Link>
              <Link to="/my-jobs" className="nav-link">My Jobs</Link>
              <Link to="/applications" className="nav-link">Applications</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  5
                </span>
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                📷
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
                Employers Dashboard
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
                      <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Hello, Instagram</h1>
                <p className="text-muted-foreground">Here is your daily activities and applications</p>
              </div>
              <Link to="/post-job">
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <p className="text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recently Posted Jobs */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recently Posted Jobs</h2>
                <button className="text-primary text-sm hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Jobs</th>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Applications</th>
                      <th className="text-left text-xs text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-secondary/50">
                        <td className="px-6 py-4">
                          <h3 className="font-medium text-foreground">{job.title}</h3>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            job.status === "Active" 
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {job.applications} Applications
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/applications/${job.id}`}
                              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              View Applications
                            </Link>
                          </div>
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

export default EmployerDashboard;
