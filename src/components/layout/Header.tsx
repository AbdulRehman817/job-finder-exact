import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, ChevronDown, Menu, X, User, LogOut, Settings, Home, Search, PlusCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Permission, Role } from "appwrite";
import { getAvatarUrl } from "@/lib/avatar";
import logo from "@/../public/logo.png";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { databases, DATABASE_ID, COLLECTIONS, Query, storage, BUCKETS, ID } from "@/lib/appwrite";
import {  useAuth } from "@/contexts/AuthContext";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useToast } from "@/hooks/use-toast";


const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, profile, signOut, loading,refreshProfile} = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // console.log('🔄 Header: Component rendered with auth data:', { loading, user: user?.id, userRole, profile: profile });

  // useEffect(() => {
  //   console.log("📊 Header: Auth state updated - loading:", loading, "userRole:", userRole, "profile:", profile?.id, "profile full_name:", profile?.full_name, "user:", user?.id);
    
  // }, [loading, userRole, profile, user]);

  // Navigation links - consistent for all users
  const mainNavLinks = [
    { label: "Home", path: "/", icon: Home },
    { label: "Find Jobs", path: "/find-jobs", icon: Search },
  ];



  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const uploaded = await storage.createFile(
        BUCKETS.RESUMES,
        ID.unique(),
        file,
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(user.id)),
          Permission.delete(Role.user(user.id)),
        ]
      );

      const { documents } = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [Query.equal("user_id", user.id)]
      );

      if (documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          documents[0].$id,
          { avatar_url: uploaded.$id }
        );
      }

      await refreshProfile();
      toast({
        title: "Profile image updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Avatar upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };


  const dashboardPath = userRole === "employer" ? "/employer-dashboard" : "/dashboard";
  const navLinks = [
    ...mainNavLinks,
    // ...(user ? [{ label: "Dashboard", path: dashboardPath, icon: LayoutDashboard }] : []),
    ...(userRole === "employer" ? [{ label: "Post a Job", path: "/post-job", icon: PlusCircle }] : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("?")[0]);
  };

  const handleSignOut = async () => {
    console.log('🔄 Header: Sign out initiated');
    await signOut();
    console.log('✅ Header: Sign out completed, navigating to home');
    navigate("/signin");
  };

  return (
<header className="w-full bg-background border-b border-border sticky top-0 z-50">
  <div className="container mx-auto px-4 h-16 flex items-center">
    <div className="flex items-center justify-between w-full">
      {/* LEFT: Logo Only */}
      <Link to="/" className="flex items-center gap-3 shrink-0">
        <img
          src={logo}
          alt="Hirely Logo"
          className="h-20 w-auto object-contain" 
        />
        <span className="text-xl ml-[-70px] font-bold text-foreground">
          Hirely
        </span>
      </Link>

      {/* CENTER: Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive(link.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
            
            {user ? (
              <>
                <NotificationDropdown />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                        {getAvatarUrl(profile?.avatar_url) ? (
                                             <img
                                               src={getAvatarUrl(profile?.avatar_url) ?? ""}
                                               alt=""
                                               className="w-32 h-[2.5rem] rounded-full object-cover"
                                             />
                                           ) : (
                                             <User className="h-16 w-16 text-primary" />
                                           )}
                      </div>
                      <div className="hidden md:block text-left">
                        <span className="text-sm font-medium block leading-tight">
                          {profile?.full_name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {userRole}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background border border-border">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {/* <DropdownMenuSeparator /> */}
                    {/* <DropdownMenuItem asChild>
                      <Link to={userRole === "employer" ? "/recruiter-profile" : "/profile"}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                   
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                      
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost" className="hidden sm:flex">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="btn-primary">Get Started</Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to={userRole === "employer" ? "/recruiter-profile" : "/profile"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
