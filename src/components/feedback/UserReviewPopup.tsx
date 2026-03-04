import { useEffect, useRef, useState } from "react";
import { Sparkles, Star, MessageSquarePlus } from "lucide-react";
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
  if (typeof window === "undefined") return [];
  try {
    const rawValue = localStorage.getItem(FEEDBACK_CACHE_KEY);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCachedFeedback = (payloads: FeedbackPayload[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(FEEDBACK_CACHE_KEY, JSON.stringify(payloads));
};

const readNumberKey = (key: string) => {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(key) || "0");
};

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

const UserReviewPopup = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [openSource, setOpenSource] = useState<"manual" | "auto" | "nudge" | null>(null);
  const submittedInThisCycleRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasSubmittedFeedback(
      localStorage.getItem(FEEDBACK_POPUP_SUBMITTED_KEY) === "true",
    );
  }, []);

  const isExcludedPath = EXCLUDED_PATHS.has(location.pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isExcludedPath || hasSubmittedFeedback) return;
    if (sessionStorage.getItem(FEEDBACK_POPUP_SESSION_PROMPTED_KEY) === "true") return;
    if (isOpen) return;

    const lastDismissedAt = Number(
      localStorage.getItem(FEEDBACK_POPUP_LAST_DISMISSED_AT_KEY) || "0",
    );
    if (lastDismissedAt > 0 && Date.now() - lastDismissedAt < DISMISS_COOLDOWN_MS) return;

    const autoPromptCount = readNumberKey(FEEDBACK_POPUP_AUTO_PROMPT_COUNT_KEY);
    if (autoPromptCount >= MAX_AUTO_PROMPTS) return;

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
    if (typeof window === "undefined") return;
    if (hasSubmittedFeedback || isExcludedPath) return;

    const handleNudge = (event: Event) => {
      if (isOpen) return;
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
    return () => window.removeEventListener(FEEDBACK_NUDGE_EVENT, handleNudge as EventListener);
  }, [hasSubmittedFeedback, isExcludedPath, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    trackFeedbackFunnel("feedback_prompt_opened", openSource || "unknown");
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
      if (payload.feedback) documentData.feedback = payload.feedback;
      if (payload.userId) documentData.user_id = payload.userId;
      if (payload.userEmail) documentData.user_email = payload.userEmail;
      await databases.createDocument(DATABASE_ID, COLLECTIONS.FEEDBACK, ID.unique(), documentData);
      return true;
    } catch {
      return false;
    }
  };

  const flushCachedFeedback = async () => {
    const cachedFeedback = parseCachedFeedback();
    if (cachedFeedback.length === 0) return 0;
    const unsentFeedback: FeedbackPayload[] = [];
    for (const item of cachedFeedback) {
      const isStored = await submitToAppwrite(item);
      if (!isStored) unsentFeedback.push(item);
    }
    saveCachedFeedback(unsentFeedback);
    return cachedFeedback.length - unsentFeedback.length;
  };

  const registerDismiss = (source: string) => {
    localStorage.setItem(FEEDBACK_POPUP_LAST_DISMISSED_AT_KEY, String(Date.now()));
    trackFeedbackFunnel("feedback_prompt_dismissed", source);
  };

  const resetDraft = () => {
    setRating(0);
    setHoverRating(0);
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
    if (!isStoredInAppwrite) cacheFeedback(payload);

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
      title: "Thanks for your feedback! 🎉",
      description: isStoredInAppwrite
        ? "Your response helps us prioritize the next improvements."
        : "Saved locally for now. We'll retry sending it when your session is ready.",
    });
  };

  const activeRating = hoverRating || rating;
  const submitButtonLabel =
    rating > 0 && !feedback.trim()
      ? `Submit ${rating}-star review`
      : "Send review";

  return (
    <>
      {/* Floating trigger button */}
      {!isExcludedPath && (
        <button
          type="button"
          onClick={handleManualOpen}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-primary/35 animate-[pulse_3s_ease-in-out_infinite]"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Help improve Hirelypk
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden gap-0">
          {/* Coloured top strip */}
          <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                </div>
                <DialogTitle className="text-base font-bold">Quick feedback</DialogTitle>
              </div>
              <DialogDescription className="text-sm leading-relaxed">
                {openSource === "nudge"
                  ? "Nice work! How did that feel? One rating helps us improve."
                  : "Rate your experience and share one thing we should do better."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Star rating */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Your experience
                </p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingSelect(value)}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="rounded-lg p-1 transition-transform hover:scale-110 active:scale-95"
                      aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          value <= activeRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  {activeRating > 0 && (
                    <span className="ml-2 text-sm font-semibold text-amber-500 transition-all">
                      {ratingLabels[activeRating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback textarea */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Suggestions <span className="normal-case font-normal text-muted-foreground/70">(optional)</span>
                </p>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What's one thing we should do better?"
                  className="min-h-[90px] rounded-xl resize-none text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-10 text-sm border-border bg-background text-foreground hover:!bg-primary hover:!text-primary-foreground hover:!border-primary"
                  onClick={handleDismiss}
                >
                  Not now
                </Button>
                <Button
                  className="flex-1 rounded-xl h-10 text-sm font-semibold shadow-md shadow-primary/20"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending…" : submitButtonLabel}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserReviewPopup;
