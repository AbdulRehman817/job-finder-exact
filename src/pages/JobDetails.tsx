import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Clock,
  Bookmark,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import JobCard from "@/components/jobs/JobCard";
import { featuredJobs, jobBenefits } from "@/data/mockData";

const JobDetails = () => {
  const { id } = useParams();
  const [showApplyModal, setShowApplyModal] = useState(false);
  
  // Mock job data
  const job = {
    id: id || "1",
    title: "Senior UX Designer",
    company: "Instagram",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png",
    location: "Dhaka, Bangladesh",
    salary: "$100,000 - $120,000",
    type: "full-time" as const,
    featured: true,
    postedDate: "2024-01-15",
    expiryDate: "June 30, 2024",
    description: `Integer aliquet pretium consequat. Donec et tellus. Duis et est ac leo rhoncus tincidunt vitae Pellentesque quis justo sit amet arcu commodo. Vivamus sit amet ligula ullamcorper, pulvinar urna. Maecenas blandit felis id massa sodales.

Sed lobortis diam tincidunt accumsan faucibus dapibus euismod ante ultricies. Ut non felis arcu. Suspendisse sollicitudin faucibus aliquet. Nam dapibus consectetur erat in euismod. aliquet nibh. Sed tristique dictum elementum in neque sit amet orci interdum tincidunt.`,
    responsibilities: [
      "Quisque semper gravida est et consectetur.",
      "Curabitur blandit lorem velit, vitae pretium leo placerat eget.",
      "Morbi mattis in ipsum ac tempus.",
      "Curabitur eu vehicula libero. Vestibulum sed purus ullamcorper, lobortis lectus nec.",
      "vulputate turpis. Quisque ante odio, iaculis a porttitor sit amet.",
      "lobortis vel lectus. Nulla at risus ut diam commodo feugiat.",
      "Nullam laoreet, diam placerat dapibus tincidunt.",
      "odio metus posuere lorem, id condimentum erat velit nec neque.",
      "dui sodales ut. Curabitur tempus augue.",
    ],
    education: "Graduation",
    experience: "3+ Years",
    jobLevel: "Senior Level",
    website: "https://instagram.com",
  };

  const companyInfo = {
    name: "Instagram",
    type: "Social networking service",
    founded: "March 21, 2006",
    organizationType: "Private Company",
    size: "120-300 Employers",
  };

  const relatedJobs = featuredJobs.slice(0, 6);

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
            <span className="text-foreground">Job Details</span>
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
                <img 
                  src={job.companyLogo} 
                  alt={job.company}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="badge-featured">Featured</span>
                      <span className="badge-fulltime">Full Time</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a href={job.website} className="text-primary hover:underline">
                        {job.website}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Button 
                  className="btn-primary h-12 px-8"
                  onClick={() => setShowApplyModal(true)}
                >
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Job expire in: <span className="text-destructive">{job.expiryDate}</span>
                </p>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Job Description</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
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

            {/* Related Jobs */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Jobs</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
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
                    <p className="font-medium text-foreground">{job.salary}</p>
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
                    <p className="text-sm text-muted-foreground">Job Expire in</p>
                    <p className="font-medium text-foreground">{job.expiryDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Education</p>
                    <p className="font-medium text-foreground">{job.education}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Type</p>
                    <p className="font-medium text-foreground">Full Time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Benefits */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Job Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {jobBenefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-success/10 text-success text-xs rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={job.companyLogo} 
                    alt={job.company}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{companyInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">{companyInfo.type}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Founded in:</span>
                  <span className="text-foreground">{companyInfo.founded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Organization type:</span>
                  <span className="text-foreground">{companyInfo.organizationType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Company size:</span>
                  <span className="text-foreground">{companyInfo.size}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply Job: {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Choose Resume
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume1">Professional Resume</SelectItem>
                  <SelectItem value="resume2">Creative Resume</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Cover Letter
              </label>
              <Textarea
                placeholder="Write down your biography here. Let the employers know who you are..."
                className="min-h-[150px]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button className="btn-primary flex-1">
                Apply Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetails;
