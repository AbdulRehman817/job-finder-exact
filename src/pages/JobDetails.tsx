import { useState,useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Bookmark,
  BookmarkCheck,
  Share2,
  ArrowRight,
    Eye,
  Building2,
  Globe,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import { useIncrementJobViews, useJob, useJobs } from "@/hooks/useJobs";
import { useApplyForJob, useHasApplied } from "@/hooks/useApplications";
import { useSaveJob, useUnsaveJob, useIsJobSaved, useSavedJobs } from "@/hooks/useSavedJobs";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidateProfileCompletion } from "@/hooks/useProfileCompletion";
import { useToast } from "@/hooks/use-toast";
import { useSeo } from "@/hooks/useSeo";
import { jobTypes } from "@/types";
import { format, formatDistanceToNow } from "date-fns";
import { normalizeJobType } from "@/lib/jobType";
import { dispatchFeedbackNudge } from "@/lib/feedbackPrompt";

const TAG_LINE_REGEX = /\n?\s*Tags:\s*.+$/i;

const resolveApplyLink = (job: any): string | null => {
  if (!job) return null;

  const rawApplyLink = [
    job.apply_link,
    job.apply_url,
    job.application_url,
    job.applyLink,
    job.applicationUrl,
    job.applyURL,
  ].find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;

  if (!rawApplyLink) return null;
  return /^https?:\/\//i.test(rawApplyLink) ? rawApplyLink : `https://${rawApplyLink}`;
};

const stripTagsLineFromDescription = (description: string) =>
  description.replace(TAG_LINE_REGEX, "").trim();

