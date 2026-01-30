import { Link } from "react-router-dom";
import { Search, MapPin, ArrowRight, Briefcase, Building2, Users, Rocket, Target, CheckCircle } from "lucide-react";
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
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  // Transform database jobs to match the Job interface used by JobCard
  const transformedJobs = dbJobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.companies?.name || "Company",
    companyLogo: job.companies?.logo_url || "",
    location: job.location,
    salary: job.salary_min && job.salary_max 
      ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
      : "Competitive",
    type: job.type as "full-time" | "part-time" | "internship" | "remote" | "contract",
    featured: job.featured || false,
    postedDate: job.posted_date,
  }));

  const hasJobs = transformedJobs.length > 0;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    navigate(`/find-jobs?${params.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary to-primary/10 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Rocket className="h-4 w-4" />
                Your Career Journey Starts Here
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 leading-tight">
                Find Your
                <span className="text-primary"> Dream Job</span>
                <br />
                Today
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Connect with top employers and discover opportunities that match your skills and aspirations. Start your journey to a fulfilling career.
              </p>

              {/* Search Box */}
              <div className="bg-card p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Job title, keyword..."
                    className="pl-10 h-12 border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    className="pl-10 h-12 border-border"
                    value={locationTerm}
                    onChange={(e) => setLocationTerm(e.target.value)}
                  />
                </div>
                <Button className="btn-primary h-12 px-8" onClick={handleSearch}>
                  Search Jobs
                </Button>
              </div>

              {/* Quick stats */}
              <div className="mt-8 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Easy apply</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-muted-foreground">Get hired fast</span>
                </div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 backdrop-blur">
                  <div className="bg-card rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-4xl">
                        💼
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Start Your Journey</h3>
                        <p className="text-sm text-muted-foreground">Find or post jobs easily</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="text-sm text-foreground">Personalized job matches</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="text-sm text-foreground">Top companies hiring</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="text-sm text-foreground">Connect with recruiters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How Jobpilot Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: "👤", title: "Create Account", desc: "Sign up for free and set up your profile in minutes", step: 1 },
              { icon: "📄", title: "Build Profile", desc: "Add your skills, experience, and upload your resume", step: 2 },
              { icon: "🔍", title: "Find Jobs", desc: "Browse and search for jobs that match your interests", step: 3 },
              { icon: "✅", title: "Apply & Get Hired", desc: "Apply with one click and get hired by top companies", step: 4 },
            ].map((item, index) => (
              <div key={index} className="text-center relative group">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-4xl group-hover:bg-primary/20 transition-colors">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                )}
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs - Only show if there are jobs */}
      {hasJobs && (
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Latest Jobs</h2>
                <p className="text-muted-foreground mt-1">Explore our newest opportunities</p>
              </div>
              <Link
                to="/find-jobs"
                className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
              >
                View All Jobs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {jobsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading jobs...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Be the First to Post a Job!
              </h2>
              <p className="text-muted-foreground mb-8">
                Our job board is growing. Recruiters can post jobs to reach talented candidates, 
                and job seekers can check back soon for new opportunities.
              </p>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup?type=employer">
                    <Button className="btn-primary">
                      <Building2 className="h-4 w-4 mr-2" />
                      Post a Job
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Create Profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show when user is NOT logged in */}
      {!user && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Candidate CTA */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 relative overflow-hidden border border-primary/20">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Become a Candidate
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Create your profile, upload your resume, and start applying to your dream jobs today.
                  </p>
                  <Link to="/signup">
                    <Button className="btn-primary">
                      Register Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="absolute right-4 bottom-4 text-8xl opacity-10">👨‍💼</div>
              </div>

              {/* Employer CTA */}
              <div className="bg-foreground rounded-2xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-primary-foreground/20 rounded-xl flex items-center justify-center mb-4">
                    <Building2 className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                    Become an Employer
                  </h3>
                  <p className="text-primary-foreground/70 mb-6 max-w-sm">
                    Post jobs, manage applications, and find the perfect candidates for your team.
                  </p>
                  <Link to="/signup?type=employer">
                    <Button variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
                      Register Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="absolute right-4 bottom-4 text-8xl opacity-10">👩‍💼</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Logged-in user quick actions */}
      {user && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Take the Next Step?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                {userRole === "employer" 
                  ? "Post new job opportunities or manage your applicants from your dashboard."
                  : "Explore job opportunities or manage your applications from your dashboard."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {userRole === "employer" ? (
                  <>
                    <Link to="/employer-dashboard?tab=post-job">
                      <Button variant="secondary" size="lg">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Post a Job
                      </Button>
                    </Link>
                    <Link to="/employer-dashboard">
                      <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/find-jobs">
                      <Button variant="secondary" size="lg">
                        <Search className="h-4 w-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;
