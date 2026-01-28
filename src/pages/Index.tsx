import { Link } from "react-router-dom";
import { Search, MapPin, ArrowRight, Briefcase, Building2, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import CompanyCard from "@/components/companies/CompanyCard";
import CategoryCard from "@/components/categories/CategoryCard";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import { useJobs } from "@/hooks/useJobs";
import { useCompanies } from "@/hooks/useCompanies";
import {
  popularVacancies,
  categories,
  featuredJobs as mockFeaturedJobs,
  topCompanies as mockTopCompanies,
  testimonials,
  stats,
} from "@/data/mockData";

const Index = () => {
  const { data: dbJobs = [], isLoading: jobsLoading } = useJobs();
  const { data: dbCompanies = [], isLoading: companiesLoading } = useCompanies();

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

  // Transform database companies to match Company interface
  const transformedCompanies = dbCompanies.slice(0, 6).map((company) => ({
    id: company.id,
    name: company.name,
    logo: company.logo_url || "🏢",
    location: company.location || "Location",
    openPositions: 0, // Would need a count query
    featured: company.featured || false,
  }));

  // Use database jobs if available, otherwise fall back to mock data
  const featuredJobs = transformedJobs.length > 0 ? transformedJobs : mockFeaturedJobs;
  const topCompanies = transformedCompanies.length > 0 ? transformedCompanies : mockTopCompanies;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-secondary py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Find a job that suits
                <br />
                your interest & skills.
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md">
                Aliquam vitae turpis in diam convallis finibus in at risus. Nullam
                in scelerisque leo, eget sollicitudin velit bestibulum.
              </p>

              {/* Search Box */}
              <div className="bg-card p-4 rounded-lg shadow-soft flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Job title, Keyword..."
                    className="pl-10 h-12 border-border"
                  />
                </div>
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Your Location"
                    className="pl-10 h-12 border-border"
                  />
                </div>
                <Link to="/find-jobs">
                  <Button className="btn-primary h-12 px-8">Find Job</Button>
                </Link>
              </div>

              {/* Popular searches */}
              <div className="mt-4 text-sm">
                <span className="text-muted-foreground">Suggestion: </span>
                <Link to="/find-jobs?q=designer" className="text-primary hover:underline">Designer</Link>
                <span className="text-muted-foreground">, </span>
                <Link to="/find-jobs?q=programming" className="text-primary hover:underline">Programming</Link>
                <span className="text-muted-foreground">, </span>
                <Link to="/find-jobs?q=marketing" className="text-primary hover:underline">Digital Marketing</Link>
                <span className="text-muted-foreground">, </span>
                <Link to="/find-jobs?q=video" className="text-primary hover:underline">Video</Link>
                <span className="text-muted-foreground">, </span>
                <Link to="/find-jobs?q=animation" className="text-primary hover:underline">Animation</Link>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-primary/10 rounded-full w-96 h-96 mx-auto flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">👨‍💻</div>
                    <p className="text-lg font-medium text-foreground">Find Your Dream Job</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  {index === 0 && <Briefcase className="h-6 w-6 text-primary" />}
                  {index === 1 && <Building2 className="h-6 w-6 text-primary" />}
                  {index === 2 && <Users className="h-6 w-6 text-primary" />}
                  {index === 3 && <FileText className="h-6 w-6 text-primary" />}
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Vacancies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Most Popular Vacancies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularVacancies.map((vacancy, index) => (
              <Link
                key={index}
                to={`/find-jobs?q=${vacancy.title}`}
                className="group text-center"
              >
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {vacancy.title}
                </h3>
                <p className="text-sm text-muted-foreground">{vacancy.count} Open Positions</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            How jobpilot work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: "👤", title: "Create account", desc: "Aliquam facilisis egestas sapien, nec tempor leo tristique at." },
              { icon: "📄", title: "Upload CV/Resume", desc: "Curabitur sit amet maximus ligula. Nam a nulla ante. Nam sodales." },
              { icon: "🔍", title: "Find suitable job", desc: "Phasellus quis eleifend ex. Morbi nec fringilla nibh." },
              { icon: "✅", title: "Apply job", desc: "Curabitur sit amet maximus ligula. Nam a nulla ante, Nam sodales purus." },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft text-4xl">
                  {step.icon}
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                )}
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Popular category</h2>
            <Link
              to="/categories"
              className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured job</h2>
            <Link
              to="/find-jobs"
              className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {jobsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.slice(0, 12).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Top companies
          </h2>
          {companiesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {topCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Clients Testimonial
          </h2>
          <TestimonialCard testimonials={testimonials} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Candidate CTA */}
            <div className="bg-secondary rounded-xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Become a Candidate
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi ea, laborum ut.
                </p>
                <Link to="/signup">
                  <Button className="btn-primary">
                    Register Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="absolute right-4 bottom-0 text-9xl opacity-10">👨‍💼</div>
            </div>

            {/* Employer CTA */}
            <div className="bg-foreground rounded-xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                  Become a Employers
                </h3>
                <p className="text-primary-foreground/70 mb-6 max-w-sm">
                  Cras in massa pellentesque, mollis ligula non, luctus dui. Morbi sed efficitur dolor.
                </p>
                <Link to="/signup?type=employer">
                  <Button variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
                    Register Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="absolute right-4 bottom-0 text-9xl opacity-10">👩‍💼</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
