import { Link, useLocation } from "react-router-dom";
import { Briefcase, Phone, ChevronDown, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Find Job", path: "/find-jobs" },
    { label: "Find Employers", path: "/employers" },
    { label: "Dashboard", path: "/dashboard" },
    { label: "Job Alerts", path: "/job-alerts" },
    { label: "Customer Supports", path: "/support" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
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
            <div className="flex items-center gap-2">
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
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-primary p-2 rounded-lg">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Jobpilot</span>
          </Link>

          {/* Search bar */}
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xl">
            <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg">
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </Button>
            <Link to="/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="btn-primary">Post A Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
