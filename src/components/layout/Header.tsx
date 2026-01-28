import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, Phone, ChevronDown, Search, Menu, X, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const candidateNavLinks = [
    { label: "Home", path: "/" },
    { label: "Find Job", path: "/find-jobs" },
    { label: "Find Employers", path: "/employers" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Job Alerts", path: "/job-alerts" },
    { label: "Customer Supports", path: "/support" },
  ];

  const employerNavLinks = [
    { label: "Home", path: "/" },
    { label: "Dashboard", path: "/employer-dashboard" },
    { label: "Post a Job", path: "/employer-dashboard?tab=post-job" },
    { label: "Find Candidates", path: "/candidates" },
    { label: "Customer Supports", path: "/support" },
  ];

  const navLinks = userRole === "employer" ? employerNavLinks : candidateNavLinks;

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("?")[0]);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-foreground text-primary-foreground">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.slice(0, 6).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "hover:text-primary-foreground/80 transition-colors",
                  isActive(link.path) && "text-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+1-202-555-0178</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span>English</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-primary p-2 rounded-lg">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Jobpilot</span>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xl">
            <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background">
              <span className="text-sm text-muted-foreground">🇮🇳 India</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Job title, keyword, company"
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationDropdown />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <span className="hidden md:block text-sm font-medium">
                        {profile?.full_name || "User"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border border-border">
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={userRole === "employer" ? "/employer-dashboard" : "/dashboard"}>
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {userRole === "employer" && (
                  <Link to="/employer-dashboard?tab=post-job" className="hidden sm:block">
                    <Button className="btn-primary">Post A Job</Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/signup" className="hidden sm:block">
                  <Button className="btn-primary">Post A Jobs</Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-lg transition-colors",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
