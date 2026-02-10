import { Link } from "react-router-dom";
import { Search, MapPin, ArrowRight, ExternalLink, Zap, Clock, Shield, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/useJobs";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { data: dbJobs = [], isLoading: jobsLoading } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

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
    company: job.companies?.name || "Company",
    companyLogo: job.companies?.logo_url || "",
    location: job.location,
    salary: formatSalary(job.salary_min, job.salary_max, job.currency || "USD"),
    type: job.type as "full-time" | "part-time" | "internship" | "remote" | "contract",
    featured: job.featured || false,
    postedDate: job.posted_date,
  }));

  const hasJobs = transformedJobs.length > 0;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (locationTerm) params.set("location", locationTerm);
    navigate(`/find-jobs?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16 lg:py-24">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="text-center mb-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                Quick & Easy Job Search
              </div>
            </div>

            {/* Main Heading */}
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 leading-tight">
                Find Your Next
                <span className="text-primary"> Dream Job</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Browse thousands of jobs from top companies. Sign in, apply with one click, and get redirected to complete your application.
              </p>
            </div>

            {/* Search Box */}
           

            {/* Quick Features */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Quick Apply</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Direct Company Links</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Verified Listings</span>
              </div>
            </div>
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
            {[
              {
                icon: "🔍",
                step: "1",
                title: "Search & Browse",
                desc: "Find jobs that match your skills and interests from our curated listings"
              },
              {
                icon: "📝",
                step: "2",
                title: "Sign In & Apply",
                desc: "Create your free account and apply to jobs with a single click"
              },
              {
                icon: "🚀",
                step: "3",
                title: "Get Redirected",
                desc: "Complete your application directly on the company's website"
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-card/80 border border-border/60 rounded-2xl p-8 text-center hover:shadow-lg transition-all backdrop-blur">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="text-6xl mb-4">{item.icon}</div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.desc}
                  </p>
                </div>

                {/* Arrow connector (except for last item) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      {hasJobs && (
        <section className="py-16 bg-secondary/40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Latest Job Opportunities
                </h2>
                <p className="text-lg text-muted-foreground">
                  Explore our newest listings
                </p>
              </div>
              <Link to="/find-jobs">
                <Button variant="outline" size="lg" className="gap-2">
                  View All Jobs
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {jobsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading jobs...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transformedJobs.slice(0, 6).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State - When no jobs */}
      {!hasJobs && !jobsLoading && (
        <section className="py-16 bg-secondary/40">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center bg-card/80 border border-border/60 rounded-2xl p-12 shadow-lg backdrop-blur">
              <div className="text-6xl mb-6">💼</div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Job Listings Coming Soon!
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                We're building our collection of opportunities. Check back soon for exciting job listings from top companies.
              </p>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup">
                    <Button size="lg" className="btn-primary">
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Not logged in */}
      {!user && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 border border-primary/20 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
              
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Ready to Find Your Dream Job?
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                  Join thousands of job seekers who trust us to connect them with amazing opportunities. Sign up for free today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup">
                    <Button size="lg" className="btn-primary px-8 h-14 text-base">
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/find-jobs">
                    <Button size="lg" variant="outline" className="px-8 h-14 text-base">
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Logged-in user quick actions */}
      {user && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary-foreground/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary-foreground/10 blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Welcome Back! 👋
                </h2>
                <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                  Ready to discover your next opportunity? Browse our latest job listings and apply with one click.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/find-jobs">
                    <Button size="lg" variant="secondary" className="px-8 h-14 text-base">
                      <Search className="mr-2 w-5 h-5" />
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 h-14 text-base"
                    >
                      My Profile
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;