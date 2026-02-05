import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProfileCompletionBannerProps {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
  type: "candidate" | "employer";
}

const ProfileCompletionBanner = ({
  isComplete,
  missingFields,
  completionPercentage,
  type,
}: ProfileCompletionBannerProps) => {
  if (isComplete) return null;

  const profileLink = type === "employer" ? "/recruiter-profile" : "/profile";
  const message =
    type === "employer"
      ? "Complete your company profile to start posting jobs"
      : "Complete your profile to apply for jobs";

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-6 mb-6 dark:bg-amber-950/40 dark:border-amber-800/60">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0 dark:bg-amber-900/40">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1 dark:text-amber-100">Profile Incomplete</h4>
            <p className="text-sm text-amber-700 mb-2 dark:text-amber-200">{message}</p>
            <div className="flex items-center gap-3">
              <Progress value={completionPercentage} className="h-2 flex-1 max-w-xs" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-200">{completionPercentage}%</span>
            </div>
            {missingFields.length > 0 && (
              <p className="text-xs text-amber-600 mt-2 dark:text-amber-300">
                Missing: {missingFields.slice(0, 3).join(", ")}
                {missingFields.length > 3 && ` +${missingFields.length - 3} more`}
              </p>
            )}
          </div>
        </div>
        <Link to={profileLink}>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
            Complete Profile
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
