import { Link } from "react-router-dom";
import { Search, ArrowRight, Target, AlertTriangle, Search as SearchIcon, UserCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/useJobs";
import { useCompanies } from "@/hooks/useCompanies";
import { useSeo } from "@/hooks/useSeo";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { data: dbJobs = [], isLoading: jobsLoading, error: jobsError, refetch } = useJobs();
  const { data: companies = [] } = useCompanies();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const jobsErrorMessage =
    jobsError instanceof Error
      ? jobsError.message
      : "Unable to load jobs right now. Please try again.";

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const homeCanonical = origin ? `${origin}/` : undefined;
  const homeImage = origin ? `${origin}/logo.png` : undefined;
  const structuredData = origin
    ? [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Hirelypk",
        url: origin,
        potentialAction: {
          "@type": "SearchAction",
          target: `${origin}/find-jobs?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Hirelypk",
        url: origin,
        logo: homeImage || `${origin}/logo.png`,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Hirelypk Home",
        url: homeCanonical || origin,
        description:
          "Browse thousands of jobs from top companies. Sign in, apply with one click, and get redirected to complete your application.",
      },
    ]
    : undefined;

  useSeo({
    title: "Find Your Next Dream Job",
    description:
      "Browse thousands of jobs from top companies. Apply quickly and get redirected to complete your application.",
    keywords: [
      "job board",
      "find jobs",
      "remote jobs",
      "full-time jobs",
      "career opportunities",
      "hirely",
    ],
    canonical: homeCanonical,
    image: homeImage,
    structuredData,
  });

  // Transform database jobs to match the Job interface used by JobCard
  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    const unit = currency || "USD";
    if (!min && !max) return "Competitive";
    if (min && max) return `${unit} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${unit} ${min.toLocaleString()}+`;
    return `Up to ${unit} ${max!.toLocaleString()}`;
  };

  const transformedJobs = dbJobs.map((job) => ({
    id: job.$id,
    title: job.title,
    company: job.companies?.name || job.company || "Company",
    companyLogo: job.companies?.logo_url || "",
    location: job.location,
    salary: formatSalary(job.salary_min, job.salary_max, job.currency || "USD"),
    type: job.type as "full-time" | "part-time" | "internship" | "remote" | "contract",
    featured: job.featured || false,
    postedDate: job.posted_date,
  }));

  const hasJobs = transformedJobs.length > 0;
  const activeJobsCount = dbJobs.length;
  const companyCount = companies.length;
  

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (locationTerm) params.set("location", locationTerm);
    navigate(`/find-jobs?${params.toString()}`);
  };

  const howItWorksSteps = [
    {
      icon: SearchIcon,
      step: "1",
      title: "Search & Browse",
      desc: "Find jobs that match your skills and interests from our curated listings",
    },
    {
      icon: UserCheck,
      step: "2",
      title: "Sign In & Apply",
      desc: "Create your free account and apply to jobs with a single click",
    },
    {
      icon: ExternalLink,
      step: "3",
      title: "Get Redirected",
      desc: "Complete your application directly on the company's website",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className=" pt-28   bg-gradient-to-br from-primary/10 via-background to-primary/5 pb-16 lg:pt-36 lg:pb-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">

            <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">
              New Opportunities Added Daily
            </p>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-foreground mb-5 leading-[1.15] tracking-tight">
            Find the right job,{" "}
              <span className="text-primary italic">faster</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
Experience a premium, high-performance job search engine designed for the modern professional. Join Hirelypk today.   </p>

            {/* Search Bar */}
            <div className="w-full max-w-2xl mx-auto mb-12">
              <div className="bg-card border border-border rounded-lg p-1.5 flex items-center shadow-sm">
                <div className="pl-3 text-muted-foreground">
                  <Search className="w-5 h-5" />
                </div>
                <Input
                  placeholder="Job title, keywords, or company..."
                  className="border-0 bg-transparent shadow-none text-base h-12 focus-visible:ring-0 placeholder:text-muted-foreground/60"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  size="lg"
                  className="rounded-md h-11 px-6 text-sm font-medium bg-primary hover:bg-primary/90"
                  onClick={handleSearch}
                >
                  Search Jobs
                </Button>
              </div>
            </div>

            {/* Stats */}
          

          </div>
        </div>
      </section>

      {/* How It Works */}
  <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="relative group">
                <div className="bg-card/80 border border-border/60 rounded-2xl p-8 text-center hover:shadow-lg transition-all backdrop-blur">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    1
                  </div>
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <SearchIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Search & Browse</h3>
                  <p className="text-muted-foreground">
                   Find jobs that match your skills and interests from our curated listings
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-primary/40" />
                </div>
              </div>

              <div className="relative group">
                <div className="bg-card/80 border border-border/60 rounded-2xl p-8 text-center hover:shadow-lg transition-all backdrop-blur">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    2
                  </div>
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Sign In & Apply</h3>
                  <p className="text-muted-foreground">
                   Create your free account and apply to jobs with a single click
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-primary/40" />
                </div>
              </div>

              <div className="relative group">
                <div className="bg-card/80 border border-border/60 rounded-2xl p-8 text-center hover:shadow-lg transition-all backdrop-blur">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    3
                  </div>
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ExternalLink className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Get Redirected</h3>
                  <p className="text-muted-foreground">
                   Complete your application directly on the company's website
                  </p>
                </div>
              </div>
            </div>
        </div>
      </section>
      {/* Featured Jobs Section */}
      {hasJobs && (
        <section className="py-16 bg-background ">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  Latest Openings
                </h2>
                <p className="text-muted-foreground">
                  Fresh roles added by hiring teams
                </p>
              </div>
              <Link to="/find-jobs">
                <Button variant="outline" className="gap-2">
                  View All Jobs
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {jobsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-sm text-muted-foreground">Loading jobs...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {transformedJobs.slice(0, 6).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State - When no jobs */}
      {!hasJobs && !jobsLoading && !jobsError && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center bg-card border border-border rounded-lg p-10">
              <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-5">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Job Listings Coming Soon
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                We're building our collection of opportunities. Check back soon for new listings.
              </p>
              {!user && (
                <Link to="/signup">
                  <Button className="btn-primary">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {jobsError && !jobsLoading && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center bg-card border border-destructive/30 rounded-lg p-10">
              <div className="w-12 h-12 bg-destructive/10 rounded-md flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Unable To Load Guest Jobs
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {jobsErrorMessage}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
                <Link to="/find-jobs">
                  <Button className="btn-primary">Open Job Search</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Not logged in */}
      {!user && (
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to find your next role?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of job seekers who use Hirelypk to connect with hiring companies. It's free to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="btn-primary px-8 h-12">
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/find-jobs">
                  <Button size="lg" variant="outline" className="px-8 h-12">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Logged-in user quick actions */}
      {user && (
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="max-w-8xl mx-auto bg-primary rounded-xl p-8 md:p-12 text-center text-primary-foreground">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Welcome back
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Ready to discover your next opportunity? Browse our latest job listings and apply with one click.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/find-jobs">
                  <Button size="lg" variant="secondary" className="px-8 h-12">
                    <Search className="mr-2 w-4 h-4" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 h-12"
                  >
                    My Profile
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
