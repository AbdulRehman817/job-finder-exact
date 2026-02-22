import { useEffect, useRef, useState } from "react";
import { Sparkles, Star } from "lucide-react";
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
import {
  FEEDBACK_NUDGE_EVENT,
  FeedbackNudgeDetail,
  trackFeedbackFunnel,
} from "@/lib/feedbackPrompt";

type FeedbackPayload = {
  rating: number;
  feedback: string | null;
  page: string;
  submittedAt: string;
  userAgent: string;
  userId: string | null;
  userEmail: string | null;
};

const FEEDBACK_POPUP_SUBMITTED_KEY = "hirely:feedback-popup-submitted:v2";
const FEEDBACK_POPUP_LAST_DISMISSED_AT_KEY =
  "hirely:feedback-popup-last-dismissed-at:v2";
const FEEDBACK_POPUP_AUTO_PROMPT_COUNT_KEY =
  "hirely:feedback-popup-auto-prompt-count:v2";
const FEEDBACK_POPUP_SESSION_PROMPTED_KEY =
  "hirely:feedback-popup-session-prompted:v2";
const FEEDBACK_CACHE_KEY = "hirely:feedback-cache:v1";
const EXCLUDED_PATHS = new Set(["/signin", "/signup"]);
const AUTO_PROMPT_DELAY_MS = 30_000;
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_AUTO_PROMPTS = 3;

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

const saveCachedFeedback = (payloads: FeedbackPayload[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify(payloads));
};

const readNumberKey = (key: string) => {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(key) || "0");
};

