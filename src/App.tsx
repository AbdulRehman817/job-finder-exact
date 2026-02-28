import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import FindJobs from "./pages/FindJobs";
import JobDetails from "./pages/JobDetails";
import Employers from "./pages/Employers";
import CandidateDashboard from "./pages/CandidateDashboard";
import SavedJobs from "./pages/SavedJobs";
import EmployerDashboard from "./pages/EmployerDashboard";
import CompanyProfile from "./pages/CompanyProfile";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import RecruiterProfile from "./pages/RecruiterProfile";
import PostJob from "./pages/PostJob";
import NotFound from "./pages/NotFound";
import About from "./pages/About";

import { useEffect } from "react";

const queryClient = new QueryClient();

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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/find-jobs" element={<FindJobs />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/employers" element={<Employers />} />
              <Route path="/company/:id" element={<CompanyProfile />} />
              <Route path="/dashboard" element={<CandidateDashboard />} />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