const dedupeTags = (values: string[]): string[] => {
  const seen = new Set<string>();
  const cleaned: string[] = [];

  values.forEach((value) => {
    const normalized = value.trim().replace(/^#+/, "");
    if (!normalized) return;

    const key = normalized.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    cleaned.push(normalized);
  });

  return cleaned;
};

const extractHashtagTags = (description: string): string[] => {
  const matches = description.match(/#[A-Za-z0-9][A-Za-z0-9._-]*/g) || [];
  return dedupeTags(matches.map((tag) => tag.replace(/^#/, "")));
};

const parseTagSource = (value: unknown): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return dedupeTags(value.map((item) => String(item)));
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return dedupeTags(parsed.map((item) => String(item)));
      }
    } catch {
      // Continue with plain-string parsing.
    }

    return dedupeTags(raw.split(/[\n,]+/));
  }

  return [];
};

const extractPlainTagsLine = (description: string): string[] => {
  const match = description.match(/(?:^|\n)\s*Tags:\s*(.+)$/i);
  if (!match?.[1]) return [];

  return dedupeTags(match[1].split(/[\s,]+/));
};

const getJobTags = (job: any): string[] => {
  const sourceCandidates = [
    job?.skills_required,
    job?.skillsRequired,
    job?.tags,
    job?.tag_list,
    job?.tagList,
  ];

  for (const candidate of sourceCandidates) {
    const parsed = parseTagSource(candidate);
    if (parsed.length > 0) {
      return parsed;
    }
  }

  const fromHashtags = extractHashtagTags(job?.description || "");
  if (fromHashtags.length > 0) {
    return fromHashtags;
  }

  return extractPlainTagsLine(job?.description || "");
};

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, profile } = useAuth();
  const { toast } = useToast();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthPromptModal, setShowAuthPromptModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
 const [viewCount, setViewCount] = useState(0);
  const { data: job, isLoading, error: jobError, refetch: refetchJob } = useJob(id || "");
  const { data: relatedJobs = [] } = useJobs();
  const { data: hasApplied = false } = useHasApplied(id || "");
  const { data: isSaved = false } = useIsJobSaved(id || "");
  const { data: savedJobs = [] } = useSavedJobs();
  const profileCompletion = useCandidateProfileCompletion();
  const jobErrorMessage =
    jobError instanceof Error
      ? jobError.message
      : "We could not load this job right now.";
  
  const applyForJob = useApplyForJob();
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();
  const savedJobsCount = savedJobs.length;
  const requiresSignInForSave = !user;
  const isSaveActionPending = saveJob.isPending || unsaveJob.isPending;
 const { mutateAsync: incrementJobViews } = useIncrementJobViews();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const companyName = job?.companies?.name || job?.company || "Company";
  const jobTitle = job?.title ? `${job.title} at ${companyName}` : "Job Details";
  const descriptionSnippet = job?.description
    ? stripTagsLineFromDescription(job.description).replace(/\s+/g, " ").slice(0, 160).trim()
    : "View job details and apply on Hirelypk.";
  const jobUrl = job && origin ? `${origin}/job/${job.$id}` : "";
  const employmentTypeMap: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
      internship: "INTERN",
    remote: "TELECOMMUTE",
    contract: "CONTRACTOR",
  };
    const normalizedJobType = normalizeJobType(job?.type);
  const hasSalary = job?.salary_min || job?.salary_max;
 const structuredData =
    job && origin
      ? {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          datePosted: new Date(job.posted_date).toISOString(),
          employmentType: employmentTypeMap[normalizedJobType] || "FULL_TIME",
          hiringOrganization: {
            "@type": "Organization",
            name: companyName,
            ...(job.companies?.logo_url
              ? { logo: job.companies.logo_url }
              : {}),
        },

         jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location,
            },
          },
          ...(normalizedJobType === "remote"
            ? { jobLocationType: "TELECOMMUTE" }
            : {}),
          ...(hasSalary
            ? {
                baseSalary: {
                  "@type": "MonetaryAmount",
                  currency: job.currency || "USD",
                  value: {
                    "@type": "QuantitativeValue",
                    ...(job.salary_min ? { minValue: job.salary_min } : {}),
                    ...(job.salary_max ? { maxValue: job.salary_max } : {}),
                    unitText: "YEAR",
                  },      },
            }
          : {}),
      }
    : undefined;

  useSeo({
    title: jobTitle,
    description: descriptionSnippet,
    canonical: jobUrl || undefined,
    image: job?.companies?.logo_url || undefined,
    type: "article",
    structuredData,
  });


  const applyLink = resolveApplyLink(job);
  const hasDirectApplyLink = Boolean(applyLink);

   const handleApplyRedirect = () => {
    if (!applyLink) return;

    if (!user) {
      setShowAuthPromptModal(true);
      return;
    }

    window.open(applyLink, "_blank", "noopener,noreferrer");
  };



   useEffect(() => {
    if (!job?.$id) return;

    const currentViews = Number(job.view_count) || 0;
    setViewCount(currentViews);

    const sessionViewKey = `hirely:viewed-job:${job.$id}`;
    if (typeof window === "undefined" || sessionStorage.getItem(sessionViewKey)) {
      return;
    }

    sessionStorage.setItem(sessionViewKey, "1");

    incrementJobViews({ id: job.$id, currentViews })
      .then((updatedJob) => {
        const updatedViews = Number(updatedJob?.view_count);
        if (!Number.isNaN(updatedViews)) {
          setViewCount(updatedViews);
        }
      })
      .catch(() => {
        // Silently ignore view tracking failures (permissions/schema differences).
      });
  }, [incrementJobViews, job?.$id, job?.view_count]);

  const handleApply = async () => {
    try {
      await applyForJob.mutateAsync({
        jobId: id!,
        coverLetter: coverLetter || undefined,
        resumeUrl: profile?.resume_url || undefined,
      });
      toast({
        title: "Application submitted! ✅",
        description: "You have successfully applied for this job. The recruiter will review your application.",
      });
      dispatchFeedbackNudge({
        source: "application_submitted",
        route: location.pathname,
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



const copyShareMessage = async (shareMessage: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareMessage);
        toast({
          title: "Share text copied",
          description: "Job details copied to clipboard.",
        });
        return true;
      }
    } catch {
      // Fall through to manual copy prompt.
    }

    window.prompt("Copy and share this job message:", shareMessage);
    toast({
      title: "Share message ready",
      description: "Copy the message from the prompt and share it.",
    });
    return true;
  };

  const handleShareJob = async () => {
    const shareUrl = `${window.location.origin}/#/job/${job.$id}`;
    const postedOn = format(new Date(job.posted_date), "EEE MMM dd yyyy");
    const cleanedDescription = job.description.replace(/\s+/g, " ").trim();
    const descriptionPreview = cleanedDescription.length > 220
      ? `${cleanedDescription.slice(0, 220).trim()}...`
      : cleanedDescription;

    const shareMessage = [
      "",
      `📣 Job Alert: ${job.title} `,
      `Location: ${job.location}`,
      `Posted: ${postedOn}`,
      "",
      descriptionPreview,
      "",
      `Apply now on ${window.location.host}`,
      shareUrl,
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareMessage,
        });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        await copyShareMessage(shareMessage);
        return;
      }
    }

    await copyShareMessage(shareMessage);
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
        const result = await saveJob.mutateAsync(id!);
        const alreadySaved =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          (result as { message?: string }).message === "Already saved";

        toast({ title: alreadySaved ? "Job already saved" : "Job saved!" });
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
      <Layout hideFooter>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </Layout>
    );
  }

  if (jobError) {
    return (
      <Layout hideFooter>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Unable to load this job</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{jobErrorMessage}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="outline" onClick={() => refetchJob()}>
              Try Again
            </Button>
            <Link to="/find-jobs">
              <Button className="btn-primary">Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout hideFooter>
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

    const typeConfig = jobTypes[normalizedJobType] || jobTypes["full-time"];
  const formatSalary = (
    min: number | null,
    max: number | null,
    currency: string | null,
  ) => {
    const unit = currency || "USD";
    if (!min && !max) return "Competitive";
    if (min && max) return `${unit} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${unit} ${min.toLocaleString()}+`;
    return `Up to ${unit} ${max!.toLocaleString()}`;
  };

  const salaryDisplay = formatSalary(job.salary_min, job.salary_max, job.currency );
  const currencyLabel = job.currency;
  const jobTags = getJobTags(job);
  const descriptionBody = stripTagsLineFromDescription(job.description);
  

  // Transform related jobs
  const transformedRelatedJobs = relatedJobs
    .filter((j) => j.$id !== job.$id)
    .slice(0, 4)
      .map((j) => ({
      id: j.$id,
      title: j.title,
      company: j.companies?.name || j.company || "Company",
      companyLogo: j.companies?.logo_url || "",
      location: j.location,
      salary: formatSalary(j.salary_min, j.salary_max, j.currency || "USD"),
  type: normalizeJobType(j.type),
        featured: j.featured || false,
      postedDate: j.posted_date,
    }));

  return (
    <Layout hideFooter>
      {/* Profile Incomplete Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg dark:bg-amber-900/40">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <DialogTitle>Complete Your Profile First</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              To apply for jobs, you need to complete your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-muted-foreground">{profileCompletion.completionPercentage}%</span>
              </div>
              <Progress value={profileCompletion.completionPercentage} className="h-2" />
            </div>
            {profileCompletion.missingFields.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Missing information:</p>
                <ul className="list-disc list-inside space-y-1">
                  {profileCompletion.missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                Cancel
              </Button>
              <Link to="/profile" className="flex-1">
                <Button className="btn-primary w-full">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAuthPromptModal} onOpenChange={setShowAuthPromptModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign up required before applying</DialogTitle>
            <DialogDescription>
              You can browse jobs and view details as a guest. To apply, you have to sign up first.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/signup"
              className="flex-1"
              onClick={() => setShowAuthPromptModal(false)}
            >
              <Button className="btn-primary w-full">Create Account</Button>
            </Link>
            <Link
              to="/signin"
              className="flex-1"
              onClick={() => setShowAuthPromptModal(false)}
            >
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breadcrumb */}
      <div className="bg-secondary py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Job Details</h1>
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
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center overflow-hidden shrink-0">
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {job.featured && <span className="badge-featured">Featured</span>}
                    <span className={typeConfig.className}>{typeConfig.label}</span>
                  </div>
                  {job.companies ? (
                    <Link 
                      to={`/company/${job.company_id}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {job.companies.name}
                    </Link>
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      {companyName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="default"
                    onClick={handleSave}
                    disabled={isSaveActionPending}
                    className={isSaved ? "h-10 border-primary bg-primary/10 text-primary hover:bg-primary/15" : "h-10"}
                  >
                    {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {/* {isSaveActionPending
                      ? "Updating..."
                      : requiresSignInForSave
                        ? "Sign in to Save"
                        : isSaved
                          ? "Saved"
                          : "Save Job"} */}
                   
                  </Button>
                 <Button variant="outline" size="icon" onClick={handleShareJob}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {salaryDisplay}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}
                  </span>
                   <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {viewCount.toLocaleString()} views
                  </span>
                </div>
                <div>
                  {hasApplied ? (
                    <Button disabled className="h-11 px-6">
                      ✅ Already Applied
                    </Button>
                  ) : userRole === "employer" ? (
                    <Button disabled className="h-11 px-6">
                      Employers can't apply
                    </Button>
                  ) : hasDirectApplyLink ? (
                    <Button className="btn-primary h-11 px-6" onClick={handleApplyRedirect}>
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Job Overview (Mobile/Tablet) */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6 lg:hidden">
              <h3 className="text-lg font-semibold text-foreground mb-6">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salary ({currencyLabel})</p>
                    <p className="font-medium text-foreground">{salaryDisplay}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium text-foreground">{typeConfig.label}</p>
                  </div>
                </div>
                {jobTags.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Skills & Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {jobTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-medium text-foreground">
                      {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Job Description</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {descriptionBody}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
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

            {/* Job Benefits (Mobile/Tablet) */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6 lg:hidden">
                <h3 className="text-lg font-semibold text-foreground mb-4">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/60"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
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
            <div className="bg-card border border-border rounded-xl p-6 hidden lg:block">
              <h3 className="text-lg font-semibold text-foreground mb-6">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salary ({currencyLabel})</p>
                    <p className="font-medium text-foreground">{salaryDisplay}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium text-foreground">{typeConfig.label}</p>
                  </div>
                </div>
                {jobTags.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Skills & Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {jobTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-medium text-foreground">
                      {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Job Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 hidden lg:block">
                <h3 className="text-lg font-semibold text-foreground mb-4">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/60"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {/* Company Info */}
            {job.companies && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                    {job.companies.logo_url ? (
                      <img 
                        src={job.companies.logo_url} 
                        alt={job.companies.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Building2 className="h-7 w-7 text-muted-foreground" />
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

            {/* Profile Summary */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/30 dark:border-green-800/60">
              <p className="text-sm font-medium text-green-800 mb-1 dark:text-green-100">Your Profile</p>
              <p className="text-sm text-green-700 dark:text-green-200">
                {profile?.full_name} • {profile?.title || "Job Seeker"}
              </p>
              {profile?.resume_url && (
                <p className="text-xs text-green-600 mt-1 dark:text-green-300">✅ Resume attached</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Cover Letter (Optional)
              </label>
              <Textarea
                placeholder="Tell the employer why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowApplyModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                className="btn-primary flex-1"
                onClick={handleApply}
                disabled={applyForJob.isPending}
              >
                {applyForJob.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetails;