const UserReviewPopup = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [openSource, setOpenSource] = useState<"manual" | "auto" | "nudge" | null>(
    null,
  );
  const submittedInThisCycleRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setHasSubmittedFeedback(
      localStorage.getItem(FEEDBACK_POPUP_SUBMITTED_KEY) === "true",
    );
  }, []);

  const isExcludedPath = EXCLUDED_PATHS.has(location.pathname);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isExcludedPath) {
      return;
    }

    if (hasSubmittedFeedback) {
      return;
    }

    if (sessionStorage.getItem(FEEDBACK_POPUP_SESSION_PROMPTED_KEY) === "true") {
      return;
    }

    if (isOpen) {
      return;
    }

    const lastDismissedAt = Number(
      localStorage.getItem(FEEDBACK_POPUP_LAST_DISMISSED_AT_KEY) || "0",
    );
    const dismissElapsedMs = Date.now() - lastDismissedAt;
    if (lastDismissedAt > 0 && dismissElapsedMs < DISMISS_COOLDOWN_MS) {
      return;
    }

    const autoPromptCount = readNumberKey(FEEDBACK_POPUP_AUTO_PROMPT_COUNT_KEY);
    if (autoPromptCount >= MAX_AUTO_PROMPTS) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRating(0);
      setFeedback("");
      setOpenSource("auto");
      setIsOpen(true);
      sessionStorage.setItem(FEEDBACK_POPUP_SESSION_PROMPTED_KEY, "true");
      localStorage.setItem(
        FEEDBACK_POPUP_AUTO_PROMPT_COUNT_KEY,
        String(autoPromptCount + 1),
      );
      trackFeedbackFunnel("feedback_prompt_seen", "auto");
    }, AUTO_PROMPT_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hasSubmittedFeedback, isExcludedPath, isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (hasSubmittedFeedback || isExcludedPath) {
      return;
    }

    const handleNudge = (event: Event) => {
      if (isOpen) {
        return;
      }

      const customEvent = event as CustomEvent<FeedbackNudgeDetail>;
      const source = customEvent.detail?.source || "unknown";

      setRating(0);
      setFeedback("");
      setOpenSource("nudge");
      setIsOpen(true);
      sessionStorage.setItem(FEEDBACK_POPUP_SESSION_PROMPTED_KEY, "true");
      trackFeedbackFunnel("feedback_prompt_seen", `nudge:${source}`);
    };

    window.addEventListener(FEEDBACK_NUDGE_EVENT, handleNudge as EventListener);

    return () =>
      window.removeEventListener(
        FEEDBACK_NUDGE_EVENT,
        handleNudge as EventListener,
      );
  }, [hasSubmittedFeedback, isExcludedPath, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const source = openSource || "unknown";
    trackFeedbackFunnel("feedback_prompt_opened", source);
  }, [isOpen, openSource]);

  const markPopupSubmitted = () => {
    localStorage.setItem(FEEDBACK_POPUP_SUBMITTED_KEY, "true");
    localStorage.removeItem(FEEDBACK_POPUP_LAST_DISMISSED_AT_KEY);
    setHasSubmittedFeedback(true);
  };

  const cacheFeedback = (payload: FeedbackPayload) => {
    const cachedFeedback = parseCachedFeedback();
    cachedFeedback.push(payload);
    saveCachedFeedback(cachedFeedback);
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

  const flushCachedFeedback = async () => {
    const cachedFeedback = parseCachedFeedback();
    if (cachedFeedback.length === 0) {
      return 0;
    }

    const unsentFeedback: FeedbackPayload[] = [];

    for (const item of cachedFeedback) {
      const isStored = await submitToAppwrite(item);
      if (!isStored) {
        unsentFeedback.push(item);
      }
    }

    saveCachedFeedback(unsentFeedback);
    return cachedFeedback.length - unsentFeedback.length;
  };

  const registerDismiss = (source: string) => {
    localStorage.setItem(
      FEEDBACK_POPUP_LAST_DISMISSED_AT_KEY,
      String(Date.now()),
    );
    trackFeedbackFunnel("feedback_prompt_dismissed", source);
  };

  const resetDraft = () => {
    setRating(0);
    setFeedback("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && submittedInThisCycleRef.current) {
      submittedInThisCycleRef.current = false;
      setIsOpen(false);
      setOpenSource(null);
      return;
    }

    if (!open) {
      registerDismiss(`${openSource || "unknown"}:dialog-close`);
      resetDraft();
      setIsOpen(false);
      setOpenSource(null);
      return;
    }

    setIsOpen(true);
  };

  const handleDismiss = () => {
    registerDismiss(`${openSource || "unknown"}:not-now`);
    resetDraft();
    setIsOpen(false);
    setOpenSource(null);
  };

  const handleManualOpen = () => {
    if (hasSubmittedFeedback) {
      return;
    }

    resetDraft();
    setOpenSource("manual");
    setIsOpen(true);
    sessionStorage.setItem(FEEDBACK_POPUP_SESSION_PROMPTED_KEY, "true");
    trackFeedbackFunnel("feedback_prompt_seen", "manual-button");
  };

  const handleRatingSelect = (value: number) => {
    setRating(value);
    trackFeedbackFunnel("feedback_rating_selected", String(value));
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
    await flushCachedFeedback();

    const payload: FeedbackPayload = {
      rating,
      feedback: feedback.trim() || null,
      page: location.pathname,
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      userId: user?.id || null,
      userEmail: user?.email || null,
    };

    const isStoredInAppwrite = await submitToAppwrite(payload);
    if (!isStoredInAppwrite) {
      cacheFeedback(payload);
    }

    markPopupSubmitted();
    submittedInThisCycleRef.current = true;
    setIsOpen(false);
    setOpenSource(null);
    resetDraft();
    setIsSubmitting(false);
    trackFeedbackFunnel(
      "feedback_prompt_submitted",
      isStoredInAppwrite ? "appwrite" : "local-cache",
    );

    toast({
      title: "Thanks for your feedback!",
      description: isStoredInAppwrite
        ? "Your response helps us prioritize the next improvements."
        : "Saved locally for now. We'll retry sending it when your session is ready.",
    });
  };

  const submitButtonLabel =
    rating > 0 && !feedback.trim()
      ? `Submit ${rating}-star review`
      : "Send review";

  return (
    <>
      {!hasSubmittedFeedback && !isExcludedPath && (
        <Button
          type="button"
          size="sm"
          className="fixed bottom-6 right-6 z-40 btn-primary shadow-lg gap-2 animate-[pulse_3s_ease-in-out_infinite]"
          onClick={handleManualOpen}
        >
          <Sparkles className="h-4 w-4" />
          Help improve Hirely
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick 10-second feedback</DialogTitle>
            <DialogDescription>
              {openSource === "nudge"
                ? "Nice work. Tell us how this experience felt so we can improve it."
                : "Rate your experience and optionally share one improvement idea."}
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
                    onClick={() => handleRatingSelect(value)}
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
                What should we improve next? (optional)
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
                {isSubmitting ? "Sending..." : submitButtonLabel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserReviewPopup;
