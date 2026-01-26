import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import { featuredJobs, popularSearches } from "@/data/mockData";

const FindJobs = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Find Job</h1>
          <div className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Find Job</span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by: Job title, Position, Keyword..."
                className="pl-10 h-12"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="City, state or zip code"
                className="pl-10 h-12"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="h-12 px-8 btn-primary">Find Job</Button>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Popular searches:</span>
            {popularSearches.map((search, index) => (
              <Link
                key={index}
                to={`/find-jobs?q=${search}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {search}
                {index < popularSearches.length - 1 && <span className="ml-2">,</span>}
              </Link>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Job Type */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Job Type</h4>
                <div className="space-y-3">
                  {["Full Time", "Part Time", "Internship", "Remote", "Contract"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox />
                      <span className="text-sm text-muted-foreground">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Salary (yearly)</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Min: $70,000" className="h-10" />
                    <Input placeholder="Max: $120,000" className="h-10" />
                  </div>
                  {["$10 - $100", "$100 - $1,000", "$1,000 - $10,000", "$10,000 - $100,000", "$100,000 Up"].map((range) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox />
                      <span className="text-sm text-muted-foreground">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Experience</h4>
                <div className="space-y-3">
                  {["Freshers", "1-2 Years", "2-4 Years", "4-6 Years", "6+ Years"].map((exp) => (
                    <label key={exp} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox />
                      <span className="text-sm text-muted-foreground">{exp}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Remote Job */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Remote Job</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox />
                  <span className="text-sm text-muted-foreground">Remote Only</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button className="btn-primary">Apply Filter</Button>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {page < 10 ? `0${page}` : page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default FindJobs;
