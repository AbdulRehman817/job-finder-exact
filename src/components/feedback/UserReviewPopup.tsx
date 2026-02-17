import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  COLLECTIONS,
  DATABASE_ID,
  ID,
  databases,
  ensureAnonymousSession,
} from "@/lib/appwrite";

type FeedbackPayload = {
  rating: number;
  feedback: string | null;
  page: string;
  submittedAt: string;
  userAgent: string;
  userId: string | null;
  userEmail: string | null;
};

const FEEDBACK_POPUP_COMPLETED_KEY = "hirely:feedback-popup-completed:v1";
const FEEDBACK_POPUP_PAGE_VIEWS_KEY = "hirely:feedback-popup-page-views:v1";
const FEEDBACK_CACHE_KEY = "hirely:feedback-cache:v1";
const MIN_PAGE_VIEWS_BEFORE_PROMPT = 3;
const EXCLUDED_PATHS = new Set(["/signin", "/signup"]);
const AUTO_PROMPT_DELAY_MS = 1200;

const parseCachedFeedback = (): FeedbackPayload[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = localStorage.getItem(FEEDBACK_CACHE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const UserReviewPopup = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
   const [hasShownAutoPrompt, setHasShownAutoPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (EXCLUDED_PATHS.has(location.pathname)) {
      return;
    }

   const popupCompleted =
      localStorage.getItem(FEEDBACK_POPUP_COMPLETED_KEY) === "true";
    if (popupCompleted) {
      return;
    }

    const currentPageViews =
      Number(sessionStorage.getItem(FEEDBACK_POPUP_PAGE_VIEWS_KEY) || "0") + 1;
    sessionStorage.setItem(
      FEEDBACK_POPUP_PAGE_VIEWS_KEY,
      String(currentPageViews),
    );

    if (currentPageViews < MIN_PAGE_VIEWS_BEFORE_PROMPT) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
          setHasShownAutoPrompt(true);
      setIsOpen(true);
    }, AUTO_PROMPT_DELAY_MS);

     return () => window.clearTimeout(timeoutId);
  }, [location.pathname]);

  const markPopupCompleted = () => {
    localStorage.setItem(FEEDBACK_POPUP_COMPLETED_KEY, "true");
  };

  const cacheFeedback = (payload: FeedbackPayload) => {
    const cachedFeedback = parseCachedFeedback();
    cachedFeedback.push(payload);
    localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify(cachedFeedback));
  };

  const submitToAppwrite = async (payload: FeedbackPayload) => {
    try {
      await ensureAnonymousSession();

      const documentData: Record<string, string | number> = {
        rating: payload.rating,
        page_path: payload.page,
        submitted_at: payload.submittedAt,
        user_agent: payload.userAgent,
      };

      if (payload.feedback) {
        documentData.feedback = payload.feedback;
      }

      if (payload.userId) {
        documentData.user_id = payload.userId;
      }

      if (payload.userEmail) {
        documentData.user_email = payload.userEmail;
      }

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.FEEDBACK,
        ID.unique(),
        documentData
      );

      return true;
    } catch {
      return false;
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open && hasShownAutoPrompt) {
      markPopupCompleted();
      setHasShownAutoPrompt(false);
    }
  };

  const handleDismiss = () => {
     if (hasShownAutoPrompt) {
      markPopupCompleted();
      setHasShownAutoPrompt(false);
    }
    setIsOpen(false);
  };

    const handleManualOpen = () => {
    setHasShownAutoPrompt(false);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({
        title: "Select a rating",
        description: "Please choose a star rating before sending your review.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: FeedbackPayload = {
      rating,
      feedback: feedback.trim() || null,
      page: location.pathname,
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      userId: user?.id || null,
      userEmail: user?.email || null,
    };

    cacheFeedback(payload);
    const isStoredInAppwrite = await submitToAppwrite(payload);

    markPopupCompleted();
    setIsOpen(false);
      setHasShownAutoPrompt(false);
    setRating(0);
    setFeedback("");
    setIsSubmitting(false);

    toast({
      title: "Thanks for your feedback!",
      description: isStoredInAppwrite
        ? "Your review was saved successfully."
        : "Review saved locally, but Appwrite save failed. Check feedback collection setup and permissions.",
    });
  };

  return (
     <>
      <Button
        type="button"
        size="sm"
        className="fixed bottom-6 right-6 z-40 btn-primary shadow-lg"
        onClick={handleManualOpen}
      >
        Give feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick website review</DialogTitle>
            <DialogDescription>
              Tell us what you think about your experience on Hirely. This popup
              appears only once.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                How would you rate your experience?
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`rounded-md p-1 transition-colors ${
                      value <= rating
                        ? "text-amber-500"
                        : "text-muted-foreground hover:text-amber-400"
                    }`}
                    aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                  >
                    <Star
                      className="h-5 w-5"
                      fill={value <= rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
          </div>

          <div>
              <p className="text-sm font-medium text-foreground mb-2">
                What should we improve next?
              </p>
              <Textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Share one thing we should do better."
                className="min-h-[110px]"
              />
            </div>

         <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDismiss}
              >
                Not now
              </Button>
              <Button
                className="btn-primary flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send review"}
              </Button>
            </div>
        </div>
       </DialogContent>
      </Dialog>
    </>
  );
};

export default UserReviewPopup;
