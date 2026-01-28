import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/useJobs";
import { featuredJobs as mockJobs, popularSearches } from "@/data/mockData";

const ITEMS_PER_PAGE = 12;

const FindJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const { data: dbJobs = [], isLoading } = useJobs({ search: searchTerm });

  // Transform database jobs
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

  // Use database jobs if available, otherwise fallback to mock
  const allJobs = transformedJobs.length > 0 ? transformedJobs : mockJobs;
  
  // Filter by selected types
  const filteredJobs = selectedTypes.length > 0
    ? allJobs.filter((job) => selectedTypes.includes(job.type))
    : allJobs;

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    }
    setCurrentPage(1);
  };

  const handleSearch = () => {
    if (searchTerm) {
      setSearchParams({ q: searchTerm });
    } else {
      setSearchParams({});
    }
    setCurrentPage(1);
  };

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="City, state or zip code"
                className="pl-10 h-12"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
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
            <Button className="h-12 px-8 btn-primary" onClick={handleSearch}>
              Find Job
            </Button>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Popular searches:</span>
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(search);
                  setSearchParams({ q: search });
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {search}
                {index < popularSearches.length - 1 && <span className="ml-2">,</span>}
              </button>
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
                  {[
                    { value: "full-time", label: "Full Time" },
                    { value: "part-time", label: "Part Time" },
                    { value: "internship", label: "Internship" },
                    { value: "remote", label: "Remote" },
                    { value: "contract", label: "Contract" },
                  ].map((type) => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedTypes.includes(type.value)}
                        onCheckedChange={(checked) => handleTypeChange(type.value, !!checked)}
                      />
                      <span className="text-sm text-muted-foreground">{type.label}</span>
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
                  <Checkbox
                    checked={selectedTypes.includes("remote")}
                    onCheckedChange={(checked) => handleTypeChange("remote", !!checked)}
                  />
                  <span className="text-sm text-muted-foreground">Remote Only</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedTypes([]);
                  setSearchTerm("");
                  setSearchParams({});
                }}
              >
                Clear Filters
              </Button>
              <Button className="btn-primary">Apply Filter</Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{paginatedJobs.length}</span> of{" "}
            <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs
          </p>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
          </div>
        ) : paginatedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    currentPage === pageNum
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {pageNum < 10 ? `0${pageNum}` : pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FindJobs;
