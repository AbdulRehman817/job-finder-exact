import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, Briefcase, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/useJobs";
import { popularSearches } from "@/data/mockData";

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

  // Filter by selected types and location
  let filteredJobs = transformedJobs;
  
  if (selectedTypes.length > 0) {
    filteredJobs = filteredJobs.filter((job) => selectedTypes.includes(job.type));
  }
  
  if (locationTerm) {
    filteredJobs = filteredJobs.filter((job) => 
      job.location.toLowerCase().includes(locationTerm.toLowerCase())
    );
  }

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

  const clearFilters = () => {
    setSelectedTypes([]);
    setLocationTerm("");
    setSearchTerm("");
    setSearchParams({});
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedTypes.length > 0 || locationTerm || searchTerm;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Dream Job</h1>
          <div className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Find Jobs</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Job title, keyword, company..."
                className="pl-10 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="City, state or country"
                className="pl-10 h-12 text-base"
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
              {selectedTypes.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {selectedTypes.length}
                </span>
              )}
            </Button>
            <Button className="h-12 px-8 btn-primary" onClick={handleSearch}>
              Search Jobs
            </Button>
          </div>

          {/* Popular Searches */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularSearches.slice(0, 5).map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchTerm(search);
                  setSearchParams({ q: search });
                }}
                className="text-sm px-3 py-1 bg-secondary rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Filter Jobs</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { value: "full-time", label: "Full Time" },
                { value: "part-time", label: "Part Time" },
                { value: "internship", label: "Internship" },
                { value: "remote", label: "Remote" },
                { value: "contract", label: "Contract" },
              ].map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTypes.includes(type.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedTypes.includes(type.value)}
                    onCheckedChange={(checked) => handleTypeChange(type.value, !!checked)}
                  />
                  <span className="text-sm font-medium text-foreground">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-foreground">
              <span className="font-semibold">{filteredJobs.length}</span> jobs found
              {searchTerm && <span className="text-muted-foreground"> for "{searchTerm}"</span>}
            </p>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              {selectedTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {type.replace("-", " ")}
                  <button onClick={() => handleTypeChange(type, false)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading jobs...</p>
          </div>
        ) : paginatedJobs.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
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
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
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
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FindJobs;
