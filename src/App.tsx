import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";

const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const FindJobs = lazy(() => import("./pages/FindJobs"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const Employers = lazy(() => import("./pages/Employers"));
const SavedJobs = lazy(() => import("./pages/SavedJobs"));
const EmployerDashboard = lazy(() => import("./pages/EmployerDashboard"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const RecruiterProfile = lazy(() => import("./pages/RecruiterProfile"));
const PostJob = lazy(() => import("./pages/PostJob"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));

const queryClient = new QueryClient();

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="relative h-10 w-10">
      <div className="h-10 w-10 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-primary" />
    </div>
  </div>
);

const HashJobRouteBridge = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hashPath = window.location.hash.replace(/^#/, "");

    if (location.pathname !== "/" || !hashPath.startsWith("/job/")) {
      return;
    }

    navigate(hashPath, { replace: true });
  }, [location.pathname, navigate]);

  return null;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="hirely-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <HashJobRouteBridge />
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/find-jobs" element={<FindJobs />} />
                <Route path="/job/:id" element={<JobDetails />} />
                <Route path="/employers" element={<Employers />} />
                <Route path="/company/:id" element={<CompanyProfile />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/saved-jobs" element={<SavedJobs />} />
                <Route path="/employer-dashboard" element={<EmployerDashboard />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/recruiter-profile" element={<RecruiterProfile />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/about" element={<About />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
