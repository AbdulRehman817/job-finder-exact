import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  ArrowRight,
  Building2,
  Globe,
  Users,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import { useJob, useJobs } from "@/hooks/useJobs";
import { useApplyForJob, useHasApplied } from "@/hooks/useApplications";
import { useSaveJob, useUnsaveJob, useIsJobSaved } from "@/hooks/useSavedJobs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { jobTypes } from "@/types";
import { formatDistanceToNow } from "date-fns";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: job, isLoading } = useJob(id || "");
  const { data: relatedJobs = [] } = useJobs();
  const { data: hasApplied = false } = useHasApplied(id || "");
  const { data: isSaved = false } = useIsJobSaved(id || "");
  
  const applyForJob = useApplyForJob();
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to apply for this job",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    if (userRole === "employer") {
      toast({
        title: "Cannot apply",
        description: "Employers cannot apply for jobs",
        variant: "destructive",
      });
      return;
    }

    try {
      await applyForJob.mutateAsync({
        jobId: id!,
        coverLetter: coverLetter || undefined,
      });
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });
      setShowApplyModal(false);
      setCoverLetter("");
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save jobs",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    try {
      if (isSaved) {
        await unsaveJob.mutateAsync(id!);
        toast({ title: "Job removed from saved" });
      } else {
        await saveJob.mutateAsync(id!);
        toast({ title: "Job saved!" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Job not found</h2>
          <p className="text-muted-foreground mb-6">This job listing may have been removed or expired.</p>
          <Link to="/find-jobs">
            <Button className="btn-primary">Browse Jobs</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const typeConfig = jobTypes[job.type as keyof typeof jobTypes] || jobTypes["full-time"];
  const salaryDisplay = job.salary_min && job.salary_max
    ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
    : "Competitive";

  // Transform related jobs
  const transformedRelatedJobs = relatedJobs
    .filter((j) => j.id !== job.id)
    .slice(0, 6)
    .map((j) => ({
      id: j.id,
      title: j.title,
      company: j.companies?.name || "Company",
      companyLogo: j.companies?.logo_url || "",
      location: j.location,
      salary: j.salary_min && j.salary_max 
        ? `$${j.salary_min.toLocaleString()} - $${j.salary_max.toLocaleString()}`
        : "Competitive",
      type: j.type as "full-time" | "part-time" | "internship" | "remote" | "contract",
      featured: j.featured || false,
      postedDate: j.posted_date,
    }));

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Job Details</h1>
          <div className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/find-jobs" className="hover:text-primary">Find Job</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{job.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
              <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {job.companies?.logo_url ? (
                  <img 
                    src={job.companies.logo_url} 
                    alt={job.companies.name}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      {job.featured && <span className="badge-featured">Featured</span>}
                      <span className={typeConfig.className}>{typeConfig.label}</span>
                    </div>
                    {job.companies && (
                      <Link 
                        to={`/company/${job.company_id}`}
                        className="flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        {job.companies.name}
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleSave}
                      className={isSaved ? "text-primary border-primary" : ""}
                    >
                      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {hasApplied ? (
                  <Button disabled className="h-12 px-8">
                    Already Applied
                  </Button>
                ) : userRole === "employer" ? (
                  <Button disabled className="h-12 px-8">
                    Employers can't apply
                  </Button>
                ) : (
                  <Button 
                    className="btn-primary h-12 px-8"
                    onClick={() => setShowApplyModal(true)}
                  >
                    Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {job.expiry_date && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Expires: <span className="text-destructive">
                      {new Date(job.expiry_date).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Job Description</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Jobs */}
            {transformedRelatedJobs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Related Jobs</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {transformedRelatedJobs.map((relatedJob) => (
                    <JobCard key={relatedJob.id} job={relatedJob} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salary (USD)</p>
                    <p className="font-medium text-foreground">{salaryDisplay}</p>
                    <p className="text-xs text-muted-foreground">Yearly salary</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Location</p>
                    <p className="font-medium text-foreground">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-medium text-foreground">
                      {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {job.experience_level && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium text-foreground">{job.experience_level}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium text-foreground">{typeConfig.label}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Job Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-success/10 text-success text-xs rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            {job.companies && (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                    {job.companies.logo_url ? (
                      <img 
                        src={job.companies.logo_url} 
                        alt={job.companies.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{job.companies.name}</h3>
                    {job.companies.location && (
                      <p className="text-sm text-muted-foreground">{job.companies.location}</p>
                    )}
                  </div>
                </div>
                <Link to={`/company/${job.company_id}`}>
                  <Button variant="outline" className="w-full">
                    View Company Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for: {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
              <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center overflow-hidden">
                {job.companies?.logo_url ? (
                  <img 
                    src={job.companies.logo_url} 
                    alt={job.companies?.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{job.title}</p>
                <p className="text-sm text-muted-foreground">{job.companies?.name}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Cover Letter (Optional)
              </label>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write a brief cover letter explaining why you're a great fit for this role..."
                className="min-h-[150px]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button 
                className="btn-primary flex-1" 
                onClick={handleApply}
                disabled={applyForJob.isPending}
              >
                {applyForJob.isPending ? "Submitting..." : "Submit Application"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetails;
