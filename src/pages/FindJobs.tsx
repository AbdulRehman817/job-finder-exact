import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X,
  Building2,
  DollarSign,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/hooks/useJobs";
import { useSeo } from "@/hooks/useSeo";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { normalizeJobType } from "@/lib/jobType";

const ITEMS_PER_PAGE = 12;

const jobTypeColors: Record<string, string> = {
  "full-time": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "part-time": "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "internship": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "remote": "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "contract": "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const FindJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const { data: dbJobs = [], isLoading, error: jobsError, refetch } = useJobs({ search: searchTerm });
  const jobsErrorMessage =
    jobsError instanceof Error
      ? jobsError.message
      : "Unable to load jobs right now. Please try again.";

  // Transform database jobs
  const transformedJobs = dbJobs.map((job) => ({
    id: job.$id,
    title: job.title,
    company: job.companies?.name || job.company || "Company",
    companyLogo: job.companies?.logo_url || "",
    companyId: job.companies?.$id || "",
    location: job.location,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    currency: job.currency || "USD",
    type: normalizeJobType(job.type),
    featured: job.featured || false,
    postedDate: job.posted_date,
    description: job.description,
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

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    locationTerm.trim().length > 0 ||
    searchTerm.trim().length > 0;
  useSeo({
    title: "Find Jobs",
    description:
      "Search and filter jobs by title, location, and type on Hirelypk.",
    noIndex: hasActiveFilters,
  });

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return "Competitive";
    const unit = currency || "USD";
    if (min && max) return `${unit} ${(min / 1000).toFixed(0)}k - ${unit} ${(max / 1000).toFixed(0)}k`;
    if (min) return `${unit} ${(min / 1000).toFixed(0)}k+`;
    return `Up to ${unit} ${(max! / 1000).toFixed(0)}k`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Search Section */}
      <section className="border-b border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Find Your Perfect Job
            </h1>
            <p className="text-muted-foreground text-sm">
              {filteredJobs.length} opportunities available
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-background border border-border rounded-lg p-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, keyword, company..."
                  className="pl-10 h-11 text-sm border-0 bg-muted/50 rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City, state or country"
                  className="pl-10 h-11 text-sm border-0 bg-muted/50 rounded-md"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>
              <Button className="h-11 px-6 rounded-md w-full lg:w-auto" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={cn(
            "lg:w-64 shrink-0",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <div className="bg-card border border-border rounded-lg p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
                    Clear all
                  </Button>
                )}
              </div>

              {/* Job Type Filters */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Type</h4>
                <div className="space-y-2.5">
                  {[
                    { value: "full-time", label: "Full Time", count: dbJobs.filter(j => j.type === "full-time").length },
                    { value: "part-time", label: "Part Time", count: dbJobs.filter(j => j.type === "part-time").length },
                    { value: "internship", label: "Internship", count: dbJobs.filter(j => j.type === "internship").length },
                    { value: "remote", label: "Remote", count: dbJobs.filter(j => j.type === "remote").length },
                    { value: "contract", label: "Contract", count: dbJobs.filter(j => j.type === "contract").length },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          checked={selectedTypes.includes(type.value)}
                          onCheckedChange={(checked) => handleTypeChange(type.value, !!checked)}
                        />
                        <span className="text-sm text-foreground">
                          {type.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {type.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </span>
                {selectedTypes.length > 0 && (
                  <Badge variant="secondary">{selectedTypes.length}</Badge>
                )}
              </Button>
            </div>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{filteredJobs.length}</span> jobs found
                {searchTerm && <span className="text-muted-foreground"> for "{searchTerm}"</span>}
              </p>
              {hasActiveFilters && (
                <div className="hidden sm:flex items-center gap-2">
                  {selectedTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="flex items-center gap-1 cursor-pointer hover:bg-destructive/10 text-xs"
                      onClick={() => handleTypeChange(type, false)}
                    >
                      {type.replace("-", " ")}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Jobs List */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin h-7 w-7 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-3 text-sm text-muted-foreground">Loading jobs...</p>
              </div>
            ) : jobsError ? (
              <div className="text-center py-16 bg-card border border-destructive/20 rounded-lg">
                <div className="w-12 h-12 bg-destructive/10 rounded-md flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">Couldn't load jobs</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto px-4">{jobsErrorMessage}</p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try Again
                  </Button>
                  <Link to="/signin">
                    <Button size="sm" className="btn-primary">Sign In</Button>
                  </Link>
                </div>
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-lg">
                <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-sm text-muted-foreground mb-5">Try adjusting your search or filters</p>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/job/${job.id}`}
                    className="block bg-card border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/30 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Company Logo */}
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden shrink-0">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.company} className="w-9 h-9 object-contain" />
                        ) : (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                          </div>
                          {job.featured && (
                            <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {formatSalary(job.salary_min, job.salary_max, job.currency)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
                          </span>
                        </div>

                        <Badge className={cn("font-medium text-xs", jobTypeColors[job.type] || jobTypeColors["full-time"])}>
                          {job.type.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
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
                      className="h-9 w-9"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FindJobs;

