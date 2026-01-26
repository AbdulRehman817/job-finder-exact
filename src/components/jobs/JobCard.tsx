import { Link } from "react-router-dom";
import { MapPin, Bookmark } from "lucide-react";
import { Job, jobTypes } from "@/types";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  variant?: "default" | "compact";
}

const JobCard = ({ job, variant = "default" }: JobCardProps) => {
  const typeConfig = jobTypes[job.type];

  if (variant === "compact") {
    return (
      <Link to={`/job/${job.id}`} className="card-job block">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-xl">🏢</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{job.location}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{job.salary}</span>
              </div>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/job/${job.id}`} className="card-job block">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
          {job.title}
        </h3>
        <button className="text-muted-foreground hover:text-primary transition-colors">
          <Bookmark className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className={cn(typeConfig.className, "uppercase text-[10px] font-semibold")}>
          {typeConfig.label}
        </span>
        <span className="text-sm text-muted-foreground">Salary: {job.salary}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.company} className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-lg">🏢</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{job.company}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{job.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
